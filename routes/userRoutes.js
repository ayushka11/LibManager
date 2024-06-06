const express = require('express');
const {
    checkoutBook,
    checkinBook,
    getAvailableBooks,
    checkHistory,
    searchBooks,
    requestAdminAccess
} = require("../controllers/userControllers");

const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.post("/checkout/:id", validateToken, checkoutBook);
router.post("/checkin/:id", validateToken, checkinBook);
router.get("/books/view", validateToken, getAvailableBooks);
router.get("/history", validateToken, checkHistory);
router.get("/books/search", validateToken, searchBooks);
router.post('/request-admin', validateToken, requestAdminAccess);

module.exports = router;