const asyncHandler = require("express-async-handler");
const { pool } = require("../database");
const { search } = require("../routes/loginRoutes");

const viewAdminRequests = asyncHandler(async (req, res) => {
  // if (!req.user.isAdmin) {
  //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
  // }
  try {
     
      const query = "SELECT * FROM users WHERE admin_request_status = 'pending'";
      const [users] = await pool.query(query); 
      
      res.render("adminRequests", { users });
  } catch (error) {
    res.status(500).render('error', { message: 'An error occurred!' });
  }    
});

const approveAdminRequests = asyncHandler(async (req, res) => {
  // if (!req.user.isAdmin) {
  //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
  // }
  try {
      const { id: userId } = req.params; 
      const query = "UPDATE users SET admin_request_status = 'approved', isAdmin = true WHERE id = ?";
      await pool.query(query, [userId]);
      res.status(200);
      res.redirect("/api/admin/requests");
      let msg = "Admin request approved";

  } catch (error) {
    res.status(500).render('error', { message: 'An error occurred!' });
  }
});


const rejectAdminRequests = asyncHandler(async (req, res) => {
    // if (!req.user.isAdmin) {
    //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
    // }
    try {
        const { id: userId } = req.params;
       
        const query = "UPDATE users SET admin_request_status = 'rejected' WHERE id = ?";
        await pool.query(query, [userId]);
        res.status(200);
        res.redirect("/api/admin/requests");
        msg = "Admin request rejected";
    } catch (error) {
      res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const viewBooks = asyncHandler(async (req, res) => {
   
    // if (!req.user.isAdmin) {
    //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
    // }
    try {
      
      const query = "SELECT b.*, c.checkout_date, c.return_date, u.username FROM books b LEFT JOIN checkouts c ON b.id = c.book_id LEFT JOIN users u ON c.user_id = u.id";
      const [rows] = await pool.query(query); 
      const books = rows;
      
      res.render("books", { books });
    } catch (error) {
      res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const addBook = asyncHandler(async (req, res) => {
    // if (!req.user.isAdmin) {
    //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
    // }
    const { title, author, quantity} = req.body;
    if (!title || !author || !quantity) {
      const message = 'ALL FIELDS ARE REQUIRED';
      res.status(400).render('adminHome', { errorMessage: message });
      return;
  }

    try {
        const query = "INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)";
        await pool.query(query, [title, author, quantity]);
        let msg = "Book added successfully";
        res.render('adminHome', { user: req.user, message: msg });
    } catch (error) {
      res.status(500).render('error', { message: 'An error occurred!' });
    }
});

const deleteBook = asyncHandler(async (req, res) => {
  // if (!req.user.isAdmin) {
  //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
  // }
  const bookId = req.params; 

  const viewQuery = "SELECT * FROM books WHERE id = ?";
  const deleteQuery = "DELETE FROM books WHERE id = ?";
  const deleteCheckouts = "DELETE FROM checkouts WHERE book_id = ?";

  let deletedBook;
  let success;

  try {
    
    const [viewResult] = await pool.query(viewQuery, [bookId.id]);
    if (viewResult.length === 0) {
      success = false;
      return res.status(404).send("Book not found");
    }
    deletedBook = viewResult[0];

    
    await pool.query(deleteCheckouts, [bookId.id]);

   
    const [deleteResult] = await pool.query(deleteQuery, [bookId.id]);

    
    if (deleteResult.affectedRows === 0) {
      success = false;
      res.status(500).render('error', { message: 'failed to delete book' });
    }

    success = true;
    res.status(200)
    res.redirect('/api/admin/books/manage');

  } catch (err) {
    res.status(500).render('error', { message: 'An error occurred!' });
  }
});

const renderUpdateBookPage = asyncHandler(async (req, res) => {
  // if (!req.user.isAdmin) {
  //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
  // }

  const {id: bookId} = req.params;
  

  try {
    const query = "SELECT * FROM books WHERE id = ?";
    const [rows] = await pool.query(query, [bookId]);
    const book = rows[0];
    

    res.render("updateBook", {
      user: req.user,
      book: book,
      message: "Enter Details",
    });
  } catch (err) {
    res.status(500).render('error', { message: 'An error occurred!' });
  }
});

const adminUpdateBook = asyncHandler(async (req, res) => {
  // if (!req.user.isAdmin) {
  //   res.status(401).render('error', { message: 'you are not authorized to view this page.' });
  // }

  const { title, author, quantity } = req.body;
  const queryBook = "SELECT * FROM books WHERE title = ?";
  const [rows] = await pool.query(queryBook, [title]);
  const book = rows[0];
  const query = "UPDATE books SET title = ?, author = ?, quantity = ? WHERE id = ?";
  let message;
  try {
    await pool.query(query, [title, author, quantity, req.params.id]);
    message = `Book '${title}' updated successfully`;
    res.redirect("/api/admin/books/manage");
  } catch (err) {
    res.status(500).render('error', { message: 'An error occurred!' });
  }

  res.render("updateBook", {
    user: req.user,
    book: book,
    message: message,
  });
});

  const searchBooks = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const sqlQuery =
      "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? AND available = true";
    try {
      const [results] = await pool.query(sqlQuery, [`%${query}%`, `%${query}%`]);
      if (!results) {
        res.send("No Books found");
      }
      res.json(results);
    } catch (err) {
      res.status(500).render('error', { message: 'An error occurred!' });
    }
  });
  
  const viewCheckouts = asyncHandler(async (req, res) => {
    const query = `
        SELECT c.*, u.username, b.title, b.author
        FROM checkouts c
        JOIN users u ON c.user_id = u.id
        JOIN books b ON c.book_id = b.id
        WHERE c.status = 'pending';
    `;

    try {
        const [checkouts] = await pool.query(query);
        return res.render('viewCheckouts', { checkouts: checkouts });
    } catch (error) {
        res.status(500).render('error', { message: 'An error occurred while fetching checkouts!' });
    }
});

const approvecheckouts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const getCheckoutQuery = "SELECT * FROM checkouts WHERE id = ?";
  const updateCheckoutQuery = `
      UPDATE checkouts 
      SET status = 'approved', 
          checkout_date = CURDATE(), 
          due_date = DATE_ADD(CURDATE(), INTERVAL 1 WEEK) 
      WHERE id = ?;
  `;
  const updateCheckinQuery = `
      UPDATE checkouts 
      SET status = 'approved', 
          return_date = CURDATE(), 
          fine = CASE WHEN DATEDIFF(CURDATE(), due_date) > 0 THEN DATEDIFF(CURDATE(), due_date) * 0.50 ELSE 0 END 
      WHERE id = ?;
  `;
  const updateBookCheckoutQuery = `
      UPDATE books 
      SET quantity = quantity - 1, 
          available = CASE WHEN quantity - 1 = 0 THEN false ELSE available END 
      WHERE id = ?;
  `;
  const updateBookCheckinQuery = `
      UPDATE books 
      SET quantity = quantity + 1, 
          available = true 
      WHERE id = ?;
  `;

  const connection = await pool.getConnection(); 

  try {
      await connection.beginTransaction(); 

      const [checkoutResult] = await connection.query(getCheckoutQuery, [id]);
      if (checkoutResult.length === 0) {
          throw new Error('Checkout not found');
      }
      const checkout = checkoutResult[0];
      const bookId = checkout.book_id;

      if (checkout.type === 'checkout') {
          await connection.query(updateCheckoutQuery, [id]);
          await connection.query(updateBookCheckoutQuery, [bookId]);
      } else if (checkout.type === 'checkin') {
          await connection.query(updateCheckinQuery, [id]);
          await connection.query(updateBookCheckinQuery, [bookId]);
      }

      await connection.commit(); 
      res.status(200).redirect('/api/admin/checkouts');
  } catch (error) {
      await connection.rollback(); 
      console.error('Error approving checkout:', error);
      res.status(500).render('error', { message: 'An error occurred while approving checkout!' });
  } finally {
      connection.release(); 
  }
});

const rejectcheckouts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateCheckoutQuery = `
      UPDATE checkouts 
      SET status = 'rejected' 
      WHERE id = ?;
  `;

  const connection = await pool.getConnection(); 

  try {
      await connection.beginTransaction(); 

      // Update the checkout status to 'rejected'
      await connection.query(updateCheckoutQuery, [id]);

      await connection.commit(); 
      res.status(200).redirect('/api/admin/checkouts');
  } catch (error) {
      await connection.rollback(); 
      console.error('Error rejecting checkout:', error);
      res.status(500).render('error', { message: 'An error occurred while rejecting checkout!' });
  } finally {
      connection.release(); 
  }
});

  module.exports = { 
    viewAdminRequests, 
    approveAdminRequests, 
    rejectAdminRequests, 
    viewBooks, 
    addBook, 
    deleteBook, 
    renderUpdateBookPage, 
    adminUpdateBook, 
    searchBooks,
    viewCheckouts,
    approvecheckouts,
    rejectcheckouts
};




