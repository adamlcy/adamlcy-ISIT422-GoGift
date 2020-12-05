var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
var usersRouter = require('./routes/usercredentials');
const dotenv = require('dotenv')
var nodemailer = require('nodemailer');

const port = 3000;

const session = require ('express-session')
const passport = require ('passport')

//load config
dotenv.config ({path: './config/config.env'})



const mongoose = require('mongoose');

let userModel = require('./userModel');
let tagModel = require('./tagModel');
let itemModel = require('./itemModel');
let imgUserModel = require('./userWithImgModel');

//testing
let imgModel = require('./imageModel');

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


// Logging Morgan - Thais
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


// Passport middleware
app.use(passport.initialize())
app.use(passport.session())


// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

//passport config 
require('./config/passport')(passport)

const mg_user = process.env.MG_USER;
const mg_pwd = process.env.MG_PWD;
const mg_db = process.env.MG_DB;
const email_user = process.env.EMAIL_USER;
const email_pwd = process.env.EMAIL_PWD;
const mongo_uri = `mongodb+srv://${mg_user}:${mg_pwd}@cluster0.iod5u.mongodb.net/${mg_db}?retryWrites=true&w=majority`;
mongoose.connect(mongo_uri, {useNewUrlParser: true})
.then(
    console.log("MongoDB is connected!")
);


const fs = require('fs'); 
const multer = require('multer'); 

global.__basedir = __dirname;
const upload = multer({dest: __basedir + '/multer-uploads/'});

const transporter = nodemailer.createTransport({
    port: 587,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: email_user,
            pass: email_pwd,
         },
    secure: false,
    });
// POST /profileWithImg
// Create account with image.

app.post('/profileWithImg', upload.single('profileImg'), async(req, res) => {
    console.log('getting file');
    console.log(req.file);
    const imgUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        bio: req.body.bio,
        profileImg: {
            data: fs.readFileSync(path.join(__dirname + '/multer-uploads/' + req.file.filename)),
            contentType: req.file.mimetype
        },
        tag: JSON.parse(req.body.tag),
        wishlist: [],
        friend: []
    };
    console.log(imgUser);
    const imgUserDoc = new imgUserModel(imgUser);
    try{
        await imgUserDoc.save();
        res.status(200).send(imgUserDoc);
    }
    catch(e){
        res.status(500).send(e);
    }

    let imgFilePath = path.join(__dirname + '/multer-uploads/' + req.file.filename);
    fs.unlink(imgFilePath, (err) => {
        if(err){
            console.log(`failed to delete file: ${e}`);
        }else{
            console.log(`file deleted: ${imgFilePath}`);
        }
    });
});

// GET /profileWithImg/:id
// Get account with image.

app.get('/profileWithImg/:id', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const userImgInfo = await imgUserModel.findById(req.params.id).populate('tag');
                        
    try{
        console.log(userImgInfo);
        res.contentType('json');
        res.status(200).send(userImgInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profileWithImg/info/:id
// Update first name, last name, and email field.

app.patch('/profileWithImg/info/:id', async(req, res) => {
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email}, {new: true}).populate('tag');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profileWithImg/bio/:id
// Update bio field.

app.patch('/profileWithImg/bio/:id', async(req, res) => {
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {bio: req.body.bio}, {new: true}).populate('tag');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});


// PATCH /profileWithImg/image/:id
// Update profile picture.


app.patch('/profileWithImg/image/:id', upload.single('profileImg'), async(req, res) => {
    const imgUser = {
        profileImg: {
            data: fs.readFileSync(path.join(__dirname + '/multer-uploads/' + req.file.filename)),
            contentType: req.file.mimetype
        }
    };
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {profileImg: imgUser.profileImg}, {new: true}).populate('tag');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }

    let imgFilePath = path.join(__dirname + '/multer-uploads/' + req.file.filename);
    fs.unlink(imgFilePath, (err) => {
        if(err){
            console.log(`[Update Profile Picture] failed to delete file: ${e}`);
        }else{
            console.log(`[Update Profile Picture] file deleted: ${imgFilePath}`);
        }
    });
});


