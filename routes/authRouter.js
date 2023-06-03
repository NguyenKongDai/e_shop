'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { body, getErrorMessage } = require('../controllers/validator');

router.get('/login', controller.show);
router.post('/login',
    body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
    body('password').trim().notEmpty().withMessage('Password is required!'),
    (req, res, next) => {
        let message = getErrorMessage(req);
        if (message) {
            return res.render('login', { loginMessage: message });
        }
        next();
    },
    controller.login
);

router.get('/logout', controller.logout);

router.post('/register',
    body('firstName').trim().notEmpty().withMessage('First name is required!'),
    body('lastName').trim().notEmpty().withMessage('Last name is required!'),
    body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
    body('mobile').trim().notEmpty().withMessage('Mobile number is required!'),
    body('password').trim().notEmpty().withMessage('Password is required!'),
    body('password').matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/).withMessage('Password must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters.'),
    body('confirmPassword').custom((confirmPassword, { req }) => {
        if (confirmPassword != req.body.password) {
            throw new Error('Password is not match!');
        }
        return true;
    }),
    (req, res, next) => {
        let message = getErrorMessage(req);
        if (message) {
            return res.render('login', { registerMessage: message });
        }
        next();
    },
    controller.register
);

router.get('/forgot', controller.showForgotPassword);
router.post('/forgot', controller.forgotPassword);

module.exports = router;