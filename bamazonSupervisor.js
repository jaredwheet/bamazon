var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
require('dotenv').config();

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.DATABASE_PASSWORD,
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
                console.log("Exiting Supervisor View");
                console.log("-------------------------------------------------------");
                conntection.end();
            }
        })
}

function viewProductSales() {
    connection.query(`SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS productSales
                        FROM departments
                        INNER JOIN products ON departments.department_name=products.department_name
                        GROUP BY departments.department_name;`, function (error, response) {
            if (error) {
                console.log(error);
            }
            else {
                var table = new Table({
                    head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit']
                    , colWidths: [20, 20, 20, 20, 20]
                });
                for (var i = 0; i < response.length; i++) {
                    var total_profit = response[i].productSales - response[i].over_head_costs;
                    table.push(
                        [response[i].department_id,
                        response[i].department_name,
                        response[i].over_head_costs,
                        response[i].productSales,
                            total_profit
                        ]);
                }
                console.log("-----------------------------------");



                console.log(table.toString());
                supervisorStart();
            }
        })
}

function createDepartment() {
    inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "What is the department name?"
            },
            {
                name: "overheadCosts",
                type: "input",
                message: "What are the overhead costs?"
            }])
        .then(function (answer) {
            var newDepartment = answer.departmentName;
            var newOverheadCosts = answer.overheadCosts;
            connection.query(`INSERT INTO departments (department_name, over_head_costs) VALUES ("${newDepartment}", "${newOverheadCosts}");`, function (error, response) {
                if (error) {
                    console.log(error)
                }
                else {
                    displayDepartments();

                }
            })
        })
}

function displayDepartments() {
    connection.query(`SELECT * FROM departments;`, function (error, response) {
        if (error) {
            console.log(error)
        }
        else {
            var table = new Table({
                head: ['Department ID', 'Department Name', 'Overhead Costs']
                , colWidths: [20, 20, 20,]
            });
            for (var i = 0; i < response.length; i++) {
                table.push(
                    [response[i].department_id,
                    response[i].department_name,
                    response[i].over_head_costs,
                    ]);
            }
            console.log("---------------------------------------------------");
            console.log(table.toString());
            console.log("---------------------------------------------------")
            supervisorStart();
        }
    })
}