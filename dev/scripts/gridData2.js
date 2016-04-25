var gridData = {
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
        Phone: {
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
        get: function _getGridData(req, cb) {
            $.ajax({
                type: 'GET',
                url: '../grid/getpage',
                data: req,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function _success(json) {
                    var tmp = json;
                    cb(json);
                }
            });
        },
        put: function _updateGridData(req, cb) {
            $.ajax({
                type: 'POST',
                url: '../grid/updateData',
                data: JSON.stringify(req),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function _success(json) {
                    var tmp = json;
                    cb(json);
                }
            });
        }
    }
};