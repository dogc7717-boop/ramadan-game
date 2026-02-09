const SUPABASE_URL = "https://ycvmnhkcbdgylybdgyue.supabase.co";
const SUPABASE_KEY = "sb_publishable__-zX3zqL_4xaQhYY4g8_Rw_1hXcWrSM";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY, 
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const joinBtn = document.getElementById("joinBtn");
const moveBtn = document.getElementById("moveBtn");

statusEl.innerText = "متصل بـ Supabase...";

const channel = supabase
  .channel("ramadan-room")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "games" },
    (payload) => {
      logEl.textContent += "\n" + JSON.stringify(payload.new);
    }
  )
  .subscribe((s) => {
    if (s === "SUBSCRIBED") {
      statusEl.innerText = "Realtime شغال ✅";
    }
  });

joinBtn.onclick = async () => {
  await supabase.from("games").insert({ state: "joined" });
};

moveBtn.onclick = async () => {
  await supabase
    .from("games")
    .update({ state: "moved" })
    .eq("id", 1);
};
