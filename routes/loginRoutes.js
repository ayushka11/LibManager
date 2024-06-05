const express = require("express");
const authControllers = require("../controllers/authControllers.js");
const validateToken = require("../middleware/validateToken");

const router = express.Router();

const { registerUser, loginUser, currentUser } = authControllers;

router.post("/register", registerUser);

router.post('/login', loginUser);

router.get('/current', validateToken, currentUser);

module.exports = router;