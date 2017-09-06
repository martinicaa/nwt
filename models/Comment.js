const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const commentSchema = new Schema({
    post: { type: ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    user: { type: ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Comment', commentSchema);