// PATCH /profileWithImg/item/:id
// Update the item field of the profile.
// data needed for update: user's id.
// data to update: item
// will pass back updated record

app.patch('/profileWithImg/item/:id', async(req, res) => {
    console.log(req.params.id);
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {$addToSet: {wishlist: req.body}}, {new: true}).populate('wishlist');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profileWithImg/friend/:id
// Update the item field of the profile.
// data needed for update: user's id.
// data to update: item
// will pass back updated record

app.patch('/profileWithImg/friend/:id', async(req, res) => {
    
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {$addToSet: {friend: req.body}}, {new: true}).populate('friend');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// DELETE /profileWithImg/removeFriend/:id
// Update the item field of the profile.
// data needed for update: user's id.
// data to update: item
// will pass back updated record

app.delete('/profileWithImg/friend/:id/:friendId', async(req, res) => {
    let removeFriendId = req.params.friendId;
    console.log(req.params.friendId);
    
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {$pull: {friend: removeFriendId}}, {new: true}).populate('friend');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo.friend);
        res.send(userNewInfo.friend);
    }catch(e){
        res.status(500).send(e);
    }
});

// GET /profileWithImg/wishlist/:id
// Get wishlist for user with profile image.
app.get('/profileWithImg/wishlist/:id', async(req, res) => {
    const userInfo = await imgUserModel.findById(req.params.id)
                        .populate('wishlist')
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
});


// GET /profileWithImg/friendlist/:id
// Get list of friends for user with profile image.
app.get('/profileWithImg/friendlist/:id', async(req, res) => {
    const userInfo = await imgUserModel.findById(req.params.id)
                        .populate('friend');
    try{
        console.log(userInfo.friend);
        res.send(userInfo.friend);
    }catch(e){
        res.status(500).send(e);
    }
});

// GET /friendWithImg/:email
// Find friend based on email address
// data: first name, last name, email, profile img
// example output: {"firstName":"White","lastName":"Seahorse","email":"white.horse@hotmail.com","bio":"Another one","profileImg":"file/path"}

app.get('/friendWithImg/:email', async(req, res) => {
    const userInfo = await imgUserModel.findOne({email: req.params.email});
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
}); 



// PATCH /profileWithImg/tag/:id
// Update the tag field of the profile.
// data needed for update: user's id.
// data to update: tag
// will pass back updated record

app.patch('/profileWithImg/tag/:id', async(req, res) => {
    const userNewInfo = await imgUserModel
                    .findByIdAndUpdate(req.params.id, {tag: req.body}, {new: true}).populate('tag');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});



app.use('/usercredential', usersRouter);


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


