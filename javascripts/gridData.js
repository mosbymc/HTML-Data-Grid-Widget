var gridData = {
    height: 400,
    useValidator: true,
    useFormatter: true,
    sortable: true,
    reorderable: true,
    groupable: true,
    groupAggregates: true,
    filterable: true,
    selectable: 'multi-row',
    excelExport: true,
    columnToggle: true,
    drillDown: {
        reorderable: true,
        sortable: true,
        resizable: true,
        columns: {
            MechanicName: {
                title: 'Mechanic',
                filterable: true,
                width: 180,
                type: 'string'
            },
            Make: {
                filterable: true,
                width: 125,
                type: 'string'
            },
            Model: {
                filterable: true,
                width: 125,
                type: 'string'
            },
            Year: {
                filterable: true,
                width: 100,
                type: 'date'
            },
            Doors: {
                filterable: true,
                width: 175,
                type: 'number',
                title: 'Number of doors'
            },
            EngineType: {
                title: 'Engine Type',
                width: 150,
                type: 'string',
                filterable: true
            },
            EngineSize: {
                title: 'Engine Size',
                width: 150,
                type: 'string',
                filterable: true
            }
        }
    },
    pagingOptions: [25, 50, 100],
    menu: ['filter', 'excel', 'save', 'sort', 'selection'],
    aggregates: {
        Service: {
            type: "count"
        },
        Labor: {
            type: "average"
        },
        Cost: {
            type: "max"
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
        Phone: {
            type: ""
        },
        Billed: {
            type: "total"
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
        Phone: {
            type: "string",
            editable: true,
            width: 130,
            inputFormat: "{{###}}-{{###}}-{{####}}",
            title: "Phone Number"
        },
        Labor: {
            type: "number",
            template: "{{data}} hour(s)",
            format: 'n2',
            editable: 'drop-down',
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
            format: '0C2',
            //symbol: "$",
            //template: "${{data}}",
            filterable: true,
            editable: true,
            min: 1,
            max: 10000,
            width: 150,
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
            format: '0C2',
            editable: true,
            //symbol: "$",
            //template: "${{data}}",
            width: 155,
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
            //template: "{{data}}%",
            format: '0P2',
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
            format: 'hh:mm:ss',
            delimiter: ":"
        },
        Paid: {
            type: "boolean",
            editable: true,
            filterable: true,
            //width: 100
        }
    },
    dataSource: {
        rowCount: 54,
        data: [
            {
                Service: "New Brakes",
                Date: "10/18/1982",
                Labor: "2",
                Cost: 55.00,
                Paid: false,
                Customer: "Mark Mosby",
                Billed: "75.00",
                Markup: 150,
                Time: "12:15:32 AM",
                drillDownData: [
                    {
                        MechanicName: 'Joe Reyes',
                        Make: 'Honda',
                        Model: 'Civic ES',
                        Year: '2003',
                        Doors: '3',
                        EngineType: '4 Cyclinder',
                        EngineSize: '1.6 Liter'
                    },
                    {
                        MechanicName: 'Joe Reyes',
                        Make: 'Acura',
                        Model: 'Integra',
                        Year: '1996',
                        Doors: '3',
                        EngineType: '4 Cyclinder',
                        EngineSize: '1.8 Liter'
                    },
                    {
                        MechanicName: 'Ed Strabel',
                        Make: 'BMW',
                        Model: 'Z4',
                        Year: '2003',
                        Doors: '1',
                        EngineType: '6 Cyclinder',
                        EngineSize: '2.2 Liter'
                    },
                    {
                        MechanicName: 'Joe Reyes',
                        Make: 'Nissan',
                        Model: 'Pathfinder',
                        Year: '2002',
                        Doors: '5',
                        EngineType: 'V6',
                        EngineSize: '3.5 Liter'
                    }
                ]
            },
            {
                Service: "Tire Rotation",
                Date: "12/12/2012",
                Labor: "1",
                Cost: "40.00",
                Paid: true,
                Customer: "David Hill",
                Billed: "65.00",
                Markup: 100,
                Time: "3:45:10 PM"
            },
            {
                Service: "New Transmission",
                Date: "1/15/2016",
                Labor: "12",
                Cost: "800.00",
                Paid: true,
                Customer: "Lenny Brensman",
                Billed: "1010.00",
                Markup: 200,
                Time: "9:03:48 AM"
            },
            {
                Service: "Oil Change",
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
                Service: "New Brakes",
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
                Service: "New Clutch",
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
                Service: "New Row Test",
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
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Bill Landers",
                Billed: "282.00",
                Markup: 900,
                Time: "11:01:53 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Lou Bennet",
                Billed: "350.00",
                Markup: 225,
                Time: "4:00:30 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Erik Ciccarone",
                Billed: "299.00",
                Markup: 108,
                Time: "2:20:46 PM"
            },
            {
                Service: "New Row Test",
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
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Paul Rogers",
                Billed: "283.00",
                Markup: 100,
                Time: "6:06:32 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Jane Mosby",
                Billed: "290.00",
                Markup: 67,
                Time: "8:49:00 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Mark Mosby",
                Billed: "75.00",
                Markup: 5,
                Time: "9:42:31 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "David Hill",
                Billed: "65.00",
                Markup: 37,
                Time: "4:07:56 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Lenny Brensman",
                Billed: "1010.00",
                Markup: 98,
                Time: "8:02:20 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Dustin Waldroup",
                Billed: "75.00",
                Markup: 52,
                Time: "10:06:50 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Leyth Gorgeis",
                Billed: "55.00",
                Markup: 67,
                Time: "3:23:33 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Kendra Billings",
                Billed: "250.00",
                Markup: 100,
                Time: "9:56:01 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Callie McConnell",
                Billed: "90.00",
                Markup: 200,
                Time: "11:51:01 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Moshe Adnesik",
                Billed: "90.00",
                Markup: 250,
                Time: "1:47:21 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Jim Song",
                Billed: "30.00",
                Markup: 87,
                Time: "5:05:39 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Bob Hollister",
                Billed: "295.00",
                Markup: 233,
                Time: "3:03:03 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Michael Villareal",
                Billed: "260.00",
                Markup: 122,
                Time: "2:35:49 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Bill Landers",
                Billed: "282.00",
                Markup: 868,
                Time: "12:56:31 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Lou Bennet",
                Billed: "350.00",
                Markup: 134,
                Time: "11:20:26 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Erik Ciccarone",
                Billed: "299.00",
                Markup: 72,
                Time: "2:33:54 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "John Mitchell",
                Billed: "265.00",
                Markup: 189,
                Time: "12:12:12 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Paul Rogers",
                Billed: "283.00",
                Markup: 23,
                Time: "1:09:15 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Jane Mosby",
                Billed: "290.00",
                Markup: 39,
                Time: "4:51:06 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Courtney Wilson",
                Billed: "300.00",
                Markup: 169,
                Time: "8:54:31 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Aaron Schwan",
                Billed: "310.00",
                Markup: 100,
                Time: "9:15:04 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Marc Smith",
                Billed: "265.00",
                Markup: 102,
                Time: "12:32:09 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Greg Main",
                Billed: "250.00",
                Markup: 67,
                Time: "3:45:32 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Some Dude",
                Billed: "5000.00",
                Markup: 433,
                Time: "5:31:08 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Some Chick",
                Billed: "5000.00",
                Markup: 235,
                Time: "9:45:16 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Bert",
                Billed: "1.00",
                Markup: 45,
                Time: "11:22:59 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Ernie",
                Billed: "2.00",
                Markup: 67,
                Time: "3:33:33 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Phillip J. Fry",
                Billed: "282.00",
                Markup: 222,
                Time: "10:18:43 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Professor Huebert Farnsworth",
                Billed: "300.00",
                Markup: 111,
                Time: "8:18:47 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Cuebert Farnsworth",
                Billed: "310.00",
                Markup: 123,
                Time: "10:04:15 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Robot Devil",
                Billed: "300.00",
                Markup: 456,
                Time: "12:47:32 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Billionaire Bot",
                Billed: "280.00",
                Markup: 623,
                Time: "2:56:01 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "9",
                Billed: "400.00",
                Markup: 133,
                Time: "5:13:50 PM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
                Paid: true,
                Customer: "Hanukkah Zombie",
                Billed: "385.00",
                Markup: 12,
                Time: "9:38:56 AM"
            },
            {
                Service: "New Row Test",
                Date: "1/25/2015",
                Labor: "2",
                Cost: "250.00",
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
