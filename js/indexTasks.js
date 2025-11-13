import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { auth } from "./firebaseConfig.js";

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

const taskList = document.getElementById("taskList");
const welcomeContainer = document.querySelector(".welcomeContainer");

// Helper: sanitize empty or whitespace-only strings
function sanitizeInput(value) {
  return value && value.trim() ? value.trim() : "N/A";
}

// Store references to points intervals
const pointsIntervals = new Map();

// Real-time listener for tasks
const tasksRef = collection(db, "tasks");
const tasksQuery = query(tasksRef, orderBy("createdAt", "desc"));

onSnapshot(tasksQuery, (snapshot) => {
  taskList.innerHTML = "";

  // Clear existing intervals when tasks reload
  pointsIntervals.forEach((intervalId) => clearInterval(intervalId));
  pointsIntervals.clear();

  // Show/hide welcome message
  if (snapshot.empty) {
    if (welcomeContainer) welcomeContainer.style.display = "block";
  } else {
    if (welcomeContainer) welcomeContainer.style.display = "none";
  }

  snapshot.forEach((docSnap) => {
    const task = docSnap.data();

    const todolist = document.createElement("div");
    todolist.classList.add("todolist");

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");

    // Task header
    const taskHeader = document.createElement("div");
    taskHeader.classList.add("taskHeader");
    taskHeader.innerHTML = `
      <span class="name">${sanitizeInput(task.taskName)}</span>
      <span class="taskReward">${task.taskPoints || 0} points</span>
      <div class="toggle"></div>
    `;

    const pointsSpan = taskHeader.querySelector(".taskReward");
    let points = task.taskPoints || 0;
    let exp = task.taskExp || 0; // <-- initialize task EXP

    // Increment points and EXP every interval
    const intervalId = setInterval(async () => {
      points += 50;
      exp += 20; // increase EXP per interval
      pointsSpan.textContent = `${points} points`;
      await updateDoc(doc(db, "tasks", docSnap.id), {
        taskPoints: points,
        taskExp: exp,
      });
    }, 10_000); // 60_000 for production
    pointsIntervals.set(docSnap.id, intervalId);

    // Task details
    const taskDetails = document.createElement("ul");
    taskDetails.classList.add("taskDetails");
    taskDetails.innerHTML = `
      <li><strong>Class:</strong> ${sanitizeInput(task.taskClass)}</li>
      <li><strong>Due:</strong> ${sanitizeInput(task.taskDueDate)}</li>
      <li><strong>Duration:</strong> ${sanitizeInput(task.taskTime)}</li>
      <li><strong>Description:</strong> ${sanitizeInput(task.taskDesc)}</li>
    `;

    // Task buttons
    const taskButtons = document.createElement("div");
    taskButtons.classList.add("taskButtons");
    taskButtons.innerHTML = `
      <button class="editButton">EDIT</button>
      <button class="doneButton">DONE</button>
    `;

    // Edit button
    taskButtons.querySelector(".editButton").addEventListener("click", () => {
      window.location.href = `/html/task1.html?taskId=${docSnap.id}`;
    });

    // Done button
    taskButtons
      .querySelector(".doneButton")
      .addEventListener("click", async () => {
        taskDiv.classList.add("completed");

        // Stop points interval
        clearInterval(pointsIntervals.get(docSnap.id));
        pointsIntervals.delete(docSnap.id);

        // Add task points and EXP to current user
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const totalPoints = (userData.points || 0) + points;
            const totalExp = (userData.exp || 0) + exp;
            await updateDoc(userRef, { points: totalPoints, exp: totalExp });
          }
        }
      

      try {
        const archiveRef = collection(db, "archiveTasks");
        await setDoc(doc(archiveRef, docSnap.id), {
          ...task,
          archivedAt: new Date(),
          finalPoints: points,
          finalExp: exp,
          userId: auth.currentUser ? auth.currentUser.uid : "guest",
        });

        await deleteDoc(doc(db, "tasks", docSnap.id));
        taskDiv.classList.add("remove");
        setTimeout(() => {
          window.location.href = "/html/archive.html";}, 600);
        } catch (err) {
          console.error("Error archiving task:", err);
          alert("There was an issue archiving your task.");
        }
      });


    // Task footer
    const taskFooter = document.createElement("div");
    taskFooter.classList.add("taskFooter");
    const createdDate = task.createdAt?.toDate
      ? task.createdAt.toDate().toLocaleString()
      : new Date().toLocaleString();
    taskFooter.textContent = createdDate;

    // Assemble task
    taskDiv.appendChild(taskHeader);
    taskDiv.appendChild(taskDetails);
    taskDiv.appendChild(taskButtons);
    taskDiv.appendChild(taskFooter);

    todolist.appendChild(taskDiv);
    taskList.appendChild(todolist);

    // Smooth fade-in animation when tasks are loaded
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        todolist.classList.add("show");
      });
    });
  });
});
