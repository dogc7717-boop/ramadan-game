const status = document.getElementById("status");
const log = document.getElementById("log");

document.getElementById("joinBtn").onclick = () => {
  status.textContent = "تم الانضمام ✅";
  log.textContent += "Player joined\n";
};

document.getElementById("moveBtn").onclick = () => {
  log.textContent += "Dice rolled 🎲\n";
};
const status = document.getElementById("status");
const log = document.getElementById("log");

/* 👇 هنا تحط الرابط والمفتاح */
const SUPABASE_URL = "https://dxqpttiffkdrtbwzmvcd.supabase.co";
const SUPABASE_KEY = "sb_publishable_CWdAdibfoDfxUpALqTyOHQ_Jltfbggt";
/* 👆 لحد هنا بس */

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

status.textContent = "Supabase متصل ✅";
log.textContent = "Connection OK\n";
