const userRole = (req, res, next) => {
    res.locals.userRole = req.session.userRole || 'guest';
    next();
};

module.exports = userRole;