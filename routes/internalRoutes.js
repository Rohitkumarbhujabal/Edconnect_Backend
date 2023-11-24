const express = require("express");
const router = express.Router();
const internalController = require("../controllers/internalController");

router.route("/student/:studentId").get(internalController.getInternalStudent);

router
  .route("/:paper")
  .get(internalController.getInternal)
  .post(internalController.addInternal)
  .patch(internalController.updateInternal)
  .delete(internalController.deleteInternal);

module.exports = router;
