import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { auth } from "./firebaseConfig.js";

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

const taskNameInput = document.getElementById("taskName");
const taskClassInput = document.getElementById("taskClass");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskTimeRadios = document.getElementsByName("timeOption");
const otherTimeInput = document.querySelector("input[name='otherTimeOption']");
const taskDescInput = document.getElementById("taskDesc");
const createButton = document.querySelector(".create");

const params = new URLSearchParams(window.location.search);
const taskId = params.get("taskId");

function sanitizeInput(value) {
  return value.trim() === "" ? "N/A" : value.trim();
}

const cancelButton = document.getElementById("cancelTaskBtn");

cancelButton.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "/html/index.html";
});

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log("hello");
    return;
  }

  const userTasksCollection = collection(db, "users", user.uid, "tasks");

  if (taskId) {
    createButton.textContent = "Done";

    const taskDocRef = doc(userTasksCollection, taskId);
    const docSnap = await getDoc(taskDocRef);
    if (docSnap.exists()) {
      const task = docSnap.data();
      taskNameInput.value = task.taskName || "";
      taskClassInput.value = task.taskClass || "";
      taskDueDateInput.value = task.taskDueDate || "";
      taskDescInput.value = task.taskDesc || "";

      if (task.taskTime) {
        let matched = false;
        taskTimeRadios.forEach((radio) => {
          if (radio.value === task.taskTime) {
            radio.checked = true;
            matched = true;
          }
        });
        if (!matched) {
          document.querySelector(
            "input[name='timeOption'][value='Other hours']"
          ).checked = true;
          otherTimeInput.value = task.taskTime;
        }
      }
    }
  } else {
    createButton.textContent = "Create";
  }

  createButton.addEventListener("click", async (e) => {
    e.preventDefault();

    let selectedTime = "";
    taskTimeRadios.forEach((radio) => {
      if (radio.checked) {
        selectedTime =
          radio.value === "Other hours" ? otherTimeInput.value : radio.value;
      }
    });
    selectedTime = sanitizeInput(selectedTime);

    const taskData = {
      taskName: sanitizeInput(taskNameInput.value),
      taskClass: sanitizeInput(taskClassInput.value),
      taskDueDate: sanitizeInput(taskDueDateInput.value),
      taskTime: selectedTime,
      taskDesc: sanitizeInput(taskDescInput.value),
      taskPoints: 0,
      taskCurrency: 0,
      taskExp: 0,
      createdAt: serverTimestamp(),
    };

    if (taskId) {
      await setDoc(doc(userTasksCollection, taskId), taskData, { merge: true });
    } else {
      await addDoc(userTasksCollection, taskData);
    }

    window.location.href = "/index.html";
  });
});
