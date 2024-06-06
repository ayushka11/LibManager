const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    //console.log('validateToken middleware');
    const token = req.cookies.jwt;

    if (!token) return res.sendStatus(401);

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decode.user.id,
            username: decode.user.username,
            isAdmin: decode.user.isAdmin
        };
        //console.log('valid');

        next();
    } catch (err) {
        res.status(401).json({message: "INVALID TOKEN"});
    }
});

module.exports = validateToken;