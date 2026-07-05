const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseAdmin = null;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = require(resolvedPath);
      firebaseAdmin = admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully using service account JSON.');
    } else {
      console.warn(`Firebase Admin SDK Warning: Service account file not found at ${resolvedPath}`);
    }
  } else if (process.env.FIREBASE_PROJECT_ID) {
    firebaseAdmin = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('Firebase Admin initialized using Project ID only (default credentials).');
  } else {
    console.warn('Firebase Admin SDK Warning: Missing FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID.');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error.message);
}

module.exports = firebaseAdmin;
