import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";


const darkToggle = document.getElementById("darkModeToggle");
const notifToggle = document.getElementById("notificationToggle");
const viewLoginsBtn = document.getElementById("viewLoginsBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const recentLoginsDiv = document.getElementById("recentLogins");


darkToggle.addEventListener("change", () => {
document.body.classList.toggle("dark-mode", darkToggle.checked);
});


notifToggle.addEventListener("change", () => {
console.log("Notifications:", notifToggle.checked);
});


onAuthStateChanged(auth, async (user) => {
if (!user) return;


viewLoginsBtn.addEventListener("click", async () => {
recentLoginsDiv.innerHTML = "Loading...";


const q = query(
collection(db, "logins"),
where("userId", "==", user.uid)
);


const querySnapshot = await getDocs(q);
recentLoginsDiv.innerHTML = "";


querySnapshot.forEach((doc) => {
const data = doc.data();
recentLoginsDiv.innerHTML += `<p>${data.date} - ${data.device}</p>`;
});
});


resetPasswordBtn.addEventListener("click", () => {
sendPasswordResetEmail(auth, user.email)
.then(() => {
alert("Password reset email sent!");
})
.catch((error) => {
console.error(error);
});
});
});

const toggle = document.getElementById("darkModeToggle");

// Load preference on page load
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
}

// Toggle dark mode
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
});
