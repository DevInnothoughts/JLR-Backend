var express = require("express");
var app = express();
const cors = require("cors");
const cron = require("node-cron");
const actionJLRController = require("./src/controllers/actionJLRController");
const uploadCallLogsController = require("./src/controllers/uploadCallLogsController");
const callingListController = require("./src/controllers/CallingListController");
const saveLeadController = require("./src/controllers/saveLeadController");
const {
  fetchLastRecordStartTime,
  fetchIVRCalls,
} = require("./src/models/jlrCallLogsModel");
app.use(express.json());
app.use(cors());

// Routes
// app.use("/ivr/actionJLR", actionJLRController);
// app.use("/ivr/uploadCallLogs", uploadCallLogsController);
// app.use("/ivr/callingList", callingListController);
app.use("/jlr/save-lead", saveLeadController);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

// Schedule the job to run every 15 minutes
// cron.schedule("*/5 * * * *", async () => {
//   console.log("Executing scheduled job...");
//   const lastRecordStartTime = await fetchLastRecordStartTime();
//   console.log(lastRecordStartTime);
//   fetchIVRCalls(
//     "/v1/Accounts/navnitmotors3/Calls.json?AccountSid=navnitmotors3",
//     lastRecordStartTime
//   );
// });

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
