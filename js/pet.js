import { db, auth } from "./firebaseConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.email ?? "Guest");

    if (user.isAnonymous) {
      const mainContent = document.querySelector(".MainContent");
      if (mainContent) mainContent.style.display = "none";
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      let userData = userSnap.data();
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
    const lockedContent = document.querySelector(".LockedContent");
    if (lockedContent) lockedContent.style.display = "grid";
    console.log("No user logged in");

    const mainContent = document.querySelector(".MainContent");
    if (mainContent) mainContent.style.display = "none";
  }
});

const petTemplate = {
  age: 1,
  mood: 3,
  hunger: 3,
  love: 3,
  type: "cat",
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
const currencyContainer = document.getElementById("pet-currency");

const lockedloginButton = document.getElementById("lockedlogin");

lockedloginButton.addEventListener("click", function () {
  window.location.href = "login.html";
});

function userRef(uid) {
  return doc(db, "users", uid);
}

function petRef(uid) {
  return doc(db, "users", uid, "pets", "pet1");
}

function bagItemRef(uid, name) {
  return doc(db, "users", uid, "bag", name);
}

function bagCollectionRef(uid) {
  return collection(db, "users", uid, "bag");
}

async function createUserDefaults(user) {
  const uRef = userRef(user.uid);
  const snap = await getDoc(uRef);

  if (!snap.exists()) {
    await setDoc(uRef, {
      createdAt: Timestamp.fromDate(new Date()),
      currency: 200,
      email: user.email ?? "",
      exp: 0,
      level: 2,
      points: 0,
      userId: user.uid,
      username: user.displayName ?? "",
    });
  }

  const pRef = petRef(user.uid);
  if (!(await getDoc(pRef)).exists()) {
    await setDoc(pRef, petTemplate);
  }

  const items = ["milkBowl", "foodBowl", "ball", "fish", "stuffy", "meat"];
  for (const item of items) {
    const iRef = bagItemRef(user.uid, item);
    if (!(await getDoc(iRef)).exists()) {
      await setDoc(iRef, { value: 0 });
    }
  }
}

let age = 1;
let catHeight = 30;
let containerHeight = 6;

async function loadPet(uid) {
  const snap = await getDoc(petRef(uid));
  if (!snap.exists()) return;

  const petData = snap.data();
  age = petData.age;

  const visualAge = Math.min(age, 9);
  catHeight = 30 + (visualAge - 1);
  containerHeight = 6 + (visualAge - 1);

  ageDisplay.textContent = age;
  pet.style.height = `${catHeight}vh`;
  petContainer.style.height = `${containerHeight}vh`;
}

async function updatePet(uid, updated) {
  await updateDoc(petRef(uid), updated);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  await createUserDefaults(user);
  await loadPet(user.uid);

  onSnapshot(petRef(user.uid), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    age = data.age;
    const visualAge = Math.min(age, 9);
    catHeight = 30 + (visualAge - 1);
    containerHeight = 6 + (visualAge - 1);

    ageDisplay.textContent = age;
    pet.style.height = `${catHeight}vh`;
    petContainer.style.height = `${containerHeight}vh`;
  });

  onSnapshot(userRef(user.uid), (snap) => {
    const data = snap.data();
    if (currencyContainer)
      currencyContainer.textContent = data?.currency ?? 200;
  });

  onSnapshot(bagCollectionRef(user.uid), (snapshot) => {
    const bag = {};
    snapshot.forEach((doc) => {
      bag[doc.id] = doc.data().value;
    });
    renderBag(bag);
  });
});

let itemselected = "none";
let foodselected = false;

let looping = false;
let idleTimeout;

let bouncedeb = false;
let petting = false;
let happy = false;
let sad = false;
let eating = false;
let wanting = false;

const catFrames = ["/images/catidle1.png", "/images/catplay.png"];
const catIdleFrames = ["/images/catidle1.png", "/images/catidle2.png"];
const catHappyIdleFrames = [
  "/images/cathappyidle1.png",
  "/images/cathappyidle2.png",
];
const catPettedFrames = ["/images/catpetted1.png", "/images/catpetted2.png"];
const catEatIdleFrames = ["/images/cateat1.png", "/images/cateat2.png"];
const catWantIdleFrames = ["/images/catwant1.png", "/images/catwant2.png"];
const catSadIdleFrames = ["/images/catwant1.png", "/images/catwant2.png"];
// Generic animation helper
function playAnimation(frames, firstDelay, nextLoopDelay) {
  pet.src = frames[1];

  idleTimeout = setTimeout(() => {
    pet.src = frames[0];
    looping = false;
    idleTimeout = setTimeout(petLoop, nextLoopDelay);
  }, firstDelay);
}

