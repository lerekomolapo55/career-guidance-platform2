// config/firebase.js
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
try {
  // Use the exact service account key you provided
  const serviceAccount = {
    "type": "service_account",
    "project_id": "career-guidance-platform-4d56c",
    "private_key_id": "7170d9602694159f6b2e3e52366f4926f57898c9", // Fixed: using your actual private_key_id
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9U77DV+j0688Y\n0Zxs4Ph9FtJWpIFk8Px4n6+YVSAx50HUVqrfxlgMJ41YzogfhOGYuiqcfBfpVLgl\ntq7YC78wXCJEn6WZuxMrTLMOFtavJ0XqPcARSMQnGSbuVIAWiMfSebrBDxbb0Vig\nPIwFPMdUGFNVehe2pY0MX1qvKeF2T1aFjsndgf+4P359bgzMmWsULBJxnK2Eoxxb\nol00Qff5yctZKNFaRaiLJh9JZJB7fegGISGsjsXcvtfnjhYYDPNQd/vFQnSxc5fJ\n8lBszYbFgld0fSDniGdnGZsUR1X7sxJpta3u1sy0ihMU/RAqAOTpW5WjRnqKhVbN\nzcjh2EYZAgMBAAECggEAEPs/N8m9iyRQe8cnSuvF1gBzRtK0CXAFETOvfhAalmdJ\n9Af/BRnHAXYVu0KxGnSigH6oPkdyJJtU9gsD9TxefnGxICsaoSaSslZLlCavxF+X\nKYq23MYEVAZxQ7zADWVg2OvSuKjIEdjd5Gdx3rFkJpKU/Ox5zofcViECYwY0YxZU\npR+Ygr/uH7v4MCN5F93AFVyMwM2P2UP4tinpihl5tFolAr0H9ME2jrQq2mAJS3TT\nUPavKApaKxGqkgf+4lm9Ndyv5mqa4jtXl/vxPnkqS8lmB3KHIpz22G2e/xuRXMbq\ntOAATEeyJWgkrEBM8tFR+zSatOpr1gyFGnsWxg6TgQKBgQDkTz2SKjJu84aIoZOI\nu2MkT8rJWOfIirbnK05m5junWpHpy0qCVmIByTvAcL5iQY4bpENs7kAilY0MjQqQ\nh9nbD3rb9Bvk14UzkjEZHZaKQCLgKVCsX/JFnkQF0znMgQaUz6y+6ap83ekTOySM\nwnBoBfjRvIGc9X3VvApHvjYs2QKBgQDUSiTbDcGx3AzwlaHpff8tL/GS5icWepFD\nwunEPjysoS9DmiBB2bxrsibAKGJBoNoWZ8RgUnRMvzc11iaAdrTUIvytZ9h5UjJW\ncRDDAwcBAj7BvSR7XGQa86gb272zGSySsGvwG4wgO72Cs+HCUZ08LqBRDufvNeDF\nNv2qcLwbQQKBgQCfsCkBphAWeLDduh3mIiMrD8Bn6o5cP2HE+Q5ifKC24mtymmVo\nGqF8XFM1u+X99Zo/DTq340Dqr62zXKdKBitDxGULmYc1HeWl95ft2DsmQcvi/CLY\nHlfnh9ZOOLqRpqGCzmsmMWu04MYYVGKxLYLPz3WExZPmw/Ka32ZVXd6oqQKBgQDM\ndrDyrlg9RvTLj0LH0YvBaOjiFHvXQavBuOxQD6V+mywbj0m8QssgaxC5iOvBy/vh\nEoZoQ2IyPQUe/ChPGIXnv97f4SH1D77d1L5RJQxM422wSczmZ8Ee2Ei0tDsMUZXF\nntgHBXE75m4LgddRwiuPuFS+XX3zvk/DgshkrXnvQQKBgECNbQ72gGYnF0xJJlx9\nuyoJqR4Mwxp6A6aS+rjgMd7P/VKOWykkYPf27bBjeDK1hQSWPGKSzng/9YLZd52Q\ncmE0iKAksTXodltH2V2zDcU4cuwLRA9whf6Z7YiyXhElLFTLFiT7R2lHwKTVJxLm\nH99Epl0Ylv19mbflpfY6+OSZ\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@career-guidance-platform-4d56c.iam.gserviceaccount.com",
    "client_id": "104438790797971229165",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40career-guidance-platform-4d56c.iam.gserviceaccount.com"
  };

  // Check if Firebase app is already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://career-guidance-platform-4d56c-default-rtdb.firebaseio.com"
    });
  }

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  
  // Fallback: Try environment variables if direct key fails
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://career-guidance-platform-4d56c-default-rtdb.firebaseio.com"
      });
    }
    console.log('✅ Firebase initialized with application default credentials');
  } catch (fallbackError) {
    console.error('❌ Firebase fallback initialization failed:', fallbackError.message);
    console.log('⚠️  Starting server without Firebase...');
  }
}

const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };