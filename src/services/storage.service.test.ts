import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ATTACHMENT_SIZE_ERROR, ATTACHMENT_TYPE_ERROR } from '../domain';
import { storageService } from './storage.service';

const firebaseService = vi.hoisted(() => ({
  storage: { name: 'storage-instance' },
}));

const firebaseStorage = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  getDownloadURL: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
}));

vi.mock('./firebase', () => firebaseService);
vi.mock('firebase/storage', () => firebaseStorage);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

describe('storage service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects unsupported content types before reading the local file', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      storageService.uploadReceipt(
        'user-123',
        'tx-123',
        'file:///receipt.gif',
        'receipt.gif',
        'image/gif'
      )
    ).rejects.toThrow(ATTACHMENT_TYPE_ERROR);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(firebaseStorage.uploadBytesResumable).not.toHaveBeenCalled();
  });

  it('rejects files larger than 5 MB before starting the upload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(new Blob([new Uint8Array(MAX_FILE_SIZE + 1)])),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      storageService.uploadReceipt(
        'user-123',
        'tx-123',
        'file:///large.pdf',
        'large.pdf',
        'application/pdf'
      )
    ).rejects.toThrow(ATTACHMENT_SIZE_ERROR);

    expect(fetchMock).toHaveBeenCalledWith('file:///large.pdf');
    expect(firebaseStorage.uploadBytesResumable).not.toHaveBeenCalled();
  });

  it('uploads an allowed file, reports progress, and returns its URL and metadata', async () => {
    const uploadedRef = { fullPath: 'receipts/user-123/tx-123/receipt.pdf' };
    const uploadTask = {
      snapshot: { ref: uploadedRef },
      on: vi.fn(),
    };
    const blob = new Blob(['receipt contents'], { type: 'application/pdf' });
    const fetchMock = vi.fn().mockResolvedValue({ blob: vi.fn().mockResolvedValue(blob) });
    const progress = vi.fn();

    vi.stubGlobal('fetch', fetchMock);
    firebaseStorage.ref.mockReturnValue(uploadedRef);
    firebaseStorage.uploadBytesResumable.mockReturnValue(uploadTask);
    firebaseStorage.getDownloadURL.mockResolvedValue('https://storage.test/receipt.pdf');
    uploadTask.on.mockImplementation(
      (
        _event: unknown,
        next: (snapshot: { bytesTransferred: number; totalBytes: number }) => void,
        _error: unknown,
        complete: () => void
      ) => {
        next({ bytesTransferred: 25, totalBytes: 100 });
        next({ bytesTransferred: 100, totalBytes: 100 });
        complete();
      }
    );

    await expect(
      storageService.uploadReceipt(
        'user-123',
        'tx-123',
        'file:///receipt.pdf',
        'receipt.pdf',
        'application/pdf',
        progress
      )
    ).resolves.toEqual({
      url: 'https://storage.test/receipt.pdf',
      path: expect.stringMatching(/^receipts\/user-123\/tx-123\/\d+-receipt\.pdf$/),
      size: blob.size,
    });

    expect(firebaseStorage.ref).toHaveBeenCalledWith(
      firebaseService.storage,
      expect.stringMatching(/^receipts\/user-123\/tx-123\/\d+-receipt\.pdf$/)
    );
    expect(firebaseStorage.uploadBytesResumable).toHaveBeenCalledWith(uploadedRef, blob, {
      contentType: 'application/pdf',
    });
    expect(uploadTask.on).toHaveBeenCalledWith(
      'state_changed',
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    );
    expect(progress).toHaveBeenCalledWith(25);
    expect(progress).toHaveBeenCalledWith(100);
    expect(firebaseStorage.getDownloadURL).toHaveBeenCalledWith(uploadedRef);
  });

  it('deletes a receipt using its Storage path', async () => {
    const receiptRef = { fullPath: 'receipts/user-123/tx-123/receipt.png' };
    firebaseStorage.ref.mockReturnValue(receiptRef);
    firebaseStorage.deleteObject.mockResolvedValue(undefined);

    await expect(storageService.deleteReceipt(receiptRef.fullPath)).resolves.toBeUndefined();

    expect(firebaseStorage.ref).toHaveBeenCalledWith(firebaseService.storage, receiptRef.fullPath);
    expect(firebaseStorage.deleteObject).toHaveBeenCalledWith(receiptRef);
  });
});
