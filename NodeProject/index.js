var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');


const port = 3000;
require('dotenv').config();
const mongoose = require('mongoose');

let userModel = require('./userModel');
let tagModel = require('./tagModel');
let itemModel = require('./itemModel');

const corsOpt = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 
}

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOpt));

app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

const mg_user = process.env.MG_USER;
const mg_pwd = process.env.MG_PWD;
const mg_db = process.env.MG_DB;
const mongo_uri = `mongodb+srv://${mg_user}:${mg_pwd}@cluster0.iod5u.mongodb.net/${mg_db}?retryWrites=true&w=majority`;
mongoose.connect(mongo_uri, {useNewUrlParser: true})
.then(
    console.log("MongoDB is connected!")
);

// GET /profile/:id
// Display data on Profile Page.
// data: first name, last name, email, bio, profile img, tags (with names)
// example output: {"tag":[{"name":"postage stamps"}],"firstName":"Hello","lastName":"World","email":"hello.world@hotmail.com","bio":"A short one.","profileImg":"file/path"}

app.get('/profile/:id', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const userInfo = await userModel.findById(req.params.id)
                        .populate('tag')
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// POST /profile
// Create account.
// data needed: first name, last name, email, bio, profile img, tags (wishlist and friend is empty)
// NOTE: need to check if tag already exist before creating
// 1. seperate tags into individual entries
// 2. loop through them and check with names in tag collection
// 3. insert if not there
// 4. get object id reference of the tag in the tag collection
// 5. post the response to user collection

app.post('/profile', async(req, res) => {
    const user = new userModel(req.body);
    try{
        await user.save();
        console.log(user)
        res.send(user);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profile/:id
// Update (any fields) of the profile.
// data needed for update: user's id.
// data options: first name, last name, email, profile img, bio
// will pass back updated record

app.patch('/profile/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(`I AM GETTING THIS: ${JSON.stringify(req.body)}`);
    const userNewInfo = await userModel
                    .findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}).populate('tag');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// GET /friends/:id
// Display friends list on user's Find Friend Page
// NOTE: id is user's id, not friend's user id
// data: first name, last name, email, profile img
// example output: [{"firstName":"White","lastName":"Seahorse","email":"white.horse@hotmail.com","bio":"Another one","profileImg":"file/path"},{"firstName":"Green","lastName":"Parrot","email":"green.parrot@gmail.com","bio":"Hello, I am Green Parrot.","profileImg":"file/path/to/greenparrot.png"}]

app.get('/friends/:id', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const userInfo = await userModel.findById(req.params.id)
                        .populate('friend', '-_id -tag -wishlist -friend')
			.select('friend -_id');
    try{
        console.log(userInfo.friend);
        res.send(userInfo.friend);
    }catch(e){
        res.status(500).send(e);
    }
});

// GET /friend/:email
// Find friend based on email address
// data: first name, last name, email, profile img
// example output: {"firstName":"White","lastName":"Seahorse","email":"white.horse@hotmail.com","bio":"Another one","profileImg":"file/path"}

app.get('/friend/:email', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const userInfo = await userModel.findOne({email: req.params.email})
                        .select('-_id -friend -tag -wishlist').toObject();
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
}); 

// GET /allTags
// For performance and caching purposes.
// Possible use cases: 
// (1) check whether the tag is already in record before creating a new one. 
// (2) store all tags on client side so no need to call MongoDB frequently. 
// (3) autocomplete functionality for adding tags
// example output: {"tags":["postage stamps","tea blends"],"tagIds":["5f9724f98c008df2d8d1c23f","5fa59090aaed85d4bd6d611f"]}

app.get('/allTags', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const tagInfo = await tagModel.find({}, '-item');
    try{
        let tags = tagInfo.map(t => t.name);
        let tagIds = tagInfo.map(t => t._id);
        res.send({tags: tags, tagIds: tagIds});
    }catch(e){
        res.status(500).send(e);
    }
});

// POST /tag
// Create a tag document in tag collection.
// Use case: created when a user enters a new tag
// data needed: name (items will be empty)

app.post('/tag', async(req, res) => {
    const tag = new tagModel(req.body);
    try{
        await tag.save();
        res.send(tag._id);
    }catch(e){
        res.status(500).send(e);
    }
});




//////////////////////////////////////////////////////////

app.get('/getUserInfo', async(req, res) => {
    let user_id = '5f97245cd5ce43461a7a14fb';
    const userInfo = await userModel.findById(user_id)
                        .select('-tag -wishlist -friend -_id');
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

app.get('/getFriendInfo', async(req, res) => {
    let user_id = '5f97245cd5ce43461a7a14fb';
    const friendInfo = await userModel.findById(user_id)
                        .populate('friend', '-_id -tag -wishlist -friend')
                        .select('friend -_id');
    try{
        console.log(friendInfo.friend);
        res.send(friendInfo.friend);
    }catch(e){
        res.status(500).send(e);
    }
});


app.get('/getFriendsList/:user_id', async(req, res) => {
    console.log(req.params.user_id);
    const friendList = await userModel.findById(req.params.user_id);
    try{
        res.send(friendList.friend);
    }catch(e){
        res.status(500).send(e);
    }
});

app.get('/getFriend/:friend_id', async(req, res) => {
    console.log(req.params.friend_id);
    const user = await userModel.findById(req.params.friend_id);
    try{
        res.send(user);
    }catch(e){
        res.status(500).send(e);
    }
});

app.get('/getFriendsInfo/:user_id', async(req, res) => {
    console.log(req.params.user_id);
    const friendList = 
        await userModel.findById(req.params.user_id)
        .populate('friend', '-_id -tag -wishlist -friend')
        .select('-tag -wishlist -_id');
    try{
        console.log('calling mongodb');
        console.log(friendList.friend);
        res.send(friendList);
    }catch(e){
        res.status(500).send(e);
    }
});

app.get('/getTagsInfo/:user_id', async(req, res) => {
    console.log(req.params.user_id);
    const tagList = 
        await userModel.findById(req.params.user_id)
        .populate('tag', 'name -_id')
        .select('-friend -wishlist');
    try{
        console.log('calling mongodb');
        console.log(tagList);
        res.send(tagList);
    }catch(e){
        res.status(500).send(e);
    }
});

app.get('/getItemsInfo/:user_id', async(req, res) => {
    console.log(req.params.user_id);
    const wishList = 
        await userModel.findById(req.params.user_id)
        .populate('wishlist', 'itemName vendor price url -_id')
        .select('-friend -tag');
    try{
        console.log('calling mongodb');
        console.log(wishList);
        res.send(wishList);
    }catch(e){
        res.status(500).send(e);
    }
});


app.listen(process.env.PORT || port, () => {
    console.log(`Express.js running on http://localhost:${port}`);
});
  

module.exports = app;



