const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();
  const email = 'buyer1@artvault.com';
  const password = 'Buyer@123';
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.email);
    const isMatch = await user.matchPassword(password);
    console.log('Password matches?', isMatch);
  }
  process.exit(0);
};

run();
