'use server';

import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { UserRecord } from 'firebase-admin/auth';
import { setGlobalOptions } from 'firebase-functions/v2';
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity';

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

// This function is now the primary way to create users by an admin.
exports.createNewUser = onCall(async (request) => {
  // 1. Verify the caller is an admin.
  if (request.auth?.token.role !== 'admin') {
    throw new Error('Only admins can create new users.');
  }

  // 2. Get user data from the request.
  const { email, password, displayName, role, nationality } = request.data;

  try {
    // 3. Create the user in Firebase Authentication.
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // 4. Set the custom user claims (role).
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // 5. Create the user document in Firestore.
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role,
      nationality,
    });

    return { result: `Successfully created user ${displayName}` };
  } catch (error) {
    console.error('Error creating new user:', error);
    // Propagate a more specific error message if available.
    if (error instanceof Error) {
        throw new Error(`Failed to create new user: ${error.message}`);
    }
    throw new Error('Failed to create new user.');
  }
});


/**
 * Triggered when a document in the 'users' collection is created, updated, or deleted.
 * Its primary purpose is to keep the user's custom claims in sync with their role in Firestore.
 */
exports.syncUserRole = onDocumentWritten('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const afterData = event.data?.after.data();
  const beforeData = event.data?.before.data();

  const newRole = afterData?.role;
  const oldRole = beforeData?.role;

  // If the role hasn't changed, do nothing.
  if (newRole === oldRole) {
    console.log(`Role for user ${userId} is unchanged. No action needed.`);
    return null;
  }

  // If the document is deleted or the role is removed, log it.
  // We don't remove claims on deletion to avoid potential issues if the user is recreated.
  if (!afterData || !newRole) {
    console.log(`User document ${userId} deleted or role removed. Claims not modified.`);
    return null;
  }
  
  try {
    // Role has changed, update the custom claims.
    console.log(`Role for user ${userId} changed from '${oldRole}' to '${newRole}'. Updating custom claims.`);
    await admin.auth().setCustomUserClaims(userId, { role: newRole });
    console.log(`Successfully set custom claims for user ${userId}.`);
    return null;
  } catch (error) {
    console.error(`Error setting custom claims for user ${userId}:`, error);
    return null;
  }
});


/**
 * Sets the default role for a user upon initial creation (self-signup).
 * Self-signed up users are made admins by default in this application.
 */
exports.addDefaultRoleOnCreate = beforeUserCreated(async (event) => {
  return {
    customClaims: { role: 'admin' },
  };
});
