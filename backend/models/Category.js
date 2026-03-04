const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },

    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters'],
        default: ''
    },
    colorTag: {
        type: String,
        default: '#6366f1'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

CategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
