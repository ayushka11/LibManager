const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) return res.sendStatus(401);

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decode.user.id,
            username: decode.user.username,
            isAdmin: decode.user.isAdmin
        };
        next();
    } catch (err) {
        res.status(401).json({message: "INVALID TOKEN"});
    }
});

module.exports = validateToken;