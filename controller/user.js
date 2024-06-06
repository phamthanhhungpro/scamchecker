const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password, fullName, email, phone } = req.body;
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    try {
        const user = await User.create({ username, fullName, email, phone, password: hashedPassword });
        res.send(user);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    const { input, password } = req.body;
    console.log(input, password);
    // Find user
    const user = await User.findOne({ where: { $or: [{ email: input }, { phone: input }, { username: input }] } });
    if (!user) return res.status(400).send('Sai thông tin đăng nhập');

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Sai thông tin đăng nhập');

    // Create and assign a token
    const token = jwt.sign({ id: user.id, role: user.role }, 'jhyatwtwfaftw23@333');
    res.header('Authorization', token).send({ token: token, email: user.email, phone: user.phone, username: user.username, role: user.role, userId: user.id});
});

// get user info by username
router.get('/info', async (req, res) => {
    const { username } = req.query;
    const user = await User.findOne({ where: { username: username } });
    if (!user) return res.status(400).send('User not found');
    res.send(user);
});


// edit user password
router.put('/password', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username: username } });
    if (!user) return res.status(400).send('User not found');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.send(user);
});

// edit user info
router.put('/info', async (req, res) => {
    const { username, fullName, email, phone } = req.body;
    const user = await User.findOne({ where: { username: username } });
    if (!user) return res.status(400).send('User not found');
    user.fullName = fullName;
    user.username = username;
    user.email = email;
    user.phone = phone;

    await user.save();
    res.send(user);
});

module.exports = router;
