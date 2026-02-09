const SUPABASE_URL = "https://ycvmnhkcbdgylybdgyue.supabase.co";
const SUPABASE_KEY = "sb_publishable__-zX3zqL_4xaQhYY4g8_Rw_1hXcWrSM";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY, 
const status = document.getElementById("status");
const log = document.getElementById("log");
const joinBtn = document.getElementById("joinBtn");
const moveBtn = document.getElementById("moveBtn");

let channel = null;

function write(msg) {
  log.textContent += msg + "\n";
}

status.textContent = "جاهز للاتصال";

joinBtn.onclick = () => {
  channel = supabase
    .channel("test-room")
    .on("broadcast", { event: "ping" }, ({ payload }) => {
      write("📩 وصل: " + payload.msg);
    })
    .subscribe((s) => {
      write("Realtime: " + s);
      if (s === "SUBSCRIBED") {
        status.textContent = "متصل ✅";
        moveBtn.disabled = false;
      }
    });

  joinBtn.disabled = true;
};

moveBtn.onclick = async () => {
  await channel.send({
    type: "broadcast",
    event: "ping",
    payload: { msg: "سلام من لاعب 👋" }
  });

  write("📤 بعت رسالة");
};
    .eq("id", 1);
};
