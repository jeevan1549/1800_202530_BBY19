import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

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

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const taskName = document.getElementById("taskName").value.trim();
  const taskClass = document.getElementById("taskClass").value.trim();
  const taskDueDate = document.getElementById("taskDueDate").value.trim();
  const taskDesc = document.getElementById("taskDesc").value.trim();

  const timeOptions = document.getElementsByName("timeOption");
  let taskTime = "";
  timeOptions.forEach((option) => {
    if (option.checked) {
      taskTime =
        option.value === "Other hours"
          ? document.querySelector('input[name="otherTimeOption"]').value || ""
          : option.value;
    }
  });

  if (!taskName || !taskClass || !taskDueDate) {
    return;
  }

  try {
    await addDoc(collection(db, "tasks"), {
      taskName,
      taskClass,
      taskDueDate,
      taskTime,
      taskDesc,
      createdAt: serverTimestamp(),
    });

    window.location.href = "/index.html";
  } catch (err) {
    console.error("Error adding task:", err);
  }
});
