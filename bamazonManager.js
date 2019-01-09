var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Devils12",
    database: "bamazon"
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    programStart();

});



function viewProducts() {
    connection.query("SELECT * FROM products", function (error, response) {
        if (error) {
            console.log(error)
        }
        else {
            console.log("ITEM ID.....ITEM NAME.....ITEM PRICE.....ITEM QUANTITY")
            console.log("-------------------------------------------------------")
            for (var i = 0; i < response.length; i++) {
                console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
            }
            console.log("-----------------------------------");
            programStart();

        }
    })
};

function viewLowInventory() {
    connection.query("SELECT * FROM products", function (error, response) {
        if (error) {
            console.log(error)
        }
        var lowInventoryItems = [];
        console.log("ITEM ID.....ITEM NAME.....ITEM PRICE.....ITEM QUANTITY")
        console.log("-------------------------------------------------------")
        for (var i = 0; i < response.length; i++) {
            var itemDetails = response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity
            if (response[i].stock_quantity < 5) {
                console.log(itemDetails);
                lowInventoryItems.push(itemDetails)
            }
        }
        if (lowInventoryItems.length === 0) {
            console.log("No items with low inventory")
            console.log("-------------------------------------------------------")
        }
        programStart();
    })
}
function updateQuantity(quantityToAdd, ID) {
    connection.query(`SELECT * FROM products WHERE item_id = ${ID}`, function (error, responseOne) {
        if (error) {
            console.log(error)
        }
        else {
            var newQuantity = responseOne[0].stock_quantity + quantityToAdd
            connection.query(`UPDATE products SET stock_quantity = "${newQuantity}" WHERE item_id = "${ID}"`, function (error, result) {
                if (error) {
                    console.log(error)
                }
                else {
                    console.log("-------------------------------------------------------")
                    console.log("You have added " + quantityToAdd + " to the inventory for this item")
                    console.log("-------------------------------------------------------")
                    programStart();
                }
            })
        }
    })
}

function addToInventory() {
    inquirer
        .prompt([
            {
                name: "itemID",
                type: "input",
                message: "What item ID would you like to add inventory?",
            },
            {
                name: "itemQuantity",
                type: "input",
                message: "How many would  you like to add?",
            }]).then(function (answer) {
                var itemID = answer.itemID;
                var itemQuanity = answer.itemQuantity;
                updateQuantity(itemQuanity, itemID)
            })
}
function addProduct (name, dept, price, quantity){
    connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
    VALUES ("${name}", "${dept}", ${price}, ${quantity})`, function (error, result){
        if (error){
            console.log(error)
        }
        else {
            console.log("-------------------------------------------------------");
            console.log("This item has been added!");
            console.log("-------------------------------------------------------");
            programStart();
        }
    })

}
function newProductInfo () {
    inquirer
        .prompt([
            {
                name: "itemName",
                type: "input",
                message: "What is the name of the item?",
            },
            {
                name: "itemDept",
                type: "input",
                message: "What is the department for this item?",
            },
            {
                name: "itemPrice",
                type: "input",
                message: "What is the price for this item?",
            },
            {
                name: "itemQuantity",
                type: "input",
                message: "How many would of these items are in the inventory?",
            }]).then(function (answer) {
                var itemName = answer.itemName;
                var itemDept = answer.itemDept;
                var itemPrice = answer.itemPrice;
                var itemQuantity = answer.itemQuantity;
                addProduct(itemName, itemDept, itemPrice, itemQuantity)
            })
}

function programStart() {
    inquirer
        .prompt([
            {
                name: "menuSelection",
                type: "rawlist",
                message: "What action would you like to take?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
            }])
        .then(function (answer) {
            // console.log(answer.menuSelection)
            if (answer.menuSelection === "Exit") {
                console.log("Exiting Manager View")
                return connection.end();
            }
            else if (answer.menuSelection === "View Products for Sale") {
                viewProducts();
            }
            else if (answer.menuSelection === "View Low Inventory") {
                viewLowInventory();
            }
            else if (answer.menuSelection === "Add to Inventory") {
                addToInventory();
            }
            else if (answer.menuSelection === "Add New Product") {
                newProductInfo();
            }
            else {
                console.log("-------------------------------------------------------");
                console.log("Please make an appropriate selection ")
                console.log("-------------------------------------------------------");
                programStart();
            }
        })
}