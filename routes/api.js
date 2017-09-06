const express = require('express');
const jwTokens = require('jsonwebtoken');

const routes = function(User) {
    const router = express.Router();
    const secret = 'hajduk1910';

    router.post('/authenticate', function (req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({success: false, message: 'Authentication failed. User not found.'});
            } else if (user) {

                if (user.password !== req.body.password) {
                    res.json({success: false, message: 'Authentication failed. Wrong password.'});
                } else {

                    var token = jwTokens.sign(user, secret, {
                        expiresIn: "6h"
                    });

                    res.json({
                        success: true,
                        token: token
                    });
                }

            }

        });
    });

    router.use('/api', function (req, res, next) {

        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        if (token) {

            jwTokens.verify(token, secret, function (err, decoded) {
                if (err) {
                    return res.json({success: false, message: 'Failed to authenticate token.'});
                } else {
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });

    return router;
};

module.exports = routes;
