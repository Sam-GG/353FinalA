'use strict';


// load package
const express = require('express');
const app = express();
var path = require('path');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
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

//Landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/menu.html'));
});
//Employee webpage
app.get('/employeesOnly', (req, res) => {
    res.sendFile(path.join(__dirname + '/employeePage.html'));
});
//background image hosting
app.get('/background', (req, res) => {
    res.sendFile(path.join(__dirname + '/coffee_background.png'));
});

//Establish connection
con.connect((err) => {
    if(err){
        console.log('MySQL NOT connected.');
        throw err;
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
app.post('/addProduct', (req, res) => {
    //Get params for the new menu item from client
    console.log(req.body.name);
    console.log(req.body)
    var product = req.body.name;
    var price = req.body.price;
    //Insert into menu table in database
    var sql = "INSERT INTO menu (ProductName, Price) VALUES ('" + product + "', " + price + ")";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send('Success.');
    });
});

//Delete products from menu
app.post('/deleteProduct', (req, res) =>{
    var product = req.body.name.trim();
    //query a delete from the menu table
    var sql = 'DELETE FROM menu WHERE ProductName = ?'
    console.log(product);
    con.query(sql, product, function (err, result) {
        if (err) console.log(err);
        console.log(result);
        res.send('Success.');
    });
})

//Add orders from a cart to orders table
app.post('/order', (req, res) => {
    var cartList = req.body.cart;
    var customer = req.body.customer;
    //creates an order table for a single customer, named after their name
    var sql = "CREATE TABLE order_" + customer + " (ProductName varchar(128), Price FLOAT)";
    con.query(sql, function (err, result) {
        if (err) console.log(err);
    });
    //Iterate and insert the products from cartList into the table
    var i;
    for (i = 1; i < cartList.length; i++) {
        var sql = "INSERT INTO order_" + customer + " (ProductName, Price) VALUES ('"+cartList[i][0]+"', "+cartList[i][1]+")";
        con.query(sql, function (err, result) {
            if (err) {console.log(err)}
            console.log(result);
        });
    } 
});

//Display active orders
app.get('/activeOrders', (req, res) => {
    //SQL commands to display all the customer order tables to the client page in order FIFO
    //Select all tables that have the 'order_' prefix and return their names
    var sql = `SELECT TABLE_NAME
    FROM information_schema.tables
    WHERE table_name like "%order%"
    ORDER BY CREATE_TIME DESC`;
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        //iterate and split names of customers into a list
        var activeOrders = [];
        var i;
        for (i=0; i < result.length; i++){
            activeOrders[activeOrders.length] = result[i]['TABLE_NAME'].split('_')[1];
        }
        res.json(activeOrders);
    });
})

app.post('/displayOrder', (req, res) => {
    var name = req.body.name;
    name = name.trim();
    var sql = 'SELECT * FROM order_'+name;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

app.post('/completeOrder', (req, res) => {
    var customerName = req.body.name.trim();
    console.log(customerName);
    var tableName = 'order_' + customerName;
    var sql = 'DROP TABLE '+tableName;
    con.query(sql, function (err, result) {
        if (err) {throw err}
        else{
            res.json(customerName);
        };
        
    });
})

//Return menu table from database to client
app.get('/menu', (req, res) => {
    var sql = 'SELECT * FROM menu';
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
});


app.use('/', express.static('pages'));
console.log('up and running');


app.listen(PORT, HOST);