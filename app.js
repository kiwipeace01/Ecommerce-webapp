const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const ejs = require("ejs");
const app=express();
const session = require('express-session');
const Razorpay=require('razorpay');

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended: true}));
app.use('/public/uploads/', express.static('./public/uploads'));
//app.use('/public/images',express.static('./public/images'));

mongoose.connect('mongodb://localhost:27017/ecommDB', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());


const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/ecommDB',
    collection: 'users'
});

var crypto = require('crypto');
var uuid = require('node-uuid');

app.use(session({
    secret: 'topsecret',
    resave: false,
    saveUninitialized: true,
    unset: 'destroy',
    store: store,
    name: 'session cookie name',
    genid: (req) => {
        return crypto.createHash('sha256').update(uuid.v1()).update(crypto.randomBytes(256)).digest("hex");
    }
}));

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

const chatSchema=new mongoose.Schema({
    senderid:String,
    message:String,
    time: { type : Date, default: Date.now }

});
//user chats ...
const withwhomSchema=mongoose.Schema({
    withu:String,
    withname:String,
    chats:[chatSchema]
});

/*
const userSchema=mongoose.Schema({
    userid:String,
    messages:[withwhomSchema]
})
*/


const withwhom=mongoose.model("with",withwhomSchema);
const mess=mongoose.model("chat",chatSchema);
//const user=mongoose.model("user",userSchema);


//for user 
const userSchema=mongoose.Schema({
    customerid:String,
    name:String,
    email:String,
    password:String,
    location:String,
    phoneno:String,
    messages:[withwhomSchema],
    basket_data:[]
 });
 
 const User=mongoose.model("user",userSchema);

  
// Showing register form 
app.get("/register", function (req, res) { 
    res.render("register",{exists:0}); 
}); 
  
// Handling user signup 
app.post("/register", function (req, res) { 
    var username = req.body.username ;
    var name = req.body.name ;
    var phone = req.body.phone;
    var password = req.body.password ;
   User.findOne({email:username},function(err,found){
       if(!err){
           if(found){
               res.render("register",{exists:1});
           }
           else{
               const newuser=new User({
                   email:username,
                   password:password,
                   name:name,
                   phoneno:phone
               });
               newuser.save(function(err,latestuser){
                   if(!err){
                       var id=latestuser._id.toString();
                       var newid=id.slice(1,5);
                       User.findByIdAndUpdate(id,{customerid:newid},function(err,user){
                           if(!err){
                            console.log("new user id created successfully!");
                            
                        req.session.user={
                          email:user.email,
                          name:user.name,
                          userid:newid
                      }
                      //console.log(user);
                      console.log(req.session.user);

                           }

                       })
                     
                   }

               });
              
              res.redirect("/login");
           }
       }
   });
});

app.get('/basket',function(req,res){
  if(req.session.user){
    //console.log(req.session.user);
    User.findOne({customerid:req.session.user.userid},function(err,data){
      if(data){
        console.log("yayay");
        console.log(data.basket_data);
        res.render('basket',{datalist:data.basket_data,exists:1,name:req.session.user.name});
      }
    })
}else{
  res.render('basket',{exists:0});
}
  
 // res.render('basket');
 // console.log("yayay");
});

app.post('/addtobasket',function(req,res){
  if(req.session.user){
 const userid  = req.session.user.userid;
 const pid = req.body.pid;
 console.log(userid);
 console.log(pid);
   product.findById(pid,function(err,det){
     if(det.sellerid!=userid){
    console.log(det);
    User.updateOne({customerid:userid},{$addToSet: {basket_data:det}},function(err,result){
      if(err){
        console.log(err);
      }
      else{
        console.log(result);
      
      }
    });}
    res.redirect("/");

   })
  }else{
    res.render('notsignedin',{exists:0});
  }
});

app.post('/remove',function(req,res){
const userid = req.session.user.userid;
const rem_id = req.body.remove;

product.findById(rem_id,function(err,det){
  console.log(det);
  User.updateOne({customerid:userid},{$pull: {basket_data:det}},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      console.log(result);
    
    }
  });
  res.redirect('/basket');

 })

});



  
//Showing login form 
app.get("/login", function (req, res) { 
    res.render("login",{error:0,exists:0}); 
}); 
  
