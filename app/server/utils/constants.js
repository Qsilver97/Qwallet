require('dotenv').config();

// Use the PORT from .env, with a fallback to 3000 if not found
const PORT = process.env.PORT || 3000;

exports.PORT = PORT
