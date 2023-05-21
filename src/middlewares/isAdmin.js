// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {

        res.render('Usuario no autorizado');
    }
};

module.exports = isAdmin;
