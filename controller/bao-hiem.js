const express = require('express');
const router = express.Router();
const { BaoHiem, User } = require('../db/db');

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
            userId
        });

        res.status(201).json({ message: 'Form submitted successfully!', data: newEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while submitting the form.' });
    }
});

router.get('/insurance-list', async (req, res) => {
    try {
        const insuranceList = await BaoHiem.findAll({
            include: User
        });

        res.json(insuranceList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the insurance list.' });
    }
});

router.get('/insurance-detail/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const insuranceDetail = await BaoHiem.findByPk(id, {
            include: User
        });

        if (!insuranceDetail) {
            return res.status(404).json({ message: 'Insurance not found' });
        }

        res.json(insuranceDetail);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the insurance detail.' });
    }
});

router.get('/insurance-by-user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const insuranceList = await BaoHiem.findAll({
            where: {
                userId
            }
        });

        res.json(insuranceList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the insurance list.' });
    }
});

router.delete('/delete-insurance/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await BaoHiem.findByPk(id);
        if (!insurance) {
            return res.status(404).json({ message: 'Insurance not found' });
        }

        await insurance.destroy();

        res.json({ message: 'Insurance deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the insurance.' });
    }
});

// admin approve insurance
router.put('/approve-insurance/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await BaoHiem.findByPk(id);
        if (!insurance) {
            return res.status(404).json({ message: 'Insurance not found' });
        }

        insurance.status = 'approved';

        await insurance.save();

        res.json({ message: 'Insurance approved successfully!', data: insurance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while approving the insurance.' });
    }
});

// admin reject insurance
router.put('/reject-insurance/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await BaoHiem.findByPk(id);
        if (!insurance) {
            return res.status(404).json({ message: 'Insurance not found' });
        }

        insurance.status = 'rejected';

        await insurance.save();

        res.json({ message: 'Insurance rejected successfully!', data: insurance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while rejecting the insurance.' });
    }
});

// get all with pagination
router.get('/insurance-list', async (req, res) => {
    try {
        const { page, limit } = req.query;

        const offset = page * limit;
        const insuranceList = await BaoHiem.findAll({
            include: User,
            offset,
            limit
        });

        const totalRecords = await BaoHiem.count();

        res.json({ insuranceList, limit, totalRecords });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the insurance list.' });
    }
});


module.exports = router;
