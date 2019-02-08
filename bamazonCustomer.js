// required NPM packages
const mysql = require('mysql');
const inquirer = require('inquirer');

// shortcut
const border = '\n------------------------------------\n';

// create a connection to the sql database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'trilogy',
  database: 'bamazon',
});

// display database information
function seeInventory(callback) {
  connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    console.log(border);
    for (let i = 0; i < res.length; i += 1) {
      console.log(
        `Item ID: ${res[i].item_id} | ${
          res[i].product_name} | ${
          res[i].price}`,
      );
    }
    console.log(border);

    if (typeof callback === 'function') {
      callback();
    }
  });
}

function continueOption() {
  inquirer
    .prompt({
      name: 'continueShopping',
      type: 'confirm',
      message: 'Would you like to continue shopping?',
    })
    .then((answer) => {
      if (answer.continueShopping === true) {
        browseAll();
      } else {
        goodbye();
      }
    });
}

function confirmAction() {
  inquirer
    .prompt({
      name: 'chooseAction',
      type: 'raw list',
      message: 'How would you like to continue?',
      choices: ['go back to select an item', 'see inventory', 'exit'],
    })
    .then((answer) => {
      switch (answer.chooseAction) {
        case 'go back to select an item':
          buyItem();
          break;
        case 'see inventory':
          browseAll();
          break;
        case 'exit':
          goodbye();
          break;
        default:
          break;
      }
    });
}

function completePurchase(localId, purchaseAmount, available) {
  const newQuantity = available - purchaseAmount;
  let cost;
  let purchaseTotal;
  connection.query('SELECT * FROM products WHERE item_id=?', [localId], (err, res) => {
    cost = res[0].price;
    purchaseTotal = cost * purchaseAmount;
    console.log(`Your total is: ${purchaseTotal}. Thank you for your purchase.`);
    connection.query(
      'UPDATE products SET ? WHERE?',
      [
        {
          stock_quantity: newQuantity,
        },
        {
          item_id: localId,
        },
      ],
    );
    continueOption();
  });
}

function verifyAmount(localId, purchaseAmount) {
  console.log(`local ID for query: ${localId}`);
  let available;

  connection.query('SELECT * FROM products WHERE item_id=?', [localId], (err, res) => {
    if (err) {
      console.log('There was a problem connecting to the database. \n Please try again.');
      buyItem();
    } else {
      available = res[0].stock_quantity;
    }

    if (purchaseAmount <= available) {
      console.log('product in stock');
      completePurchase(localId, purchaseAmount, available);
    } else {
      console.log("Sorry, we weren't able to complete your order due to insufficient stock.");
      confirmAction();
    }
  });
}

function selectQuantity(localId) {
  inquirer
    .prompt({
      name: 'quantity',
      type: 'text',
      message: 'How many would you like to purchase? Please enter numerals. (i.e. 50)',
    })
    .then((answer) => {
      const purchaseAmount = parseInt(answer.quantity, 10);
      verifyAmount(localId, purchaseAmount);
    });
}

function confirmItem(localId) {
  console.log(`local id: ${localId}`);
  connection.query('SELECT * FROM products WHERE item_id=?', [localId], (err, res) => {
    if (err) throw err;
    console.log(border);
    console.log(`${res[0].item_id} | ${res[0].product_name}`);
    console.log(border);
  });

  inquirer
    .prompt({
      name: 'confirmItem',
      type: 'confirm',
      message: 'Is this the item you wish to purchase?',
    })
    .then((answer) => {
      if (answer.confirmItem === true) {
        selectQuantity(localId);
      } else {
        confirmAction();
      }
    });
}

function buyItem() {
  inquirer
    .prompt({
      name: 'selectItem',
      type: 'text',
      message: 'Please enter the Item ID of the product you would like to purchase.',
    })
    .then((answer) => {
      const localId = answer.selectItem;
      // console.log("bI localId: " + localId);
      confirmItem(localId);
    });
}

function browseAll() {
  seeInventory();
  inquirer
    .prompt({
      name: 'initiatePurchase',
      type: 'confirm',
      message: 'Would you like to make a purchase?',
    })
    .then((answer) => {
      if (answer.initiatePurchase === true) {
        buyItem();
      } else {
        goodbye();
      }
    });
}

// end shopping when user is finished
function goodbye() {
  console.log('Thanks for visiting! We hope to see you again soon.');
  connection.end();
}

function startShopping() {
  inquirer
    .prompt([{
      name: 'initiateShop',
      type: 'confirm',
      message: 'Welcome to Bamazon! Would you like to see a list of our products?',
    }])
    .then((answer) => {
      if (answer.initiateShop === true) {
        browseAll();
      } else {
        goodbye();
      }
    });
}

// connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log(`connectes as ${connection.threadID}\n`);
  // main function
  startShopping();
});
