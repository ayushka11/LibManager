const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) return res.sendStatus(401);

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode.user;
        console.log(decode.user);
        next();
    } catch (err) {
        res.status(401).json({message: "INVALID TOKEN"});
    }
});

module.exports = validateToken;