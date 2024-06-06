const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const errorHandler = require ('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const validateToken = require('./middleware/validateToken');

const { pool } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs"); // Set the view engine to EJS for rendering HTML templates
app.set("views", path.join(__dirname, "views")); // Set the directory for view templates to 'views'

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.use('/api/users', require('./routes/loginRoutes'));
app.use("/api/user", require("./routes/userRoutes"));
app.use('/api/admin', require('./routes/adminRoutes'))
app.use(errorHandler);

app.get("/login", (req, res) => {
  res.render("loginUser");
});

app.get("/register", (req, res) => {
  res.render("registerUser");
});

app.get("/home", validateToken, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      res.render("adminHome", { user: req.user, message: "" });
    } else {
      const [rows] = await pool.query("SELECT * FROM books"); // Adjust the query based on your table structure
      const books = rows;
      res.render("userHome", { user: req.user, books: books });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/view", validateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books"); // Adjust the query based on your table structure
    const books = rows;
    res.render("userViewBooks", { user: req.user, books: books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/history", validateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assumes validateToken middleware sets req.user
    const [rows] = await pool.query(`
      SELECT checkouts.id as checkout_id, checkouts.checkout_date, checkouts.due_date, checkouts.return_date, checkouts.fine, 
             books.id as book_id, books.title, books.author 
      FROM checkouts 
      INNER JOIN books ON checkouts.book_id = books.id 
      WHERE checkouts.user_id = ?`, [userId]);
    
    const borrowingHistory = rows;
    res.render("checkoutHistory", { user: req.user, books: borrowingHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/");
app.get("/");

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

app.get('/', (req, res) => {
    res.status(200).end('Hello from the server');
})
