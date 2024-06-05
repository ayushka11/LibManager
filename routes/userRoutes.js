const express = require('express');
const {
    checkoutBook,
    checkinBook,
    getAvailableBooks,
    checkHistory,
    searchBooks,
} = require("../controllers/userControllers");

const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.post("/checkout/:id", validateToken, checkoutBook);
router.post("/checkin/:id", validateToken, checkinBook);
router.get("/books/view", validateToken, getAvailableBooks);
router.get("/history", validateToken, checkHistory);
router.get("/books/search", validateToken, searchBooks);

module.exports = router;