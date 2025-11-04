import { db } from "./firebaseAPIConfig.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const form = document.getElementById("taskForm");
form.addEventListener("Submit", async (e) => {
e.preventDefault();

//Reads inputs from user
const taskName = document.getElementById("taskName").value.trim();
  const taskClass = document.getElementById("taskClass").value.trim();
  const taskDueDate = document.getElementById("taskDueDate").value.trim();
  const taskDesc = document.getElementById("taskDesc").value.trim();
  const otherTime = document.getElementById("otherTimeOption").value.trim();
  const timeOption = document.querySelector('input[name="timeOption"]:checked')?.value || otherTime;

  try {
    await addDoc(collection(db, "tasks"), {
      name: taskName,
      class: taskClass,
      dueDate: taskDueDate,
      time: timeOption,
      description: taskDesc,
      createdAt: serverTimestamp()

    });
    alert("Task created!");
    form.reset();
    window.location.href = "tasklist.html";
    } catch (error) {
    console.error("Error adding task:", error);
    alert("Error saving task.");
  }
});