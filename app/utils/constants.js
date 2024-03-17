require('dotenv').config();

// Use the PORT from .env, with a fallback to 3000 if not found
const PORT = process.env.PORT || 3000;
const TRANSACTION_URL = process.env.TRANSACTION_URL

exports.PORT = PORT
exports.TRANSACTION_URL = TRANSACTION_URL
