import { useCallback, useMemo, useRef, useState } from 'react';

import type { AttachmentItem } from '../components/ui/AttachmentList';
import type { PickedAttachment } from '../components/ui/AttachmentPicker.source';
import { MAX_TRANSACTION_ATTACHMENTS, validateAttachmentCandidate, type Attachment } from '../domain';
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
    // `pending` has no counterpart in the list: it renders like any settled row.
    status: draft.status === 'pending' ? undefined : draft.status,
    progress: draft.progress,
    errorMessage: draft.errorMessage,
  };
}

export interface UseAttachmentsOptions {
  /** Owner of `receipts/{uid}/{txId}/...`. */
  uid?: string | null;
  /** Existing transaction: picks upload right away. Omit for a transaction still being created. */
  txId?: string;
  /** Attachments already stored on the transaction document. */
  persisted?: Attachment[];
  /** Writes the whole attachment array back to Firestore. */
  onPersist?: (txId: string, attachments: Attachment[]) => Promise<void>;
  /** Deletes one stored attachment from Storage *and* Firestore. */
  onRemovePersisted?: (attachment: Attachment) => Promise<void>;
}

export interface UseAttachmentsResult {
  /** Persisted attachments plus in-flight drafts, ready for `AttachmentList`. */
  items: AttachmentItem[];
  error: string | null;
  /** An upload or a removal is running. */
  busy: boolean;
  canAdd: boolean;
  /** Files waiting for a transaction id. */
  pendingCount: number;
  add: (picked: PickedAttachment) => Promise<void>;
  remove: (item: AttachmentItem) => Promise<void>;
  /** Uploads everything queued under `txId` and persists it. Rejects if anything fails. */
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

  const updateDrafts = useCallback(
    (updater: (current: AttachmentDraft[]) => AttachmentDraft[]) => {
      draftsRef.current = updater(draftsRef.current);
      setDrafts(draftsRef.current);
    },
    []
  );

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
      // A committed draft lingers until the transaction reload lists it as persisted.
      ...drafts.filter((draft) => !persistedIds.has(draft.id)).map(draftToItem),
    ];
  }, [drafts, persistedList]);

  /** Best-effort: keeps Storage clean when the Firestore write never lands. */
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

      // No transaction id yet: the file waits for `commit` so a cancelled form
      // never leaves an orphan in Storage.
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
        // Sequential: one progress bar moves at a time and only one blob is held in memory.
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
        // Uploaded moments ago but not reloaded yet — drop the file too.
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
