const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");

router.route("/login/teacher").post(authController.teacherLogin);
router.route("/login/student").post(authController.studentLogin);


module.exports = router;