//Handling user login 
app.post("/login", function(req,res){
    var username = req.body.username ;
    var password = req.body.password ;
   User.findOne({email:username,password:password},function(err,user){
       if(!err){

           if(user){
               req.session.user={
                   email:user.email,
                   name:user.name,
                   userid:user.customerid,
                   phone:user.phoneno
               }
               res.redirect("/");
           }else{
               res.render("login",{error:1,exists:0});
           }
       }
    });
});

  
app.get('/',(req,res) => {
    product.find({},function(err, products){
        if(req.session.user){
            console.log(req.session.user);
           res.render('index',{'items':products,exists:1,name:req.session.user.name});
   }else{
        res.render('index',{'items':products,exists:0});    
    }
  });
})

app.get('/logout', (req, res) => {
    if(req.session.user) {
        delete req.session.user;
        res.redirect('/login');
    } else {
        res.redirect('/');
    }        
});

app.get("/vehicles",function(req,res){
    product.find({category:"Vehicles"},function(err,veh){
        if(!err){
     // console.log(veh);
      if(req.session.user){
      res.render("index_vehicles",{items:veh,exists:1,name:req.session.user.name});}
      else{
        res.render("index_vehicles",{items:veh,exists:0});
      }

        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
});


app.get('/furniture',(req,res) => {

    product.find({category:"Furniture"},function(err,furn){
        if(!err){
     // console.log(furn);
      if(req.session.user){
        res.render("index_furn",{items:furn,name:req.session.user.name,exists:1});}
        else{
          res.render("index_furn",{items:furn,exists:0});
        }
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
  });

app.get('/gadgets',(req,res) => {

    product.find({category:"Gadgets"},function(err,gad){
        if(!err){
      if(req.session.user){
        res.render("index_gadgets",{items:gad,name:req.session.user.name,exists:1});}
        else{
          res.render("index_gadgets",{items:gad,exists:0});
        }
      }
        else
        console.log(err);
    })
  });


app.get('/cookware',(req,res) => {
   
    product.find({category:"Cooking"},function(err,cooking){
        if(!err){
      //console.log(cooking);
      if(req.session.user){
        res.render("index_cooking",{items:cooking,name:req.session.user.name,exists:1});}
        else{
          res.render("index_cooking",{items:cooking,exists:0});
        }
        //vehicle.push(veh);
      }
        else
        console.log(err);
    })
})

app.get('/beauty',(req,res) => {
    
    product.find({category:"Beauty"},function(err,beauty){
        if(!err){
     // console.log(beauty);
      if(req.session.user){
        res.render("index_beauty",{items:beauty,name:req.session.user.name,exists:1});}
        else{
          res.render("index_beauty",{items:beauty,exists:0});
        }
      }
        else
        console.log(err);
    });
})

app.get('/stationary',(req,res) => {

    product.find({category:"Stationary"},function(err,station){
        if(!err){
     // console.log(station);
     if(req.session.user){
      res.render("index_stationary",{items:station,name:req.session.user.name,exists:1});}
      else{
        res.render("index_stationary",{items:station,exists:0});
      }
      }
        else
        console.log(err);
    })
  });


var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 

app.get("/submitad",function(req,res){
  if(req.session.user){
    res.render('submitad',{exists:1,name:req.session.user.name});}
    else{
      res.render('notsignedin',{exists:0});
    }

});

var storage = multer.diskStorage({ 
    destination: './public/uploads/' ,
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname)) ;
    } 
}); 

var upload = multer({ storage: storage }).single('ifile'); 

app.post("/submitad",upload,function(req,res,next){
   // var sellerid="1234";
    console.log(req.file);
    var image=req.file.filename;
    const prod=new product({
        sellerid:req.session.user.userid,
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


//chats

app.post("/openchat",function(req,res){
  if(req.session.user){
    if(req.session.user.userid!=req.body.seller){
    const currentchatwith=req.body.seller;
    const currentuser=req.session.user.userid;

      
    User.findOne({customerid:currentuser,"messages.withu":currentchatwith},function(err,foundu){
      if(!err){
        if(foundu){
         foundu.messages.forEach(element => {
           if(element.withu===currentchatwith){
            User.findOne({customerid:currentchatwith},function(err,user2){

           
             res.render("page",{chat: element.chats,exists1:1,exists:1,withuser:currentchatwith,name:req.session.user.name,withusername:user2.name});
            });
           }
         });
     //  console.log(foundchats);
   
      
        }else{
          User.findOne({customerid:currentchatwith},function(err,user2){

           
            res.render("page",{exists1:0,exists:1,withuser:currentchatwith,name:req.session.user.name,withusername:user2.name});
           });
        }

     
   
      }else{
        //console.log('errrr');
        console.log(err);
      }
   
   
    });
  }else{
    res.redirect("/");
  }}else{
    res.render('notsignedin',{exists:0});
  }
  
});

app.get("/chat",function(req,res){

    const currentchatwith=req.query.seller;
    const currentuser=req.session.user.userid;
   
    User.findOne({customerid:currentuser,"messages.withu":currentchatwith},function(err,foundu){
      if(!err){
        if(foundu){
         foundu.messages.forEach(element => {
           if(element.withu===currentchatwith){
            User.findOne({customerid:currentchatwith},function(err,user2){

           
              res.render("page",{chat: element.chats,exists1:1,exists:1,withuser:currentchatwith,name:req.session.user.name,withusername:user2.name});
             });
            // res.render("page",{chat: element.chats,exists1:1,exists:1,withuser:currentchatwith,name:req.session.user.name});
           }
         });
     //  console.log(foundchats);
   
      
        }else{
          User.findOne({customerid:currentchatwith},function(err,user2){

           
            res.render("page",{exists1:1,exists:1,withuser:currentchatwith,name:req.session.user.name,withusername:user2.name});
           });
        // res.render("page",{exists1:0,withuser:currentchatwith,exists:1,name:req.session.user.name});
        }
   
      }else{
        //console.log('errrr');
        console.log(err);
      }
   
   
    });  
   });
   
   app.post("/chat",function(req,res){
   
       const currentchatwith=req.body.seller;
       const currentuser=req.session.user.userid;

       console.log(req.body.seller);
       console.log(req.body.message);
      
       const newmess=new mess({
           senderid:currentuser,
           message:req.body.message
         });
   
   User.findOne({customerid:currentuser,"messages.withu":currentchatwith},function(err,foundc){ 
         //console.log(foundc);
         if(!foundc){
        // user.findOne
             console.log("nnot");
             const Withwhom= new withwhom({withu:currentchatwith, chats:[newmess]});
          /*   user.findOneAndUpdate({userid:"4567"},{$push:{messages:Withwhom}},{useFindAndModify: false},function(err,found2){
               console.log(found2);
              
               
             });*/
   
             //console.log(Withwhom);
               const Withwhom2=new withwhom({withu:currentuser,chats:[newmess]});
               User.findOne({customerid:currentuser},function(err,found2){
               if(!err){
                 found2.messages.push(Withwhom);
                 found2.save(function(err){
                   if(err)
                   console.log("1111..");
                 });
   
                 User.findOne({customerid:currentchatwith},function(err,found3){
                   if(!err){
                    // console.log(found3);  
                     found3.messages.push(Withwhom2);
                     found3.save(function(err){
                       if(err)
                       console.log(err);       
                     });
                   }
                 });
   
               }else{
                 console.log("erroror");
               //console.log(err);
               }
             });
   
           //  res.redirect("/");  
       
         }else{
        // console.log(foundc);
           //foundc.messages.chats.push(newmess);
           foundc.messages.forEach(element => {
             if(element.withu===currentchatwith){
               element.chats.push(newmess);
             }
             
           });
           foundc.save();
   
           User.findOne({customerid:currentchatwith,"messages.withu":currentuser},function(err,foundc1){ 
             if(foundc1){
                 foundc1.messages.forEach(element => {
                 if(element.withu===currentuser){
                   element.chats.push(newmess);
                 }
                 
               });
               foundc1.save();       
             }   
           });
         }
         res.redirect('/chat?seller=' + currentchatwith); 
   
       });       
   });
   
   var foundmessages;
   var foundusers;

   app.get("/allmessages",function(req,res){
      // var userid="4567";
     // var foundnameuser=[];
       User.findOne({customerid:req.session.user.userid},function(err,founduser){
         if(!err){
           //console.log("foundddd");
           //  console.log(founduser);
           founderusers = founduser;
             foundmessages=founduser.messages;
           if(founduser.messages!=null){
            // console.log(foundmessages);
           /*  for(var i=0;i<foundmessages.length;i++){
               var withwh=foundmessages[i].withu;
               //console.log(withwh);
               User.findOne({customerid:withwh},function(err,foundname){
                 foundnameuser.push(foundname.name);
                 //res.render("messages",{allmessages:founduser.messages,exists:1,name:req.session.user.name,foundnames:foundnameuser});
                // console.log(foundnameuser);
               })
             }*/
            // console.log(foundnameuser);
           res.render("messages",{allmessages:founduser.messages,exists:1,name:req.session.user.name});
           }
           else
           res.render("messages",{exists:0,name:req.session.user.name});
   
         }else{
           console.log(err);
         }});
       
   });




///////////////////// payment 

var instance = new Razorpay({
  key_id: 'rzp_test_l5kapIUaiisRhQ',
  key_secret: 'DWKfOkIESZA11BoTBUSbaxma',
});

app.post('/post2pay',function(req,res){
  var total=req.body.total;
  res.redirect("/pay?amount="+total);

})

app.get("/pay",function(req,res){
  const total=req.query.amount+"00";
  console.log(total);
  
  var options = {
      amount: total,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: '0',
      redirect: true
    };
  instance.orders
.create({
  amount: total,
  currency: "INR",
  receipt: "", // Add receipt string
  payment_capture: 1, // auto capture payment config
//  notes: { username, planId: id }
  // custom notes, you can use this in received response as key-value pair
})
.then(data => { // created order response
  let sendToApplicationResponse = { // Creating the response send to mobile app
    orderId: data.id,
    receipt: data.receipt
  };
  console.log(sendToApplicationResponse.orderId);
  res.render('paybutton',{orderid:sendToApplicationResponse.orderId,name:req.session.user.name,phone:req.session.user.phone,
    email:req.session.user.email,exists:1});
 // return sendToApplicationResponse;
});

})

app.post("/pay",function(req,res){
  console.log(res.body);
})


/////////////////// update basket and products page after purchase done 

/*app.get("/successpayment",function(req,res){

  User.findOne({customerid: req.session.user.userid},function(err,item){
    var basket = item.basket_data;
    for(var i=0;i<basket.length;i++){
      product.findByIdAndDelete(basket[i]._id,function(err,result){
        if(!err){
          console.log('Product deleted successfully');
        }
      })
    }
  })

  User.update({customerid: req.session.user.userid},{$set: {basket_data:[]}},function(err,result){
    if(!err){
      console.log('Basket updated successfully!');
      res.render("successpayment",{exists:1,name:req.session.user.name
      });
    }
  })
 

});*/


app.get("/successpayment",function(req,res){

  User.findOne({customerid: req.session.user.userid},function(err,item){
    var basket = item.basket_data;
    for(var i=0;i<basket.length;i++){

     // console.log("itemmm 111");
      var basketimgname=basket[i].img.name;
      User.find({},function(err,allusers){
        for(var j=0;j<allusers.length;j++){
          var eachuserbasket=allusers[j].basket_data;
        //  console.log("baskettt...");
          //console.log(eachuserbasket);
          for(var k=0;k<eachuserbasket.length;k++){
         //  console.log("itemmm");
           // console.log(eachuserbasket[k].img.name);
           // console.log("itemmm 111");
            //console.log(basket[i].img.name);
           if(eachuserbasket[k].img.name===basketimgname){
             // console.log("sammeee");  
            User.update({customerid:allusers[j].customerid},{$pull:{basket_data: eachuserbasket[k]}},function(err,result){
                if(!err){
                  console.log('item removed from all baskets');
                }
              }
                )
           }

          }

        }
      })


      product.findByIdAndDelete(basket[i]._id,function(err,result){
        if(!err){
          console.log('Product deleted successfully');
        }
      })
    }
  })

 
  User.update({customerid: req.session.user.userid},{$set: {basket_data:[]}},function(err,result){
    if(!err){
      console.log('Basket updated successfully!');
      res.render("successpayment",{exists:1,name:req.session.user.name
      });
    }
  })
 

});


app.listen(3000,function(){
    console.log("started on port 3000...");
});