app.get('/takeWishlist/:id', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    const userInfo = await userModel.findById(req.params.id)
                        .populate('wishlist')
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
                        .populate('friend', '-tag -wishlist -friend')
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
                        .select('-_id -friend -tag -wishlist');
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
        console.log({tags: tags, tagIds: tagIds});
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

// GET /itemsByTag/:tagName
// Search Gift Ideas Page. 
// Get all items associated with the search term.
// example output: [{"itemName":"50 Bird Postage Stamps","vendor":"PostalGuy","price":34.99,"image":"img/file/path","url":"url/path"}]

app.get('/itemsByTag/:tagName', async(req, res) => {
    //let user_id = '5f97245cd5ce43461a7a14fb';
    
    const tagItemInfo = await tagModel.findOne({name: req.params.tagName})
                            .populate('item', '-tag')
                            .select('-_id');                            
    try{
        console.log(tagItemInfo.item);
        res.send(tagItemInfo.item);
    }catch(e){
        res.status(500).send(e);
    }
}); 

// POST /item
// Create Wishlist Item Page.
// Create an item document in item collection.
// Use case: created when a user creates a wishlist item.
// data needed: name (items will be empty)

app.post('/item', async(req, res) => {
    const item = new itemModel(req.body);
    try{
        await item.save();
        res.send(item._id);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /tag/:id
// Update the item field of the tag.
// data needed for update: tag's id.
// data to update: item 
// will pass back updated record

app.patch('/tag/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(`I AM GETTING THIS: ${JSON.stringify(req.body)}`);
    const tagNewInfo = await tagModel
                    .findByIdAndUpdate(req.params.id, {$push: {item: req.body}}, {new: true}).populate('item');
    try{
        console.log(tagNewInfo);
        res.send(tagNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});
app.patch('/deleteItemFromWislist/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(`I AM GETTING THIS: ${JSON.stringify(req.body)}`);
   
    const userInfo = await userModel.findByIdAndUpdate(req.params.id, {$pull: req.body}, {new: true})
                        .populate('wishlist')
    try{
        console.log(userInfo);
        res.send(userInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profile/item/:id
// Update the item field of the profile.
// data needed for update: user's id.
// data to update: item
// will pass back updated record

app.patch('/profile/item/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(`I AM GETTING THIS: ${JSON.stringify(req.body)}`);
    const userNewInfo = await userModel
                    .findByIdAndUpdate(req.params.id, {$push: {wishlist: req.body}}, {new: true}).populate('wishlist');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
    }catch(e){
        res.status(500).send(e);
    }
});

// PATCH /profile/tag/:id
// Update the tag field of the profile.
// data needed for update: user's id.
// data to update: tag
// will pass back updated record

app.patch('/profile/tag/:id', async(req, res) => {
    console.log(req.params.id);
    console.log(`I AM GETTING THIS: ${JSON.stringify(req.body)}`);
    const userNewInfo = await userModel
                    .findByIdAndUpdate(req.params.id, {tag: req.body}, {new: true}).populate('wishlist');
    try{
        //await userNewInfo.save();
        console.log(userNewInfo);
        res.send(userNewInfo);
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


////image test code
app.post('/imgTest', upload.single('image'), async(req, res) => {
    console.log(req.file);
    const Image = {
        image: {
            data: fs.readFileSync(path.join(__dirname + '/multer-uploads/' + req.file.filename)),
            contentType: 'image/jpeg'
        },
    };
    
    const imgInfo = new imgModel(Image);
    console.log('sending to database');
    console.log(imgInfo);
    try{
        await imgInfo.save();
        res.status(200).send('image saved');
    }
    catch(e){
        res.status(500).send(e);
    }

    
    let imgFilePath = path.join(__dirname + '/multer-uploads/' + req.file.filename);
    fs.unlink(imgFilePath, (err) => {
        if(err){
            console.log(`failed to delete file: ${e}`);
        }else{
            console.log(`file deleted: ${imgFilePath}`);
        }
    });
});

app.get('/getImage', async(req, res) => {
    
    const image = await imgModel.findById('5fbab3868dfb4058d2b62925');
    
    try{
        console.log(image);
        res.contentType('json');
        res.send(image.image);
    }catch(e){
        res.status(500).send(e);
    }
    
});
app.post("/friend/email", (req, res) => {
    const {to, sender} = req.body;
    const mailData = {
        from: email_user,
        to: to,
        subject: `${sender} has invited you to join GoGift`,
        html: 'Hey, I found this cool app! Come join me by signing up here: http://gogiftangular.azurewebsites.net/'
    };
    transporter.sendMail(mailData, function (err, info) {
        let msg = {msg: 'Email Sent.'};
        if(err){
          msg = {msg: 'Email Sent Failed.'};
          console.log(err);
          res.status(200).send(msg);
        }
        else{
          console.log(info);
          res.status(200).send(msg);
        }
     });
  });

app.listen(process.env.PORT || port, () => {
    console.log(`Express.js running on http://localhost:${port}`);
});
  

module.exports = app;



