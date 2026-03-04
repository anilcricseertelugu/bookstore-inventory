const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Branch name is required'],
        trim: true,
        maxlength: [100, 'Branch name cannot exceed 100 characters']
    },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Branch', BranchSchema);
