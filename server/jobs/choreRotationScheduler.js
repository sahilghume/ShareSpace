const cron = require("node-cron");
const Chore = require("../models/Chore");

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function startChoreRotationScheduler() {
  const runRotation = async () => {
    try {
      const today = getTodayDate();
      const count = await Chore.generateDailyRotationAssignments(today);

      console.log(
        `Daily chore rotation completed for ${today}. Assignments created: ${count}`,
      );
    } catch (error) {
      console.error("Daily Chore Rotation Error:", error);
    }
  };

  // Run once when the server starts to catch up on today's assignments.
  runRotation();

  // Run every day at 12:05 AM IST.
  cron.schedule("5 0 * * *", runRotation, {
    timezone: "Asia/Kolkata",
  });
}

module.exports = startChoreRotationScheduler;
