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
                //response.send(null);
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
    //res.send(false);
    res.end();
};

var getInitialGridDataSource = function _getInitialGridDataSource(req, res) {
    res.send(originalData);
    res.end();
};

function determinePageData(requestObj, fullGridData, callback) {
    /*if (requestObj.filteredOn) {
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
    limitPageData(requestObj, fullGridData, callback);*/

    //TODO: I can make this much smarter and faster by checking to see if a filter has been added or removed. If added, just take the existing data
    //TODO: and filter it again. If removed, need to take the original data and apply all remaining filters.
    if (requestObj.filteredOn && requestObj.filteredOn.length) {
        for (var i = 0; i <  requestObj.filteredOn.length; i++) {
            var dataType = columns[requestObj.filteredOn[i].field].type || 'string';
            fullGridData = gridDataHelpers.filterGridData(requestObj.filteredOn[i].filterType, requestObj.filteredOn[i].value, requestObj.filteredOn[i].field, dataType, fullGridData);
        }
    }

    if (requestObj.groupedBy) {
        var groupedData = gridDataHelpers.sortGridData([{ field: requestObj.groupedBy, sortDirection: requestObj.groupSortDirection }], fullGridData, columns);
        if (requestObj.sortedOn && requestObj.sortedOn.length) {
            var sortedGroup = [];
            for (var group in groupedData.groupings) {
                sortedGroup = sortedGroup.concat(gridDataHelpers.sortGridData(requestObj.sortedOn, groupedData.groupings[group], columns));
            }
            limitPageData(requestObj, sortedGroup, callback);
            return;
        }
        limitPageData(requestObj, groupedData, callback);
        return;
    }

    if (requestObj.sortedOn && requestObj.sortedOn.length && !requestObj.groupedBy)
        fullGridData = gridDataHelpers.sortGridData(requestObj.sortedOn, fullGridData, columns);
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