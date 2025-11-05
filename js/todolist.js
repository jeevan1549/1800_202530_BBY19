import { db } from "./firebaseAPIConfig.js";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const taskList = document.getElementById("todolist");

const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    taskList.innerHTML = "";
    snapshot.forEach((doc) => {
      const task = doc.data();
  
      const div = document.createElement("div");
      div.classList.add("taskItem");
      div.innerHTML = `
        <h2>${task.name}</h2>
        <p><strong>Class:</strong> ${task.class}</p>
        <p><strong>Due:</strong> ${task.dueDate}</p>
        <p><strong>Time:</strong> ${task.time}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <hr/>
      `;
      taskList.appendChild(div);
    });
  });
  