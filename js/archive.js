import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const archiveList = document.getElementById("archiveList");

// Archive collection reference
const archiveRef = collection(db, "archiveTasks");
const archiveQuery = query(archiveRef, orderBy("archivedAt", "desc"));

onSnapshot(archiveQuery, (snapshot) => {
  archiveList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const task = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("archiveTask");

    div.innerHTML = `
      <div class="taskHeader">
        <p class = "taskName">${task.taskName}</p>
      </div>
      <ul class="taskDetails">
        <p class="taskDetail"><strong>Class:</strong> ${task.taskClass}</p>
        <p class="taskDetail"><strong>Due:</strong> ${task.taskDueDate}</p>
        <p class="taskDetail"><strong>Description:</strong> ${task.taskDesc}</p>
        <p class="taskDetail"><strong>Final Points:</strong> ${task.finalPoints}</p>
        <p class="taskDetail"><strong>Final EXP:</strong> ${task.finalExp}</p>
        </div>

        <div class="taskFooter">
        <p class="timeArchived"><small>Archived: ${task.archivedAt.toDate().toLocaleString()}</small></p>

        
        </div>
        <button class="deleteBtn">Delete</button>
    `;

    // Delete button
    div.querySelector(".deleteBtn").addEventListener("click", async () => {
      await deleteDoc(doc(db, "archiveTasks", docSnap.id));
    });

    archiveList.appendChild(div);
  });
});
