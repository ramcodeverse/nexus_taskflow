import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { setDoc, getDocs, updateDoc, collection, doc } from 'firebase/firestore';

const PROJECT_ID = 'gen-lang-client-0878004068';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules', () => {
  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync('DRAFT_firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  function getContext(auth?: { uid: string; email_verified?: boolean }): RulesTestContext {
    return auth
      ? testEnv.authenticatedContext(auth.uid, { email_verified: auth.email_verified ?? true })
      : testEnv.unauthenticatedContext();
  }

  it('Payload 1: Identity Spoofing (Create Profile) - Denied', async () => {
    const context = getContext({ uid: 'attacker_uid' });
    const db = context.firestore();
    const profileDoc = doc(db, 'profiles', 'victim_uid');
    
    await expect(setDoc(profileDoc, {
      full_name: 'Attacker',
      avatar_url: '',
      role: 'member',
      created_at: new Date(),
      updated_at: new Date(),
    })).rejects.toThrow();
  });

  it('Payload 2: Privilege Escalation (Update Role) - Denied', async () => {
    const context = getContext({ uid: 'my_uid' });
    const db = context.firestore();
    const profileDoc = doc(db, 'profiles', 'my_uid');
    
    // Set initial profile as member
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      await setDoc(doc(adminContext.firestore(), 'profiles', 'my_uid'), {
        full_name: 'Me',
        avatar_url: '',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    await expect(updateDoc(profileDoc, { role: 'admin' })).rejects.toThrow();
  });

  it('Payload 4: Resource Exhaustion (Large String) - Denied', async () => {
    const context = getContext({ uid: 'member_uid' });
    const db = context.firestore();
    
    // Set membership
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      await setDoc(doc(adminContext.firestore(), 'projects', 'p1', 'members', 'member_uid'), {
        role: 'member',
        joined_at: new Date(),
      });
    });

    const taskDoc = doc(db, 'projects', 'p1', 'tasks', 't1');
    await expect(setDoc(taskDoc, {
      project_id: 'p1',
      title: 'A'.repeat(1000), // Max is 500 in rules
      description: '...',
      status: 'todo',
      priority: 'low',
      position: 1,
      created_by: 'member_uid',
      created_at: new Date(),
      updated_at: new Date(),
    })).rejects.toThrow();
  });

  it('Payload 7: Notification Snooping - Denied', async () => {
    const context = getContext({ uid: 'user_A' });
    const db = context.firestore();
    const q = collection(db, 'notifications');
    
    // Attempting to read all (or someone else's if query supported it)
    await expect(getDocs(q)).rejects.toThrow();
  });
});
