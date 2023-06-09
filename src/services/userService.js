import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import bcrypt from 'bcrypt';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null }
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function getByEmail(email) {
  return User.findOne({
    where: { email: email }
  });
}

async function register({ email, password }) {
  const existingUser = await getByEmail(email);

  const hash = await bcrypt.hash(password, 10);

  if (existingUser) {
    throw ApiError.BadRequest('Email already exists', {
      email: 'Email is already exists'
    });
  }
  const activationToken = uuidv4();
  const newUser = await User.create({ email, password: hash, activationToken });

  await emailService.sendActivationLink(email, activationToken);
}

export const userService = { getAllActive, normalize, getByEmail, register };
