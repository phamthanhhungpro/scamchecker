const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password, fullName, emailOrPhone } = req.body;
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    try {
        const user = await User.create({ username, fullName, emailOrPhone, password: hashedPassword });
        res.send(user);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { emailOrPhone : emailOrPhone} });
    if (!user) return res.status(400).send('Username or password is wrong');

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({ id: user.id, role: user.role }, 'jhyatwtwfaftw23@333');
    res.header('Authorization', token).send({token : token, emailOrPhone: user.emailOrPhone, role: user.role});
});

module.exports = router;
