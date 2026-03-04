const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// @desc    Get all customers (optional ?search=)
// @route   GET /api/customers
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.search) {
            const rx = new RegExp(req.query.search, 'i');
            filter.$or = [
                { name: rx },
                { phone: rx },
                { email: rx },
                { customerId: rx }
            ];
        }
        const customers = await Customer.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get single customer
// @route   GET /api/customers/:id
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.status(200).json({ success: true, data: customer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Create customer
// @route   POST /api/customers
router.post('/', async (req, res) => {
    try {
        // Treat empty strings as null for optional unique fields
        if (req.body.phone === '') req.body.phone = null;
        if (req.body.email === '') req.body.email = null;
        const customer = await Customer.create(req.body);
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, error: `A customer with this ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update customer
// @route   PUT /api/customers/:id
router.put('/:id', async (req, res) => {
    try {
        if (req.body.phone === '') req.body.phone = null;
        if (req.body.email === '') req.body.email = null;
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.status(200).json({ success: true, data: customer });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, error: `A customer with this ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
