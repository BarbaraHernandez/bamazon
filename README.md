# Bamazon

## What is it?
A CLI "storefront"

This program uses node.js to create a CLI Application which allows users to interact with a MySQL database. The
application simulates a rudimentary storefront experience, allowing customers to view inventory and request(buy) items in
stock. Inquirer is used to guide users through use of the application.

[video demo](https://youtu.be/Qa1M-0naDb0)

## Running the application

In order to run the application, you can use `npm start`. Before running, however, you will need to run the seed files (`.sql`) files.

```
mysql -u root -p < bamazon_seeds.sql
mysql -D bamazon -u root -p < bamazon_seeds.sql
```

