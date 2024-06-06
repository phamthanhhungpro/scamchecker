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
    const user = await User.findOne({ where: { emailOrPhone: emailOrPhone } });
    if (!user) return res.status(400).send('Username or password is wrong');

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({ id: user.id, role: user.role }, 'jhyatwtwfaftw23@333');
    res.header('Authorization', token).send({ token: token, emailOrPhone: user.emailOrPhone, role: user.role });
});

// get user info by id
router.get('/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(400).send('User not found');
    res.send(user);
});

// edit user password
router.put('/password', async (req, res) => {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ where: { emailOrPhone: emailOrPhone } });
    if (!user) return res.status(400).send('User not found');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.send(user);
});

// edit user info
router.put('/info', async (req, res) => {
    const { emailOrPhone, fullName, username } = req.body;
    const user = await User.findOne({ where: { emailOrPhone: emailOrPhone } });
    if (!user) return res.status(400).send('User not found');
    user.fullName = fullName;
    user.username = username;
    user.emailOrPhone = emailOrPhone;

    await user.save();
    res.send(user);
});

module.exports = router;
