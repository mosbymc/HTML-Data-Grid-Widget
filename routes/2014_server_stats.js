var stats2014 = {
    height: 250,
    useValidator: true,
    useFormatter: true,
    sortable: true,
    reorderable: true,
    resizable: true,
    groupable: true,
    groupAggregates: true,
    selectable: 'multi-row',
    excelExport: true,
    columnToggle: true,
    advancedFiltering: {
        groupsCount: 4,
        filtersCount: 8
    },
    pagingOptions: [25, 50, 100],
    //menu: ['filter', 'excel', 'save', 'sort', 'selection'],
    //pageSize: 50,
    rows: {
        alternateRows: ["testAlt"],
        all: ["testAll"]
    },
    columns: [
        {
            field: 'FirstName',
            title: 'First Name',
            filterable: true,
            editable: true,
            width: 125,
            attributes: {
                cellClasses: ["custom-class", "anotherOne"],
                style: "font: bold;",
                headerClasses: ["custom-class"]
            }
        },
        {
            field: 'LastName',
            title: 'Last Name',
            type: "string",
            width: 110
        },
        {
            field: 'Team',
            type: "string",
            editable: true,
            width: 100,
        },
        {
            field: 'Position',
            type: "string",
            width: 75
        },
        {
            field: 'GamesPlayed',
            title: 'Games Played',
            type: "number",
            filterable: true,
            editable: true,
            min: 1,
            max: 10000,
            width: 150
        },
        {
            field: 'AtBat',
            title: 'At Bat',
            type: "number",
            editable: true,
            width: 80
        },
        {
            field: 'Runs',
            filterable: false,
            type: "number",
            width: 80,
            editable: true,
        },
        {
            field: 'Hits',
            filterable: true,
            type: "number",
            width: 80,
            editable: true
        },
        {
            field: '2B',
            filterable: true,
            type: "number",
            width: 100,
            editable: true
        },
        {
            field: '3B',
            type: "number",
            editable: true,
            filterable: true,
            width: 100
        },
        {
            field: 'HomeRuns',
            title: 'Home Runs',
            type: 'number',
            width: 110
        },
        {
            field: 'RBI',
            type: 'number',
            width: 50
        },
        {
            field: 'Walks',
            type: 'number',
            width: 80
        },
        {
            field: 'StrikeOuts',
            title: 'Strike Outs',
            type: 'number',
            width: 100
        },
        {
            field: 'StolenBases',
            title: 'Stolen Bases',
            type: 'number',
            width: 125
        },
        {
            field: 'BattingAverage',
            title: 'Batting Average',
            type: 'number',
            width: 140
        }
    ],
    dataSource: {
        get: function _getGridData(req, cb) {
            $.ajax({
                type: 'GET',
                url: '../grid/get_2014_stats',
                data: req,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            })
                .done(function pageDataSuccessCallback(data) {
                    cb(data);
                })
                .fail(function pageDataFailureCallback() {
                    cb();
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

module.exports = stats2014;