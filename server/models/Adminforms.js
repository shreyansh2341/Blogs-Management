const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FormSchema = new Schema({
    username: {  type: [String, Number],
        required: true,
    unique: true},

    password:{ type: String, Number,
         required: true},
})

module.exports = mongoose.model('Adminform', FormSchema);