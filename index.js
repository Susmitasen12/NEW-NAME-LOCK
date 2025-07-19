const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "24041838383";
const LOCKED_GROUP_NAME = "FATIMA RANDI";

const app = express();
const PORT = process.env.PORT || 3000;

let lastResetTime = 0; // 🕒 Timestamp of last name reset

// 🌐 Anti-sleep Express route
app.get("/", (req, res) => {
  res.send("✅ Bot is alive and running safely.");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// 🔁 Group name check logic
const startBot = (api) => {
  const checkLoop = async () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error getting group info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          const now = Date.now();
          const timeSinceLastReset = (now - lastResetTime) / 1000; // in sec

          if (timeSinceLastReset >= 30) { // 🔁 Only 30-second cooldown now
            console.log(`⚠️ Group name changed to "${info.name}". Resetting in 10 seconds...`);

            setTimeout(() => {
              api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
                if (err) {
                  console.error("❌ Failed to reset name:", err);
                } else {
                  console.log("🔒 Group name reset successfully.");
                  lastResetTime = Date.now(); // ✅ Update last reset time
                }
              });
            }, 10000); // ⏳ 10 sec delay before resetting
          } else {
            console.log(`🕒 Waiting (${Math.floor(30 - timeSinceLastReset)}s) before next reset...`);
          }
        } else {
          console.log("✅ Group name is correct.");
        }
      }

      setTimeout(checkLoop, 5000); // Repeat every 5 sec
    });
  };

  checkLoop(); // Start loop
};

// 🟢 Start bot
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }

  console.log("✅ Logged in successfully.");
  startBot(api);
});
