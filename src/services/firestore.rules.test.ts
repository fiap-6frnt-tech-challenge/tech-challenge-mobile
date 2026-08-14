import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const host = '127.0.0.1';
const port = 8080;

async function isEmulatorRunning(): Promise<boolean> {
  try {
    const res = await fetch(`http://${host}:${port}/`);
    if (res.status !== 200) return false;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json.status === 'ok';
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

describe('Firestore Security Rules', async () => {
  const running = await isEmulatorRunning();

  if (!running) {
    it.skip('Skipping Firestore security rules tests because the Firestore emulator is not running', () => {});
    return;
  }

  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const rulesPath = resolve(__dirname, '../../firestore.rules');
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-bytebank',
      firestore: {
        rules: readFileSync(rulesPath, 'utf8'),
        host,
        port,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('allows a user to read and write their own user document', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = doc(aliceDb, 'users/alice');

    await expect(setDoc(docRef, { name: 'Alice' })).resolves.not.toThrow();
    await expect(getDoc(docRef)).resolves.not.toThrow();
  });

  it('denies User A from reading/writing User B document', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDocRef = doc(aliceDb, 'users/bob');

    await expect(getDoc(bobDocRef)).rejects.toThrow();
    await expect(setDoc(bobDocRef, { name: 'Bob' })).rejects.toThrow();
  });

  it('allows a user to read and write their own transactions', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const docRef = doc(aliceDb, 'users/alice/transactions/tx123');

    await expect(
      setDoc(docRef, {
        description: 'Allowed transaction',
        amount: 100,
        category: 'Food',
        date: '2026-08-12',
      })
    ).resolves.not.toThrow();

    await expect(getDoc(docRef)).resolves.not.toThrow();
  });

  it('denies User A from reading User B transactions', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDocRef = doc(aliceDb, 'users/bob/transactions/tx123');

    await expect(getDoc(bobDocRef)).rejects.toThrow();
  });

  it('denies User A from writing User B transactions', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDocRef = doc(aliceDb, 'users/bob/transactions/tx123');

    await expect(
      setDoc(bobDocRef, {
        description: 'Forbidden transaction',
        amount: 100,
        category: 'Food',
        date: '2026-08-12',
      })
    ).rejects.toThrow();
  });

  it('denies unauthenticated read/write access', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthDb, 'users/alice/transactions/tx123');

    await expect(getDoc(docRef)).rejects.toThrow();
    await expect(
      setDoc(docRef, {
        description: 'Unauth transaction',
        amount: 100,
        category: 'Food',
        date: '2026-08-12',
      })
    ).rejects.toThrow();
  });
});
