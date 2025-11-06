// src/accounts.js
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.getElementById("Username");

  // Container for login/logout
  const loginContainer = document.querySelector(".login-and-signup");
  const loginLink = loginContainer.querySelector("a");

  // Create logout button
  const logoutButton = document.createElement("a"); // use <a> so it shares login link CSS
  logoutButton.textContent = "Logout";
  logoutButton.href = "#"; // prevent default navigation
  logoutButton.className = loginLink.className; // copy CSS classes
  logoutButton.style.display = "none"; // hidden by default
  loginContainer.appendChild(logoutButton);

  // Logout click handler
  logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = "/html/login.html"; // optional redirect
    } catch (err) {
      console.error("Logout error:", err);
    }
  });

  // Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Show logout button, hide login link
      logoutButton.style.display = "inline-block";
      loginLink.style.display = "none";

      // Fetch username from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        usernameElement.textContent = userDoc.exists()
          ? userDoc.data().username
          : "User";
      } catch (err) {
        console.error("Error fetching username:", err);
        usernameElement.textContent = "User";
      }
    } else {
      // User logged out
      usernameElement.textContent = "Guest";
      logoutButton.style.display = "none";
      loginLink.style.display = "inline-block";
    }
  });
});
