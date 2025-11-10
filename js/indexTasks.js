import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

// Firebase config from .env
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

const taskList = document.getElementById("taskList");

// Real-time listener for tasks
const tasksRef = collection(db, "tasks");
const tasksQuery = query(tasksRef, orderBy("createdAt", "desc")); // newest first

onSnapshot(tasksQuery, (snapshot) => {
  taskList.innerHTML = ""; // clear previous tasks
  snapshot.forEach((doc) => {
    const task = doc.data();

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("taskItem");

    taskDiv.innerHTML = `
      <h3>${task.taskName}</h3>
      <p><strong>Class:</strong> ${task.taskClass}</p>
      <p><strong>Due:</strong> ${task.taskDueDate}</p>
      ${task.taskTime ? `<p><strong>Time:</strong> ${task.taskTime}</p>` : ""}
      ${
        task.taskDesc
          ? `<p><strong>Description:</strong> ${task.taskDesc}</p>`
          : ""
      }
    `;

    taskList.appendChild(taskDiv);
  });
});
