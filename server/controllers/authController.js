const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const sign = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.signup = [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { username, email, password } = req.body;
    try {
      if (await User.findOne({ $or: [{ email }, { username }] }))
        return res.status(400).json({ message: 'User already exists' });
      const user = await User.create({ username, email, password });
      res.status(201).json({ token: sign(user), user: { id: user._id, username, email } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

exports.login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: 'Invalid credentials' });
      res.json({ token: sign(user), user: { id: user._id, username: user.username, email } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
