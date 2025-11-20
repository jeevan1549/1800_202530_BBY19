// src/auth.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"; // added updateDoc & getDoc

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // SIGNUP LOGIC
  // -------------------------
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signupForm["email"].value;
      const password = signupForm["password"].value;
      const username = signupForm["username"].value;

      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        function generateUserId() {
          const chars = "ABCDEFGHIGJKLMNOPQRSTUVWXYZ1234567890";
          let id = "";
          for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          return id;
        }
        // Store username, email, points, exp, and level in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          points: 0,
          currency: 200,
          exp: 50,
          level: 1,
          bag: {
            // object for all items
            milkBowl: 0,
            foodBowl: 0,
            ball: 0,
            fish: 0,
            stuffy: 0,
            meat: 0,
          },
          createdAt: new Date(),
          userId: generateUserId(),
        });

        alert("Signup successful!");
        signupForm.reset();
        window.location.href = "/html/accounts.html";
      } catch (err) {
        alert(err.message);
        console.error(err);
      }
    });
  }

  // -------------------------
  // LOGIN LOGIC
  // -------------------------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm["email"].value;
      const password = loginForm["password"].value;

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        alert("Login successful!");
        loginForm.reset();
        window.location.href = "/html/accounts.html";
      } catch (err) {
        alert(err.message);
        console.error(err);
      }
    });
  }
});

// -------------------------
// OPTIONAL: AUTH STATE
// -------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.email);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      let userData = userSnap.data();
      let exp = userData.exp ?? 50;
      let level = userData.level ?? 1;

      let expForNextLevel = 50 * Math.pow(1.015, level - 1);

      while (exp >= expForNextLevel) {
        exp -= expForNextLevel;
        level++;
        expForNextLevel = 50 * Math.pow(1.015, level - 1);
      }

      await updateDoc(userRef, { exp, level });
    }
  } else {
    console.log("No user logged in");
  }
});
