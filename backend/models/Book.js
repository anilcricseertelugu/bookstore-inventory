const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a book title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    author: {
        type: String,
        required: [true, 'Please add an author name'],
        trim: true,
        maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    language: {
        type: String,
        required: [true, 'Please select a language'],
        trim: true,
        default: 'English'
    },
    isbn: {
        type: String,
        trim: true,
        sparse: true,
        unique: true,
        default: null
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters'],
        default: ''
    },
    publishedYear: {
        type: Number,
        min: [1000, 'Please enter a valid year'],
        max: [new Date().getFullYear(), 'Year cannot be in the future'],
        default: null
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    categories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    branch: {
        type: mongoose.Schema.ObjectId,
        ref: 'Branch',
        required: true
    },
    coverColor: {
        type: String,
        default: '#6366f1'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', BookSchema);
