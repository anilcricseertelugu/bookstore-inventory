const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});




// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Public
router.post('/', async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Category name must be unique' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
