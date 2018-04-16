import { gridState } from './gridState';
import { general_util } from './general_util'
import { createFilterTreeFromFilterObject } from './expressionParser';

/**
 * Abstraction for getting grid data so the 'create' function doesn't
 * care whether it was passed in, or if there is a server call to get it.
 * @method getInitialGridData
 * @for grid
 * @private
 * @param {object} dataSource - The dataSource for grid creation
 * @param {number} pageSize - The initial size of the grid's pages
 * @param {function} callback - The callback function
 */
function getInitialGridData(dataSource, pageSize, callback) {
    var requestObj = { pageSize: pageSize, pageNum: dataSource.pageNum };

    if (dataSource && typeof dataSource.data === 'object') {
        dataSource.originalData = dataSource.data;
        limitPageData(requestObj, dataSource.data, gridDataCallback);
    }
    else if (dataSource && typeof dataSource.get === 'function') {
        dataSource.get(requestObj, gridDataCallback);
    }
    else callback(true, {});

    function gridDataCallback(res) {
        if (res) {
            dataSource.originalData = res.data;
            callback(null, res);
        }
        else callback(true, {});
    }
}

//All page request-related functions call here. This sets up the request object and then calls either
//the internal or the supplied GET function to get a new page of grid data.
function preparePageDataGetRequest(id, updateContentCallback) {
    var gridConfig = gridState.getInstance(id);
    gridConfig[id].updating = true;
    var pageNum = gridConfig.pageRequest.pageNum || gridConfig.pageNum;
    var pageSize = gridConfig.pageRequest.pageSize || gridConfig.pageSize;

    var requestObj = {};
    if (gridConfig.sortable) requestObj.sortedOn = gridConfig.sortedOn.length ? gridConfig.sortedOn : [];
    if (gridConfig.filterable) requestObj.filters = gridConfig.filters.filterGroup && gridConfig.filters.filterGroup.length? gridConfig.filters : { conjunct: null, filterGroup: [] };
    if (gridConfig.groupable) requestObj.groupedBy = gridConfig.groupedBy.length? gridConfig.groupedBy : [];

    requestObj.pageSize = pageSize;
    requestObj.pageNum = gridConfig.pageRequest.eventType === 'filter' ? 1 : pageNum;

    gridConfig.grid.find('.grid-content-div').empty();

    callGridEventHandlers(gridState[id].events.pageRequested, gridConfig.grid, { element: gridConfig.grid });
    if (gridConfig.dataSource.get && typeof gridConfig.dataSource.get === general_util.jsTypes.function) gridConfig.dataSource.get(requestObj, getPageDataRequestCallback);
    else {
        if (!gridConfig.alteredData || gridConfig.pageRequest.eventType === 'filter') gridConfig.alteredData = cloneGridData(gridConfig.originalData);
        getPageDataFromDataSource(requestObj, id, getPageDataRequestCallback);
    }

    /**
     * Callback function used for both client-side and server-side
     * page updates.
     * @param {Object} response - The response object containing the new page data as
     * well as the total number of rows in the grid and the size of the current page (i.e. the
     * number of rows)
     */
    function getPageDataRequestCallback(response) {
        if (response) {
            gridConfig.dataSource.data = response.data;
            gridConfig.pageSize = requestObj.pageSize;
            gridConfig.pageNum = requestObj.pageNum;// (requestObj.pageSize * requestObj.pageNum) > response.rowCount ? Math.ceil(response.data.length / requestObj.pageSize) : requestObj.pageNum;
            gridConfig.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.data.length;
            gridConfig.groupedBy = requestObj.groupedBy || [];
            gridConfig.sortedOn = requestObj.sortedOn || [];
            gridConfig.filters = requestObj.filters || {};

            if (typeof gridConfig.dataSource.get === general_util.jsTypes.function) gridConfig.originalData = cloneGridData(response.data);

            if (gridConfig.pageRequest.eventType === 'newGrid' || gridConfig.pageRequest.eventType === 'group')
                setColWidth(gridConfig, gridState[id].grid);

            if (gridConfig.pageRequest.eventType === 'filter') {
                gridConfig.gridAggregations = {};
                if (response.aggregations && gridConfig.dataSource.aggregates) {
                    gridConfig.dataSource.aggregates = gridConfig.dataSource.aggregates.map(function _mapAggregateValues(val) {
                        if (response.aggregations[val.field])
                            return { aggregate: val.aggregate, field: val.field, value: response.aggregations[val.field] };
                        else return { aggregate: val.aggregate, field: val.field, value: null };
                    });
                }
            }

            updateContentCallback(gridConfig);
            if (gridConfig.pageRequest.eventType === 'filter' || gridConfig.pageRequest.eventType === 'pageSize') {
                gridConfig.grid.find('.grid-pager-div').empty();
                createGridPager(gridConfig, gridConfig.grid);
            }
            gridConfig.pageRequest = {};
        }
    }
}

