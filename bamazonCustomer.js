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
    userPrompt();

});

function programStart() {
    connection.query("SELECT * FROM products", function (error, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
        }
        console.log("-----------------------------------");        
    })
};

function userPrompt() {
    inquirer
        .prompt([
            {
                name: "itemID",
                type: "input",
                message: "What is the item ID that you would like to purchase?"
            },
            {
                name: "itemQuantity",
                type: "input",
                message: "How many would you like to purchase?",

            }])
        .then(function (answer) {
            var userItemToBuy = parseInt(answer.itemID)
            var userQuantityToBuy = parseInt(answer.itemQuantity)
            console.log(userItemToBuy)
            // based on their answer, check if enough supply
            connection.query(`SELECT * FROM products WHERE item_id = ${userItemToBuy}`, function (error, responseOne) {
                var selectedItemQuantity = responseOne[0].stock_quantity
                var updatedQuantity = selectedItemQuantity - userQuantityToBuy
                if (userQuantityToBuy > selectedItemQuantity) {
                    console.log("Insuficcient Quantity!")
                }
                else {
                    // var updateQuery = `UPDATE products SET stock_quantity = ${updatedQuantity} WHERE item_id = ${userItemToBuy}`;
                    connection.query(`UPDATE products SET stock_quantity = ${updatedQuantity} WHERE item_id = ${userItemToBuy}`, function (error, result) {
                        console.log(result)
                    })
                }
            })

            connection.end()
        })
}

