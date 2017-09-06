const express = require('express');
const multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/profile');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

const upload = multer({ storage: storage });

const routes = function (User) {
    const router = express.Router();

    router.post('/', upload.single('profilePicture'), function(req, res, next){
        req.body.profilePicture = req.file.path();
        next();
    });

    router.route('/')
        .get(function(req, res){
            const query = {};

            if (req.query.username) query.username = req.query.username;
            User.find(query, function(error, users){
                if (error) {
                    res.status(500).send({ success: false, message: error });
                } else if(users.length === 0) {
                    res.status(404).send({ success: false, message: 'No users found.' });
                } else {
                    res.json({ success: true, data: users});
                }
            })
        })
        .post(function(req, res){
            const user = new User(req.body); // TODO hash passwords
            user.save(function(error){
                if (error) {
                    res.status(500).send({ success: false, message: error });
                } else {
                    res.json({success: true, data: user});
                }
            });
        });

    router.use('/:userId', function(req, res, next) {
        User.findById(req.params.userId)
            .populate('posts')
            .populate('following')
            .populate('followers')
            .exec(function(error, user){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else if(user) {
                    req.user = user;
                    next();
                } else {
                    res.status(404).json({ success: false, message: 'No user found' });
                }
            });
    });

    router.route('/:userId')
        .get(function(req, res){
            res.json(req.user);
        })
        .post(function(req,res) {
            req.user.firstName = (req.body.firstName) ? req.body.firstName : req.user.firstName;
            req.user.lastName = (req.body.lastName) ? req.body.lastName : req.user.lastName;
            req.user.email = (req.body.email) ? req.body.email : req.user.email;
            req.user.phone = (req.body.phone) ? req.body.phone : req.user.phone;
            req.user.gender = (req.body.gender) ? req.body.gender : req.user.gender;
            req.user.profilePicture = (req.body.profilePicture) ? req.body.profilePicture : req.user.profilePicture;

            req.user.save(function(error) {
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else {
                    res.json({success: true, data: req.user});
                }
            })
        });

    router.route('/:userId/followers')
        .get(function(req, res){
            res.json({success: true, data: req.user.followers});
        });

    router.route('/:userId/following')
        .get(function(req, res){
            res.json({success: true, data: req.user.following});
        });

    router.route('/:userId/follow')
        .post(function(req, res){
            User.findById(req.body.followerId, function(error, user){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else if(user) {
                    req.user.followers.push(user);
                    req.user.save(function(error) {
                        if (error) {
                            res.status(500).json({ success: false, message: error });
                        }
                    });

                    user.following.push(req.user);
                    user.save(function(error) {
                        if (error) {
                            res.status(500).json({ success: false, message: error });
                        } else {
                            res.json({ success: true });
                        }
                    });
                } else {
                    res.status(404).json({ success: false, message: 'User follower not found' });
                }
            })
        });


    return router;
};


module.exports = routes;

