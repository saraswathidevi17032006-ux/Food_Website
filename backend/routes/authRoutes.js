import express from 'express';
import { isValidEmail } from '../utils/validation.js';
import { hashPassword, signToken, verifyPassword, getOptionalAuthUserId } from '../utils/auth.js';
import { createUser, findUserByEmail, findUserById } from '../utils/store.js';

const router = express.Router();

const sanitizeUser = (user) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in name, email, and password');
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const user = await createUser({
      name,
      email,
      password: hashPassword(password),
    });

    const publicUser = sanitizeUser(user);
    const token = signToken({ sub: publicUser._id, email: publicUser.email });
    res.status(201).json({ user: publicUser, token });
  } catch (error) {
    next(error);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password');
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const publicUser = sanitizeUser(user);
    const token = signToken({ sub: publicUser._id, email: publicUser.email });
    res.json({ user: publicUser, token });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res, next) => {
  try {
    const userId = getOptionalAuthUserId(req);
    if (!userId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
});

export default router;
