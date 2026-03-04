const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// @desc    Get all books (optional ?category=id filter)
// @route   GET /api/books
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.categories = req.query.category;
        const books = await Book.find(filter)
            .populate('categories', 'name colorTag')
            .sort({ title: 1 });
        res.status(200).json({ success: true, count: books.length, data: books });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get single book
// @route   GET /api/books/:id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('categories', 'name colorTag');
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.status(200).json({ success: true, data: book });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Create book
// @route   POST /api/books
router.post('/', async (req, res) => {
    try {
        // Clean up isbn — treat empty string as null to avoid unique conflict
        if (req.body.isbn === '') req.body.isbn = null;
        const book = await Book.create(req.body);
        const populated = await book.populate('categories', 'name colorTag');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'A book with this ISBN already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update book
// @route   PUT /api/books/:id
router.put('/:id', async (req, res) => {
    try {
        if (req.body.isbn === '') req.body.isbn = null;
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('categories', 'name colorTag');
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.status(200).json({ success: true, data: book });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete book
// @route   DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
