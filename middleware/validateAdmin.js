const asyncHandler = require('express-async-handler');

const validateAdmin = asyncHandler (async (req, res, next) => {
    if (!req.user.isAdmin) {
        res.status(401).render('error', { message: 'you are not authorized to view this page.' });
    }
    next();
});

module.exports = validateAdmin;