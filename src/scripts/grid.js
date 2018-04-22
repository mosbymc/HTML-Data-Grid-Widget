import { gridState } from './gridState';
import { createGridInstanceFunctions } from './gridInstanceFunctions';
import { general_util } from './general_util';
import { getInitialGridData } from './pageRequests';
import { dominator } from './dominator';
import { contentGenerator } from './contentGenerator';
import { headerGenerator } from './headerGenerator';
import { pagerGenerator } from './pagerGenerator';
import { callGridEventHandlers, cloneGridData } from './grid_util';

var grid = Object.defineProperties(
    {}, {
        'createGrid': {
            get: function create(gridData, gridElem) {
                if (gridData && general_util.isDomElement(gridElem)) {
                    var gridConfig = initializeConfig(gridData, gridElem),
                        instanceId = gridState.createInstance(gridConfig);

                    gridElem = dominator(gridElem).addClass('grid_elem');
                    //gridElem = $(gridElem).addClass('grid_elem');

                    var wrapperDiv = dominator({ type: 'div', id: 'grid-wrapper' + instanceId, attributes: [ { name: 'grid_id', value: instanceId } ], classes: ['grid-wrapper'] })
                        .appendTo(gridElem);
                    //var wrapperDiv = general_util.createElement({ element: 'div', id: 'grid-wrapper' + instanceId, attributes: [ { name: 'grid_id', value: instanceId } ], classes: ['grid-wrapper'] });
                    //general_util.appendTo(wrapperDiv, gridElem);

                    var headerDiv = dominator({ type: 'div', id: 'grid-header' + instanceId, attributes: [{ name: 'grid_header_id', value: instanceId }], classes: ['grid-header-div']})
                        .appendTo(gridElem);

                    //var headerDiv = general_util.createElement({ element: 'div', id: 'grid-header' + instanceId, attributes: [{ name: 'grid_header_id', value: instanceId }], classes: ['grid-header-div']});
                    //general_util.appendTo(headerDiv, gridElem);

                    dominator({ type: 'div', classes: ['grid-header-wrapper'] }).appendTo(headerDiv);
                    dominator({ type: 'div', id: 'grid-content' + instanceId, attributes: [{ name: 'grid-content-id', value: instanceId }], classes: ['grid-content-div']})
                        .appendTo(wrapperDiv);
                    dominator({ type: 'div', id: 'grid-pager-' + instanceId, attributes: { name: 'grid_pager_id', value: instanceId, classes: ['grid-pager-div'] }}).appendTo(wrapperDiv);


                    //general_util.appendTo(general_util.createElement({ element: 'div', classes: ['grid-header-wrapper'] }), headerDiv);
                    //general_util.appendTo(
                        //general_util.createElement({ element: 'div', id: 'grid-content' + instanceId, attributes: [{ name: 'grid-content-id', value: instanceId }], classes: ['grid-content-div']}), wrapperDiv);
                    //general_util.appendTo(
                        //general_util.createElement({ element: 'div', id: 'grid-pager-' + instanceId, attributes: { name: 'grid_pager_id', value: instanceId, classes: ['grid-pager-div'] }}), wrapperDiv);
                    gridElem.grid = {};
                    //var wrapperDiv = $('<div id="grid-wrapper-' + instanceId + '" data-grid_id="' + instanceId + '" class="grid-wrapper"></div>').appendTo(gridElem);
                    //var headerDiv = $('<div id="grid-header-' + instanceId + '" data-grid_header_id="' + instanceId + '" class="grid-header-div"></div>').appendTo(wrapperDiv);
                    //headerDiv.append('<div class="grid-header-wrapper"></div>');
                    //wrapperDiv.append('<div id="grid-content-' + instanceId + '" data-grid_content_id="' + instanceId + '" class="grid-content-div"></div>');
                    //wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');
                    //wrapperDiv.append('<div id="grid-pager-' + instanceId + '" data-grid_pager_id="' + instanceId + '" class="grid-pager-div"></div>');
                    //gridElem[0].grid = {};

                    createGridInstanceFunctions(gridElem, instanceId);

                    (gridConfig.useValidator === true && window.validator && typeof validator.setAdditionalEvents === general_util.jsTypes.function) ?
                        validator.setAdditionalEvents(['blur', 'change']) : gridConfig.useValidator = false;

                    headerGenerator.createHeaders(gridConfig);
                    getInitialGridData(gridConfig.dataSource, gridConfig.pageSize || 25, function initialGridDataCallback(err, res) {
                        if (!err) {
                            gridConfig.dataSource.data = res.data;
                            gridConfig.dataSource.rowCount = general_util.isInteger(res.rowCount) ? res.rowCount : res.data.length;
                            if (res.aggregations && gridConfig.dataSource.aggregates) {
                                gridConfig.dataSource.aggregates = gridConfig.dataSource.aggregates.map(function _mapAggregateValues(val) {
                                    if (res.aggregations[val.field])
                                        return { aggregate: val.aggregate, field: val.field, value: res.aggregations[val.field] };
                                    else return { aggregate: val.aggregate, field: val.field, value: null };
                                });
                            }
                        }
                        else {
                            gridConfig.dataSource.data = {};
                            gridConfig.dataSource.rowCount = 0;
                        }
                        setOriginalData(gridConfig);

                        var eventObj = { element: gridConfig.grid };
                        callGridEventHandlers(gridConfig.events.beforeDataBind, gridConfig.grid, eventObj);
                        pagerGenerator.createPager(gridConfig, gridElem);
                        contentGenerator.createContent(gridConfig, gridElem);
                        callGridEventHandlers(gridConfig.events.afterDataBind, gridConfig.grid, eventObj);
                    });
                }
                return gridElem[0].grid;
            }
        }
    }
);

