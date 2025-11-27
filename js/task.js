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

// Form elements
const taskNameInput = document.getElementById("taskName");
const taskClassInput = document.getElementById("taskClass");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskTimeRadios = document.getElementsByName("timeOption");
const otherTimeInput = document.querySelector("input[name='otherTimeOption']");
const taskDescInput = document.getElementById("taskDesc");
const createButton = document.querySelector(".create");

// Get taskId from URL
const params = new URLSearchParams(window.location.search);
const taskId = params.get("taskId");

// Helper function to convert empty/space-only input to "N/A"
function sanitizeInput(value) {
  return value.trim() === "" ? "N/A" : value.trim();
}

// If editing an existing task
if (taskId) {
  createButton.textContent = "Done"; // Change button text to DONE

  const taskDocRef = doc(db, "tasks", taskId);
  getDoc(taskDocRef).then((docSnap) => {
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
  });
} else {
  createButton.textContent = "Create"; // Default text for new tasks
}

// On form submit (create or update task)
createButton.addEventListener("click", async (e) => {
  e.preventDefault();

  // Determine selected time
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
    taskDueDate: convertToISO(sanitizeInput(taskDueDateInput.value)),
    taskTime: selectedTime,
    taskDesc: sanitizeInput(taskDescInput.value),
    taskPoints: 0,
    taskExp: 0,
    createdAt: serverTimestamp(),
  };

  if (taskId) {
    // Update existing task
    await setDoc(doc(db, "tasks", taskId), taskData, { merge: true });
  } else {
    // Create new task with auto-generated ID
    await addDoc(collection(db, "tasks"), taskData);
  }

  // Redirect back to index
  window.location.href = "/index.html";
});

function convertToISO(dateString) {
  if (dateString === "N/A") return "N/A";
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}
