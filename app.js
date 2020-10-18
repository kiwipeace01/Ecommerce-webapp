const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const ejs = require("ejs");
const app=express();

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended: true}));
app.use('/public/uploads/', express.static('./public/uploads'));

mongoose.connect('mongodb://localhost:27017/ecommDB', {useNewUrlParser: true,useUnifiedTopology: true});


/*const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'ecommerce';
const client = new MongoClient(url);*/

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());



//schemas///////////////////////////////////
//for ad upload
const productSchema=mongoose.Schema({
    sellerid:String,
    title:String,
    category:String,
    description:String,
    price:Number,
    img: 
    {
       name:String
    } 

});

const product=mongoose.model("product",productSchema);


//
const chatSchema=new mongoose.Schema({
    senderid:String,
    message:String,
    time: { type : Date, default: Date.now }

});
//user chats ...
const withwhomSchema=mongoose.Schema({
    withu:String,
    chats:[chatSchema]
});

const userSchema=mongoose.Schema({
    userid:String,
    messages:[withwhomSchema]
})


const withwhom=mongoose.model("with",withwhomSchema);
const mess=mongoose.model("chat",chatSchema);
const user=mongoose.model("user",userSchema);

app.get("/signin",function(req,res){
    res.render("signin");
});

app.post("/register", function (req, res) { 
    var username = req.body.username 
    var password = req.body.password 
    User.register(new User({ username: username }), 
            password, function (err, user) { 
        if (err) { 
            console.log(err); 
            return res.render("register"); 
        } 
  
        passport.authenticate("local")( 
            req, res, function () { 
            res.render("secret"); 
        }); 
    }); 
}); 
   
 
//Handling user login 
app.post("/signin", passport.authenticate("local", { 
    successRedirect: "/secret", 
    failureRedirect: "/signin"
}), function (req, res) { 
}); 
  
//Handling user logout  
app.get("/logout", function (req, res) { 
    req.logout(); 
    res.redirect("/"); 
}); 
  
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) return next(); 
    res.redirect("/login"); 
} 

app.get('/',(req,res) => {
  //  const db = client.db(dbName);
    product.find({},function(err, products){
    res.render('index',{'items':products});
    //assert.equal(err, null);
  });
})

app.post('/',function(req,res){
    var sort = req.body.sort;
    console.log(sort);
});

app.get("/vehicles",function(req,res){
   
    product.find({category:"Vehicles"},function(err,veh){
        if(!err){
      console.log(veh);
      res.render("index_vehicles",{items:veh});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
});


app.get('/furniture',(req,res) => {

    product.find({category:"Furniture"},function(err,furn){
        if(!err){
      console.log(furn);
      res.render("index_furn",{items:furn});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
  });

app.get('/gadgets',(req,res) => {

    product.find({category:"Gadgets"},function(err,gad){
        if(!err){
      console.log(gad);
      res.render("index_gadgets",{items:gad});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
  });


app.get('/cookware',(req,res) => {
   
    product.find({category:"Cooking"},function(err,cooking){
        if(!err){
      console.log(cooking);
      res.render("index_cooking",{items:cooking});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
})

app.get('/beauty',(req,res) => {
    
    product.find({category:"Beauty"},function(err,beauty){
        if(!err){
      console.log(beauty);
      res.render("index_beauty",{items:beauty});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    });
})

app.get('/stationary',(req,res) => {

    product.find({category:"Stationary"},function(err,station){
        if(!err){
      console.log(station);
      res.render("index_stationary",{items:station});
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
  });


var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 




app.get("/showads",function(req,res){
    product.find({}, (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            res.render('showads', { items: items }); 
        } 
    }); 

});

app.get("/submitad",function(req,res){
    res.render('submitad');
});

var storage = multer.diskStorage({ 
    destination: './public/uploads/' ,
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname)) ;
    } 
}); 

var upload = multer({ storage: storage }).single('ifile'); 

app.post("/submitad",upload,function(req,res,next){
    var sellerid="1234";
    console.log(req.file);
    var image=req.file.filename;
    const prod=new product({
        sellerid:sellerid,
        title:req.body.title,
        category:req.body.category,
        description:req.body.description,
        price:req.body.price,
        img: {
            name:image
        } 
    });

    prod.save(function(err){
        if(err)
        console.log(err);
        else
        console.log("product added!");
    });

    res.redirect("/");
    

});

app.listen(3000,function(){
    console.log("started on port 3000...");
});
