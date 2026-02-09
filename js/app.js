const status = document.getElementById("status");
const log = document.getElementById("log");

document.getElementById("joinBtn").onclick = () => {
  status.textContent = "تم الانضمام ✅";
  log.textContent += "Player joined\n";
};

document.getElementById("moveBtn").onclick = () => {
  log.textContent += "Dice rolled 🎲\n";
};
