const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../dao/models/users.model');

router.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const user = req.session.user;
    res.render('login', { isLoggedIn, user });
});

router.post('/', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).render('notLoggedIn');
            }

            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        req.session.user = user;
                        res.redirect('/');
                    } else {
                        res.render('notLoggedIn');
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error de servidor');
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error de servidor');
        });
});

module.exports = router;
