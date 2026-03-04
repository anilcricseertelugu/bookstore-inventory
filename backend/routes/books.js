const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, branchUserOnly } = require('../middleware/auth');

router.use(protect, branchUserOnly);

router.get('/', async (req, res) => {
    try {
        const filter = { branch: req.user.branch._id };
        if (req.query.category) filter.categories = req.query.category;
        const books = await Book.find(filter).populate('categories', 'name colorTag').sort({ title: 1 });
        res.json({ success: true, count: books.length, data: books });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, branch: req.user.branch._id }).populate('categories', 'name colorTag');
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.json({ success: true, data: book });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.body.isbn === '') req.body.isbn = null;
        const book = await Book.create({ ...req.body, branch: req.user.branch._id });
        const populated = await book.populate('categories', 'name colorTag');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, error: 'A book with this ISBN already exists' });
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (req.body.isbn === '') req.body.isbn = null;
        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, branch: req.user.branch._id },
            req.body,
            { new: true, runValidators: true }
        ).populate('categories', 'name colorTag');
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.json({ success: true, data: book });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ _id: req.params.id, branch: req.user.branch._id });
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
