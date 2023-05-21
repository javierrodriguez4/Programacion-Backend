const express = require('express');
const router = express.Router();
const User = require('../dao/models/users.model');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const userObjects = users.map(user => user.toObject());
        res.render('users', { users: userObjects });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error del servidor');
    }
});


module.exports = router;
