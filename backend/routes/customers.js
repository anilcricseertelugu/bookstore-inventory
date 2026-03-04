const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { protect, branchUserOnly } = require('../middleware/auth');

router.use(protect, branchUserOnly);

router.get('/', async (req, res) => {
    try {
        const filter = { branch: req.user.branch._id };
        if (req.query.search) {
            const rx = new RegExp(req.query.search, 'i');
            filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { customerId: rx }];
        }
        const customers = await Customer.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, branch: req.user.branch._id });
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.body.phone === '') req.body.phone = null;
        if (req.body.email === '') req.body.email = null;
        const customer = await Customer.create({ ...req.body, branch: req.user.branch._id });
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, error: `A customer with this ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (req.body.phone === '') req.body.phone = null;
        if (req.body.email === '') req.body.email = null;
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, branch: req.user.branch._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.json({ success: true, data: customer });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, error: `A customer with this ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, branch: req.user.branch._id });
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
