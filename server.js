'use strict';


// load package
const express = require('express');
const app = express();
var path = require('path');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
const axios = require('axios');
var mysql = require('mysql');

const PORT = 8080;
const HOST = '0.0.0.0';

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9043',
    database: '353final'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/menu.html'));
});

//Establish connection
con.connect((err) => {
    if(err){
        throw err;
        console.log('MySQL NOT connected.');
    }
    console.log('MySql connected.');
});

app.get('/end', (req, res) => {

    con.end(function (err) {
        if (err) console.log(err);
        console.log("off");
    });

    res.send("ok");
});

//Add new products to the menu
app.post('/insert', (req, res) => {
    //Get params for the new menu item from client
    product = req.body.newProduct.name;
    price = req.body.newProduct.price;
    //Insert into menu table in database
    var sql = "INSERT INTO menu (ProductName, Price) VALUES ('" + product + "', " + price + ")";
    con.query(sql, function (err, result) {
        if (err) throw err;
    });
});

//Delete products from menu
app.get('/delete', (req, res) =>{
    //TODO:
    //SQL command to delete an entry from the menu table given ProductName
})

//Add orders from a cart to orders table
app.post('/order', (req, res) => {
    cartList = req.body.order.cart;
    customer = req.body.order.customerName;
    //TODO:
    //SQL Create table command for a customer
    //creates an order table for a single customer, named after their name
    var sql = "CREATE TABLE " + customer + " (ProductName VARCHAR(128), Price FLOAT)";
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
    //TODO:
    //Iterate and insert the products from cartList into the table
    var i;
    for (i = 0; i < cartList.length; i++) {
        price = getPrice(cartList[i]);
        var sql = "INSERT INTO " + customer + " (ProductName, Price) VALUES (" + cartList[i] + ', '  + price + ')';
        con.query(sql, function (err, result) {
            if (err) throw err;
        });
    } 
});

//Grabs price of a menu item given it's name
function getPrice(productName){
    sql= "SELECT 'Price' FROM menu WHERE ProductName = " + productName + " LIMIT 1";
    con.query(sql, function (err, result) {
        if (err) throw err;
        return result;
    });
}

//Display active orders
app.get('/active_orders', (req, res) => {
    //TODO:
    //SQL commands to display all the customer order tables to the client page
    //Preferably have this on a new webpage
    //Implementation should resemble /select
})

//Return menu table from database to client
app.get('/select', (req, res) => {

    var data;
    console.log("select was hit");
    var sql = 'SELECT * FROM menu';
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });


});


app.use('/', express.static('pages'));
console.log('up and running');


app.listen(PORT, HOST);