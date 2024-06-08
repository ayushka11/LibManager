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
const validateUser = require('../middleware/validateUser');

const router = express.Router();

router.post("/checkout/:id", validateToken, validateUser, checkoutBook);
router.post("/checkin/:id", validateToken, validateUser, checkinBook);
router.get("/books/view", validateToken, validateUser, getAvailableBooks);
router.get("/history", validateToken, validateUser, checkHistory);
router.get("/books/search", validateToken, validateUser, searchBooks);
router.post('/request-admin', validateToken, validateUser, requestAdminAccess);

module.exports = router;