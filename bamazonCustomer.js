// npm dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

// MySQL connection
var connection = mysql.createConnection({
	host: 'LocalHost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'bamazon'
});

// connect to the MySQL LocalHost server
connection.connect(function (err) {
	if (err) throw err;
});

// This displays the current Bamazon products in a 'NICE!' table
function inventory() {
	var query = "SELECT * FROM products";
	connection.query(query, function (err, res) {

		var table = new Table({
			head: ['ID #', 'PRODUCT NAME', 'DEPARTMENT NAME', 'PRICE', 'QUANTITY'],
			colWidths: [12, 30, 30, 12, 12]
		});
		for (var i = 0; i < res.length; i++) {
			table.push(
				[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
			);
		}
		console.log(table.toString());
	});
	purchase();
};



// the inquirer prompt to select an item to interact with
function purchase() {


	// the user picks an item
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID which you would like to purchase.',
		},
		{
			type: 'input',
			name: 'stock_quantity',
			message: 'How many do you need?',
		}
	]).then(function (input) {

		var item = input.item_id;
		var quantity = input.stock_quantity;

		// check Bamazon for quantity
		var bamRequest = 'SELECT * FROM products WHERE ?';

		connection.query(bamRequest, { item_id: item }, function (err, data) {
			if (err) throw err;

			if (data.length === null) {
				console.log("\n----------------------------------------------------------\n");
				console.log('Please select a valid Item ID #.');
				console.log("\n----------------------------------------------------------\n");
				inventory();

			} else {
				var selection = data[0];

				// if in stock....
				if (quantity <= selection.stock_quantity) {
					console.log("\n----------------------------------------------------------\n");
					console.log("Your item is in stock! Placing order!");
					console.log("\n----------------------------------------------------------\n");

					// subtract the purchased ammount
					var bamUpdate = 'UPDATE products SET stock_quantity = ' + (selection.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					// update the inventory
					connection.query(bamUpdate, function (err, data) {
						if (err) throw err;
						console.log("\n----------------------------------------------------------\n");
						console.log('Your order was sucessful. Your purchase total is $' + selection.price * quantity);
						console.log("\n----------------------------------------------------------\n");

						// end connection
						// inventory();
						connection.end();
					})
				} else {
					console.log("\n----------------------------------------------------------\n");
					console.log('Out of stock.');
					console.log('Please call again.');
					console.log("\n----------------------------------------------------------\n");

					connection.end();
				}
			}
		})
	})
}

inventory();