import { db, auth } from "/js/firebaseConfig.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

console.log("friendslist.js loaded");

const form = document.getElementById("addFriendForm");
const nameInput = document.getElementById("friendName");
const userIdInput = document.getElementById("friendUserId");
const friendsListEl = document.getElementById("friendsList");
const searchInput = document.getElementById("friendsSearch");
const sortSelect = document.getElementById("friendsSort");
const friendsCountEl = document.getElementById("friendsCount");

let friendsArray = [];
const usersCache = new Map();

function formatTimestamp(ts) {
  try {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts instanceof Date) return ts.toLocaleString();
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function updateFriendCount() {
  friendsCountEl.textContent = `(${friendsArray.length})`;
}

function clearList() {
  friendsListEl.innerHTML = "";
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createFriendCard(friendDoc) {
  const container = document.createElement("div");
  container.className = "friend-card";
  container.dataset.id = friendDoc.id;

  container.innerHTML = `
    <div class="friend-main">
      <div class="friend-meta">
        <div class="friend-name">${escapeHtml(friendDoc.name)}</div>
        <div class="friend-sub" id="sub-${friendDoc.id}">ID: ${escapeHtml(
    friendDoc.uid
  )}</div>
      </div>
      <div class="friend-actions">
        <button class="info-btn" title="View profile">Info</button>
        <button class="delete-btn" title="Delete friend">X</button>
      </div>
    </div>

    <div class="friend-details" id="details-${friendDoc.id}" aria-hidden="true">
      <div class="details-row"><strong>Username:</strong> <span class="u-username">—</span></div>
      <div class="details-row"><strong>Level:</strong> <span class="u-level">—</span></div>
      <div class="details-row"><strong>Points:</strong> <span class="u-points">—</span></div>
      <div class="details-row"><strong>Exp:</strong> <span class="u-exp">—</span></div>
      <div class="details-row"><strong>Email:</strong> <span class="u-email">—</span></div>
      <div class="details-row"><strong>Added:</strong> <span class="u-added">${escapeHtml(
        formatTimestamp(friendDoc.addedAt)
      )}</span></div>
    </div>
  `;

  // DELETE FRIEND
  container.querySelector(".delete-btn").addEventListener("click", async () => {
    const confirmed = confirm(`Delete ${friendDoc.name} from your friends?`);
    if (!confirmed) return;

    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "users", user.uid, "friends", friendDoc.id));
    } catch (err) {
      console.error("Failed to delete friend:", err);
    }
  });

  // SHOW INFO
  container.querySelector(".info-btn").addEventListener("click", async () => {
    const detailsEl = document.getElementById(`details-${friendDoc.id}`);
    const isHidden = detailsEl.getAttribute("aria-hidden") === "true";

    if (isHidden) {
      await populateProfileIntoCard(friendDoc.uid, friendDoc.id);
      detailsEl.setAttribute("aria-hidden", "false");
      detailsEl.style.display = "block";
    } else {
      detailsEl.setAttribute("aria-hidden", "true");
      detailsEl.style.display = "none";
    }
  });

  return container;
}

async function fetchUserByUserId(userId) {
  if (usersCache.has(userId)) {
    return usersCache.get(userId);
  }
  try {
    const q = query(
      collection(db, "users"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      usersCache.set(userId, null);
      return null;
    }

    const userData = snap.docs[0].data();
    usersCache.set(userId, userData);
    return userData;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    usersCache.set(userId, null);
    return null;
  }
}

async function populateProfileIntoCard(userId, friendDocId) {
  const user = await fetchUserByUserId(userId);
  const detailsEl = document.getElementById(`details-${friendDocId}`);
  if (!detailsEl) return;

  if (!user) {
    detailsEl.querySelector(".u-username").textContent = "Unknown";
    detailsEl.querySelector(".u-level").textContent = "—";
    detailsEl.querySelector(".u-points").textContent = "—";
    detailsEl.querySelector(".u-exp").textContent = "—";
    detailsEl.querySelector(".u-email").textContent = "—";
    return;
  }

  detailsEl.querySelector(".u-username").textContent = user.username ?? "—";
  detailsEl.querySelector(".u-level").textContent = user.level ?? "—";
  detailsEl.querySelector(".u-points").textContent = user.points ?? "—";
  detailsEl.querySelector(".u-exp").textContent = user.exp ?? "—";
  detailsEl.querySelector(".u-email").textContent = user.email ?? "—";
}

function applySearchAndSortAndRender() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const sortMode = sortSelect.value;

  let arr = [...friendsArray];

  // FILTER
  if (searchTerm) {
    arr = arr.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(searchTerm)) ||
        (f.uid && f.uid.toLowerCase().includes(searchTerm))
    );
  }

  // SORT
  if (sortMode === "name") {
    arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortMode === "level") {
    arr.sort((a, b) => {
      const aLevel = usersCache.get(a.uid)?.level ?? -1;
      const bLevel = usersCache.get(b.uid)?.level ?? -1;
      return bLevel - aLevel;
    });
  } else {
    arr.sort((a, b) => {
      const atA = a.addedAt
        ? new Date(a.addedAt.toDate?.() || a.addedAt).getTime()
        : 0;
      const atB = b.addedAt
        ? new Date(b.addedAt.toDate?.() || b.addedAt).getTime()
        : 0;
      return atB - atA;
    });
  }

  clearList();

  if (arr.length === 0) {
    const empty = document.createElement("div");
    empty.className = "friends-empty";
    empty.textContent = "No friends to show.";
    friendsListEl.appendChild(empty);
  } else {
    arr.forEach((f) => friendsListEl.appendChild(createFriendCard(f)));
  }

  updateFriendCount();
}

let unsubscribeFriends = null;

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  if (unsubscribeFriends) unsubscribeFriends();

  const friendsRef = collection(db, "users", user.uid, "friends");

  unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
    const newArr = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      newArr.push({
        id: docSnap.id,
        name: data.name ?? "",
        uid: data.uid ?? "",
        addedAt: data.addedAt ?? null,
      });
    });

    friendsArray = newArr;

    const uids = Array.from(new Set(newArr.map((f) => f.uid))).slice(0, 20);
    uids.forEach((u) => fetchUserByUserId(u));

    applySearchAndSortAndRender();
  });
});

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const friendName = nameInput.value.trim();
  const friendUserId = userIdInput.value.trim();

  if (!friendName || !friendUserId) {

    return;
  }

  try {
    const qUser = query(
      collection(db, "users"),
      where("userId", "==", friendUserId)
    );
    const userSnap = await getDocs(qUser);

    if (userSnap.empty) {

      return;
    }

    const currentUser = auth.currentUser;
    const friendsRef = collection(db, "users", currentUser.uid, "friends");

    const qDup = query(friendsRef, where("uid", "==", friendUserId));
    const dupSnap = await getDocs(qDup);

    if (!dupSnap.empty) {

      return;
    }

    await addDoc(friendsRef, {
      name: friendName,
      uid: friendUserId,
      addedAt: serverTimestamp(),
    });

    form.reset();
  } catch (err) {
    console.error("Error adding friend:", err);

  }
});

searchInput.addEventListener("input", applySearchAndSortAndRender);
sortSelect.addEventListener("change", applySearchAndSortAndRender);

applySearchAndSortAndRender();
