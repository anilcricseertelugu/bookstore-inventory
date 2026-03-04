const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Book = require('../models/Book');

// GET /api/orders — list all orders newest first
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/orders/:id — single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/orders — create, validate stock, deduct inventory
// Body: { items, amountReceived, notes, customerId?, customerName?, customerPhone?, customer? }
router.post('/', async (req, res) => {
    const { items, amountReceived, notes, customer, customerId, customerName, customerPhone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Order must have at least one item.' });
    }
    if (amountReceived === undefined || amountReceived === null || amountReceived < 0) {
        return res.status(400).json({ success: false, error: 'Amount received is required.' });
    }

    try {
        // 1. Load all books in one query
        const bookIds = items.map(i => i.bookId);
        const books = await Book.find({ _id: { $in: bookIds } });
        const bookMap = Object.fromEntries(books.map(b => [b._id.toString(), b]));

        // 2. Validate stock for each item
        const lineItems = [];
        let totalAmount = 0;
        const stockErrors = [];

        for (const { bookId, quantity } of items) {
            const book = bookMap[bookId];
            if (!book) {
                stockErrors.push(`Book ID ${bookId} not found.`);
                continue;
            }
            if (book.quantity < quantity) {
                stockErrors.push(`"${book.title}" only has ${book.quantity} in stock (requested ${quantity}).`);
                continue;
            }
            const subtotal = Number((book.price * quantity).toFixed(2));
            totalAmount += subtotal;
            lineItems.push({
                book: book._id,
                bookTitle: book.title,
                language: book.language || '',
                unitPrice: book.price,
                quantity,
                subtotal
            });
        }

        if (stockErrors.length > 0) {
            return res.status(400).json({ success: false, error: stockErrors.join(' | ') });
        }

        totalAmount = Number(totalAmount.toFixed(2));
        const received = Number(Number(amountReceived).toFixed(2));
        const discount = Number((totalAmount - received).toFixed(2));

        // 3. Deduct stock
        for (const { bookId, quantity } of items) {
            await Book.findByIdAndUpdate(bookId, { $inc: { quantity: -quantity } });
        }

        // 4. Save order
        const order = await Order.create({
            customer: customer || null,
            customerId: customerId || '',
            customerName: customerName || '',
            customerPhone: customerPhone || '',
            items: lineItems,
            totalAmount,
            amountReceived: received,
            discount,
            notes: notes || ''
        });


        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/orders/:id — delete order and restore stock
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        // Restore stock
        for (const item of order.items) {
            await Book.findByIdAndUpdate(item.book, { $inc: { quantity: item.quantity } });
        }

        await order.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
