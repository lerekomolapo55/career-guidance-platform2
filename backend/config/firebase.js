const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin using environment variables (for Render deployment)
try {
  const serviceAccount = {
    type: "service_account",
    project_id: "career-guidance-platform-4d56c",
    private_key_id: "4cc1e0d6d20976f75c68defc9ff3828af7dbf459",
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
    client_email: "firebase-adminsdk-fbsvc@career-guidance-platform-4d56c.iam.gserviceaccount.com",
    client_id: "104438790797971229165",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40career-guidance-platform-4d56c.iam.gserviceaccount.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://career-guidance-platform-4d56c-default-rtdb.firebaseio.com"
  });

  console.log('✅ Firebase initialized successfully with environment variables');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('⚠️  Starting server without Firebase...');
}

const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };
