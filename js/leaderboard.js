import { db } from "../js/firebaseConfig.js";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const leaderboardRows = document.getElementById("leaderboardRows");

function startLeaderboard() {
  const usersRef = collection(db, "users");

  const q = query(usersRef, orderBy("points", "desc"));

  onSnapshot(q, (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    renderLeaderboard(users);
  });
}

function renderLeaderboard(users) {
  leaderboardRows.innerHTML = "";

  users.forEach((user, index) => {
    const rank = index + 1;

    const initials = user.username
      ? user.username.substring(0, 2).toUpperCase()
      : "??";

    const row = `
      <div class="row ${rank === 1 ? "top1" : rank === 2 ? "top2" : rank === 3 ? "top3" : ""}">
        <div class="rank">${rank}</div>

        <div class="name-cell">
          <div class="avatar">${initials}</div>
          <div class="person">
            <span class="who">${user.username}</span>
            <span class="meta">ID: ${user.userId}</span>
          </div>
        </div>

        <div class="score">
          <span class="small">Points</span> ${user.points}
        </div>

        <div class="level">
          <span class="small">Lvl</span> ${user.level}
        </div>
      </div>
    `;

    leaderboardRows.innerHTML += row;
  });
}

startLeaderboard();
