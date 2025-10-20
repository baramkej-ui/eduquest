import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

exports.createNewUser = onCall(async (request) => {
  if (request.auth?.token.role !== "admin") {
    throw new Error("Only admins can create new users.");
  }

  const { email, password, displayName, role, nationality } = request.data;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      role,
      nationality,
    });

    return { result: `Successfully created user ${displayName}` };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new Error("Failed to create new user.");
  }
});
