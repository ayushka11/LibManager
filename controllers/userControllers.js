const { pool } = require('../database');
const asyncHandler = require('express-async-handler');

const checkoutBook = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const bookId = req.params.id;
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const insertQuery = "INSERT INTO checkouts (user_id, book_id, checkout_date, due_date) VALUES (?, ?, ?, ?)";
    const updateQuery = "UPDATE books SET available = false WHERE id = ?";
    const bookQuery = "SELECT * FROM books WHERE id = ?";
    

    try {
        await pool.query(insertQuery, [
            userId,
            bookId,
            checkoutDate,
            dueDate,
        ]);
        await pool.query(updateQuery, [bookId]);
        const [book] = await pool.query(bookQuery, [bookId]);
        res.render("checkoutDetails", {
            user: req.user,
            book: book[0],
            checkoutType: "checkOut",
          });
    } catch (error) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const checkinBook = asyncHandler(async (req, res) => {
    const bookId = req.params.id;
    const userId = req.user.id;
    const returnDate = new Date();

    const selectDueDateQuery = "SELECT due_date FROM checkouts WHERE user_id = ? AND book_id = ? AND return_date IS NULL";
    try {
        
        const [results] = await pool.query(selectDueDateQuery, [userId, bookId]);

        if (results.length === 0) {
            return res.status(404).send('No active checkout found for this book and user.');
        }

        const dueDate = new Date(results[0].due_date);
        let fine = 0;

        if (returnDate > dueDate) {
            const daysLate = Math.ceil((returnDate-dueDate)/(1000*60*60*24));
            fine = daysLate * 5;
        }
        const updateCheckoutQuery = "UPDATE checkouts SET return_date = ?, fine = ? WHERE user_id = ? AND book_id = ? AND return_date IS NULL";
        await pool.query(updateCheckoutQuery, [returnDate, fine, userId, bookId]);

        const updateBookStatusQuery = "UPDATE books SET available = true WHERE id = ?";
        await pool.query(updateBookStatusQuery, [bookId]);
        
        const bookQuery = "SELECT * FROM books WHERE id = ?";
        const [book] = await pool.query(bookQuery, [bookId]);

        res.render("checkoutDetails", {
            user: req.user,
            book: book[0],
            checkoutType: "checkIn",
          });
    } catch (error) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const getAvailableBooks = asyncHandler(async (req, res) => {
    try {
        const query = 'SELECT * FROM books WHERE available = true';
        const [results] = await pool.query(query);

        res.render('userViewBooks', { user: req.user, books: results });
    } catch (err) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const checkHistory = asyncHandler(async (req, res) => {
    try {
        const query = `
            SELECT checkouts.*, books.title, books.author
            FROM checkouts
            JOIN books ON checkouts.book_id = books.id
            WHERE checkouts.user_id = ?
        `;
        const userId = req.user.id;
        const [results] = await pool.query(query, [userId]);
        res.render('checkoutHistory', { user: req.user, checkouts: results });
    } catch (error) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const searchBooks = asyncHandler(async (req, res) => {
    const { title, author, available } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    let params = [];

    if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
    }

    if (author) {
        query += ' AND author LIKE ?';
        params.push(`%${author}%`);
    }

    if (available) {
        query += ' AND available = ?';
        params.push(available);
    }

    try {
        const [results] = await pool.query(query, params);
        res.render('userHome', { user: req.user, books: results });
    } catch (error) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const requestAdminAccess = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const updateAdminRequestQuery = "UPDATE users SET admin_request_status = 'pending' WHERE id = ?";

    try {
        await pool.query(updateAdminRequestQuery, [userId]);
        const message = 'Admin request submitted successfully.';
        res.redirect('/home');
    } catch (err) {
        res.status(500).render('error', { message: 'An error occurred!' });
    }
});

module.exports = {
    checkoutBook,
    checkinBook,
    getAvailableBooks,
    checkHistory,
    searchBooks,
    requestAdminAccess
};



