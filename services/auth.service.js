const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

function getUserModelByRole(role) {
  const normalizedRole = String(role || 'PARTICIPANT').toUpperCase();
  return normalizedRole === 'ADMIN' ? require('../models/admin').User : require('../models/participant').User;
}

async function registerUser({ name, email, password, role = 'PARTICIPANT' }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const UserModel = getUserModelByRole(role);

  const existingUser = await User.findOne({ email: normalizedEmail, role });
  if (existingUser) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    },
    token: jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
  };
}

async function loginUser({ email, password, role }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const selectedRole = role ? String(role).toUpperCase() : 'PARTICIPANT';
  const user = await User.findOne({ email: normalizedEmail, role: selectedRole });

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (role && String(role).toUpperCase() !== String(user.role).toUpperCase()) {
    const err = new Error('Selected role does not match this account');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    },
    token: jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
  };
}

module.exports = { registerUser, loginUser };
