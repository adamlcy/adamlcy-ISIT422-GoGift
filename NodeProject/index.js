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



