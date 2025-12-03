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
  setDoc,
  serverTimestamp,
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

const taskList = document.getElementById("taskList");
const welcomeContainer = document.querySelector(".welcomeContainer");

function sanitizeInput(value) {
  return value && value.trim() ? value.trim() : "N/A";
}

const pointsIntervals = new Map();

auth.onAuthStateChanged((user) => {
  if (!user) return;

  const userTasksCollection = collection(db, "users", user.uid, "tasks");
  const tasksQuery = query(userTasksCollection, orderBy("createdAt", "desc"));

  onSnapshot(tasksQuery, (snapshot) => {
    taskList.innerHTML = "";

    pointsIntervals.forEach((intervalId) => clearInterval(intervalId));
    pointsIntervals.clear();

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

      const taskHeader = document.createElement("div");
      taskHeader.classList.add("taskHeader");
      taskHeader.innerHTML = `
        <span class="name">${sanitizeInput(task.taskName)}</span>
        <span class="taskReward">${task.taskPoints || 0} points :</span>
        <span class="taskReward2">${task.taskCurrency || 0} S</span>
        <div class="toggle"></div>
      `;

      const pointsSpan = taskHeader.querySelector(".taskReward");
      let points = task.taskPoints || 0;
      let currency = task.taskCurrency || 0;
      let exp = task.taskExp || 0;

      const intervalId = setInterval(async () => {
        points += 50;
        currency += 25;
        exp += 20;
        pointsSpan.textContent = `${points} points`;
        await updateDoc(doc(userTasksCollection, docSnap.id), {
          taskPoints: points,
          taskCurrency: currency,
          taskExp: exp,
        });
      }, 2500);
      pointsIntervals.set(docSnap.id, intervalId);

      const taskDetails = document.createElement("ul");
      taskDetails.classList.add("taskDetails");
      taskDetails.innerHTML = `
        <li><strong>Class:</strong> ${sanitizeInput(task.taskClass)}</li>
        <li><strong>Due:</strong> ${sanitizeInput(task.taskDueDate)}</li>
        <li><strong>Duration:</strong> ${sanitizeInput(task.taskTime)}</li>
        <li><strong>Description:</strong> ${sanitizeInput(task.taskDesc)}</li>
      `;

      const taskButtons = document.createElement("div");
      taskButtons.classList.add("taskButtons");
      taskButtons.innerHTML = `
        <button class="editButton">EDIT</button>
        <button class="doneButton">DONE</button>
      `;

      taskButtons.querySelector(".editButton").addEventListener("click", () => {
        window.location.href = `/html/task1.html?taskId=${docSnap.id}`;
      });

      taskButtons
        .querySelector(".doneButton")
        .addEventListener("click", async () => {
          taskDiv.classList.add("completed");

          clearInterval(pointsIntervals.get(docSnap.id));
          pointsIntervals.delete(docSnap.id);

          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const totalCurrency = (userData.currency || 0) + currency;
            const totalPoints = (userData.points || 0) + points;
            const totalExp = (userData.exp || 0) + exp;
            await updateDoc(userRef, {
              points: totalPoints,
              exp: totalExp,
              currency: totalCurrency,
            });
          }

          try {
            const archiveRef = collection(
              db,
              "users",
              user.uid,
              "archivedTasks"
            );
            await setDoc(doc(archiveRef, docSnap.id), {
              ...task,
              archivedAt: serverTimestamp(),
              finalPoints: points,
              finalExp: exp,
            });

            await deleteDoc(doc(userTasksCollection, docSnap.id));
            taskDiv.classList.add("remove");
          } catch (err) {
            console.error("Error archiving task:", err);
            alert("There was an issue archiving your task.");
          }
        });

      const taskFooter = document.createElement("div");
      taskFooter.classList.add("taskFooter");
      const createdDate = task.createdAt?.toDate
        ? task.createdAt.toDate().toLocaleString()
        : new Date().toLocaleString();
      taskFooter.textContent = createdDate;

      taskDiv.appendChild(taskHeader);
      taskDiv.appendChild(taskDetails);
      taskDiv.appendChild(taskButtons);
      taskDiv.appendChild(taskFooter);

      todolist.appendChild(taskDiv);
      taskList.appendChild(todolist);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          todolist.classList.add("show");
        });
      });
    });
  });
});
