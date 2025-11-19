import { db } from "./firebaseConfig.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

const petDoc = doc(db, "pets", "myPet");

const petData = {
  age: 1,
  mood: 3,
  hunger: 3,
  love: 3,
};

const playButton = document.getElementById("playButton");
const pet = document.getElementById("pet");
const petContainer = document.getElementById("petContainer");
const ageDisplay = document.getElementById("age");

let bouncedeb = false;
const catFrames = [
  "/images/petsprites/catidle1.png",
  "/images/petsprites/catplay.png",
];

const catIdleFrames = [
  "/images/petsprites/catidle1.png",
  "/images/petsprites/catidle2.png",
];

let age = 1;
let catHeight = 30;
let containerHeight = 6;

ageDisplay.textContent = age;
pet.style.height = `${catHeight}vh`;
petContainer.style.height = `${containerHeight}vh`;

async function loadPet() {
  const docSnap = await getDoc(petDoc);
  if (docSnap.exists()) {
    age = docSnap.data().age || 1;
    catHeight = 30 + (age - 1);
    containerHeight = 6 + (age - 1);
  }
  ageDisplay.textContent = age;
  pet.style.height = `${catHeight}vh`;
  petContainer.style.height = `${containerHeight}vh`;
}

loadPet();

function blinkLoop() {
  if (!bouncedeb) {
    pet.src = catIdleFrames[1];
    setTimeout(() => {
      pet.src = catIdleFrames[0];
      setTimeout(blinkLoop, 2800);
    }, 60);
  } else {
    setTimeout(blinkLoop, 100);
  }
}

blinkLoop();

setInterval(async () => {
  age += 1;
  ageDisplay.textContent = age;

  const visualAge = Math.min(age, 9);
  catHeight = 30 + (visualAge - 1);
  containerHeight = 6 + (visualAge - 1);
  pet.style.height = `${catHeight}vh`;
  petContainer.style.height = `${containerHeight}vh`;

  await setDoc(petDoc, { age: age }, { merge: true });
}, 60000);

function bounce() {
  if (bouncedeb) return;
  bouncedeb = true;

  pet.src = catFrames[1];
  let position = 0;
  let direction = 1;

  const interval = setInterval(() => {
    position += direction * 2;
    pet.style.transform = `translateY(-${position}px)`;

    if (position >= 20) direction = -1;
    if (position <= 0 && direction === -1) {
      clearInterval(interval);
      pet.style.transform = "translateY(0)";
      pet.src = catFrames[0];
      bouncedeb = false;
    }
  }, 20);
}

playButton.addEventListener("click", () => {
  bounce();
});

async function createPet() {
  const docSnap = await getDoc(petDoc);
  if (!docSnap.exists()) {
    await setDoc(petDoc, petData);
  }
}

createPet();
