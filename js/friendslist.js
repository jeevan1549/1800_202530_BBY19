
import { db } from "/js/firebaseConfig.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const form = document.getElementById("addFriendForm");
const nameInput = document.getElementById("friendName");
const emailInput = document.getElementById("friendEmail");
const list = document.getElementById("friendsList");


async function addFriend(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name) return alert("Please enter a friend's name!");

  try {
    await addDoc(collection(db, "friends"), {
      name,
      email,
      createdAt: serverTimestamp(),
    });
    form.reset();
  } catch (err) {
    console.error("Error adding friend:", err);
    alert("Error adding friend. Check console for details.");
  }
}

if (form) {
  form.addEventListener("submit", addFriend);
}


function loadFriends() {
  const q = query(collection(db, "friends"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const friendItem = document.createElement("li");
      friendItem.classList.add("friend-item");

      friendItem.innerHTML = `
        <span class="friend-info">
          <strong>${data.name}</strong>
          ${data.email ? `<br><small>${data.email}</small>` : ""}
        </span>
        <button class="deleteBtn" data-id="${docSnap.id}">Delete</button>
      `;

      list.appendChild(friendItem);
    });

    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "friends", btn.dataset.id));
        } catch (err) {
          console.error("Error deleting friend:", err);
        }
      });
    });
  });
}

if (list) loadFriends();
