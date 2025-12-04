// src/accounts.js
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.getElementById("Username");
  const pointsElement = document.getElementById("Points");
  const levelElement = document.getElementById("Level");
  const friendsElement = document.getElementById("Friends");
  const friendCodeElement = document.getElementById("friend-code");

  const addFriendElements = document.getElementsByClassName("addFriend");

  const loginContainer = document.querySelector(".login-and-signup");
  const loginLink = loginContainer.querySelector("a");

  let currentUserId = null;
  let points = 0;
  let level = 1;

  async function addPoints(amount) {
    if (!currentUserId) return;
    points += amount;
    pointsElement.textContent = `Points: ${points}`;
    await updateDoc(doc(db, "users", currentUserId), { points });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      loginLink.style.display = "none";

      for (const el of addFriendElements) {
        el.style.display = "fixed";
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        usernameElement.textContent = userData.username || "User";
        points = userData.points || 0;
        level = userData.level || 1;

        pointsElement.textContent = `Points: ${points}`;
        levelElement.textContent = `Level: ${level}`;

        const friendsSnap = await getDocs(
          collection(db, "users", user.uid, "friends")
        );
        friendsElement.textContent = `Friends: ${friendsSnap.size}`;

        if (friendCodeElement) {
          friendCodeElement.textContent = `ID: ${userData.userId}` || "No ID";
        }
      } catch {
        usernameElement.textContent = "User";
        points = 0;
        level = 1;
        pointsElement.textContent = `Points: ${points}`;
        levelElement.textContent = `Level: ${level}`;
        friendsElement.textContent = `Friends: 0`;

        if (friendCodeElement) {
          friendCodeElement.textContent = "No Code";
        }
      }
    } else {
      currentUserId = null;
      loginLink.style.display = "inline-block";

      for (const el of addFriendElements) {
        el.style.display = "none";
      }

      usernameElement.textContent = "Guest";
      points = 0;
      level = 1;
      pointsElement.textContent = `Points: ${points}`;
      levelElement.textContent = `Level: ${level}`;

      if (friendCodeElement) {
        friendCodeElement.textContent = "";
      }

      friendsElement.textContent = `Friends: 0`;
    }
  });

  window.addPoints = addPoints;
});
