const { createPool } = require("./dbconfig");

// Define your database connections
//const conJLR = createPool("JLR_test");
const conJLR = createPool("JLR");

const getConnectionByLocation = () => {
  let connection;
  let location;

  connection = conJLR;
  location = "JLR";

  return { connection, location };
};

module.exports = { getConnectionByLocation };
