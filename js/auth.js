// src/auth.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

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

        // Optional: store username in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          createdAt: new Date(),
        });

        // After successful signup
        alert("Signup successful!");
        signupForm.reset();
        // Redirect to accounts page
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
        // Redirect to dashboard or homepage
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
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
    // You could show/hide elements based on login status
  } else {
    console.log("No user logged in");
  }
});
