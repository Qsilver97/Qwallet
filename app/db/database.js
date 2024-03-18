const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const isPackaged = typeof process.pkg !== 'undefined';
const basePath = isPackaged ? path.dirname(process.execPath) : __dirname;
const dbPath = path.resolve(basePath, 'sqlite.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
    )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

module.exports = db;
