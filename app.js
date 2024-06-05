const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const errorHandler = require ('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const validateToken = require('./middleware/validateToken');

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
app.use(errorHandler);

app.get("/login", (req, res) => {
  res.render("loginUser");
});

app.get("/register", (req, res) => {
  res.render("registerUser");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

app.get('/', (req, res) => {
    res.status(200).end('Hello from the server');
})
