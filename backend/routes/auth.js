const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, error: 'Username and password are required' });

    try {
        const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password').populate('branch');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ success: false, error: 'Invalid username or password' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '12h' });

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                branch: user.branch   // null for owner
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    res.json({
        success: true, user: {
            _id: req.user._id,
            username: req.user.username,
            role: req.user.role,
            branch: req.user.branch
        }
    });
});

// PUT /api/auth/password
router.put('/password', require('../middleware/auth').protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
        return res.status(400).json({ success: false, error: 'Old and new passwords are required' });

    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!user || !(await user.matchPassword(oldPassword))) {
            return res.status(401).json({ success: false, error: 'Incorrect old password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
