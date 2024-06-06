const express = require('express');
const router = express.Router();
const { BaoHiem, User } = require('../models'); // Adjust the path as needed

router.post('/submit-insurance', async (req, res) => {
    try {
        const {
            fullName,
            phone,
            profilePicture,
            coverPhoto,
            insurancePackage,
            website,
            category,
            zalo,
            facebook,
            address,
            telegram,
            introduction,
            bankName,
            bankAccount,
            accountHolder,
            userId // Ensure this is included in the form data
        } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const newEntry = await BaoHiem.create({
            fullName,
            phone,
            profilePicture, // You might need to handle file uploads separately
            coverPhoto, // You might need to handle file uploads separately
            insurancePackage,
            website,
            category,
            zalo,
            facebook,
            address,
            telegram,
            introduction,
            bankName,
            bankAccount,
            accountHolder,
            userId
        });

        res.status(201).json({ message: 'Form submitted successfully!', data: newEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while submitting the form.' });
    }
});

module.exports = router;


module.exports = router;
