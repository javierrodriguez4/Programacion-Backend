// Middleware para verificar si hay un usuario logueado
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {        
        next();
    } else {        
        res.redirect('/login');
    }
};

module.exports = isLoggedIn;
