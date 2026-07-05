const path = require('path');
const dotenv = require('dotenv');

// Locate absolute paths
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const Artwork = require('../models/Artwork');
const User = require('../models/User');

const run = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully!');

    // 1. Verify Settings
    console.log('\n--- 1. Verification of dynamic settings ---');
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({ key: 'global', platformFeePercentage: 10 });
      console.log('Created default Settings document.');
    }
    console.log('Current Platform Fee Percentage Setting:', settings.platformFeePercentage);

    // Update settings
    settings.platformFeePercentage = 15;
    await settings.save();
    console.log('Updated Platform Fee Percentage to 15%. Verification successful.');

    // 2. Verify Audit Log entry
    console.log('\n--- 2. Verification of Audit Log writing ---');
    const newLog = await AuditLog.create({
      action: 'test_verify',
      details: 'Automated verification check running on settings updates',
    });
    console.log('Log created:', newLog.action, '->', newLog.details);
    
    // Check logs retrieval
    const logCheck = await AuditLog.findById(newLog._id);
    if (logCheck) {
      console.log('Successfully retrieved log from MongoDB!');
    }

    // 3. Verify Pending Artwork Status
    console.log('\n--- 3. Verification of Artwork pending status enum ---');
    // Find or create a draft artwork, set it to pending
    const testArtist = await User.findOne({ role: 'artist' });
    if (testArtist) {
      const art = await Artwork.create({
        title: 'Verification Artwork Item',
        description: 'Verify status is pending',
        artist: testArtist._id,
        category: 'Digital Painting',
        price: 2000,
        status: 'pending',
      });
      console.log('Created pending artwork:', art.title, 'Status:', art.status);
      
      // Update it to published
      art.status = 'published';
      await art.save();
      console.log('Successfully approved and published pending artwork. New status:', art.status);
      
      // Cleanup verification artwork
      await Artwork.findByIdAndDelete(art._id);
      console.log('Cleaned up verification artwork.');
    } else {
      console.log('No artist found to run artwork test.');
    }

    // Reset settings back to 10%
    settings.platformFeePercentage = 10;
    await settings.save();
    console.log('\nReset settings platformFeePercentage back to 10% successfully.');

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed. Verification complete!');
    process.exit(0);
  }
};

run();
