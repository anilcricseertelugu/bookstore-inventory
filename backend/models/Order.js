const mongoose = require('mongoose');

function generateOrderId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'ORD-';
    for (let i = 0; i < 4; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

const LineItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true },
    language: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        index: true
    },
    // Optional customer linkage — null for anonymous walk-ins
    customer: { type: mongoose.Schema.ObjectId, ref: 'Customer', default: null },
    customerId: { type: String, default: '' },   // snapshot e.g. CST-A3F9
    customerName: { type: String, default: '' },   // snapshot
    customerPhone: { type: String, default: '' },   // snapshot
    items: {
        type: [LineItemSchema],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: 'An order must have at least one item'
        }
    },
    totalAmount: { type: Number, required: true },
    amountReceived: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    branch: {
        type: mongoose.Schema.ObjectId,
        ref: 'Branch',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate orderId
OrderSchema.pre('save', async function () {
    if (this.orderId) return;
    let id, exists;
    let attempts = 0;
    do {
        id = generateOrderId();
        exists = await mongoose.model('Order').findOne({ orderId: id }).lean();
        attempts++;
        if (attempts > 20) break;
    } while (exists);
    this.orderId = id;
});

module.exports = mongoose.model('Order', OrderSchema);
