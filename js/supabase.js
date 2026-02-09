const SUPABASE_URL = "https://ycvmnhkcbdgylybdgyue.supabase.co";
const SUPABASE_KEY = "sb_publishable__-zX3zqL_4xaQhYY4g8_Rw_1hXcWrSM";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const statusDiv = document.getElementById("status");
const log = document.getElementById("log");
const joinBtn = document.getElementById("joinBtn");
const moveBtn = document.getElementById("moveBtn");

function logMsg(msg) {
  log.textContent += msg + "\n";
}

let channel = null;

joinBtn.onclick = async () => {
  statusDiv.textContent = "جارٍ الاتصال بـ Realtime...";

  channel = supabase.channel("ramadan-ludo-room");

  channel
    .on("broadcast", { event: "move" }, ({ payload }) => {
      logMsg("🎲 حركة وصلت: " + JSON.stringify(payload));
      moveBtn.disabled = false;
    })
    .subscribe((status) => {
      logMsg("Realtime status: " + status);
      if (status === "SUBSCRIBED") {
        statusDiv.textContent = "متصل ✅";
        joinBtn.disabled = true;
        moveBtn.disabled = false;
      }
    });
};

moveBtn.onclick = async () => {
  const dice = Math.floor(Math.random() * 6) + 1;

  await channel.send({
    type: "broadcast",
    event: "move",
    payload: {
      dice,
      at: new Date().toISOString()
    }
  });

  logMsg("👉 لعبت: " + dice);
  moveBtn.disabled = true;
};
