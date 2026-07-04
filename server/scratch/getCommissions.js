const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Commission = require('../models/Commission');

const run = async () => {
  await connectDB();
  const commissions = await Commission.find();
  
  for (let c of commissions) {
    let modified = false;
    for (let r of c.replies) {
      const originalLength = r.attachments.length;
      r.attachments = r.attachments.filter(att => att.url);
      if (r.attachments.length !== originalLength) {
        modified = true;
      }
    }
    if (modified) {
      await c.save();
      console.log(`Cleaned up empty attachments for commission ID: ${c._id}`);
    }
  }
  
  console.log('Database clean-up finished successfully!');
  process.exit(0);
};

run();
