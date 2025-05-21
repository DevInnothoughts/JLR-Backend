const { getConnectionByLocation } = require("../../databaseUtils");

async function saveLeads(Lead) {
  const { name = "", email = "", phone = "" } = Lead;

  const { connection } = getConnectionByLocation("saveLeads");
  if (!connection) {
    const err = new Error("Invalid location", "saveLeads");
    err.status = 404;
    throw err;
  }

  return new Promise((resolve, reject) => {
    connection.getConnection(function (err, tempCon) {
      if (err) {
        tempCon.release();
        return reject(err);
      }

      var sql =
        "INSERT INTO facebookLeads (name, email, phone) VALUES (?, ?, ?)";

      console.log(sql, [name, email, phone]);
      tempCon.query(sql, [name, email, phone], function (error, result) {
        tempCon.release();
        if (error) {
          console.log("Error while adding lead!");
          return reject(error);
        }
        console.log("Lead Added!", result);
        resolve("Lead added!");
      });
    });
  });
}

module.exports = {
  saveLeads,
};
