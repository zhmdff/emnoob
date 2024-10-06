const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

router.get('/login', (req, res) => {
    const isLoginPage = true;
    const username = req.session.username || '';

    if (username) {
        return res.redirect('/dashboard');
    }

    res.render('login', { isLoginPage, username, req, path: req.path, globalUserType: 'default' });
});

router.post('/form-login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(400).send('Username does not exist');
        }

        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal server error');
            }

            if (result) {
                req.session.username = results[0].username;
                req.session.userType = results[0].userType;

                switch (results[0].userType) {
                    case 'admin':
                        req.session.globalUserType = 'admin';
                        break;
                    case 'moderator':
                        req.session.globalUserType = 'moderator';
                        break;
                    case 'teacher':
                        req.session.globalUserType = 'teacher';
                        break;
                    case 'student':
                        req.session.globalUserType = 'student';
                        break;
                    default:
                        return res.status(401).send('Unauthorized');
                }
                return res.redirect('/dashboard');
            } else {
                return res.status(401).send('Incorrect password');
            }
        });
    });
});

module.exports = router;
