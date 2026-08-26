import { useCallback, useMemo, useRef, useState } from 'react';

import type { AttachmentItem } from '../components/ui/AttachmentList';
import type { PickedAttachment } from '../components/ui/AttachmentPicker.source';
import {
  MAX_TRANSACTION_ATTACHMENTS,
  validateAttachmentCandidate,
  type Attachment,
} from '../domain';
import { storageService } from '../services/storage.service';

const UPLOAD_ERROR = 'Não foi possível enviar o anexo. Tente novamente.';
const PERSIST_ERROR = 'Anexo enviado, mas não foi possível vinculá-lo à transação.';
const REMOVE_ERROR = 'Não foi possível remover o anexo. Tente novamente.';
const SESSION_ERROR = 'Sessão expirada. Entre novamente para anexar recibos.';

type DraftStatus = 'pending' | 'uploading' | 'ready' | 'error';

interface AttachmentDraft {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uri: string;
  status: DraftStatus;
  progress: number;
  url?: string;
  path?: string;
  errorMessage?: string;
}

let draftSequence = 0;

function nextAttachmentId(): string {
  draftSequence += 1;
  return `att-${Date.now().toString(36)}-${draftSequence.toString(36)}`;
}

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toItem(attachment: Attachment): AttachmentItem {
  return { ...attachment, status: 'ready' };
}

function draftToItem(draft: AttachmentDraft): AttachmentItem {
  return {
    id: draft.id,
    name: draft.name,
    size: draft.size,
    mimeType: draft.mimeType,
    uri: draft.uri,
    url: draft.url,
    path: draft.path,
    status: draft.status === 'pending' ? undefined : draft.status,
    progress: draft.progress,
    errorMessage: draft.errorMessage,
  };
}

export interface UseAttachmentsOptions {
  uid?: string | null;
  txId?: string;
  persisted?: Attachment[];
  onPersist?: (txId: string, attachments: Attachment[]) => Promise<void>;
  onRemovePersisted?: (attachment: Attachment) => Promise<void>;
}

export interface UseAttachmentsResult {
  items: AttachmentItem[];
  error: string | null;
  busy: boolean;
  canAdd: boolean;
  pendingCount: number;
  add: (picked: PickedAttachment) => Promise<void>;
  remove: (item: AttachmentItem) => Promise<void>;
  commit: (txId: string) => Promise<void>;
  setError: (message: string | null) => void;
}

