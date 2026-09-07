const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { apiResponse } = require('../utils/apiResponse');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const authSessions = new Map();
const rateLimitStore = new Map();

function sanitizeInput(value) {
  if (value === null || value === undefined) return '';

  const normalized = typeof value === 'string' ? value : String(value);
  const withoutHtml = normalized
    .trim()
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');

  return withoutHtml.replace(/\s+/g, ' ').trim();
}

function validateLoginInput(email, password) {
  const trimmedEmail = sanitizeInput(email).toLowerCase();

  if (!trimmedEmail || !password || typeof password !== 'string') {
    throw new Error('Email and password are required');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    throw new Error('Please provide a valid email address');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  return {
    email: trimmedEmail,
    password,
  };
}

async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password is required');
  }

  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, hashedPassword);
}

async function findUserByCredential(usernameOrEmail, userModel = User) {
  if (!usernameOrEmail) {
    return null;
  }

  const normalizedValue = sanitizeInput(usernameOrEmail).toLowerCase();
  if (!normalizedValue) {
    return null;
  }

  const targetModel = userModel || User;
  const candidateQueries = [
    { email: normalizedValue },
    { username: normalizedValue },
    { name: normalizedValue },
    {
      $or: [
        { email: normalizedValue },
        { username: normalizedValue },
        { name: normalizedValue },
      ],
    },
  ];

  for (const query of candidateQueries) {
    const result = await targetModel.findOne(query);
    if (result) {
      return result;
    }
  }

  return null;
}

async function verifyCredentials(inputUser = {}, inputPassword, userModel = User) {
  const emailOrUsername = inputUser.email || inputUser.username || inputUser.name;

  if (!emailOrUsername || !inputPassword) {
    return { user: null, error: 'Invalid credentials' };
  }

  const user = await findUserByCredential(emailOrUsername, userModel);
  if (!user) {
    return { user: null, error: 'Invalid credentials' };
  }

  const isValid = await verifyPassword(inputPassword, user.passwordHash);
  if (!isValid) {
    return { user: null, error: 'Invalid credentials' };
  }

  return { user, error: null };
}

function parseExpiryToMs(expiry) {
  if (!expiry) return 7 * 24 * 60 * 60 * 1000;

  const match = String(expiry).match(/^([0-9]+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || multipliers.d);
}

function generateAuthToken(userID, payload = {}) {
  if (!userID) {
    throw new Error('A user identifier is required to generate an auth token');
  }

  const token = jwt.sign({ userId: String(userID), ...payload }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || '7d',
  });

  authSessions.set(token, {
    userId: String(userID),
    expiresAt: Date.now() + parseExpiryToMs(JWT_EXPIRES_IN || '7d'),
  });

  return token;
}

function setSessionCookie(res, token) {
  if (!res || typeof res.cookie !== 'function') return null;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseExpiryToMs(JWT_EXPIRES_IN || '7d'),
  });

  return token;
}

function revokeSession(userIDOrSessionID, res) {
  if (userIDOrSessionID) {
    for (const [token, session] of authSessions.entries()) {
      if (session.userId === String(userIDOrSessionID) || token === String(userIDOrSessionID)) {
        authSessions.delete(token);
      }
    }
  }

  if (res && typeof res.clearCookie === 'function') {
    res.clearCookie('token');
  }

  return true;
}

async function verifySessionMiddleware(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token || null;
    const tokenFromHeader = authorizationHeader && authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.replace('Bearer ', '').trim()
      : null;
    const token = tokenFromHeader || cookieToken;

    if (!token) {
      const err = new Error('Authentication token missing or invalid');
      err.statusCode = 401;
      return next(err);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const session = authSessions.get(token);

    if (session && session.expiresAt < Date.now()) {
      revokeSession(token);
      const err = new Error('Session expired');
      err.statusCode = 401;
      return next(err);
    }

    req.user = decoded;
    req.session = session || { userId: decoded.userId };
    return next();
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    return next(err);
  }
}

function rateLimiterMiddleware(identifier = 'default') {
  return (req, res, next) => {
    const key = String(identifier || req.ip || req.headers['x-forwarded-for'] || 'unknown');
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = 5;
    const record = rateLimitStore.get(key) || { attempts: 0, firstAttempt: now, lockedUntil: 0 };

    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
      return res.status(429).json(apiResponse(false, null, `Too many login attempts. Please try again in ${retryAfter}s.`));
    }

    if (record.firstAttempt + windowMs < now) {
      record.attempts = 0;
      record.firstAttempt = now;
      record.lockedUntil = 0;
    }

    record.attempts += 1;

    if (record.attempts >= maxAttempts) {
      record.lockedUntil = now + windowMs;
      rateLimitStore.set(key, record);
      return res.status(429).json(apiResponse(false, null, 'Too many login attempts. Account temporarily locked.'));
    }

    rateLimitStore.set(key, record);
    req.rateLimitKey = key;
    return next();
  };
}

function lockAccount(userID, lockoutDuration = 15 * 60 * 1000) {
  const key = String(userID || 'anonymous');
  const record = rateLimitStore.get(key) || { attempts: 0, firstAttempt: Date.now(), lockedUntil: 0 };
  record.lockedUntil = Date.now() + lockoutDuration;
  record.attempts = Math.max(record.attempts, 5);
  rateLimitStore.set(key, record);
  return true;
}

function logAuthEvent(userID, eventType, IP = 'unknown') {
  const entry = {
    userId: userID || null,
    eventType,
    ipAddress: IP,
    timestamp: new Date().toISOString(),
  };

  console.log('[AUTH_EVENT]', JSON.stringify(entry));
  return entry;
}

function authSecurity() {
  return {
    sanitizeInput,
    validateLoginInput,
    hashPassword,
    verifyPassword,
    findUserByCredential,
    verifyCredentials,
    generateAuthToken,
    setSessionCookie,
    verifySessionMiddleware,
    revokeSession,
    rateLimiterMiddleware,
    lockAccount,
    logAuthEvent,
  };
}

module.exports = Object.assign(authSecurity, authSecurity());
module.exports.default = authSecurity;
