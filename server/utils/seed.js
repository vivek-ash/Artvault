const dotenv = require('dotenv');
const path = require('path');

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@artvault.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Aria Chen',
    email: 'artist1@artvault.com',
    password: 'Artist@123',
    role: 'artist',
    bio: 'Digital painter specializing in ethereal landscapes and surreal portraits.',
    isVerifiedArtist: true,
  },
  {
    name: 'Marcus Rivera',
    email: 'artist2@artvault.com',
    password: 'Artist@123',
    role: 'artist',
    bio: '3D artist and sculptor creating mesmerizing abstract digital forms.',
    isVerifiedArtist: true,
  },
  {
    name: 'Sarah Mitchell',
    email: 'buyer1@artvault.com',
    password: 'Buyer@123',
    role: 'buyer',
  },
  {
    name: 'David Park',
    email: 'buyer2@artvault.com',
    password: 'Buyer@123',
    role: 'buyer',
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Check for --fresh flag to delete existing users
    const freshSeed = process.argv.includes('--fresh');

    if (freshSeed) {
      console.log('🗑️  Clearing existing users...');
      await User.deleteMany({});
      console.log('✅ All existing users deleted.\n');
    }

    console.log('🌱 Seeding users...\n');

    for (const userData of seedUsers) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User already exists: ${userData.email} (skipping)`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Created ${user.role.padEnd(6)} → ${user.name} (${user.email})`);
      console.log(`   Password: ${userData.password}`);
      console.log('');
    }

    console.log('─'.repeat(50));
    console.log('🎉 Seed completed successfully!');
    console.log('─'.repeat(50));
    console.log('\nTest Credentials:');
    console.log('─'.repeat(50));
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(6)} | ${u.email.padEnd(25)} | ${u.password}`);
    });
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedDB();