function quickLoop(delay) {
  looping = false;
  idleTimeout = setTimeout(petLoop, delay);
}

function petLoop() {
  if (looping) return;
  looping = true;

  // WANTING
  if (wanting) {
    if (!bouncedeb) playAnimation(catWantIdleFrames, 500, 500);
    else quickLoop(200);
    return;
  }

  // EATING
  if (eating) {
    if (!bouncedeb) playAnimation(catEatIdleFrames, 500, 500);
    else quickLoop(200);
    return;
  }

  // PETTING
  if (petting) {
    if (!bouncedeb) playAnimation(catPettedFrames, 1000, 800);
    else quickLoop(500);
    return;
  }

  // SAD IDLE
  if (sad) {
    if (!bouncedeb) playAnimation(catSadIdleFrames, 500, 500);
    else quickLoop(500);
    return;
  }

  // HAPPY IDLE
  if (happy) {
    if (!bouncedeb) playAnimation(catHappyIdleFrames, 1000, 800);
    else quickLoop(500);
    return;
  }

  // NORMAL IDLE
  if (!bouncedeb) playAnimation(catIdleFrames, 60, 2800);
  else quickLoop(100);
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

  await updatePet(user.uid, { age });
}, 120000);

function bounce() {
  if (bouncedeb) return;
  bouncedeb = true;

  if (energy > 500) {
    heart += 50;
    hunger -= 50;
    energy -= 250;

    pet.src = catFrames[1];
    let pos = 0;
    let dir = 1;

    const interval = setInterval(() => {
      pos += dir * 2;
      pet.style.transform = `translateY(-${pos}px)`;

      if (pos >= 20) dir = -1;
      if (pos <= 0 && dir === -1) {
        clearInterval(interval);
        pet.style.transform = "translateY(0)";
        pet.src = catFrames[0];
        bouncedeb = false;
      }
    }, 20);
  } else {
    pet.src = catSadIdleFrames[0];

    setTimeout(() => {
      pet.src = catSadIdleFrames[1];
    }, 1000);

    sad = true;

    setTimeout(() => {
      sad = false;
      bouncedeb = false;
    }, 2000);
  }
}

function petted() {
  if (bouncedeb) return;

  if (petting) {
    happy = true;
    energy += 250;
    setTimeout(() => (happy = false), 3000);
  }

  petting = !petting;
  clearTimeout(idleTimeout);
  looping = false;
  petLoop();
}

const itemButtons = [
  "fish-button",
  "meat-button",
  "ball-button",
  "food-bowl-button",
  "milk-bowl-button",
  "stuffy-button",
];

const itemImages = [
  "/images/fish.png",
  "/images/meat.png",
  "/images/ball.png",
  "/images/foodbowl.png",
  "/images/milkbowl.png",
  "/images/stuffy.png",
];

const petItem = document.getElementById("itemImg");
let feeddeb = false;

function feed() {
  if (feeddeb) return;

  feeddeb = true;
  clearTimeout(idleTimeout);
  looping = false;

  if (foodselected) {
    petItem.style.visibility = "visible";
    petItem.style.opacity = 1;
    const index = itemButtons.indexOf(itemselected);
    if (index !== -1) {
      petItem.src = itemImages[index];
    }

    eating = true;
    petLoop();

    setTimeout(() => {
      (async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (itemselected === "milk-bowl-button") {
          hunger += 200;
          heart += 100;
          const userBagRef = doc(
            db,
            "users",
            currentUser.uid,
            "bag",
            "milkBowl"
          );
          const bagSnap = await getDoc(userBagRef);

          if (bagSnap.exists()) {
            const itemDep = bagSnap.data().value ?? 0;
            if (itemDep > 0) {
              await updateDoc(userBagRef, { value: itemDep - 1 });
            }
          }
        } else if (itemselected === "food-bowl-button") {
          hunger += 250;
          heart += 150;
          const userBagRef = doc(
            db,
            "users",
            currentUser.uid,
            "bag",
            "foodBowl"
          );
          const bagSnap = await getDoc(userBagRef);

          if (bagSnap.exists()) {
            const itemDep = bagSnap.data().value ?? 0;
            if (itemDep > 0) {
              await updateDoc(userBagRef, { value: itemDep - 1 });
            }
          }
        } else if (itemselected === "fish-button") {
          hunger += 500;
          heart += 250;
          const userBagRef = doc(db, "users", currentUser.uid, "bag", "fish");
          const bagSnap = await getDoc(userBagRef);

          if (bagSnap.exists()) {
            const itemDep = bagSnap.data().value ?? 0;
            if (itemDep > 0) {
              await updateDoc(userBagRef, { value: itemDep - 1 });
            }
          }
        } else if (itemselected === "meat-button") {
          hunger += 1000;
          heart += 500;
          const userBagRef = doc(db, "users", currentUser.uid, "bag", "meat");
          const bagSnap = await getDoc(userBagRef);

          if (bagSnap.exists()) {
            const itemDep = bagSnap.data().value ?? 0;
            if (itemDep > 0) {
              await updateDoc(userBagRef, { value: itemDep - 1 });
            }
          }
        }

        eating = false;
        petLoop();
        resetButtonColors();
        itemselected = "none";
        foodselected = false;
      })();
    }, 3000);

    setTimeout(() => {
      petItem.style.opacity = 0;
      feeddeb = false;
    }, 4000);
  } else {
    wanting = true;
    petLoop();
    setTimeout(() => {
      wanting = false;
      feeddeb = false;
      petLoop();
    }, 3000);
  }
}

