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
        const sqlmssg = err.sqlMessage;
        if (sqlMessage.slice(0, 15) == 'Duplicate entry') {
            res.status(400);
            throw new Error('Username already exists');
        }
        res.status(500).json({message: 'Registration failed'});
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "ALL FIELDS ARE MANDATORY"});
    }

    try {
        const info = await getUserByName(username);
        const user = info[0][0];
        if (!user) {
            return res.status(401).json({message: "INVALID USERNAME OR PASSWORD"});
        }

        const validpwd = await bcrypt.compare(password, user.password);
        if (!validpwd) {
            return res.status(401).json({message: "INVALID USERNAME OR PASSWORD"});
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
        res.status(500).json({message: "SERVER ERROR"});
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