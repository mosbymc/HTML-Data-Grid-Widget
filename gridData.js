var gridData = {
	sortable: true,
	reorderable: true,
	groupable: true,
	filterable: true,
	pagingOptions: [25, 50, 100],
	//pageSize: 50,
	summaryRow: {
		Service: "count",
		Labor: "average",
		Cost: "max",
		Date: "",
		Paid: "count",
		Customer: "",
		Billed: "total",
		positionAt: "top"
	},
	columns: {
		Service: {
			filterable: true,
			editable: true,
			width: 160,
			cellClassList: ["custom-class", "anotherOne"],
			columnClassList: ["custom-class"]
		},
		Customer: {
			type: "string",
			width: 180
		},
		Labor: {
			type: "time",
			measurement: "hours",
			template: "{{data}} hour(s)",
			selectable: true,
			options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
			width: 160
		},
		Cost: {
			type: "currency",
			symbol: "$",
			template: "${{data}}",
			filterable: true,
			editable: true,
			min: 1,
			max: 10000,
			width: 180
		},
		Billed: {
			type: "currency",
			symbol: "$",
			template: "${{data}}",
			width: 125
		},
		Date: {
			filterable: true,
			type: "date",
			width: 180,
			editable: true,
			format: "mm/dd/yyyy"
		},
		Paid: {
			type: "bool",
			editable: true,
			width: 100
		}
	},
	dataSource: {
		get: "localhost:8080/grid_data",
		update: "localhost:8080/grid_data",
		rowCount: 54,
		data: [
			{
				Service: "New Brakes",
				Labor: "2",
				Cost: "55.00",
				Paid: false,
				Customer: "Mark Mosby",
				Billed: "75.00"
			},
			{
				Service: "Tire Rotation",
				Labor: "1",
				Cost: "40.00",
				Paid: true,
				Customer: "David Hill",
				Billed: "65.00"
			},
			{
				Service: "New Transmission",
				Labor: "12",
				Cost: "800.00",
				Paid: true,
				Customer: "Lenny Brensman",
				Billed: "1010.00"
			},
			{
				Service: "Oil Change",
				Date: "1/25/2015",
				Labor: "0.5",
				Cost: "55.00",
				Paid: true,
				Customer: "Dustin Waldroup",
				Billed: "75.00"
			},
			{
				Service: "New Brakes",
				Labor: "1.5",
				Cost: "45.00",
				Paid: true,
				Customer: "Leyth Gorgeis",
				Billed: "55.00"
			},
			{
				Service: "New Clutch",
				Labor: "5",
				Cost: "200.00",
				Paid: true,
				Customer: "Kendra Billings",
				Billed: "250.00"
			},
			{
				Service: "Oil Change",
				Labor: "0.5",
				Cost: "70.00",
				Paid: true,
				Customer: "Callie McConnell",
				Billed: "90.00"
			},
			{
				Service: "New Spark Plugs",
				Labor: "0.5",
				Cost: "65.00",
				Paid: true,
				Customer: "Moshe Adnesik",
				Billed: "90.00"
			},
			{
				Service: "Emission Check",
				Labor: "0.25",
				Cost: "25.00",
				Paid: true,
				Customer: "Jim Song",
				Billed: "30.00"
			},
			{
				Service: "New Exhaust",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Bob Hollister",
				Billed: "295.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Michael Villareal",
				Billed: "260.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Bill Landers",
				Billed: "282.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Lou Bennet",
				Billed: "350.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Erik Ciccarone",
				Billed: "299.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "John Mitchell",
				Billed: "265.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Paul Rogers",
				Billed: "283.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Jane Mosby",
				Billed: "290.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Mark Mosby",
				Billed: "75.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "David Hill",
				Billed: "65.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Lenny Brensman",
				Billed: "1010.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Dustin Waldroup",
				Billed: "75.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Leyth Gorgeis",
				Billed: "55.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Kendra Billings",
				Billed: "250.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Callie McConnell",
				Billed: "90.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Moshe Adnesik",
				Billed: "90.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Jim Song",
				Billed: "30.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Bob Hollister",
				Billed: "295.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Michael Villareal",
				Billed: "260.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Bill Landers",
				Billed: "282.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Lou Bennet",
				Billed: "350.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Erik Ciccarone",
				Billed: "299.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "John Mitchell",
				Billed: "265.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Paul Rogers",
				Billed: "283.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Jane Mosby",
				Billed: "290.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Courtney Wilson",
				Billed: "300.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Aaron Schwan",
				Billed: "310.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Marc Smith",
				Billed: "265.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Greg Main",
				Billed: "250.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Some Dude",
				Billed: "5000.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Some Chick",
				Billed: "5000.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Bert",
				Billed: "1.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Ernie",
				Billed: "2.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Phillip J. Fry",
				Billed: "282.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Professor Huebert Farnsworth",
				Billed: "300.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Cuebert Farnsworth",
				Billed: "310.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Robot Devil",
				Billed: "300.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Billionaire Bot",
				Billed: "280.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "9",
				Billed: "400.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Hanukkah Zombie",
				Billed: "385.00"
			},
			{
				Service: "New Row Test",
				Date: "1/25/2015",
				Labor: "2",
				Cost: "250.00",
				Paid: true,
				Customer: "Harold Zoid",
				Billed: "260.00"
			},
			{
				Service: "Tire Rotation",
				Labor: "1",
				Cost: "40.00",
				Paid: true,
				Customer: "Mayor Poopinmayer",
				Billed: "290.00"
			},
			{
				Service: "New Transmission",
				Labor: "12",
				Cost: "800.00",
				Paid: true,
				Customer: "Yancey Fry",
				Billed: "280.00"
			},
			{
				Service: "Oil Change",
				Date: "Let's see how this looks",
				Labor: "0.5",
				Cost: "55.00",
				Paid: true,
				Customer: "Hermes Conrad",
				Billed: "275.00"
			},
			{
				Service: "New Brakes",
				Labor: "1.5",
				Cost: "45.00",
				Paid: true,
				Customer: "Roberto",
				Billed: "-1000.00"
			}
		]
	}
};
