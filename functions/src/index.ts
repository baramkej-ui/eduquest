
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { beforeUserCreated } from 'firebase-functions/v2/identity';

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

// This function is the primary way to create users by an admin.
exports.createNewUser = onCall(async (request) => {
  // 1. Authentication Check: Ensure the caller is an admin.
  if (request.auth?.token.role !== 'admin') {
    throw new Error('Only admins can create new users.');
  }

  const { email, password, displayName, role, nationality } = request.data;

  try {
    // 2. Create Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // 3. Set Custom Claim for the new user's role IMMEDIATELY after creation.
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // 4. Create Firestore Document for the new user
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role,
      nationality,
    });

    return { result: `Successfully created user ${displayName}` };
  } catch (error) {
    console.error('Error creating new user:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to create new user: ${error.message}`);
    }
    throw new Error('Failed to create new user.');
  }
});

/**
 * Triggered when a document in the 'users' collection is created, updated, or deleted.
 * Its primary purpose is to keep the user's custom claims in sync with their role in Firestore.
 * This ensures that if a user's role is changed in the database, their access permissions
 * are updated immediately on their next sign-in or token refresh.
 */
exports.syncUserRole = onDocumentWritten('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const afterData = event.data?.after.data();
  const beforeData = event.data?.before.data();

  // On delete, or if role is removed, clear the custom claim.
  if (!afterData || !afterData.role) {
    // Check if there was a role before to avoid unnecessary updates
    if (beforeData?.role) {
        console.log(`User document ${userId} deleted or role removed. Clearing custom claims.`);
        try {
            await admin.auth().setCustomUserClaims(userId, { role: null });
            console.log(`Successfully cleared custom claims for user ${userId}.`);
        } catch (error) {
            console.error(`Error clearing custom claims for user ${userId}:`, error);
        }
    }
    return null;
  }

  const newRole = afterData.role;
  const oldRole = beforeData?.role;

  // If the role hasn't changed, no need to update claims.
  if (newRole === oldRole) {
    return null;
  }
  
  try {
    console.log(`Role for user ${userId} changed from '${oldRole || 'none'}' to '${newRole}'. Updating custom claims.`);
    await admin.auth().setCustomUserClaims(userId, { role: newRole });
    console.log(`Successfully set custom claims for user ${userId}.`);
    // After updating the role, revoke tokens to force the user to re-authenticate
    // and get the new custom claims.
    await admin.auth().revokeRefreshTokens(userId);
    console.log(`Successfully revoked refresh tokens for user ${userId}.`);
    return null;
  } catch (error) {
    console.error(`Error setting custom claims or revoking tokens for user ${userId}:`, error);
    return null;
  }
});


/**
 * Sets the default role for a user upon initial creation (self-signup).
 * Self-signed up users are made admins by default in this application.
 * This ensures that the very first user can manage other users.
 */
exports.addDefaultRoleOnCreate = beforeUserCreated(async (event) => {
  // Add the 'admin' role to the custom claims.
  // This claim will be readable in Firestore Security Rules.
  return {
    customClaims: { role: 'admin' },
  };
});
