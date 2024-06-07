const express = require('express');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {
    getUsers,
    getUser,
    createUser,
    updateUserName,
    deleteUser,
    pool,
    getUserByName,
} = require('../database');

const registerUser = asyncHandler(async (req, res) => {
    const { username, password, isAdmin = false } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedpwd = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
            [username, hashedpwd, isAdmin]
        );

        const id = result.insertId;
        const user = await getUser(id);

        res.redirect('/login');
    } catch (err) {
        const sqlMessage = err.sqlMessage;
        if (sqlMessage && sqlMessage.slice(0, 15) === 'Duplicate entry') {
            const message = 'Username already exists';
            res.status(400).render('registerUser', { errorMessage: message });
        } else {
            res.status(500).render('registerUser', { errorMessage: 'Registration failed' });
        }
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password} = req.body;

    if (!username || !password) {
        const message = 'ALL FIELDS ARE REQUIRED';
        res.status(400).render('loginUser', { errorMessage: message });
        return;
    }

    try {
        const info = await getUserByName(username);
        const user = info[0][0];
        if (!user) {
            const message = 'INVALID USERNAME OR PASSWORD';
            res.status(400).render('loginUser', { errorMessage: message });
            return;
        }

        const validpwd = await bcrypt.compare(password, user.password);
        if (!validpwd) {
            const message = 'INVALID USERNAME OR PASSWORD';
            res.status(400).render('loginUser', { errorMessage: message });
            return;
        }

        const token = jwt.sign(
            {user: { id: user.id, isAdmin: user.isAdmin, username: user.username } },
            process.env.JWT_SECRET,
            { expiresIn: "120m"}
        );

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7200000,
        });

        res.redirect('/home');
    } catch (err) {
        console.error(err);
        const message = 'internal server error';
        res.status(400).render('loginUser', { errorMessage: message });
        return;
    }

});

const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});

module.exports = { registerUser, loginUser, currentUser, logoutUser };