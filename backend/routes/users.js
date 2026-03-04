const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Branch = require('../models/Branch');
const { protect, ownerOnly } = require('../middleware/auth');

router.use(protect, ownerOnly);

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: 'branch_user' }).populate('branch').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/users — create branch user
router.post('/', async (req, res) => {
    const { username, password, branch } = req.body;
    if (!username || !password || !branch)
        return res.status(400).json({ success: false, error: 'Username, password and branch are required' });
    try {
        const branchDoc = await Branch.findById(branch);
        if (!branchDoc) return res.status(404).json({ success: false, error: 'Branch not found' });

        const user = await User.create({ username, password, role: 'branch_user', branch });
        const populated = await user.populate('branch');
        res.status(201).json({ success: true, data: { _id: populated._id, username: populated.username, role: populated.role, branch: populated.branch, createdAt: populated.createdAt } });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, error: 'Username already exists' });
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT /api/users/:id — update password or branch
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role === 'owner')
            return res.status(404).json({ success: false, error: 'User not found' });

        if (req.body.branch) user.branch = req.body.branch;
        if (req.body.password) user.password = req.body.password;   // pre-save hook re-hashes
        await user.save();
        const populated = await user.populate('branch');
        res.json({ success: true, data: { _id: populated._id, username: populated.username, role: populated.role, branch: populated.branch } });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role === 'owner')
            return res.status(404).json({ success: false, error: 'User not found' });
        await user.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
