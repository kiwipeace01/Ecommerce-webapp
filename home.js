var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'ecommerce';
const client = new MongoClient(url);

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

app.post('/',function(req,res){
    var sort = req.body.sort;
    console.log(sort);
});


app.get('/furniture',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({'category':'furniture'}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

app.get('/gadgets',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({'category':'gadgets'}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

app.get('/cookware',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({'category':'cooking'}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

app.get('/beauty',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({'category':'beauty'}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

app.get('/stationary',(req,res) => {
    //let products = [{"title":"Ishika"},{"title":"Naik"}];
    const db = client.db(dbName);
    const collection = db.collection('products');

    collection.find({'category':'stationary'}).toArray(function(err, products) {
    res.render('index',{'items':products})
    assert.equal(err, null);
  });
})

client.connect(function(err){
    assert.equal(null,err);
    console.log("Connected successfully to Mongo DB");
    app.listen(3000,()=>console.log('Listening on 3000'));
    
    //client.close();
});
