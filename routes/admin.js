const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const router = express.Router();

function adminAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token');
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    if (req.user.role !== 'admin') return res.status(403).send('Not authorized');
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

router.get('/users', adminAuth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/posts', adminAuth, async (req, res) => {
  const posts = await Post.find().populate('author');
  res.json(posts);
});

router.delete('/posts/:id', adminAuth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.send('Post deleted');
});

// Promote a user to admin
router.post('/users/:id/promote', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role: 'admin' } }, { new: true });
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Demote an admin to regular user
router.post('/users/:id/demote', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role: 'user' } }, { new: true });
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
