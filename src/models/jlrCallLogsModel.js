const { getConnectionByLocation } = require("../../databaseUtils");

const SERVER_BASE_URL = "https://api.exotel.com";

const fetchLastRecordStartTime = () => {
  const { connection } = getConnectionByLocation();
  console.log("Connection obtained:", !!connection); // Should be true

  return new Promise((resolve, reject) => {
    connection.getConnection((err, tempCon) => {
      if (err) {
        console.error("Error getting DB connection:", err);
        return reject(err);
      }

      console.log("Temp connection acquired");

      const sql = `
        SELECT StartTime
        FROM ivrdata
        ORDER BY StartTime DESC
        LIMIT 1
      `;

      console.log("Executing SQL:", sql);

      tempCon.query(sql, (error, rows) => {
        tempCon.release();

        if (error) {
          console.error("Query error:", error);
          return reject(error);
        }

        console.log("Query result:", rows);

        if (!rows || rows.length === 0) {
          console.warn("No records found in ivrdata.");
          return resolve(null);
        }

        console.log("StartTime fetched:", rows[0].StartTime);
        resolve(rows[0].StartTime);
      });
    });
  });
};

const fetchIVRCalls = async (pageURL, storedStartTime) => {
  try {
    let allRecords = [];
    let nextPageUrl = pageURL;
    const fetch = (await import("node-fetch")).default;

    while (nextPageUrl) {
      const response = await fetch(`${SERVER_BASE_URL}${nextPageUrl}`, {
        method: "GET",
        headers: {
          Authorization:
            "Basic ZjEzNTdjYTI1ZGY3NGE5NDU4ZjBmMmUzNDNjNTVhNDNkNTJmYzU0MjgyYjRlMGMwOjUyZDg2NGFjYTk2ZTBhZWRmNTAzMmM4MTJkNjYwZjBjYTljMWY3ZTQ4ZjdiNmNmZA==",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.Metadata || !Array.isArray(data.Calls)) break;

      const number = "02241495111";

      const newCalls = data.Calls.filter(
        (call) =>
          call.PhoneNumberSid === number &&
          new Date(call.StartTime) > new Date(storedStartTime)
      );

      allRecords.push(...newCalls);

      // If any call matches the stored time, assume we've fetched all new data
      const foundMatch = data.Calls.some(
        (call) => call.StartTime === storedStartTime
      );

      if (foundMatch) break;

      nextPageUrl = data.Metadata.NextPageUri;
    }

    if (allRecords.length === 0) {
      console.log("No new calls to insert.");
      return;
    }

    // Sort by StartTime descending
    allRecords.sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));

    await saveToDatabase(allRecords);
  } catch (error) {
    console.error("Error fetching IVR calls:", error.message);
  }
};

// Mock function for saving records to the database
const saveToDatabase = async (records) => {
  console.log("Saving to database:", records.length, "records");
  console.log("First record", records[0]);

  if (!records.length) {
    console.warn("No records to insert.");
    return;
  }

  const { connection } = getConnectionByLocation();
  console.log("Connection obtained:", !!connection);

  return new Promise((resolve, reject) => {
    connection.getConnection((err, tempCon) => {
      if (err) {
        console.error("Error getting DB connection:", err);
        return reject(err);
      }

      console.log("Temp connection acquired");

      // Extract column names from the first record

      const sql = `
  INSERT INTO ivrdata (
    \`Sid\`, \`ParentCallSid\`, \`DateCreated\`, \`DateUpdated\`, \`AccountSid\`,
    \`ToNumber\`, \`FromNumber\`, \`PhoneNumber\`, \`PhoneNumberSid\`, \`Status\`,
    \`StartTime\`, \`EndTime\`, \`Duration\`, \`Price\`, \`Direction\`,
    \`AnsweredBy\`, \`ForwardedFrom\`, \`CallerName\`, \`Uri\`, \`CustomField\`, \`RecordingUrl\`
  )
  VALUES ?
`;

      console.log("Executing SQL:", sql);
      const rows = records.map((record) => [
        record.Sid,
        record.ParentCallSid,
        record.DateCreated,
        record.DateUpdated,
        record.AccountSid,
        record.To,
        record.From,
        record.PhoneNumber,
        record.PhoneNumberSid,
        record.Status,
        record.StartTime,
        record.EndTime,
        record.Duration,
        record.Price,
        record.Direction,
        record.AnsweredBy,
        record.ForwardedFrom,
        record.CallerName,
        record.Uri,
        record.CustomField,
        record.RecordingUrl,
      ]);

      tempCon.query(sql, [rows], (error, result) => {
        tempCon.release();

        if (error) {
          console.error("Query error:", error);
          return reject(error);
        }

        console.log("Inserted rows:", result.affectedRows);
        resolve(result);
      });
    });
  });
};

module.exports = {
  fetchLastRecordStartTime,
  fetchIVRCalls,
  saveToDatabase,
};
