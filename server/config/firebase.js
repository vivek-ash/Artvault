const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseAdmin = null;

try {
  // If service account JSON is provided as a string in environment variables (Standard Cloud Deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      firebaseAdmin = admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully using FIREBASE_SERVICE_ACCOUNT_JSON environment string.');
    } catch (err) {
      console.error('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env string:', err.message);
    }
  } 
  // Fallback: check for service account file path
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = require(resolvedPath);
      firebaseAdmin = admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully using service account JSON file.');
    } else {
      console.warn(`Firebase Admin SDK Warning: Service account file not found at ${resolvedPath}`);
    }
  } 
  // Fallback: check for project ID only
  else if (process.env.FIREBASE_PROJECT_ID) {
    firebaseAdmin = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('Firebase Admin initialized using Project ID only.');
  } 
  // Direct default initialization attempt
  else {
    // If we are in a Firebase environment, try default initialization
    firebaseAdmin = admin.initializeApp();
    console.log('Firebase Admin initialized using default credentials.');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization warning:', error.message);
}

module.exports = firebaseAdmin;
