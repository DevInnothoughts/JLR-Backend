var express = require("express");
var router = express.Router();
const { getCallingList } = require("../models/callingListModel");

router.get("/", async (req, res, next) => {
  try {
    const callingList = await getCallingList();
    res.status(200).send(callingList);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
