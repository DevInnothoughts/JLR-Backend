var express = require("express");
var router = express.Router();
const { saveLeads } = require("../models/saveLeads");

router.post("/", async (req, res, next) => {
  try {
    const callingList = await saveLeads(req.body);
    res.status(200).send(callingList);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