/**
 * Initializes an instance of the grid after retrieving the dataSource data.
 * Sets the internal instance of the grid's data, calls to create the footer and content
 * @method initializeGrid
 * @for grid
 * @private
 * @param {object} gridConfig
 * @param {object} gridElem
 */
function initializeConfig(gridConfig, gridElem) {
    var storageData = cloneGridData(gridData);

    storageData.columnIndices = {};
    storageData.columns.forEach(function _createColumnIndices(col, idx) {
        storageData.columnIndices[col.field] = idx;
    });
    storageData.useFormatter = gridConfig.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === general_util.jsTypes.function;

    storageData.events = {
        beforeCellEdit: typeof storageData.beforeCellEdit === 'object' && storageData.beforeCellEdit.constructor === Array ? storageData.beforeCellEdit : [],
        cellEditChange: typeof storageData.cellEditChange === 'object' && storageData.cellEditChange.constructor === Array ? storageData.cellEditChange : [],
        afterCellEdit: typeof storageData.afterCellEdit === 'object' && storageData.afterCellEdit.constructor === Array ? storageData.afterCellEdit : [],
        pageRequested: typeof storageData.pageRequested === 'object' && storageData.pageRequested.constructor === Array ? storageData.pageRequested : [],
        beforeDataBind: typeof storageData.beforeDataBind === 'object' && storageData.beforeDataBind.constructor === Array ? storageData.beforeDataBind : [],
        afterDataBind: typeof storageData.afterDataBind === 'object' && storageData.afterDataBind.constructor === Array ? storageData.afterDataBind : [],
        columnReorder: typeof storageData.columnReorder === 'object' && storageData.columnReorder.constructor === Array ? storageData.columnReorder : []
    };

    delete storageData.beforeCellEdit;
    delete storageData.cellEditChange;
    delete storageData.afterCellEdit;
    delete storageData.pageRequested;
    delete storageData.beforeDataBind;
    delete storageData.afterDataBind;
    delete storageData.columnReorder;

    storageData.pageNum = gridConfig.pageNum || 1;
    storageData.pageSize = gridConfig.pageSize || 25;
    storageData.grid = gridElem;
    storageData.currentEdit = {};
    storageData.pageRequest = {};
    storageData.putRequest = {};
    storageData.resizing = false;
    storageData.sortedOn = [];
    storageData.basicFilters = { conjunct: 'and', filterGroup: null };
    storageData.advancedFilters = {};
    storageData.filters = {};
    storageData.groupedBy = [];
    storageData.gridAggregations = {};

    storageData.advancedFiltering = storageData.filterable ? storageData.advancedFiltering : false;
    if (typeof storageData.advancedFiltering === general_util.jsTypes.object) {
        storageData.advancedFiltering.groupsCount = general_util.isInteger(storageData.advancedFiltering.groupsCount) ? storageData.advancedFiltering.groupsCount : 5;
        storageData.advancedFiltering.filtersCount = general_util.isInteger(storageData.advancedFiltering.filtersCount) ? storageData.advancedFiltering.filtersCount : 10;
    }

    storageData.parentGridId = gridConfig.parentGridId != null ? gridConfig.parentGridId : null;
    if (storageData.dataSource.rowCount == null) storageData.dataSource.rowCount = gridConfig.dataSource.data.length;

    return storageData;
}

function setOriginalData(gridConfig) {
    gridConfig.originalData = cloneGridData(gridConfig.dataSource.originalData);
    delete gridConfig.dataSource.originalData;
    return gridConfig;
}