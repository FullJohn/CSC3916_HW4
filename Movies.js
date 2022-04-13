var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
require('dotenv').config();
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected to movies"));
}catch (error) {
    console.log("could not connect");
}

var MovieSchema = new Schema({
    title: {type: String, required: true, index: {unique: true }},
    year: {type: String},
    genre: {type: String},
    actors: {type: [{name: {type: String, required: true},
        characterName: {type: String, required: true},}], required: true},
})

MovieSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Movies', MovieSchema);