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

function programStart() {
    
    connection.query("SELECT * FROM products", function (error, response) {
        for (var i = 0; i < response.length; i++) {            
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity + " | " + response[i].product_sales);
        }
        console.log("-----------------------------------");
        userPrompt();
        
    })
};

function userPrompt() {
    inquirer
        .prompt([
            {
                name: "itemID",
                type: "input",
                message: "What is the item ID that you would like to purchase? (Exit to quit)"
            },
            {
                name: "itemQuantity",
                type: "input",
                message: "How many would you like to purchase? (Exit to Quit)",

            }])
        .then(function (answer) {
            if (answer.itemID.toLowerCase() === "exit" || answer.itemQuantity.toLowerCase() === "exit"){
                return connection.end()
            }
            var userItemToBuy = parseInt(answer.itemID)
            var userQuantityToBuy = parseInt(answer.itemQuantity)            
            
            // based on their answer, check if enough supply
            connection.query(`SELECT * FROM products WHERE item_id = ${userItemToBuy}`, function (error, responseOne) {
                var selectedItemQuantity = responseOne[0].stock_quantity;
                var updatedQuantity = selectedItemQuantity - userQuantityToBuy;
                var currentProductSales = parseInt(responseOne[0].product_sales);                
                var itemPrice = parseInt(responseOne[0].price);
                var thisSaleTotal = itemPrice * userQuantityToBuy;
                if (userQuantityToBuy > selectedItemQuantity) {
                    console.log("Insuficcient Quantity!");

                }
                else {
                    updateQuantity(updatedQuantity, userItemToBuy);
                    updateProductSales(currentProductSales, thisSaleTotal, userItemToBuy);
                    programStart()
                }
            })

            // connection.end()
        })

    function updateQuantity(newQuantity, ID) {
        connection.query(`UPDATE products SET stock_quantity = "${newQuantity}" WHERE item_id = "${ID}"`, function (error, result) {
            if (error) {
                console.log(error)
            }
            else {
                console.log(result)
            }
        })
    }

    function updateProductSales(currentSales, thisSaleTotal, ID){        
        var newProductSales = currentSales + thisSaleTotal;        
        connection.query(`UPDATE products SET product_sales = ${newProductSales} WHERE item_id = ${ID}`, function (error, result){
            if (error){
                console.log(error)
            }
            else {
                console.log(result)
                
            }
        })
    }

}
