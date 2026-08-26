import { useEffect } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PickedAttachment } from '../components/ui/AttachmentPicker.source';
import {
  ATTACHMENT_LIMIT_ERROR,
  ATTACHMENT_SIZE_ERROR,
  ATTACHMENT_TYPE_ERROR,
  MAX_ATTACHMENT_SIZE_BYTES,
  type Attachment,
} from '../domain';
import { useAttachments, type UseAttachmentsOptions, type UseAttachmentsResult } from './useAttachments';

const storageMocks = vi.hoisted(() => ({
  uploadReceipt: vi.fn(),
  deleteReceipt: vi.fn(),
}));

vi.mock('../services/storage.service', () => ({ storageService: storageMocks }));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const PERSIST_ERROR = 'Anexo enviado, mas não foi possível vinculá-lo à transação.';
const REMOVE_ERROR = 'Não foi possível remover o anexo. Tente novamente.';

const UPLOAD_RESULT = {
  url: 'https://storage.test/receipt.jpg',
  path: 'receipts/user-1/tx-1/1700000000000-receipt.jpg',
  size: 2048,
};

let renderer: ReactTestRenderer | undefined;
let latest: UseAttachmentsResult | undefined;

function Probe(options: UseAttachmentsOptions) {
  const value = useAttachments(options);

  useEffect(() => {
    latest = value;
  }, [value]);

  return null;
}

function renderHook(options: UseAttachmentsOptions = {}): void {
  act(() => {
    renderer = create(<Probe {...options} />);
  });
}

function current(): UseAttachmentsResult {
  if (!latest) throw new Error('useAttachments has not rendered');
  return latest;
}

function picked(overrides: Partial<PickedAttachment> = {}): PickedAttachment {
  return {
    uri: 'file:///receipt.jpg',
    name: 'receipt.jpg',
    contentType: 'image/jpeg',
    size: 1024,
    ...overrides,
  };
}

const storedAttachment: Attachment = {
  id: 'a-1',
  name: 'nota.pdf',
  url: 'https://storage.test/nota.pdf',
  path: 'receipts/user-1/tx-9/nota.pdf',
  size: 4096,
  mimeType: 'application/pdf',
};

async function addPick(overrides: Partial<PickedAttachment> = {}): Promise<void> {
  await act(async () => {
    await current().add(picked(overrides));
  });
}

/** Runs `action` inside `act` and hands back whatever it rejected with. */
async function rejection(action: () => Promise<unknown>): Promise<unknown> {
  let caught: unknown;
  await act(async () => {
    caught = await action().then(
      () => undefined,
      (error: unknown) => error
    );
  });
  return caught;
}

beforeEach(() => {
  vi.resetAllMocks();
  storageMocks.uploadReceipt.mockResolvedValue(UPLOAD_RESULT);
  storageMocks.deleteReceipt.mockResolvedValue(undefined);
  latest = undefined;
  renderer = undefined;
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('useAttachments validation', () => {
  it('rejects a disallowed content type without queueing it', async () => {
    renderHook({ uid: 'user-1' });

    await addPick({ contentType: 'image/gif', name: 'meme.gif' });

    expect(current().error).toBe(ATTACHMENT_TYPE_ERROR);
    expect(current().items).toHaveLength(0);
    expect(storageMocks.uploadReceipt).not.toHaveBeenCalled();
  });

  it('rejects a file over 5 MB reported by the picker', async () => {
    renderHook({ uid: 'user-1' });

    await addPick({ size: MAX_ATTACHMENT_SIZE_BYTES + 1 });

    expect(current().error).toBe(ATTACHMENT_SIZE_ERROR);
    expect(current().items).toHaveLength(0);
  });

  it('stops at five attachments per transaction', async () => {
    renderHook({ uid: 'user-1' });

    for (let index = 0; index < 5; index += 1) {
      await addPick({ name: `receipt-${index}.jpg` });
    }

    expect(current().items).toHaveLength(5);
    expect(current().canAdd).toBe(false);

    await addPick({ name: 'receipt-6.jpg' });

    expect(current().error).toBe(ATTACHMENT_LIMIT_ERROR);
    expect(current().items).toHaveLength(5);
  });
});

describe('useAttachments on a transaction being created', () => {
  it('queues picks instead of uploading while there is no transaction id', async () => {
    renderHook({ uid: 'user-1' });

    await addPick();

    expect(storageMocks.uploadReceipt).not.toHaveBeenCalled();
    expect(current().pendingCount).toBe(1);
    expect(current().items).toEqual([
      expect.objectContaining({ name: 'receipt.jpg', uri: 'file:///receipt.jpg', status: undefined }),
    ]);
  });

  it('uploads queued picks under the new id and persists the array', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);

    renderHook({ uid: 'user-1', onPersist });
    await addPick();

    await act(async () => {
      await current().commit('tx-1');
    });

    expect(storageMocks.uploadReceipt).toHaveBeenCalledWith(
      'user-1',
      'tx-1',
      'file:///receipt.jpg',
      'receipt.jpg',
      'image/jpeg',
      expect.any(Function)
    );
    expect(onPersist).toHaveBeenCalledWith('tx-1', [
      expect.objectContaining({
        name: 'receipt.jpg',
        mimeType: 'image/jpeg',
        url: UPLOAD_RESULT.url,
        path: UPLOAD_RESULT.path,
        size: UPLOAD_RESULT.size,
      }),
    ]);
    expect(current().items[0]).toMatchObject({ status: 'ready', url: UPLOAD_RESULT.url });
    expect(current().pendingCount).toBe(0);
    expect(current().error).toBeNull();
  });

  it('drives the progress bar while the file is in flight', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);
    let reportProgress: ((percent: number) => void) | undefined;
    let finishUpload: (() => void) | undefined;

    storageMocks.uploadReceipt.mockImplementation(
      async (
        _uid: string,
        _txId: string,
        _uri: string,
        _name: string,
        _contentType: string,
        onProgress?: (percent: number) => void
      ) => {
        reportProgress = onProgress;
        await new Promise<void>((resolve) => {
          finishUpload = resolve;
        });
        return UPLOAD_RESULT;
      }
    );

    renderHook({ uid: 'user-1', onPersist });
    await addPick();

    let committed!: Promise<void>;
    await act(async () => {
      committed = current().commit('tx-1');
    });

    expect(current().items[0]).toMatchObject({ status: 'uploading', progress: 0 });
    expect(current().busy).toBe(true);

    act(() => reportProgress?.(45));
    expect(current().items[0]).toMatchObject({ status: 'uploading', progress: 45 });

    await act(async () => {
      finishUpload?.();
      await committed;
    });

    expect(current().items[0]).toMatchObject({ status: 'ready', progress: 100 });
    expect(current().busy).toBe(false);
  });

  it('does nothing on commit when no file is queued', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);
    renderHook({ uid: 'user-1', onPersist });

    await act(async () => {
      await current().commit('tx-1');
    });

    expect(storageMocks.uploadReceipt).not.toHaveBeenCalled();
    expect(onPersist).not.toHaveBeenCalled();
  });

  it('keeps the file retryable and reports why when the upload fails', async () => {
    storageMocks.uploadReceipt.mockRejectedValue(new Error(ATTACHMENT_SIZE_ERROR));
    renderHook({ uid: 'user-1' });
    await addPick();

    const error = await rejection(() => current().commit('tx-1'));

    expect(error).toBeInstanceOf(Error);
    expect(current().error).toBe(ATTACHMENT_SIZE_ERROR);
    expect(current().items[0]).toMatchObject({
      status: 'error',
      errorMessage: ATTACHMENT_SIZE_ERROR,
    });
    expect(current().pendingCount).toBe(1);
  });

  it('deletes the uploaded file when the transaction write fails', async () => {
    const onPersist = vi.fn().mockRejectedValue(new Error('firestore unavailable'));
    renderHook({ uid: 'user-1', onPersist });
    await addPick();

    const error = await rejection(() => current().commit('tx-1'));

    expect(error).toBeInstanceOf(Error);
    expect(storageMocks.deleteReceipt).toHaveBeenCalledWith(UPLOAD_RESULT.path);
    expect(current().error).toBe(PERSIST_ERROR);
    expect(current().items[0]).toMatchObject({ status: 'error', url: undefined });
    expect(current().pendingCount).toBe(1);
  });
});

