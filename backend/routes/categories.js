const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, branchUserOnly } = require('../middleware/auth');

router.use(protect, branchUserOnly);

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ branch: req.user.branch._id }).sort({ name: 1 });
        res.json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, branch: req.user.branch._id });
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const category = await Category.create({ ...req.body, branch: req.user.branch._id });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, branch: req.user.branch._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, branch: req.user.branch._id });
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
