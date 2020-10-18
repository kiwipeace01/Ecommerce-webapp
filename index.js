const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const ejs = require("ejs");
const app=express();

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/messageDB', {useNewUrlParser: true,useUnifiedTopology: true});


//collection
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

app.get("/",function(req,res){

 const currentchatwith="1251";
 const currentuser="4567";

 user.findOne({userid:currentuser,"messages.withu":currentchatwith},function(err,foundu){
   if(!err){
     if(foundu){
      foundu.messages.forEach(element => {
        if(element.withu===currentchatwith){
          res.render("page",{chat: element.chats,exists:1,withuser:currentchatwith});
        }
      });
  //  console.log(foundchats);

   
     }else{
      res.render("page",{exists:0,withuser:currentchatwith});
     }

   }else{
     //console.log('errrr');
     console.log(err);
   }


 }); 
 /*withwhom.findOne({withu:"1234"},function(err,foundc){
   if(!err){
    if(foundc){
   //   console.log(foundc.chats);
   res.render("page",{chat: foundc.chats,exists:1,withuser:"1234"});
  }else{
    res.render("page",{exists:0});
  }

   }
  });*/

  
});

app.post("/",function(req,res){

    const currentchatwith="1251";
    const currentuser="4567";
    console.log(req.body.sid);
    console.log(req.body.message);
   
    const newmess=new mess({
        senderid:req.body.sid,
        message:req.body.message
      });

    user.findOne({userid:currentuser,"messages.withu":currentchatwith},function(err,foundc){ 
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
            user.findOne({userid:currentuser},function(err,found2){
            if(!err){
              console.log("ehehehe");
              found2.messages.push(Withwhom);
              found2.save(function(err){
                if(err)
                console.log(err);
              });

              user.findOne({userid:currentchatwith},function(err,found3){
                if(!err){
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

        user.findOne({userid:currentchatwith,"messages.withu":currentuser},function(err,foundc1){ 
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
      res.redirect("/");  

    });        
});


app.get("/allmessages",function(req,res){
    var userid="4567";
    user.findOne({userid:userid},function(err,founduser){
      if(!err){
        if(founduser.messages!=null)
        res.render("messages",{allmessages:founduser.messages,exists:1});
        else
        res.render("messages",{exists:0});

      }else{
        console.log(err);
      }
    });
});
    
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });


  /*
    
        const Withwhom= new withwhom({withu:"1234", chats:[newmess]});
      foundc.messages.push(Withwhom);
          foundc.save(function(err){
            if(!err){
              console.log("errrrrrr...")
              res.redirect("/");
            }else{
              console.log(err);
            }
          });
          
        }else{
          console.log("here...");
          foundc.messages.chats.push(newmess);
          foundc.save(function(err){
            if(!err){
            console.log("added..");
            res.redirect("/");}
            else
            console.log(err);
          });
        }
      }else{
        console.log("eeeeee");
        console.log(err);}   
      });
      */