describe('useAttachments on an existing transaction', () => {
  it('uploads and persists a pick right away', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);
    renderHook({ uid: 'user-1', txId: 'tx-9', persisted: [storedAttachment], onPersist });

    await addPick();

    expect(storageMocks.uploadReceipt).toHaveBeenCalledWith(
      'user-1',
      'tx-9',
      'file:///receipt.jpg',
      'receipt.jpg',
      'image/jpeg',
      expect.any(Function)
    );
    expect(onPersist).toHaveBeenCalledWith('tx-9', [
      storedAttachment,
      expect.objectContaining({ path: UPLOAD_RESULT.path }),
    ]);
    expect(current().items).toHaveLength(2);
    expect(current().items[1]).toMatchObject({ status: 'ready' });
  });

  it('rolls the upload back when persisting it fails', async () => {
    const onPersist = vi.fn().mockRejectedValue(new Error('firestore unavailable'));
    renderHook({ uid: 'user-1', txId: 'tx-9', onPersist });

    await addPick();

    expect(storageMocks.deleteReceipt).toHaveBeenCalledWith(UPLOAD_RESULT.path);
    expect(current().error).toBe(PERSIST_ERROR);
    expect(current().items[0]).toMatchObject({ status: 'error' });
  });

  it('lists persisted attachments as ready', () => {
    renderHook({ uid: 'user-1', txId: 'tx-9', persisted: [storedAttachment] });

    expect(current().items).toEqual([
      expect.objectContaining({ id: 'a-1', name: 'nota.pdf', status: 'ready' }),
    ]);
  });
});

describe('useAttachments removal', () => {
  it('drops a queued file without touching Storage', async () => {
    renderHook({ uid: 'user-1' });
    await addPick();

    await act(async () => {
      await current().remove(current().items[0]);
    });

    expect(storageMocks.deleteReceipt).not.toHaveBeenCalled();
    expect(current().items).toHaveLength(0);
    expect(current().canAdd).toBe(true);
  });

  it('delegates a persisted attachment so Storage and Firestore stay in step', async () => {
    const onRemovePersisted = vi.fn().mockResolvedValue(undefined);
    renderHook({ uid: 'user-1', txId: 'tx-9', persisted: [storedAttachment], onRemovePersisted });

    await act(async () => {
      await current().remove(current().items[0]);
    });

    expect(onRemovePersisted).toHaveBeenCalledWith(storedAttachment);
    expect(current().error).toBeNull();
  });

  it('reports a failed removal without dropping the attachment from the list', async () => {
    const onRemovePersisted = vi.fn().mockRejectedValue(new Error('permission denied'));
    renderHook({ uid: 'user-1', txId: 'tx-9', persisted: [storedAttachment], onRemovePersisted });

    await act(async () => {
      await current().remove(current().items[0]);
    });

    expect(current().error).toBe(REMOVE_ERROR);
    expect(current().items).toHaveLength(1);
  });
});