playButton.addEventListener("click", bounce);
petButton.addEventListener("click", petted);
feedButton.addEventListener("click", feed);

const petstats = document.getElementsByClassName("petStatsAndCurrency")[0];
const currencyBox = petstats.querySelector(".currencyBox");
const ageContainer = document.getElementById("ageContainer");
const energyContainer = document.getElementById("energyContainer");
const hungerContainer = document.getElementById("hungerContainer");
const loveContainer = document.getElementById("loveContainer");

shopButton.addEventListener("click", () => {
  if (shopFrame.style.visibility === "visible") {
    shopFrame.style.visibility = "hidden";
    bagFrame.style.visibility = "hidden";

    ageContainer.style.display = "flex";
    energyContainer.style.display = "flex";
    hungerContainer.style.display = "flex";
    loveContainer.style.display = "flex";
  } else {
    shopFrame.style.visibility = "visible";
    bagFrame.style.visibility = "hidden";

    ageContainer.style.display = "none";
    energyContainer.style.display = "none";
    hungerContainer.style.display = "none";
    loveContainer.style.display = "none";
  }
});

bagButton.addEventListener("click", () => {
  if (bagFrame.style.visibility === "visible") {
    bagFrame.style.visibility = "hidden";

    ageContainer.style.display = "flex";
    energyContainer.style.display = "flex";
    hungerContainer.style.display = "flex";
    loveContainer.style.display = "flex";
  } else {
    bagFrame.style.visibility = "visible";
    shopFrame.style.visibility = "hidden";

    ageContainer.style.display = "none";
    energyContainer.style.display = "none";
    hungerContainer.style.display = "none";
    loveContainer.style.display = "none";
  }
});

const bagContainer = document.getElementById("bagContainer");

function renderBag(bag) {
  bagContainer.innerHTML = `
    <div class="useContainer"><p>Milk Bowl: ${
      bag.milkBowl || 0
    }</p><button class="useButton" id="milk-bowl-button"></button></div>
    <div class="useContainer"><p>Food Bowl: ${
      bag.foodBowl || 0
    }</p><button class="useButton" id="food-bowl-button"></button></div>
    <div class="useContainer"><p>Ball: ${
      bag.ball || 0
    }</p><button class="useButton" id="ball-button"></button></div>
    <div class="useContainer"><p>Fish: ${
      bag.fish || 0
    }</p><button class="useButton" id="fish-button"></button></div>
    <div class="useContainer"><p>Stuffy: ${
      bag.stuffy || 0
    }</p><button class="useButton" id="stuffy-button"></button></div>
    <div class="useContainer"><p>Meat: ${
      bag.meat || 0
    }</p><button class="useButton" id="meat-button"></button></div>
  `;
}

const shopItems = [
  {
    id: "foodBowl",
    name: "Food Bowl",
    price: 100,
    img: "/images/foodbowl.png",
  },
  {
    id: "milkBowl",
    name: "Milk Bowl",
    price: 100,
    img: "/images/milkbowl.png",
  },
  {
    id: "fish",
    name: "Fish",
    price: 300,
    img: "/images/fish.png",
  },
  {
    id: "meat",
    name: "Meat",
    price: 420,
    img: "/images/meat.png",
  },
  {
    id: "ball",
    name: "Ball",
    price: 1000,
    img: "/images/ball.png",
  },
  {
    id: "stuffy",
    name: "Stuffy",
    price: 1000,
    img: "/images/stuffy.png",
  },
];

const itemContainer = document.getElementById("itemContainer");

