const User = require('../models/userModel');

exports.listUsers = (req, res) => {
    User.findAll((err, users) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(200).json(users);
    });
};

exports.createUser = (req, res) => {
    User.create(req.body.name, req.body.email, (err, user) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(201).json(user);
    });
};
