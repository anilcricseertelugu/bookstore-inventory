const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const User = require('../models/User');
const { protect, ownerOnly } = require('../middleware/auth');

router.use(protect, ownerOnly);

// GET /api/branches
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find().sort({ createdAt: -1 });
        // attach user count per branch
        const withCounts = await Promise.all(branches.map(async b => {
            const userCount = await User.countDocuments({ branch: b._id });
            return { ...b.toObject(), userCount };
        }));
        res.json({ success: true, count: branches.length, data: withCounts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/branches
router.post('/', async (req, res) => {
    try {
        const branch = await Branch.create(req.body);
        res.status(201).json({ success: true, data: branch });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT /api/branches/:id
router.put('/:id', async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!branch) return res.status(404).json({ success: false, error: 'Branch not found' });
        res.json({ success: true, data: branch });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /api/branches/:id
router.delete('/:id', async (req, res) => {
    try {
        const userCount = await User.countDocuments({ branch: req.params.id });
        if (userCount > 0)
            return res.status(400).json({ success: false, error: `Cannot delete — ${userCount} user(s) still assigned to this branch.` });
        const branch = await Branch.findByIdAndDelete(req.params.id);
        if (!branch) return res.status(404).json({ success: false, error: 'Branch not found' });
        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
