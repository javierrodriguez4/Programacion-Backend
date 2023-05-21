const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../dao/models/users.model');

router.get('/', (req, res) => {
    res.render('signup');
});

router.post('/', (req, res) => { 
    const { first_name, last_name, email, age, role, password } = req.body;
    bcrypt.hash(password, 10)
        .then(hash => {
            const newUser = new User({
                first_name: first_name,
                last_name: last_name,
                email: email,
                age: age,
                role: role,
                password: hash 
            });

            return newUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error de servidor');
        });
});

module.exports = router;
