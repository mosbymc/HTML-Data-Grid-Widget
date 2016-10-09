var request =           require('request'),
    gridData =          require('../dev/scripts/data.js'),
    originalData =      require('./grid-server-data'),
    drillDownData =     require('./drillDownConfig-server'),
    columns =           originalData.columns,
    drillDownColumns =  drillDownData.columns,
    gridDataHelpers =   require('./gridDataHelpers.js');

module.exports = function (router) {
    router.post('/grid/updateData', updateGridData);

    router.get('/grid/getpage', getGridPageData);

    router.get('/grid/getInitialDataSource', getInitialGridDataSource);

    router.get('/grid/drilldown/getpage', getDrillDownData);
};

var reqObj = {
    filters: null,
    groupedBy: null,
    pageNum: 1,
    pageSize: 25,
    sortedBy: null,
    sortedOn: null
};

var getGridPageData = function _getGridPageData(req, response) {
    request('http://localhost:5500/auto-repairs', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            determinePageData(req.query, JSON.parse(body), columns, function(err, data) {
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

var getDrillDownData = function _getDrillDownData(req, response) {
    request('http://localhost:5500/auto-repair-info', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            var childData = findDataByParentId(JSON.parse(body), req.query.parentId);
            determinePageData(req.query, childData, drillDownColumns, function(err, data) {
                response.send(data);
                response.end();
            });
        }
        else {
            response.send();
            response.end();
        }
    });
};

function determinePageData(requestObj, fullGridData, columns, callback) {
    //TODO: I can make this much smarter and faster by checking to see if a filter has been added or removed. If added, just take the existing data
    //TODO: and filter it again. If removed, need to take the original data and apply all remaining filters.
    if (requestObj.filters && requestObj.filters.filterGroup && requestObj.filters.filterGroup.length) {
        fullGridData = gridDataHelpers.expressionParser.createFilterTreeFromFilterObject(requestObj.filters).filterCollection(fullGridData);
    }
    //TODO: figure out why node or jquery isn't preserving the empty [] sent from grid...
    if ((requestObj.groupedBy && requestObj.groupedBy.length) || (requestObj.sortedOn && requestObj.sortedOn.length)) {
        var groupSort;
        if ((requestObj.groupedBy && requestObj.groupedBy.length) && (requestObj.sortedOn && requestObj.sortedOn.length)) groupSort = requestObj.groupedBy.concat(requestObj.sortedOn);
        else if (requestObj.groupedBy && requestObj.groupedBy.length) groupSort = requestObj.groupedBy;
        else groupSort = requestObj.sortedOn;
        var sortedData = gridDataHelpers.sortGridData(groupSort, fullGridData, columns);
        limitPageData(requestObj, sortedData, callback);
        return;
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

function findDataByParentId(collection, parentId) {
    return collection.filter(function findChildData(data) {
        return data.AutoRepairId === parentId;
    });
}