const User = require('../models/User');
const { hashPassword } = require('../utils/auth');
const createError = require('http-errors');

async function createUser(input) {
  const exists = await User.findOne({ email: input.email });
  if (exists) throw createError(409, 'Email already registered');
  const hashed = await hashPassword(input.password);
  const user = await User.create({ ...input, password: hashed });
  return user;
}

async function listUsers() {
  return User.find().limit(100).sort({ createdAt: -1 });
}

async function updateUser(userId, input) {
  const allowed = ['name', 'email', 'phone', 'bio', 'avatar'];
  const update = {};
  for (const key of allowed) if (key in input) update[key] = input[key];
  if (update.email) {
    const exists = await User.findOne({ email: update.email, _id: { $ne: userId } });
    if (exists) throw createError(409, 'Email already registered');
  }
  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw createError(404, 'User not found');
  return user;
}

module.exports = { createUser, listUsers, updateUser };


