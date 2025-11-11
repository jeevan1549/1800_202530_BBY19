import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Increment points for all tasks every minute
export const incrementTaskPoints = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const tasksSnapshot = await db.collection("tasks").get();

    tasksSnapshot.forEach(async (doc) => {
      const currentPoints = doc.data().points || 0;
      await doc.ref.update({ points: currentPoints + 1 });
    });

    console.log("Points updated for all tasks");
    return null;
  });
