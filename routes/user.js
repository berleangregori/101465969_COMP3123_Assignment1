const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ENDPOINT #1 POST /api/v1/user/signup Allow user to create new account 
router.post('/signup', [
    // Validation rules
    body('username').isString().notEmpty().withMessage('Username is required.'),
    body('email').isEmail().withMessage('Email is not valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;
        
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = new User({ username, email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({
            message: "User created successfully.",
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ENDPOINT #2 POST /api/v1/user/login Allow user to access the system 
router.post('/login', [
    // Validation rules for login
    body('username').isString().notEmpty().withMessage('Username is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password is required.')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', jwt_token: token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

