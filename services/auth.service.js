const User = require('../models/User');
const authSecurity = require('./auth.security');
const {
  hashPassword,
  verifyPassword,
  validateLoginInput,
  findUserByCredential,
  generateAuthToken,
  sanitizeInput,
} = authSecurity;

function getUserModelByRole(role) {
  const normalizedRole = String(role || 'PARTICIPANT').toUpperCase();
  return normalizedRole === 'ADMIN' ? require('../models/admin').User : require('../models/participant').User;
}

async function registerUser({ name, email, password, role = 'PARTICIPANT' }) {
  const normalizedEmail = sanitizeInput(email).toLowerCase();
  const normalizedName = sanitizeInput(name);
  const selectedRole = String(role || 'PARTICIPANT').toUpperCase();
  const UserModel = getUserModelByRole(selectedRole);

  if (!normalizedName) {
    const err = new Error('Name is required');
    err.statusCode = 400;
    throw err;
  }

  validateLoginInput(normalizedEmail, password);

  const existingUser = await User.findOne({ email: normalizedEmail, role: selectedRole });
  if (existingUser) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: selectedRole,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    },
    token: generateAuthToken(user._id, { role: user.role }),
  };
}

async function loginUser({ email, password, role }) {
  const normalizedEmail = sanitizeInput(email).toLowerCase();
  const selectedRole = role ? String(role).toUpperCase() : 'PARTICIPANT';

  validateLoginInput(normalizedEmail, password);

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

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
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
    token: generateAuthToken(user._id, { role: user.role }),
  };
}

module.exports = { registerUser, loginUser, findUserByCredential, validateLoginInput, hashPassword, verifyPassword, generateAuthToken };
