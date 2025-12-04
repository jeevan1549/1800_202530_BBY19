import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signupForm["email"].value;
      const password = signupForm["password"].value;
      const username = signupForm["username"].value;

      try {
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
            id += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return id;
        }

        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          points: 0,
          currency: 200,
          exp: 0,
          level: 1,
          createdAt: new Date(),
          userId: generateUserId(),
        });

        signupForm.reset();
        window.location.href = "/html/accounts.html";
      } catch (err) {
        console.error(err);
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm["email"].value;
      const password = loginForm["password"].value;

      try {
        await signInWithEmailAndPassword(auth, email, password);

        loginForm.reset();
        window.location.href = "/html/accounts.html";
      } catch (err) {
        console.error(err);
      }
    });
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.email);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
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