itemContainer.innerHTML = shopItems
  .map(
    (item) => `
    <div class="shopItemBody" id="${item.id}">
      <div class="shopItemHeader"><a>${item.name}</a></div>
      <div class="itemContainer"><img src="${item.img}" class="shop-item"/></div>
      <div class="shopItemFooter">
        <div><img src="/images/currency.png" class="priceIcon"/></div>
        <div><p>${item.price}</p></div>
      </div>
    </div>
  `
  )
  .join("");

shopItems.forEach((item) => {
  const element = document.getElementById(item.id);
  if (!element) return;

  element.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const uRef = userRef(user.uid);
    const uSnap = await getDoc(uRef);
    const currency = uSnap.data().currency;

    if (currency < item.price) return;

    await updateDoc(uRef, { currency: currency - item.price });

    const itemRef = bagItemRef(user.uid, item.id);
    const itemSnap = await getDoc(itemRef);
    const amount = itemSnap.exists() ? itemSnap.data().value : 0;

    await setDoc(itemRef, { value: amount + 1 });
  });
});

let hunger = localStorage.getItem("hunger");

if (hunger !== null) {
  hunger = Number(hunger);
} else {
  hunger = 2000;
}

localStorage.setItem("hunger", hunger);

const hungerBars = [
  document.getElementById("hunger1"),
  document.getElementById("hunger2"),
  document.getElementById("hunger3"),
];

const pointsPerBar = 500;

setInterval(() => {
  hungerBars.forEach((bar, index) => {
    if (hunger >= (index + 1) * pointsPerBar) {
      bar.style.visibility = "visible";
    } else {
      bar.style.visibility = "hidden";
    }
  });

  if (hunger > 0) {
    hunger--;
    localStorage.setItem("hunger", hunger);
  }

  if (hunger > 2000) {
    hunger = 2000;
  }
}, 500);

let heart = localStorage.getItem("heart");

if (heart !== null) {
  heart = Number(heart);
} else {
  heart = 1000;
}

localStorage.setItem("heart", heart);

const heartBars = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3"),
];

const pointsPerBar2 = 250;

setInterval(() => {
  heartBars.forEach((bar, index) => {
    if (heart >= (index + 1) * pointsPerBar2) {
      bar.style.visibility = "visible";
    } else {
      bar.style.visibility = "hidden";
    }
  });

  if (hunger < 1500 && heart > 0) {
    heart--;
    localStorage.setItem("heart", heart);
  }

  if (heart > 1000) {
    heart = 1000;
  }
}, 500);

let energy = localStorage.getItem("energy");

if (energy !== null) {
  energy = Number(energy);
} else {
  energy = 2000;
}

localStorage.setItem("energy", energy);

const energyBars = [
  document.getElementById("energy1"),
  document.getElementById("energy2"),
  document.getElementById("energy3"),
];

const pointsPerBar3 = 500;

setInterval(() => {
  energyBars.forEach((bar, index) => {
    if (energy >= (index + 1) * pointsPerBar3) {
      bar.style.visibility = "visible";
    } else {
      bar.style.visibility = "hidden";
    }
  });

  if (energy > 0) {
    energy--;
    localStorage.setItem("energy", energy);
  }

  if (energy > 2000) {
    energy = 2000;
  }
}, 500);

const buttons = [
  "milk-bowl-button",
  "food-bowl-button",
  "fish-button",
  "meat-button",
  "ball-button",
  "stuffy-button",
];

const foodButtons = [
  "milk-bowl-button",
  "food-bowl-button",
  "fish-button",
  "meat-button",
];

document.addEventListener("click", async function (e) {
  if (eating == true) {
    return;
  }

  if (!buttons.includes(e.target.id)) return;

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const clickedId = e.target.id;

  const bagDocId = clickedId
    .replace("-button", "")
    .replace(/-(.)/g, (_, c) => c.toUpperCase());

  const userBagRef = doc(db, "users", currentUser.uid, "bag", bagDocId);
  const bagSnap = await getDoc(userBagRef);
  const itemAmount = bagSnap?.data()?.value ?? 0;

  if (itemAmount <= 0) {
    console.log(`${clickedId} is unavailable!`);
    return;
  }

  if (itemselected === clickedId) {
    itemselected = "none";
    foodselected = false;
    resetButtonColors();
    return;
  }

  itemselected = clickedId;

  foodselected = foodButtons.includes(itemselected);

  resetButtonColors();

  e.target.style.backgroundColor = "#6cde9f";
});

function resetButtonColors() {
  buttons.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.backgroundColor = "#272727ff";
  });
}
