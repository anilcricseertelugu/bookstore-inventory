const mongoose = require('mongoose');

// Generates a short unique customer ID like CST-X7B3
function generateCustomerId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
    let id = 'CST-';
    for (let i = 0; i < 4; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

const CustomerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        trim: true,
        default: null,
        sparse: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
        sparse: true
    },
    address: {
        type: String,
        trim: true,
        maxlength: [300, 'Address cannot exceed 300 characters'],
        default: ''
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate customerId before saving if not set
CustomerSchema.pre('save', async function () {
    if (this.customerId) return;
    let id, exists;
    let attempts = 0;
    do {
        id = generateCustomerId();
        exists = await mongoose.model('Customer').findOne({ customerId: id }).lean();
        attempts++;
        if (attempts > 20) break; // safety valve
    } while (exists);
    this.customerId = id;
});

module.exports = mongoose.model('Customer', CustomerSchema);
