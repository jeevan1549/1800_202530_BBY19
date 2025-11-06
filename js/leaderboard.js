const myBar = document.getElementById("myBar");
const circle = document.getElementById("levelCircle");

function updateLevel(percent) {
  myBar.style.width = percent + "%";
  circle.style.left = percent + "%";
  myBar.querySelector("span").textContent = percent + "%";
}

updateLevel(80);