/**
 * Used when saving changes made to grid data. If being used for server-side updates, this
 * function will eventually call the provided function for saving changes to the grid. Otherwise,
 * it will update its internal reference to the grid's data
 * @param {number} id - The id of the grid widget instance
 */
function prepareGridDataUpdateRequest(id) {
    gridState[id].updating = true;
    var requestObj = {
        models: gridState[id].putRequest.models,
        pageNum: gridState[id].putRequest.pageNum
    };

    gridState[id].dataSource.put(requestObj, updatePageDataPutRequestCallback);

    function updatePageDataPutRequestCallback(response) {
        gridState[id].updating = false;
        if (response) {
            gridState[id].grid.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                var index = $(val).parents('tr').index();
                var field = $(val).parents('td').data('field');
                var origIdx = gridState[id].dataMap[index];
                gridState[id].originalData[origIdx][field] = gridState[id].dataSource.data[index][field];
                $(val).remove();
            });
        }
        else {
            gridState[id].grid.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                var cell = $(val).parents('td'),
                    index = cell.parents('tr').index(),
                    field = cell.data('field'),
                    column = gridState[id].columns[gridState[id].columnIndices[field]],
                    text = getFormattedCellText(column, gridState[id].originalData[index][field]) || gridState[id].originalData[index][field];
                cell.text(text);
                $(val).remove();
            });
        }
    }
}

//Default GET function - used for client-side page updates
//As long as there isn't a "remove sort" functionality, and a filter hasn't been applied or removed,
//then I only need to do one of the data manipulations below. Adding or removing a filter complicates things,
//as does removing sorting. For now, I am going to do things the "dumb" way, but I may revisit this later to
//see if there is a faster way to manipulate the data.
//TODO: update this function based both on the multi-sort addition and the comment above
function getPageDataFromDataSource(requestObj, id, callback) {
    var eventType = gridState[id].pageRequest.eventType,
        fullGridData = cloneGridData(gridState[id].alteredData);
    if (!gridState[id].dataMap) gridState[id].dataMap = [];

    if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
        limitPageData(requestObj, cloneGridData(gridState[id].alteredData), callback);
        return;
    }
    if (requestObj.filters && requestObj.filters.filterGroup && requestObj.filters.filterGroup.length) {
        var filtered = createFilterTreeFromFilterObject(requestObj.filters).filterCollection(gridState[id].originalData);
        fullGridData = filtered.filteredData;
        gridState[id].dataMap = filtered.filteredDataMap;
        requestObj.pageNum = 1;
        gridState[id].alteredData = fullGridData;
    }
    if (requestObj.groupedBy && requestObj.groupedBy.length || requestObj.sortedOn.length) {
        var sorted_mapped_Data = sortGridData((requestObj.groupedBy || []).concat(requestObj.sortedOn), fullGridData || cloneGridData(gridState[id].originalData), id),
            sortedData = sorted_mapped_Data.map(function _extractValues(item) {
                return item[0];
            });
        gridState[id].alteredData = sortedData;
        gridState[id].dataMap = sorted_mapped_Data.map(function _extractIndices(item) {
            return item[1];
        });
        limitPageData(requestObj, sortedData, callback);
        return;
    }
    gridState[id].alteredData = fullGridData;
    limitPageData(requestObj, fullGridData, callback);
}

function limitPageData(requestObj, fullGridData, callback) {
    var returnData;
    if (requestObj.pageSize >= fullGridData.length) returnData = fullGridData;
    else {
        var startRow = (requestObj.pageNum-1) * (requestObj.pageSize);
        var endRow = fullGridData.length >= (startRow + parseInt(requestObj.pageSize)) ? (startRow + parseInt(requestObj.pageSize)) : fullGridData.length;
        returnData = fullGridData.slice(startRow, endRow);
    }

    callback({ rowCount: fullGridData.length, data: returnData });
}

export { getInitialGridData, prepareGridDataUpdateRequest, preparePageDataGetRequest };