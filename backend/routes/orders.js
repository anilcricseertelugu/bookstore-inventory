const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Book = require('../models/Book');
const { protect, branchUserOnly } = require('../middleware/auth');

router.use(protect, branchUserOnly);

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ branch: req.user.branch._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, branch: req.user.branch._id });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { items, amountReceived, notes, customer, customerId, customerName, customerPhone } = req.body;
    const branchId = req.user.branch._id;

    if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ success: false, error: 'Order must have at least one item.' });
    if (amountReceived === undefined || amountReceived === null || amountReceived < 0)
        return res.status(400).json({ success: false, error: 'Amount received is required.' });

    try {
        const bookIds = items.map(i => i.bookId);
        // Only allow books from this branch
        const books = await Book.find({ _id: { $in: bookIds }, branch: branchId });
        const bookMap = Object.fromEntries(books.map(b => [b._id.toString(), b]));

        const lineItems = [];
        let totalAmount = 0;
        const stockErrors = [];

        for (const { bookId, quantity } of items) {
            const book = bookMap[bookId];
            if (!book) { stockErrors.push(`Book not found or belongs to another branch.`); continue; }
            if (book.quantity < quantity) {
                stockErrors.push(`"${book.title}" only has ${book.quantity} in stock (requested ${quantity}).`);
                continue;
            }
            const subtotal = Number((book.price * quantity).toFixed(2));
            totalAmount += subtotal;
            lineItems.push({ book: book._id, bookTitle: book.title, language: book.language || '', unitPrice: book.price, quantity, subtotal });
        }

        if (stockErrors.length > 0)
            return res.status(400).json({ success: false, error: stockErrors.join(' | ') });

        totalAmount = Number(totalAmount.toFixed(2));
        const received = Number(Number(amountReceived).toFixed(2));
        const discount = Number((totalAmount - received).toFixed(2));

        for (const { bookId, quantity } of items)
            await Book.findByIdAndUpdate(bookId, { $inc: { quantity: -quantity } });

        const order = await Order.create({
            customer: customer || null,
            customerId: customerId || '',
            customerName: customerName || '',
            customerPhone: customerPhone || '',
            items: lineItems,
            totalAmount,
            amountReceived: received,
            discount,
            notes: notes || '',
            branch: branchId
        });

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, branch: req.user.branch._id });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        for (const item of order.items)
            await Book.findByIdAndUpdate(item.book, { $inc: { quantity: item.quantity } });
        await order.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
