const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [50, 'Username cannot exceed 50 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false   // never returned in queries by default
    },
    role: {
        type: String,
        enum: ['owner', 'branch_user'],
        default: 'branch_user'
    },
    branch: {
        type: mongoose.Schema.ObjectId,
        ref: 'Branch',
        default: null   // null for owner
    },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare plain password to hash
UserSchema.methods.matchPassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
