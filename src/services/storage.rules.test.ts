import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const host = '127.0.0.1';
const port = 9199;
const bucket = 'gs://demo-bytebank.appspot.com';

async function isEmulatorRunning(): Promise<boolean> {
  try {
    const response = await fetch(`http://${host}:${port}/`);
    return response.ok;
  } catch {
    return false;
  }
}

describe('Storage Security Rules', async () => {
  const running = await isEmulatorRunning();

  if (!running) {
    it.skip('Skipping Storage security rules tests because the emulator is not running', () => {});
    return;
  }

  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-bytebank',
      storage: {
        rules: readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8'),
        host,
        port,
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearStorage();
  });

  it('allows an owner to upload, read, and delete a valid receipt', async () => {
    const storage = testEnv.authenticatedContext('alice').storage(bucket);
    const receipt = ref(storage, 'receipts/alice/tx-1/receipt.pdf');
    const content = new Uint8Array([1, 2, 3]);

    await expect(
      uploadBytes(receipt, content, { contentType: 'application/pdf' })
    ).resolves.toBeDefined();
    await expect(getBytes(receipt)).resolves.toEqual(content);
    await expect(deleteObject(receipt)).resolves.toBeUndefined();
  });

  it('denies another user from reading, writing, or deleting an owner receipt', async () => {
    const aliceStorage = testEnv.authenticatedContext('alice').storage(bucket);
    const bobStorage = testEnv.authenticatedContext('bob').storage(bucket);
    const aliceReceipt = ref(aliceStorage, 'receipts/alice/tx-1/receipt.png');
    const bobReceipt = ref(bobStorage, 'receipts/alice/tx-1/receipt.png');

    await uploadBytes(aliceReceipt, new Uint8Array([1]), { contentType: 'image/png' });

    await expect(getBytes(bobReceipt)).rejects.toThrow();
    await expect(
      uploadBytes(bobReceipt, new Uint8Array([2]), { contentType: 'image/png' })
    ).rejects.toThrow();
    await expect(deleteObject(bobReceipt)).rejects.toThrow();
  });

  it('denies unauthenticated access and invalid receipt content', async () => {
    const unauthenticatedStorage = testEnv.unauthenticatedContext().storage(bucket);
    const ownerStorage = testEnv.authenticatedContext('alice').storage(bucket);
    const unauthenticatedReceipt = ref(unauthenticatedStorage, 'receipts/alice/tx-1/receipt.pdf');
    const invalidTypeReceipt = ref(ownerStorage, 'receipts/alice/tx-1/receipt.gif');
    const oversizedReceipt = ref(ownerStorage, 'receipts/alice/tx-1/large.pdf');

    await expect(
      uploadBytes(unauthenticatedReceipt, new Uint8Array([1]), { contentType: 'application/pdf' })
    ).rejects.toThrow();
    await expect(
      uploadBytes(invalidTypeReceipt, new Uint8Array([1]), { contentType: 'image/gif' })
    ).rejects.toThrow();
    await expect(
      uploadBytes(oversizedReceipt, new Uint8Array(5 * 1024 * 1024 + 1), {
        contentType: 'application/pdf',
      })
    ).rejects.toThrow();
  });
});
