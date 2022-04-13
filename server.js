/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews')
require("dotenv").config();
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

// '/signup' methods

router.route('/signup')
    .post(function(req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please include name, username, and password to signup.'})
        } else {
            var user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;

            user.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A user with that username already exists.'});
                    else
                        return res.json(err);
                }

                res.json({success: true, msg: 'Successfully created new user.'})
            });
        }
    })
    .get(function(req, res){
        res.json({success: false, msg: 'Does not support the GET method.'});
    })
    .put(function(req, res){
        res.json({success: false, msg: 'Does not support the PUT method.'});
    })
    .delete(function(req, res){
        res.json({success: false, msg: 'Does not support the DELETE method.'});
    })
    .patch(function(req, res){
        res.json({success: false, msg: 'Does not support the PATCH method.'});
    })

// '/signin' methods
router.route('/signin')
    .post(function (req, res) {
        var userNew = new User();
        userNew.username = req.body.username;
        userNew.password = req.body.password;

        if(!req.body.username || !req.body.password){
        return res.json({success: false, msg: "Please include a username and password."});
        }
        
        User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
            
            if(user == null){
                return res.json({success: false, msg: 'Authetnication failed.'});
            }
            user.comparePassword(userNew.password, function(isMatch) {
                if (isMatch) {
                    var userToken = { id: user.id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json ({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, msg: 'Authentication failed.'});
                }
            })
        })
    })
    .get( function(req, res){
        res.json({success: false, msg: 'Does not support the GET method.'});
    })
    .put(function(req, res){
        res.json({success: false, msg: 'Does not support the PUT method.'});
    })
    .delete(function(req, res){
        res.json({success: false, msg: 'Does not support the DELETE method.'});
    })
    .patch(function(req, res){
        res.json({success: false, msg: 'Does not support the PATCH method.'});
    })


// '/movies' methods
router.route('/movies')
    .post(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body.title || !req.body.actors) {
            res.json({success: false, msg: 'Please include title and actors.'})
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
        
            movie.save(function(err){
                res.json({success: true, msg: 'Successfully added movie.'})
            });
        }
    })
    .get(authJwtController.isAuthenticated, function(req, res) {
        
        if(!req.body.title){
            Movie.find({}, function(err,movies){
                if(err) throw err;
                console.log(movies);
                res.json({success: true, query: movies});
            });
        }
        else{
            if(req.body.reviews==='true'){
                var req_reviews;
                Review.find({title: req.body.title}, function(err, reviews){
                    req_reviews = reviews;
                })
                Movie.findOne({title: req.body.title}, function(err, movie){
                    res.json({sucess: true, movie: movie, reviews: req_reviews})
                })
            }
            else{
                Movie.findOne({title: req.body.title}, function(err, movie){
                    res.json({success: true, query: movie, reviews: req.body.reviews});
                });
            }
        }
    })
    .delete(authJwtController.isAuthenticated, function(req, res) {
        var id;
        Movie.findOne({title: req.body.title}, function(err, movie){
            if(movie == null){
                res.json({success: false, msg:"No movie with that title in database.", query: movie});
            }
            else{
                Movie.deleteOne({title: movie.title}, function(result){
                    res.json({success: true, msg: "Movie deleted", _id: movie._id})
                });
            }
        })
    })
    .put(authJwtController.isAuthenticated, function(req, res){
        if (!req.body.title || !req.body.actors) {
            res.json({success: false, msg: 'Please include title and actors'})
        } 
        else {
            var update = {
                title: req.body.title,
                year: req.body.year,
                genre: req.body.genre, 
                actors: req.body.actors
        
            };
            Movie.findOneAndUpdate({title: req.body.title}, update, function(err, movie){
                if(err) throw err;
                res.json({success: true, msg: "Movie updated", query: movie})
            })
        }
    })
    .patch(authJwtController.isAuthenticated, function(req, res) {
        res.json({msg: "Does not support the 'PATCH' method"});
    });


// '/reviews' methods
router.route('/reviews')
    .post(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body.title || !req.body.quote || !req.body.rating) {
            res.json({success: false, msg: 'Please fill out all of the forms'})
        }
        if(req.body.rating > 5 || req.body.rating < 1){
            res.json({success: false, msg: "Enter a rating between 1 and 5"})
        }
        else{
            Movie.findOne({title: req.body.title}, function(err, movie){
                if(movie == null){
                    res.json({success: false, msg:"No movie with that title in database.", query: movie});
                }
                else{
                    var review = new Review();
                
                    //authJwtController.passport
                    review.user = req.headers.authorization.split(" ")[1].split('.')[0]
                    review.title = req.body.title
                    review.quote = req.body.quote
                    review.rating = req.body.rating
                    review.save(function(err){
                        res.json({success: true, msg: 'Successfully added review.'})
                    });
                }
            })      
        }
    })
    .get(authJwtController.isAuthenticated, function(req, res) {
        // Get all reviews from a specific user
        var req_user = req.headers.authorization.split(" ")[1].split('.')[0]
        Review.find({user: req_user}, function(err, reviews){
            res.json({success: true, query: reviews})
        })
    })
    .delete(authJwtController.isAuthenticated, function(req, res) {
        res.json({msg: "Does not support the 'DELETE' method"});
        
    })
    .put(authJwtController.isAuthenticated, function(req, res){
        res.json({msg: "Does not support the 'PUT' method"});
    })
    .patch(authJwtController.isAuthenticated, function(req, res) {
        res.json({msg: "Does not support the 'PATCH' method"});
    });
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


