var request =           require('request'),
    gridData =          require('../dev/scripts/data.js'),
    originalData =      require('../dev/scripts/gridData.js'),
    columns =           originalData.columns,
    gridDataHelpers =   require('./gridDataHelpers.js');

module.exports = function (router) {
    router.post('/grid/updateData', updateGridData);

    router.get('/grid/getpage', getGridPageData);

    router.get('/grid/getInitialDataSource', getInitialGridDataSource)
};

var reqObj = {
    filterType: null,
    filterVal: null,
    filteredOn: null,
    groupedBy: null,
    pageNum: 1,
    pageSize: 25,
    sortedBy: null,
    sortedOn: null
};

var getGridPageData = function _getGridPageData(req, response) {
    request('http://localhost:5500/auto-repairs', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            determinePageData(req.query, JSON.parse(body), function(err, data) {
                response.send(data);
                response.end()
            });
        }
        else {
            response.send();
            response.end();
        }
    });
};

var updateGridData = function _updateGridData(req, res) {
    res.send(req.body);
    res.end();
};

var getInitialGridDataSource = function _getInitialGridDataSource(req, res) {
    res.send(originalData);
    res.end();
};

function determinePageData(requestObj, fullGridData, callback) {
    if (requestObj.filteredOn) {
        if (requestObj.filterVal !== "") {
            var dataType = columns[requestObj.filteredOn].type || "string";
            fullGridData = gridDataHelpers.filterGridData(requestObj.filterType, requestObj.filterVal, requestObj.filteredOn, dataType, fullGridData);
        }
    }

    if (requestObj.groupedBy) {	//Need to group the columns first, before sorting. Sorting grouped columns is going to be a bitch!
        var groupedData = gridDataHelpers.groupColumns(fullGridData, requestObj.groupedBy);
        if (requestObj.sortedOn && requestObj.sortedBy !== "default") {
            var sortedGroup = [];
            for (var group in groupedData.groupings) {
                sortedGroup = sortedGroup.concat(gridDataHelpers.mergeSort(groupedData.groupings[group], requestObj.sortedOn, columns[requestObj.sortedOn].type || "string"));
            }
            if (requestObj.sortedBy === "asc") sortedGroup.reverse();
            limitPageData(requestObj, sortedGroup, callback);
            return;
        }
        limitPageData(requestObj, groupedData.groupedData, callback);
        return;
    }

    if (requestObj.sortedOn && !requestObj.groupedBy) {
        if (requestObj.sortedBy !== "default") {
            fullGridData = gridDataHelpers.mergeSort(fullGridData, requestObj.sortedOn, columns[requestObj.sortedOn].type || "string");
            if (requestObj.sortedBy === "asc") fullGridData.reverse();
        }
        else if (!fullGridData.length) {
            fullGridData = originalData.dataSource.data;
        }
    }
    limitPageData(requestObj, fullGridData, callback);
}

function limitPageData(requestObj, fullGridData, callback) {
    var aggregations = calculateAggregations(fullGridData);
    var returnData;
    if (requestObj.pageSize >= fullGridData.length)
        returnData = fullGridData;
    else {
        returnData = [];
        var startRow = (requestObj.pageNum-1) * (requestObj.pageSize);
        var endRow = fullGridData.length >= (startRow + parseInt(requestObj.pageSize)) ? (startRow + parseInt(requestObj.pageSize)) : fullGridData.length;

        for (var i = startRow; i < endRow; i++){
            returnData.push(fullGridData[i]);
        }
    }

    callback(null, { rowCount: fullGridData.length, data: returnData, aggregations: aggregations });
}

function calculateAggregations(fullGridData) {
    var labor, total = 0, mTotal = 0, max;
    for (var i = 0; i < fullGridData.length; i++) {
        total += parseFloat(fullGridData[i]['Labor']);
        if (!max || parseFloat(fullGridData[i]["Cost"]) > max) max = parseFloat(fullGridData[i]["Cost"]);
        mTotal += parseFloat(fullGridData[i]["Billed"]);
    }
    labor = parseFloat(total/parseFloat(fullGridData.length)).toFixed(2);
    return { Service: fullGridData.length, Labor: labor, Cost: max, Paid: fullGridData.length, Billed: mTotal };
}