import { db, auth } from "./firebaseConfig.js";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// --- PET TEMPLATE ---
const petTemplate = {
  age: 1,
  mood: 3,
  hunger: 3,
  love: 3,
  type: "cat" // placeholder type
};

const playButton = document.getElementById("playButton");
const petButton = document.getElementById("petButton");
const feedButton = document.getElementById("feedButton");

const shopButton = document.getElementById("shopButton");
const shopFrame = document.getElementById("shopFrame");

const bagButton = document.getElementById("bagButton");
const bagFrame = document.getElementById("bagFrame");

const pet = document.getElementById("pet");
const petContainer = document.getElementById("petContainer");
const ageDisplay = document.getElementById("age");

let bouncedeb = false;
let petting = false;

const catFrames = [
  "/images/petsprites/catidle1.png",
  "/images/petsprites/catplay.png",
];

const catIdleFrames = [
  "/images/petsprites/catidle1.png",
  "/images/petsprites/catidle2.png",
];

const catHappyIdleFrames = [
  "/images/petsprites/cathappyidle1.png",
  "/images/petsprites/cathappyidle2.png",
];

const catPettedFrames = [
  "/images/petsprites/catpetted1.png",
  "/images/petsprites/catpetted2.png",
];

let age = 1;
let catHeight = 30;
let containerHeight = 6;
let happy = false;

ageDisplay.textContent = age;
pet.style.height = `${catHeight}vh`;
petContainer.style.height = `${containerHeight}vh`;

// --- DATABASE FUNCTIONS ---

function getUserDoc(uid) {
  return doc(db, "users", uid);
}

// Create a pet for the user if none exists
async function createPetForUser(uid) {
  const userDoc = getUserDoc(uid);
  const docSnap = await getDoc(userDoc);

  if (!docSnap.exists()) {
    await setDoc(userDoc, { pets: [petTemplate] }, { merge: true });
  } else {
    const petsArray = docSnap.data().pets || [];
    if (petsArray.length === 0) {
      await updateDoc(userDoc, { pets: [petTemplate] });
    }
  }
}

// Load pet stats from user document
async function loadPetForUser(uid) {
  const userDoc = getUserDoc(uid);
  const docSnap = await getDoc(userDoc);
  if (!docSnap.exists()) return;

  const petsArray = docSnap.data().pets || [];
  const userPet = petsArray[0] || petTemplate;

  age = userPet.age || 1;

  const visualAge = Math.min(age, 9);
  catHeight = 30 + (visualAge - 1);
  containerHeight = 6 + (visualAge - 1);

  ageDisplay.textContent = age;
  pet.style.height = `${catHeight}vh`;
  petContainer.style.height = `${containerHeight}vh`;
}

// Update the first pet's stats in user document
async function updatePetForUser(uid, updatedPet) {
  const userDoc = getUserDoc(uid);
  const docSnap = await getDoc(userDoc);
  if (!docSnap.exists()) return;

  const petsArray = docSnap.data().pets || [];
  petsArray[0] = { ...petsArray[0], ...updatedPet };
  await updateDoc(userDoc, { pets: petsArray });
}

// --- AUTH LISTENER ---
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  await createPetForUser(user.uid);
  await loadPetForUser(user.uid);

  // Real-time listener for user's pets
  const userDoc = getUserDoc(user.uid);
  onSnapshot(userDoc, (docSnap) => {
    if (!docSnap.exists()) return;

    const petsArray = docSnap.data().pets || [];
    const userPet = petsArray[0];
    if (!userPet) return;

    age = userPet.age || 1;
    const visualAge = Math.min(age, 9);
    catHeight = 30 + (visualAge - 1);
    containerHeight = 6 + (visualAge - 1);

    ageDisplay.textContent = age;
    pet.style.height = `${catHeight}vh`;
    petContainer.style.height = `${containerHeight}vh`;
  });
});

// --- PET ANIMATION LOOP ---
let looping = false;
let idleTimeout;

function petLoop() {
  if (looping) return;
  looping = true;

  if (!petting) {
    if (!happy) {
      if (!bouncedeb) {
        pet.src = catIdleFrames[1];
        idleTimeout = setTimeout(() => {
          pet.src = catIdleFrames[0];
          looping = false;
          idleTimeout = setTimeout(petLoop, 2800);
        }, 60);
      } else {
        looping = false;
        idleTimeout = setTimeout(petLoop, 100);
      }
    } else {
      if (!bouncedeb) {
        pet.src = catHappyIdleFrames[1];
        idleTimeout = setTimeout(() => {
          pet.src = catHappyIdleFrames[0];
          looping = false;
          idleTimeout = setTimeout(petLoop, 800);
        }, 1000);
      } else {
        looping = false;
        idleTimeout = setTimeout(petLoop, 500);
      }
    }
  } else {
    if (!bouncedeb) {
      pet.src = catPettedFrames[1];
      idleTimeout = setTimeout(() => {
        pet.src = catPettedFrames[0];
        looping = false;
        idleTimeout = setTimeout(petLoop, 800);
      }, 1000);
    } else {
      looping = false;
      idleTimeout = setTimeout(petLoop, 500);
    }
  }
}

