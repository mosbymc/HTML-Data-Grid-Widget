var testGridData = {
    useValidator: true,
    useFormatter: true,
    sortable: true,
    reorderable: true,
    groupable: true,
    filterable: true,
    pagingOptions: [25, 50, 100],
    //pageSize: 50,
    summaryRow: {
        Service: {
            type: "count"
        },
        Labor: {
            type: "average"
        },
        Cost: {
            type: "max",
            template: "${{data}}"
        },
        Date: {
            type: ""
        },
        Time: {
            type: ""
        },
        Paid: {
            type: "count"
        },
        Customer: {
            type: ""
        },
        Billed: {
            type: "total",
            template: "${{data}}"
        },
        Markup: {
            type: ""
        },
        positionAt: "top"
    },
    rows: {
        alternateRows: ["testAlt"],
        all: ["testAll"]
    },
    columns: {
        Service: {
            filterable: true,
            editable: true,
            width: 160,
            attributes: {
                cellClasses: ["custom-class", "anotherOne"],
                style: "font: bold;",
                headerClasses: ["custom-class"]
            }
        },
        Customer: {
            type: "string",
            width: 180
        },
        Labor: {
            type: "number",
            template: "{{data}} hour(s)",
            decimals: 0,
            selectable: true,
            options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            width: 160,
            validation: {
                required: true,
                customRules: {
                    maxValue: function maxValue(callback) {
                        if ($(this).val() >= 10)
                            callback(false, "You must select a lower value.", 150);
                        else
                            callback(true);
                    }
                }
            }
        },
        Cost: {
            type: "number",
            symbol: "$",
            template: "${{data}}",
            filterable: true,
            editable: true,
            min: 1,
            max: 10000,
            width: 180,
            validation: {
                required: true,
                customRules: {
                    maxCost: function maxCost(callback) {
                        if (this.value > 1500)
                            callback(false, "Total cost cannot exceed $1500.00.", 200);
                        else
                            callback(true);
                    },
                    minCost: function minCost(callback) {
                        if (this.value > 1500)
                            callback(false, "Total cost cannot be less than $1500.00.", 200);
                        else
                            callback(true);
                    }
                }
            }
        },
        Billed: {
            type: "number",
            symbol: "$",
            template: "${{data}}",
            width: 125,
            validation: {
                required: true,
                customRules: {
                    maxBilled: function maxBilled(callback) {
                        if (this.value > 1500)
                            callback(false, "Total billing cannot exceed $1500.00.", 200);
                        else
                            callback(true);
                    }
                }
            }
        },
        Markup: {
            filterable: false,
            type: "number",
            width: 140,
            editable: true,
            title: "Parts Markup",
            template: "{{data}}%",
            decimals: 0
        },
        Date: {
            filterable: true,
            type: "date",
            width: 180,
            editable: true,
            format: "mm/dd/yyyy",
            validation: {
                required: true,
                customRules: {
                    dateValidation: function dateValidation(callback) {
                        var userDate = new Date($(this).val());
                        var timezone = userDate.getTimezoneOffset();
                        var trueTime = new Date(userDate.getTime() + (timezone*60000));
                        if (trueTime > new Date())
                            callback(false, "You cannot select a future date.", 200);
                        else
                            callback(true);
                    }
                }
            }
        },
        Time: {
            title: "Check-in Time",
            filterable: true,
            type: "time",
            width: 150,
            editable: true,
            timeFormat: "12",
            delimiter: ":"
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
                Service: "Old Brakes",
                Date: "18/10/1982",
                Labor: "2.25",
                Cost: 57.65,
                Paid: true,
                Customer: "Mark Mosby",
                Billed: "75.22",
                Markup: 19,
                Time: "10:17:46 PM"
            },
            {
                Service: "Tires Rotation",
                Date: "1/07/2009",
                Labor: "1.89",
                Cost: "532.00",
                Paid: false,
                Customer: "David Hill",
                Billed: "11.11",
                Markup: 5000,
                Time: "9:45:10 AM"
            },
            {
                Service: "Old Transmission",
                Date: "3/4/2006",
                Labor: "2",
                Cost: "252.78",
                Paid: true,
                Customer: "Lenny Brensman",
                Billed: "563.89",
                Markup: 300,
                Time: "12:15:48 AM"
            },
            {
                Service: "Oil Changes",
                Date: "1/25/2015",
                Labor: "0.5",
                Cost: "55.00",
                Paid: true,
                Customer: "Dustin Waldroup",
                Billed: "75.00",
                Markup: 50,
                Time: "8:57:34 AM"
            },
            {
                Service: "Old Brakes",
                Date: "11/25/2015",
                Labor: "1.5",
                Cost: "45.00",
                Paid: true,
                Customer: "Leyth Gorgeis",
                Billed: "55.00",
                Markup: 67,
                Time: "10:10:12: AM"
            },
            {
                Service: "Old Clutch",
                Date: "10/12/2015",
                Labor: "5",
                Cost: "200.00",
                Paid: true,
                Customer: "Kendra Billings",
                Billed: "250.00",
                Markup: 108,
                Time: "4:31:59 AM"
            },
            {
                Service: "Oil Change",
                Date: "12/01/2015",
                Labor: "0.5",
                Cost: "70.00",
                Paid: true,
                Customer: "Callie McConnell",
                Billed: "90.00",
                Markup: 93,
                Time: "5:05:36 AM"
            },
            {
                Service: "New Spark Plugs",
                Date: "11/18/2014",
                Labor: "0.5",
                Cost: "65.00",
                Paid: true,
                Customer: "Moshe Adnesik",
                Billed: "90.00",
                Markup: 100,
                Time: "11:24:56 AM"
            },
            {
                Service: "Emission Check",
                Date: "1/25/2015",
                Labor: "0.25",
                Cost: "25.00",
                Paid: true,
                Customer: "Jim Song",
                Billed: "30.00",
                Markup: 500,
                Time: "9:49:02 AM"
            },
            {
                Service: "New Exhaust",
                Date: "9/07/2016",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Bob Hollister",
                Billed: "295.00",
                Markup: 67,
                Time: "5:11:30 PM"
            },
            {
                Service: "Tire Rotation",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Michael Villareal",
                Billed: "260.00",
                Markup: 32,
                Time: "8:08:00 AM"
            },
            {
                Service: "Fluids Check",
                Date: "1/25/2015",
                Labor: "1.37",
                Cost: "250.00",
                Paid: true,
                Customer: "Bill Landers",
                Billed: "282.00",
                Markup: 900,
                Time: "11:01:53 AM"
            },
            {
                Service: "Car Detail",
                Date: "1/25/2015",
                Labor: "2.26",
                Cost: "250.00",
                Paid: true,
                Customer: "Lou Bennet",
                Billed: "350.00",
                Markup: 225,
                Time: "4:00:30 PM"
            },
            {
                Service: "New O2 Sensor",
                Date: "1/25/2015",
                Labor: "3.31",
                Cost: "250.00",
                Paid: true,
                Customer: "Erik Ciccarone",
                Billed: "299.00",
                Markup: 108,
                Time: "2:20:46 PM"
            },
            {
                Service: "Replacement Gear Shift",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "John Mitchell",
                Billed: "265.00",
                Markup: 200,
                Time: "1:39:00 PM"
            },
            {
                Service: "New Windshield Wipers",
                Date: "1/25/2015",
                Labor: "1.83",
                Cost: "42.00",
                Paid: false,
                Customer: "Paul Rogers",
                Billed: "283.00",
                Markup: 100,
                Time: "6:06:32 PM"
            },
            {
                Service: "New Tires",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "487.00",
                Paid: true,
                Customer: "Jane Mosby",
                Billed: "290.00",
                Markup: 67,
                Time: "8:49:00 AM"
            },
            {
                Service: "Oil Change",
                Date: "6/18/2015",
                Labor: "1.52",
                Cost: "87.00",
                Paid: true,
                Customer: "Mark Mosby",
                Billed: "75.00",
                Markup: 5,
                Time: "9:42:31 AM"
            },
            {
                Service: "New Transmission",
                Date: "3/2/2016",
                Labor: "12.86",
                Cost: "1255.00",
                Paid: true,
                Customer: "David Hill",
                Billed: "65.00",
                Markup: 37,
                Time: "4:07:56 PM"
            },
            {
                Service: "Emission Check",
                Date: "2/29/2016",
                Labor: "87.3",
                Cost: "5.00",
                Paid: true,
                Customer: "Lenny Brensman",
                Billed: "25.00",
                Markup: 98,
                Time: "8:02:20 AM"
            },
            {
                Service: "Oil Change",
                Date: "8/30/2015",
                Labor: "1",
                Cost: "33.00",
                Paid: true,
                Customer: "Dustin Waldroup",
                Billed: "75.00",
                Markup: 52,
                Time: "10:06:50 AM"
            },
            {
                Service: "Oil Change",
                Date: "1/26/2016",
                Labor: "1",
                Cost: "40",
                Paid: true,
                Customer: "Leyth Gorgeis",
                Billed: "85.00",
                Markup: 67,
                Time: "3:23:33 PM"
            },
            {
                Service: "New Exhaust",
                Date: "12/18/2015",
                Labor: "8",
                Cost: "998.00",
                Paid: false,
                Customer: "Kendra Billings",
                Billed: "1369.00",
                Markup: 100,
                Time: "9:56:01 AM"
            },
            {
                Service: "Fluids Check",
                Date: "6/27/2015",
                Labor: "1.37",
                Cost: "50.00",
                Paid: true,
                Customer: "Callie McConnell",
                Billed: "90.00",
                Markup: 200,
                Time: "11:51:01 AM"
            },
            {
                Service: "Tire Rotation",
                Date: "9/5/2015",
                Labor: "1.25",
                Cost: "68.00",
                Paid: true,
                Customer: "Moshe Adnesik",
                Billed: "90.00",
                Markup: 250,
                Time: "1:47:21 PM"
            },
            {
                Service: "Car Detail",
                Date: "4/14/2016",
                Labor: "2.18",
                Cost: "138.55",
                Paid: false,
                Customer: "Jim Song",
                Billed: "250.99",
                Markup: 87,
                Time: "5:05:39 PM"
            },
            {
                Service: "Oil Change",
                Date: "1/5/2016",
                Labor: "1",
                Cost: "52.55",
                Paid: true,
                Customer: "Bob Hollister",
                Billed: "123.96",
                Markup: 233,
                Time: "3:03:03 PM"
            },
            {
                Service: "New Tires",
                Date: "11/3/2015",
                Labor: "1.5",
                Cost: "150.00",
                Paid: false,
                Customer: "Michael Villareal",
                Billed: "586.50",
                Markup: 122,
                Time: "2:35:49 PM"
            },
            {
                Service: "New Spark Plugs",
                Date: "7/19/2015",
                Labor: "1.25",
                Cost: "67.33",
                Paid: true,
                Customer: "Bill Landers",
                Billed: "110.09",
                Markup: 868,
                Time: "12:56:31 PM"
            },
            {
                Service: "Emission Check",
                Date: "9/9/2016",
                Labor: "0.23",
                Cost: "15.00",
                Paid: true,
                Customer: "Lou Bennet",
                Billed: "25.00",
                Markup: 134,
                Time: "11:20:26 AM"
            },
            {
                Service: "Oil Change",
                Date: "8/13/2015",
                Labor: "0.75",
                Cost: "67.00",
                Paid: true,
                Customer: "Erik Ciccarone",
                Billed: "92.65",
                Markup: 72,
                Time: "2:33:54 PM"
            },
            {
                Service: "Tire Rotation",
                Date: "1/25/2015",
                Labor: "0.5",
                Cost: "37.50",
                Paid: true,
                Customer: "John Mitchell",
                Billed: "98.00",
                Markup: 189,
                Time: "12:12:12 PM"
            },
            {
                Service: "New Tires",
                Date: "10/18/2014",
                Labor: "1.87",
                Cost: "350.00",
                Paid: false,
                Customer: "Paul Rogers",
                Billed: "987.63",
                Markup: 23,
                Time: "1:09:15 PM"
            },
            {
                Service: "New Spark Plugs",
                Date: "1/5/2015",
                Labor: "0.75",
                Cost: "18.00",
                Paid: true,
                Customer: "Jane Mosby",
                Billed: "73.56",
                Markup: 39,
                Time: "4:51:06 PM"
            },
            {
                Service: "Fluid Check",
                Date: "4/25/2015",
                Labor: "1",
                Cost: "50.00",
                Paid: true,
                Customer: "Courtney Wilson",
                Billed: "300.00",
                Markup: 169,
                Time: "8:54:31 AM"
            },
            {
                Service: "New Transmission",
                Date: "12/6/2014",
                Labor: "9.66",
                Cost: "683.28",
                Paid: false,
                Customer: "Aaron Schwan",
                Billed: "1310.00",
                Markup: 100,
                Time: "9:15:04 AM"
            },
            {
                Service: "Oil Change",
                Date: "1/25/2015",
                Labor: "2.05",
                Cost: "65.00",
                Paid: true,
                Customer: "Marc Smith",
                Billed: "265.00",
                Markup: 102,
                Time: "12:32:09 PM"
            },
            {
                Service: "Engine Tuneup",
                Date: "9/6/2013",
                Labor: "4.73",
                Cost: "250.00",
                Paid: false,
                Customer: "Greg Main",
                Billed: "1250.00",
                Markup: 67,
                Time: "3:45:32 PM"
            },
            {
                Service: "New Exhaust",
                Date: "10/9/2016",
                Labor: "6.18",
                Cost: "328.89",
                Paid: false,
                Customer: "Some Dude",
                Billed: "5000.01",
                Markup: 433,
                Time: "5:31:08 PM"
            },
            {
                Service: "Tire Rotation",
                Date: "7/25/2015",
                Labor: "1.15",
                Cost: "48.63",
                Paid: true,
                Customer: "Some Chick",
                Billed: "148.63",
                Markup: 235,
                Time: "9:45:16 AM"
            },
            {
                Service: "New O2 Sensor",
                Date: "11/23/2013",
                Labor: "3.35",
                Cost: "150.00",
                Paid: false,
                Customer: "Bert",
                Billed: "1121.00",
                Markup: 45,
                Time: "11:22:59 AM"
            },
            {
                Service: "Oil Change",
                Date: "10/20/2015",
                Labor: ".89",
                Cost: "50.00",
                Paid: true,
                Customer: "Ernie",
                Billed: "98.00",
                Markup: 67,
                Time: "3:33:33 PM"
            },
            {
                Service: "Oil Change",
                Date: "3/16/2014",
                Labor: "1.15",
                Cost: "99.00",
                Paid: true,
                Customer: "Phillip J. Fry",
                Billed: "282.00",
                Markup: 222,
                Time: "10:18:43 AM"
            },
            {
                Service: "New Tires",
                Date: "11/25/2015",
                Labor: "1.45",
                Cost: "450.00",
                Paid: false,
                Customer: "Professor Huebert Farnsworth",
                Billed: "1300.00",
                Markup: 111,
                Time: "8:18:47 AM"
            },
            {
                Service: "Emission Check",
                Date: "6/6/2016",
                Labor: ".1",
                Cost: "5.00",
                Paid: true,
                Customer: "Cuebert Farnsworth",
                Billed: "25.00",
                Markup: 123,
                Time: "10:04:15 AM"
            },
            {
                Service: "New Spark Plugs",
                Date: "1/1/2012",
                Labor: "1",
                Cost: "50.00",
                Paid: true,
                Customer: "Robot Devil",
                Billed: "1300.00",
                Markup: 456,
                Time: "12:47:32 PM"
            },
            {
                Service: "Replacement Engine",
                Date: "7/18/2015",
                Labor: "6.67",
                Cost: "1250.00",
                Paid: false,
                Customer: "Billionaire Bot",
                Billed: "2280.00",
                Markup: 623,
                Time: "2:56:01 PM"
            },
            {
                Service: "Fluid Check",
                Date: "2/8/2011",
                Labor: "0.89",
                Cost: "52.54",
                Paid: true,
                Customer: "9",
                Billed: "400.00",
                Markup: 133,
                Time: "5:13:50 PM"
            },
            {
                Service: "New Brakes",
                Date: "3/12/2013",
                Labor: "3.13",
                Cost: "250.00",
                Paid: true,
                Customer: "Hanukkah Zombie",
                Billed: "385.00",
                Markup: 12,
                Time: "9:38:56 AM"
            },
            {
                Service: "Oil Change",
                Date: "4/21/2015",
                Labor: "1.12",
                Cost: "87.00",
                Paid: true,
                Customer: "Harold Zoid",
                Billed: "260.00",
                Markup: 36,
                Time: "9:56:02 AM"
            },
            {
                Service: "Tire Rotation",
                Date: "6/23/2010",
                Labor: "1",
                Cost: "40.00",
                Paid: true,
                Customer: "Mayor Poopinmayer",
                Billed: "290.00",
                Markup: 45,
                Time: "10:33:15 AM"
            },
            {
                Service: "New Transmission",
                Date: "5/06/2013",
                Labor: "12",
                Cost: "800.00",
                Paid: true,
                Customer: "Yancey Fry",
                Billed: "280.00",
                Markup: 56,
                Time :"1:15:08 PM"
            },
            {
                Service: "Oil Change",
                Date: "Let's see how this looks",
                Labor: "0.5",
                Cost: "55.00",
                Paid: true,
                Customer: "Hermes Conrad",
                Billed: "275.00",
                Markup: 245,
                Time: "4:00:13 PM"
            },
            {
                Service: "New Brakes",
                Date: "8/16/2012",
                Labor: "1.5",
                Cost: "45.00",
                Paid: true,
                Customer: "Roberto",
                Billed: "-1000.00",
                Markup: 23,
                Time: "5:55:01 PM"
            }
        ]
    }
};