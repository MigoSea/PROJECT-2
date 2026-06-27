const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const router = express.Router();

function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token');
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

router.post('/', auth, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).send('Missing fields');
    const post = new Post({ title, body, author: req.user.id });
    await post.save();
    res.send('Post saved');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.json(posts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
