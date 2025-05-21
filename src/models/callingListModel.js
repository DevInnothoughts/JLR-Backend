const { getConnectionByLocation } = require("../../databaseUtils");
const {
  fetchLastRecordStartTime,
  fetchIVRCalls,
} = require("./jlrCallLogsModel");

async function getCallingList() {
  await storeCallList();
  const { connection } = getConnectionByLocation();
  if (!connection) {
    const err = new Error("Invalid location");
    err.status = 404;
    throw err;
  }

  return new Promise((resolve, reject) => {
    connection.getConnection(function (err, tempCon) {
      if (err) {
        return reject(err);
      }

      const sql = `
        SELECT *
        FROM 
          ivrdata
        ORDER BY StartTime DESC
        LIMIT 150
      `;

      tempCon.query(sql, function (error, rows) {
        tempCon.release();
        if (error) {
          return reject(error);
        }

        console.log(rows); // Log the grouped data
        resolve(rows);
      });
    });
  });
}

const storeCallList = async (pageURL) => {
  const lastRecordStartTime = await fetchLastRecordStartTime();
  console.log(lastRecordStartTime);
  await fetchIVRCalls(
    "/v1/Accounts/navnitmotors3/Calls.json?AccountSid=navnitmotors3",
    lastRecordStartTime
  );
};

module.exports = {
  getCallingList,
};
