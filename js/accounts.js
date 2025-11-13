// src/accounts.js
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.getElementById("Username");
  const pointsElement = document.getElementById("Points");
  const levelElement = document.getElementById("Level");
  const friendsElement = document.getElementById("Friends");

  const loginContainer = document.querySelector(".login-and-signup");
  const loginLink = loginContainer.querySelector("a");

  // Create logout button
  const logoutButton = document.createElement("a");
  logoutButton.textContent = "Logout";
  logoutButton.href = "#";
  logoutButton.className = loginLink.className;
  logoutButton.style.display = "none";
  loginContainer.appendChild(logoutButton);

  logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = "/html/login.html";
    } catch (err) {
      console.error("Logout error:", err);
    }
  });

  let currentUserId = null;
  let points = 0;
  let level = 1; // just display level, no exp logic

  // Add points
  async function addPoints(amount) {
    if (!currentUserId) return;
    points += amount;
    pointsElement.textContent = `Points: ${points}`;
    await updateDoc(doc(db, "users", currentUserId), { points });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;

      logoutButton.style.display = "inline-block";
      loginLink.style.display = "none";

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        usernameElement.textContent = userData.username || "User";
        points = userData.points || 0;
        level = userData.level || 1;

        pointsElement.textContent = `Points: ${points}`;
        levelElement.textContent = `Level: ${level}`;
        friendsElement.textContent = `Friends: ${
          userData.friends?.length || 0
        }`;
      } catch {
        usernameElement.textContent = "User";
        points = 0;
        level = 1;
        pointsElement.textContent = `Points: ${points}`;
        levelElement.textContent = `Level: ${level}`;
        friendsElement.textContent = `Friends: 0`;
      }
    } else {
      currentUserId = null;

      logoutButton.style.display = "none";
      loginLink.style.display = "inline-block";

      usernameElement.textContent = "Guest";
      points = 0;
      level = 1;
      pointsElement.textContent = `Points: ${points}`;
      levelElement.textContent = `Level: ${level}`;
      friendsElement.textContent = `Friends: 0`;
    }
  });

  // Expose functions globally if needed
  window.addPoints = addPoints;
});
