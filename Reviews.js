var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
require('dotenv').config();

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("Connected to reviews"));
}catch (error) {
    console.log("Could not connect");
}

var ReviewSchema = new Schema({
    title: {type: String, required: true},
    user: {type: String, required: true},
    quote: {type: String, required: true},
    rating: {type: Number, min:1, max:5, required: true}
});

ReviewSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Reviews', ReviewSchema);