const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_super_secret_2026';

// Verify JWT and attach req.user
exports.protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Not authorised — no token' });
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).populate('branch');
        if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Only owner role
exports.ownerOnly = (req, res, next) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ success: false, error: 'Owner access only' });
    }
    next();
};

// Only branch_user role
exports.branchUserOnly = (req, res, next) => {
    if (req.user.role !== 'branch_user') {
        return res.status(403).json({ success: false, error: 'Branch user access only' });
    }
    if (!req.user.branch) {
        return res.status(403).json({ success: false, error: 'User has no branch assigned' });
    }
    next();
};

exports.JWT_SECRET = JWT_SECRET;