petLoop();

// --- AGE TIMER ---
setInterval(async () => {
  const user = auth.currentUser;
  if (!user) return;

  age += 1;
  ageDisplay.textContent = age;

  const visualAge = Math.min(age, 9);
  catHeight = 30 + (visualAge - 1);
  containerHeight = 6 + (visualAge - 1);
  pet.style.height = `${catHeight}vh`;
  petContainer.style.height = `${containerHeight}vh`;

  await updatePetForUser(user.uid, { age });
}, 120000);

// --- PET INTERACTIONS ---
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

function petted() {
  if (bouncedeb) return;
  if (petting) {
    happy = true;
    setTimeout(() => {
      happy = false;
    }, 3000);
  }

  petting = !petting;
  clearTimeout(idleTimeout);
  looping = false;
  petLoop();
}

playButton.addEventListener("click", bounce);
petButton.addEventListener("click", petted);
feedButton.addEventListener("click", bounce);

// --- SHOP & BAG LOGIC ---
shopButton.addEventListener("click", () => {
  const shopVisible = window.getComputedStyle(shopFrame).visibility === "visible";
  shopFrame.style.visibility = shopVisible ? "hidden" : "visible";
  if (!shopVisible) bagFrame.style.visibility = "hidden";
});

bagButton.addEventListener("click", () => {
  const bagVisible = window.getComputedStyle(bagFrame).visibility === "visible";
  bagFrame.style.visibility = bagVisible ? "hidden" : "visible";
  if (!bagVisible) shopFrame.style.visibility = "hidden";
});

// --- INITIAL PET CREATION ---
async function createPet() {
  const user = auth.currentUser;
  if (!user) return;
  await createPetForUser(user.uid);
}
createPet();

// --- SHOP ITEMS & BAG RENDERING ---
const itemContainer = document.getElementById("itemContainer");

itemContainer.innerHTML = `
  <div class="shopItemBody" id="foodBowlItem">
    <div class="shopItemHeader"><a>Milk Bowl</a></div>
    <div class="itemContainer"><img src="/images/petsprites/foodbowl.png" class="shop-item"/></div>
    <div class="shopItemFooter">
      <div><img src="/images/petsprites/currency.png" class="priceIcon"/></div>
      <div><p>100</p></div>
    </div>
  </div>
`;

const bagContainer = document.getElementById("bagContainer");

function renderBag(bag) {
  bagContainer.innerHTML = `
  <div class="useContainer">
    <p id="milkbowl-amount">Milk Bowl: ${bag.milkBowl || 0}</p> 
    <button id="use1" class="useButton"></button>
  </div>
  <div class="useContainer">
    <p id="foodbowl-amount">Food Bowl: ${bag.foodBowl || 0}</p>
    <button id="use2" class="useButton"></button>
  </div>
  <div class="useContainer">
    <p id="ball-amount">Ball: ${bag.ball || 0}</p>
    <button id="use3" class="useButton"></button>
  </div>
  <div class="useContainer">
    <p id="fish-amount">Fish: ${bag.fish || 0}</p>
    <button id="use4" class="useButton"></button>
  </div>
  <div class="useContainer">
    <p id="stuffy-amount">Stuffy: ${bag.stuffy || 0}</p>
    <button id="use5" class="useButton"></button>
  </div>
  <div class="useContainer">
    <p id="meat-amount">Meat: ${bag.meat || 0}</p>
    <button id="use6" class="useButton"></button>
  </div>
  `;
}

const currencyContainer = document.getElementById("pet-currency");

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const userRef = getUserDoc(user.uid);

  onSnapshot(userRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const userData = docSnap.data();
    renderBag(userData.bag || {});
    if (currencyContainer) currencyContainer.textContent = userData.currency ?? 0;
  });
});

const foodbowlItem = document.getElementById("foodBowlItem");

if (foodbowlItem) {
  foodbowlItem.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to buy items.");

    const userRef = getUserDoc(user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentCurrency = userData.currency || 0;
      const bag = userData.bag || {};

      if (currentCurrency < 100) return alert("Not enough currency!");

      await updateDoc(userRef, {
        currency: currentCurrency - 100,
        bag: { ...bag, milkBowl: (bag.milkBowl || 0) + 1 },
      });

      alert("Item purchased!");
    }
  });
}
