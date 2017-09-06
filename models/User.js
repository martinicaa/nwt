const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        firstName: { type: String, trim: true, required: true },
        lastName: { type: String, trim: true, required: true },
        email: { type: String, required: true, trim: true },
        phone: String,
        gender: String,
        followers: [{ type: ObjectId, ref: 'User' }],
        posts: [{ type: ObjectId, ref: 'Post' }],
        following: [{ type: ObjectId, ref: 'User' }],
        profilePicture: { type: String, required: false, trim: true }
});

module.exports = mongoose.model('User', userSchema, 'Users');
