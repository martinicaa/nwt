const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const postSchema = new Schema({
    owner: { type: ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    text: String,
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    likes: [{
        type: ObjectId,
        ref: 'User',
        unique: true
    }],
    tags: [{ type: String }],
    image: { type: String }
});

module.exports = mongoose.model('Post', postSchema, 'Posts');
