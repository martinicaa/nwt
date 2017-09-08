const express = require('express');
const multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/posts');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

const upload = multer({ storage: storage });

const routes = function(Post, Comment, User) {
    const router = express.Router();

    router.post('/', upload.single('postImage'), function(req, res, next){
        if (req.file){
            req.body.image = req.file.path;
        }
        next();
    });

    router.route('/')
        .get(function(req, res){
            const query = {};
            if (req.query.owner) query.owner = req.query.owner;
            if (req.query.date) query.owner = req.query.date;

            Post.find(query, function(error, posts){
                if (error) {
                    res.status(500).send({ success: false, message: error });
                } else if(posts.length === 0) {
                    res.status(404).send({ success: false, message: 'No posts found.' });
                } else {
                    res.json({success: true, data: posts});
                }
            })
        })
        .post(function(req,res){
            const post = new Post(req.body);
            post.save(function(error){
                if (error) {
                    res.status(500).send({ success: false, message: error });
                } else {
                    res.json({success: true, data: post});
                }
            });
        });

    router.use('/:postId', function(req, res, next) {
        Post.findById(req.params.postId)
            .populate('owner')
            .populate('comments')
            .populate('likes')
            .exec(function(error, post){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else if(post) {
                    req.post = post;
                    next();
                } else {
                    res.status(404).json({ success: false, message: 'No post found' });
                }
            })
    });

    router.route('/:postId')
        .get(function(req, res){
            res.json({success: true, data: req.post});
        })
        .post(function(req, res){
            req.post.title = (req.body.title) ? req.body.title : req.post.title;
            req.post.text = (req.body.text) ? req.body.text : req.post.text;

            req.post.save(function(error) {
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else {
                    res.json({success: true, data: req.post});
                }
            })
        });

    router.route('/:postId/like')
        .get(function(req, res){
            res.json({success: true, data: req.post.likes});
        })
        .post(function(req, res){
            User.findById(req.body.userId, function(error, user){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                }
                else if (user) {
                    req.post.likes.push(user);
                    req.post.save(function(error){
                        if (error) {
                            res.status(500).json({ success: false, message: error });
                        } else {
                            res.json({success: true, data: req.post});
                        }
                    });
                } else {
                    res.status(404).json({ success: false, message: 'User not found' });
                }
            })
        });

    router.route('/:postId/comments')
        .get(function(req, res){
            res.json({success: true, data:req.post.comments});
        })
        .post(function(req, res){
            req.body.post = req.post._id;
            const comment = new Comment(req.body);
            comment.save(function(error){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else {
                    req.post.comments.push(comment);
                    req.post.save(function(error){
                        if (error) {
                            comment.remove();
                            res.status(500).json({ success: false, message: error });
                        } else {
                            res.json({success: true, data: req.post});
                        }
                    });
                }
            })
        });

    router.route('/:postId/comments/:commentId')
        .get(function(req, res){
            res.json({success: true, data: req.post.comments});
        })
        .post(function(req, res){
            Comment.findById(req.params.commentId, function(error, comment){
                if (error) {
                    res.status(500).json({ success: false, message: error });
                } else {
                    comment.text = req.body.text;
                    comment.save(function(error){
                        if (error) {
                            res.status(500).json({ success: false, message: error });
                        } else {
                            res.json({success: true, data: comment});
                        }
                    });
                }
            })
        });

    return router;
};

module.exports = routes;
