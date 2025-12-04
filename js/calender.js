import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

let tasks = [];

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const tasksRef = collection(db, "users", user.uid, "tasks");

  onSnapshot(tasksRef, (snapshot) => {
    tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    renderTasksToCalendar(tasks);
  });
});

const monthYearElement = document.getElementById("month-year");
const datesElement = document.getElementById("dates");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentDate = new Date();

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();
  const firstDayIndex = firstDay.getDay();
  const lastDayIndex = lastDay.getDay();

  const monthYearString = currentDate.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });
  monthYearElement.textContent = monthYearString;

  let datesHTML = "";

  for (let i = 0; i < firstDayIndex; i++) {
    const prevDate = new Date(currentYear, currentMonth, -i);
    datesHTML =
      `<div class="date inactive">${prevDate.getDate()}</div>` + datesHTML;
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const activeClass =
      date.toDateString() === new Date().toDateString() ? "active" : "";

    const fullDate = date.toISOString().split("T")[0];

    datesHTML += `
    <div class="date ${activeClass}" data-date="${fullDate}">
      <span>${i}</span>
      <div class="tasks-container"></div>
    </div>
  `;
  }

  for (let i = 1; i < 7 - lastDayIndex; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
  }

  datesElement.innerHTML = datesHTML;

  renderTasksToCalendar(tasks);
};

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

updateCalendar();

function renderTasksToCalendar(tasks) {
  document
    .querySelectorAll(".tasks-container")
    .forEach((c) => (c.innerHTML = ""));

  tasks.forEach((task) => {
    if (task.taskDueDate === "N/A") return;

    const cell = document.querySelector(`[data-date="${task.taskDueDate}"]`);
    if (cell) {
      const container = cell.querySelector(".tasks-container");
      const div = document.createElement("div");
      div.className = "calendar-task";
      div.innerText = task.taskName;
      container.appendChild(div);
    }
  });
}

if ("Notification" in window && Notification.permission !== "granted") {
}

setInterval(() => {
  if (!tasks || tasks.length === 0) return;

  const now = new Date();

  tasks.forEach((task) => {
    if (!task.taskDueDate || task.taskDueDate === "N/A") return;

    const due = new Date(task.taskDueDate);
    const diff = due - now;

    if (diff > 0 && diff < 3600000 && !task.reminded) {
      new Notification("Task Reminder", {
        body: `${task.taskName} is due soon!`,
      });

      task.reminded = true;
    }
  });
}, 60000);