export function useAttachments({
  uid,
  txId,
  persisted,
  onPersist,
  onRemovePersisted,
}: UseAttachmentsOptions = {}): UseAttachmentsResult {
  const [drafts, setDrafts] = useState<AttachmentDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const draftsRef = useRef<AttachmentDraft[]>([]);
  const persistedList = useMemo(() => persisted ?? [], [persisted]);

  const updateDrafts = useCallback((updater: (current: AttachmentDraft[]) => AttachmentDraft[]) => {
    draftsRef.current = updater(draftsRef.current);
    setDrafts(draftsRef.current);
  }, []);

  const patchDraft = useCallback(
    (id: string, patch: Partial<AttachmentDraft>) => {
      updateDrafts((current) =>
        current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
      );
    },
    [updateDrafts]
  );

  const items = useMemo<AttachmentItem[]>(() => {
    const persistedIds = new Set(persistedList.map((attachment) => attachment.id));

    return [
      ...persistedList.map(toItem),
      ...drafts.filter((draft) => !persistedIds.has(draft.id)).map(draftToItem),
    ];
  }, [drafts, persistedList]);

  const discardUploads = useCallback(async (paths: string[]) => {
    await Promise.all(
      paths.map((path) => storageService.deleteReceipt(path).catch(() => undefined))
    );
  }, []);

  const uploadDraft = useCallback(
    async (targetTxId: string, draft: AttachmentDraft): Promise<Attachment> => {
      if (!uid) throw new Error(SESSION_ERROR);

      patchDraft(draft.id, { status: 'uploading', progress: 0, errorMessage: undefined });

      const { url, path, size } = await storageService.uploadReceipt(
        uid,
        targetTxId,
        draft.uri,
        draft.name,
        draft.mimeType,
        (percent) => patchDraft(draft.id, { progress: percent })
      );

      return { id: draft.id, name: draft.name, mimeType: draft.mimeType, url, path, size };
    },
    [patchDraft, uid]
  );

  const failDrafts = useCallback(
    (failed: AttachmentDraft[], message: string) => {
      const failedIds = new Set(failed.map((draft) => draft.id));

      updateDrafts((current) =>
        current.map((draft) =>
          failedIds.has(draft.id)
            ? {
                ...draft,
                status: 'error',
                progress: 0,
                url: undefined,
                path: undefined,
                errorMessage: message,
              }
            : draft
        )
      );
      setError(message);
    },
    [updateDrafts]
  );

  const add = useCallback(
    async (picked: PickedAttachment) => {
      setError(null);

      const rejection = validateAttachmentCandidate(
        { mimeType: picked.contentType, size: picked.size },
        items.length
      );
      if (rejection) {
        setError(rejection);
        return;
      }

      if (!uid) {
        setError(SESSION_ERROR);
        return;
      }

      const draft: AttachmentDraft = {
        id: nextAttachmentId(),
        name: picked.name,
        size: picked.size ?? 0,
        mimeType: picked.contentType,
        uri: picked.uri,
        status: 'pending',
        progress: 0,
      };

      updateDrafts((current) => [...current, draft]);

      if (!txId) return;

      let uploaded: Attachment | undefined;
      try {
        uploaded = await uploadDraft(txId, draft);
        await onPersist?.(txId, [...persistedList, uploaded]);
      } catch (uploadError) {
        const failedPersist = uploaded !== undefined;
        if (uploaded) await discardUploads([uploaded.path]);
        failDrafts([draft], failedPersist ? PERSIST_ERROR : messageFrom(uploadError, UPLOAD_ERROR));
        return;
      }

      patchDraft(draft.id, {
        status: 'ready',
        progress: 100,
        url: uploaded.url,
        path: uploaded.path,
        size: uploaded.size,
      });
    },
    [
      discardUploads,
      failDrafts,
      items.length,
      onPersist,
      patchDraft,
      persistedList,
      txId,
      uid,
      updateDrafts,
      uploadDraft,
    ]
  );

  const commit = useCallback(
    async (targetTxId: string) => {
      const queued = draftsRef.current.filter((draft) => !draft.path);
      if (queued.length === 0) return;

      if (!uid) {
        failDrafts(queued, SESSION_ERROR);
        throw new Error(SESSION_ERROR);
      }

      setError(null);
      const uploaded: Attachment[] = [];

      try {
        for (const draft of queued) {
          uploaded.push(await uploadDraft(targetTxId, draft));
        }
      } catch (uploadError) {
        await discardUploads(uploaded.map((attachment) => attachment.path));
        failDrafts(queued, messageFrom(uploadError, UPLOAD_ERROR));
        throw uploadError;
      }

      try {
        await onPersist?.(targetTxId, [...persistedList, ...uploaded]);
      } catch (persistError) {
        await discardUploads(uploaded.map((attachment) => attachment.path));
        failDrafts(queued, PERSIST_ERROR);
        throw persistError;
      }

      const byId = new Map(uploaded.map((attachment) => [attachment.id, attachment]));
      updateDrafts((current) =>
        current.map((draft) => {
          const attachment = byId.get(draft.id);
          if (!attachment) return draft;

          return {
            ...draft,
            status: 'ready',
            progress: 100,
            url: attachment.url,
            path: attachment.path,
            size: attachment.size,
          };
        })
      );
    },
    [discardUploads, failDrafts, onPersist, persistedList, uid, updateDrafts, uploadDraft]
  );

  const remove = useCallback(
    async (item: AttachmentItem) => {
      setError(null);

      const draft = draftsRef.current.find((current) => current.id === item.id);
      const stored = persistedList.find((attachment) => attachment.id === item.id);

      if (!stored) {
        updateDrafts((current) => current.filter((entry) => entry.id !== item.id));
        if (draft?.path) await discardUploads([draft.path]);
        return;
      }

      setRemoving(true);
      try {
        await onRemovePersisted?.(stored);
        updateDrafts((current) => current.filter((entry) => entry.id !== item.id));
      } catch {
        setError(REMOVE_ERROR);
      } finally {
        setRemoving(false);
      }
    },
    [discardUploads, onRemovePersisted, persistedList, updateDrafts]
  );

  const uploading = drafts.some((draft) => draft.status === 'uploading');

  return {
    items,
    error,
    busy: uploading || removing,
    canAdd: items.length < MAX_TRANSACTION_ATTACHMENTS,
    pendingCount: drafts.filter((draft) => !draft.path).length,
    add,
    remove,
    commit,
    setError,
  };
}
