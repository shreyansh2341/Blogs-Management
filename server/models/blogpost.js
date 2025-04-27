const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BlogSchema = new Schema({
    title: {  type: String,
        required: true},

    body:{ type: String,
         required: true},

    image: { type: String,
         required: false},

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('BlogPost', BlogSchema);