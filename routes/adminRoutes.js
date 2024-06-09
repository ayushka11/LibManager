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
    searchBooks, 
    viewCheckouts
}= require('../controllers/adminControllers.js');
const validateAdmin = require('../middleware/validateAdmin.js');

const router = express.Router();

router.get("/books/manage", validateToken, validateAdmin, viewBooks);
router.post("/books", validateToken, validateAdmin, addBook);
router.post("/books/update/:id", validateToken, validateAdmin, renderUpdateBookPage);
router.post("/books/update/details/:id", validateToken, validateAdmin, adminUpdateBook);
router.post("/books/delete/:id", validateToken, validateAdmin, deleteBook);
router.get("/books/search", validateToken, validateAdmin, searchBooks);
router.get("/books/update/:id", validateToken, validateAdmin, renderUpdateBookPage);
router.get("/requests", validateToken, validateAdmin, viewAdminRequests);
router.post("/requests/approve/:id", validateToken, validateAdmin, approveAdminRequests);
router.post("/requests/deny/:id", validateToken, validateAdmin, rejectAdminRequests);
router.get("/checkouts", validateToken, validateAdmin, viewCheckouts);


module.exports = router;