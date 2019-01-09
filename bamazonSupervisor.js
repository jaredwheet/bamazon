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
    supervisorStart()

});

function supervisorStart() {
    inquirer
        .prompt([
            {
                name: "menuSelection",
                type: "rawlist",
                message: "What action would you like to take?",
                choices: ["View Product Sales by Department", "Create New Department", "Exit"]
            }])
        .then(function (answer) {
            // console.log(answer.menuSelection)
            if (answer.menuSelection === "Exit") {
                console.log("Exiting Supervisor View")
                return connection.end();
            }
            else if (answer.menuSelection === "View Product Sales by Department") {
                viewProductSales();
            }
            else if (answer.menuSelection === "Create New Department") {
                createDepartment();
            }
            else {
                console.log("-------------------------------------------------------");
                console.log("Please make an appropriate selection ")
                console.log("-------------------------------------------------------");
                programStart();
            }
        })
}

function viewProductSales() {
    connection.query("SELECT * FROM departments", function (error, response) {
        if (error) {
            console.log(error);
        }
        else {
            for (var i = 0; i < response.length; i++) {
                console.log(response[i].department_id + " | " + response[i].department_name + " | " + response[i].over_head_costs + " | " + response[i].product_sales + " | " + response[i].total_profit);
            }
            console.log("-----------------------------------");
            userPrompt();
        }
    })
}