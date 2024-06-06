const express = require('express');
const validateToken = require('../middleware/validateToken');
const {
    viewAdminRequests, 
    approveAdminRequests, 
    rejectAdminRequests, 
    viewBooks, 
    addBook, 
    deleteBook, 
    renderUpdateBookPage, 
    adminUpdateBook, 
    searchBooks
}= require('../controllers/adminControllers');

const router = express.Router();

router.get("/books/manage", validateToken, viewBooks);
router.post("/books", validateToken, addBook);
router.post("/books/update/:id", validateToken, renderUpdateBookPage);
router.post("/books/update/details/:id", validateToken, adminUpdateBook);
router.post("/books/delete/:id", validateToken, deleteBook);
router.get("/books/search", validateToken, searchBooks);
router.get("/books/update/:id", validateToken, renderUpdateBookPage);
router.get("/requests", validateToken, viewAdminRequests);
router.post("/requests/approve/:id", validateToken, approveAdminRequests);
router.post("/requests/deny/:id", validateToken, rejectAdminRequests);

module.exports = router;