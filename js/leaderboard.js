import { auth, db } from "./firebaseConfig.js";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const usersRef = collection(db, "users");

const leaderboardQuery = query(
  usersRef,
  orderBy("points", "desc"),
  orderBy("level", "desc"),
  orderBy("exp", "desc"),
  limit(3)
);

onSnapshot(leaderboardQuery, (snapshot) => {
  const top = snapshot.docs.map((doc) => doc.data());

  const first = top[0] || { username: "---", level: 0 };
  const second = top[1] || { username: "---", level: 0 };
  const third = top[2] || { username: "---", level: 0 };

  document.getElementById("firstPlaceName").textContent = first.username;
  document.getElementById("firstPlaceRank").textContent = first.level;

  document.getElementById("secondPlaceName").textContent = second.username;
  document.getElementById("secondPlaceRank").textContent = second.level;

  document.getElementById("thirdPlaceName").textContent = third.username;
  document.getElementById("thirdPlaceRank").textContent = third.level;
});


document.addEventListener("DOMContentLoaded", () => {
  const bar = document.querySelector(".myBar");
  const levelCircle = document.querySelector(".level-number-circle span");

  function calculateExpForNextLevel(level) {
    return 50 * Math.pow(1.025, level - 1);
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const exp = data.exp ?? 0;
      const level = data.level ?? 1;

      levelCircle.textContent = level;

      const required = calculateExpForNextLevel(level);
      const percent = Math.min((exp / required) * 100, 100);

      bar.style.width = percent + "%";
      bar.textContent = Math.floor(percent) + "%";
    });
  });
});
