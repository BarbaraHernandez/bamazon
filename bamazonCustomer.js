//required NPM packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//shortcut
var border = "\n------------------------------------\n";

//create a connection to the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password:"trilogy",
    database:"bamazon"
});

//connect to the database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connectes as " + connection.threadID + "\n");
    //main function
    startShopping();
})

//display database information
function seeInventory(callback) {
    connection.query("SELECT * FROM products", function(err,res) {
        if (err) throw err;
        console.log(border);
        for (var i = 0; i < res.length; i++){
            console.log(
                "Item ID: " + res[i].item_id + " | " +
                res[i].product_name + " | "+
                res[i].price
            );
        }
        console.log(border);

        if(typeof callback === "function") {
            callback();
        }
    })
}

function continueOption() {
    inquirer
        .prompt({
            name: "continueShopping",
            type: "confirm",
            message: "Would you like to continue shopping?"
        })
        .then (function(answer){
            if(answer.continueShopping === true){
                browseAll();
            }
            else{
                goodbye();
            }
        })
}

function confirmAction() {
    inquirer
        .prompt({
            name:"chooseAction",
            type: "raw list",
            message: "How would you like to continue?",
            choices: ["go back to select an item", "see inventory", "exit"]
        })
        .then (function(answer) {
            switch (answer.chooseAction) {
                case "go back to select an item":
                    buyItem();
                    break;
                
                case "see inventory":
                    browseAll();
                    break;

                case "exit":
                    goodbye();
                    break;

            }

        })
}

function completePurchase(local_id, purchaseAmount, available) {
    var newQuantity = available - purchaseAmount;
    var cost;
    var purchaseTotal;
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [local_id], function(err, res) {
        cost = res[0].price;
        purchaseTotal = cost * purchaseAmount;
        console.log("Your total is: " + purchaseTotal + ". Thank you for your purchase.");
        connection.query(
            "UPDATE products SET ? WHERE?",
            [
                {
                    stock_quantity: newQuantity
                },
                {
                    item_id: local_id
                }
            ]
        )
        continueOption();
    })
}

function verifyAmount(local_id, purchaseAmount) {
    console.log("local ID for query: " + local_id);
    var query = connection.query("SELECT * FROM products WHERE item_id=?", [local_id], function (err, res) {
        if (err){
            console.log("There was a problem connecting to the database. \n Please try again.");
            buyItem();
        }
        else {
            var available = res[0].stock_quantity;
        }
        if (purchaseAmount <= available) {
            console.log("product in stock");
            completePurchase(local_id, purchaseAmount, available);
        }
        else {
            console.log("Sorry, we weren't able to complete your order due to insufficient stock.");
            confirmAction();
        }
    });
}

function selectQuantity(local_id) {
    inquirer
        .prompt({
            name:"quantity",
            type: "text",
            message: "How many would you like to purchase? Please enter numerals. (i.e. 50)"
        })
        .then (function(answer){
            var purchaseAmount = parseInt(answer.quantity);
            verifyAmount(local_id, purchaseAmount);
        })
}

function confirmItem ( local_id ) {
    console.log("local id: " + local_id);
    connection.query("SELECT * FROM products WHERE item_id=?", [local_id], function(err, res) {
        if (err) throw err;
        console.log(border);
        console.log(res[0].item_id + " | " + res[0].product_name);
        console.log(border);
    } );

    inquirer
        .prompt({
            name: "confirmItem",
            type: "confirm",
            message: "Is this the item you wish to purchase?"
        })
        .then (function(answer){
            if(answer.confirmItem === true) {
                selectQuantity(local_id);
            }
            else{
                confirmAction();
            }
        })
}

function buyItem(){
    inquirer
        .prompt({
            name: "selectItem",
            type: "text",
            message: "Please enter the Item ID of the product you would like to purchase."
        })
        .then (function(answer) {
            var local_id = answer.selectItem;
            // console.log("bI local_id: " + local_id);
            confirmItem(local_id);
        })
}

function browseAll () {
    seeInventory();
    inquirer
        .prompt({
            name: "initiatePurchase",
            type: "confirm",
            message: "Would you like to make a purchase?"
        })
        .then (function(answer) {
            if(answer.initiatePurchase === true) {
                buyItem();
            }
            else{
                goodbye();
            }
        })
    

}

//end shopping when user is finished
function goodbye() {
    console.log("Thanks for visiting! We hope to see you again soon.");
    connection.end();
}

function startShopping() {
    inquirer
        .prompt([{
            name:"initiateShop",
            type: "confirm",
            message: "Welcome to Bamazon! Would you like to see a list of our products?"
        }])
        .then(function(answer) {
            if (answer.initiateShop === true) {
                browseAll();
            }
            else {
                goodbye();
            }
        });
}

