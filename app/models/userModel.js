const db = require('../db/database.js');

class User {
    static findAll(callback) {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, rows);
        });
    }

    static create(name, email, callback) {
        db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, { id: this.lastID, name, email });
        });
    }
}

module.exports = User;
