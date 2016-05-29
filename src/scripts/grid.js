/*
 The MIT License (MIT)
 Copyright © 2014 <copyright holders>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*
 TODO:
 - Need to reattach event listeners for sorting and filtering when columns are reordered. - DONE
 - Need to reorder summary row on column reorder - DONE
 - Remove click handlers on in-cell edit to stop event propagation and check the event target/currentTarget - DONE
 - On cell edit/select, need to make sure that the prefix/postfix is applied to the value in the cell - DONE
 - Work on resizing columns - DONE
 - Need to figure out how to properly display the last cell in the header row - DONE
 - Figure out column sizing - DONE
 - Specify a min-width for column re-sizing, beyond which the cell cannot be made smaller - DONE
 - Add loading icon (fa fa-spinner fa-pulse fa-2x) - DONE
 - Fix editable/selectable cells with client-side paging - DONE
 - Fix column sizing issue - DONE
 - Fix paging + row counter - DONE
 - Add max and min for sum row - DONE
 - Refactor class names and ids + storage attr names - DONE
 - Stop page from jumping when links are clicked - DONE
 - Make sure reordered columns don't swap sizes - DONE
 - Prevent horizontal scroll when sorting/filtering - DONE
 - Make sure when removing filter that it remain sorted - DONE
 - Figure out loader placement - DONE
 - Fix column resizing after column reordering (resize, then reorder, then resize) - DONE
 - Fix saving the new value to work on empty string/undefined - DONE
 - Should probably clone grid data on create. Maintain a separate copy of data from what Devs have access to - DONE
 - Need to create grid content from "create" function, not headers function - DONE
 - Add a "rowCount" field to the dateSource for server-side actions - DONE
 - Fix page size changing to stay on correct page, and display the correct rows - DONE
 - Fix filtering on empty string - DONE
 - Fix "Delete Changes" when a new value has been selected twice before saving - DONE
 - Figure out why "insertKey" isn't working on highlights - DONE
 - Add ability to alternate row colors - DONE
 - Fix resizing on grouped rows - DONE
 - Add "undo" filter/sort/group ability in toolbar - DONE
 - During paging, grouped and/or sorted data is being un-grouped (filtered data too likely) - DONE
 - Fix paging on filtered data - DONE
 - Redo summary row so that it works with server-side paging as well - DONE
 - Fix reordering on grouped grid - DONE
 - See about only giving the dataSource.data the needed data for the current grid page - DONE
 - Add a template field for column data - DONE
 - Fix NaN/Undefined rows on filter/sorting - DONE
 - Add a field for custom classes to be applied to cells/rows - DONE
 - Change class setters for columns/rows to "attributes", include style attr - DONE
 - Redo aggregates on filter - DONE
 - Fire event on cell edit/select - DONE
 - Disable all buttons/inputs on grid when waiting for page content - DONE
 - Add getters for page data, selected row, column, cell - DONE
 - Add 'destroy' function to remove dom elements and events - DONE
 - Figure out how to get correct row index of 'originalData' when updating cell data on save - DONE
 - Add function to programatically update grid display data; dirty flag - DONE
 - Implement true aggregates + fix naming of row grouping - DONE
 - Check aggregations for existence of column before trying to build row's aggregates - DONE
 - Fix filtering/sorting on time - DONE
 - Rework setting column widths - DONE
 - Fix sorting chevron to not display on top of filter icon when column name is same size as column - DONE
 - Examine headers and fix DOM structure - DONE
 - Remove unused regex values & update 'inputTypes' to use validateCharacter function - DONE
 - Ensure all types are implemented across the board (number, time, date, boolean, string)
 - Add server paging + data saving/filtering/sorting
 - Add "transform" function to be called for the cell data in a column
 - View http://docs.telerik.com/kendo-ui/api/javascript/ui/grid for events/methods/properties
 - Prevent filtering on non-safe values/add character validation on input to filtering divs
 - Update API event methods to work with array and namespace
 - Add integration tests if possible
 - Add type checking - passed in grid data
 - Thoroughly test date & time regex usages
 - Find out what the hell 'groupingStatusChanged' is used for.
 - Update sorting to handle multi-sort
 */
/*exported grid*/
/**
 * grid module - object for creating and manipulating grid widgets
 * @class grid
 * @function _grid
 * @param {object} $ - jQuery alias
 */
var grid = (function _grid($) {
    'use strict';
    var dataTypes, events, storage, aggregates;

    /**
     * Exposed on the grid module. Called to create a grid widget.
     * @function create
     * @static
     * @param {object} gridData - The dataSource object needed to initialize the grid
     * @param {object} gridElem - The DOM element that should be used to create the grid widget
     */
    function create(gridData, gridElem) {
        if (gridData && isDomElement(gridElem)) {
            var id = storage.count;
            if (id > 0) {   //test to check if previously created grids still exist
                var tmp = id - 1;
                while (tmp > -1) {  //iterate through all previous grids
                    if (storage.grids[tmp] != null && !$('body').find('#' + storage.grids[tmp].grid[0].id).length)     //if not found in the body
                        delete storage.grids[tmp];      //remove the data from storage
                    tmp--;
                }
            }
            gridElem = $(gridElem);
            var wrapperDiv = $('<div id="grid-wrapper-' + id + '" data-grid_id="' + id + '" class=grid-wrapper></div>').appendTo(gridElem);
            var headerDiv = $('<div id="grid-header-' + id + '" data-grid_header_id="' + id + '" class=grid-header-div></div>').appendTo(wrapperDiv);
            headerDiv.append('<div class=grid-header-wrapper></div>');
            wrapperDiv.append('<div id="grid-content-' + id + '" data-grid_content_id="' + id + '" class=grid-content-div></div>');
            wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');

            storage.grids[id] = {};
            gridElem[0].grid = {};

            createGridInstanceMethods(gridElem, id);

            (gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === 'function') ? validator.setAdditionalEvents(['blur', 'change']) : gridData.useValidator = false;

            //if (gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === 'function') validator.setAdditionalEvents(['blur', 'change']);
            //else gridData.useValidator = false;

            gridData.useFormatter = gridData.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === 'function';

            if (gridData.constructor === Array) createGridColumnsFromArray(gridData, gridElem);
            else {
                createGridHeaders(gridData, gridElem);
                getInitialGridData(gridData.dataSource, function initialGridDataCallback(err, res) {
                    if (!err) {
                        gridData.dataSource.data = res.data;
                        gridData.dataSource.rowCount = res.rowCount || 25;
                        if (res.aggregations) {
                            for (var col in gridData.summaryRow) {
                                if (res.aggregations[col])
                                    gridData.summaryRow[col].value = res.aggregations[col];
                            }
                        }
                    }
                    else {
                        gridData.dataSource.data = {};
                        gridData.dataSource.rowCount = 0;
                    }
                    initializeGrid(id, gridData, gridElem);
                });
            }
        }
    }

    /**
     * Adds publicly accessible methods to the DOM element that was
     * passed to the 'create' function to initialize the grid widget
     * @method createGridInstanceMethods
     * @private
     * @param {object} gridElem - The DOM element that should be used to create the grid widget
     * @param {integer} gridId - The id of this grid's instance
     */
    function createGridInstanceMethods(gridElem, gridId) {
        Object.defineProperty(
            gridElem[0].grid,
            'activeCellData',
            {
                /**
                 * Returns the data from whichever grid cell is active
                 * @method _getActiveCellData
                 * @for Grid DOM element
                 * @protected
                 * @readonly
                 * @default grid cell's .text() value
                 * @type string
                 * @returns {string|null} - cell data
                 */
                get: function _getActiveCellData() {
                    var cell = gridElem.find('.active-cell');
                    if (!cell.length)
                        return null;
                    if (cell[0].type === 'checkbox')
                        return cell[0].checked;
                    return cell.val();
                }
            });

        Object.defineProperty(
            gridElem[0].grid,
            'selectedRow',
            {
                /**
                 * Returns the row index from whichever grid cell is active
                 * @method _getSelectedRow
                 * @for Grid DOM element
                 * @protected
                 * @readonly
                 * @default Active cell's row index
                 * @type integer
                 * @returns {integer} - cell row index
                 */
                get: function _getSelectedRow() {
                    var cell = gridElem.find('.active-cell');
                    if (!cell.length)
                        return null;
                    return cell.parents('tr').index();
                }
            });

        Object.defineProperty(
            gridElem[0].grid,
            'selectedColumn',
            {
                /**
                 * Returns the selected column and column index of whichever
                 * cell is currently active
                 * @method _getSelectedColumn
                 * @for Grid DOM element
                 * @protected
                 * @readonly
                 * @default { field: 'field name', columnIndex: 'column index' }
                 * @type object
                 * @returns {Object|null} - {field: 'grid column name', columnIndex: 'column index'}
                 */
                get: function _getSelectedColumn() {
                    var cell = gridElem.find('.active-cell');
                    if (!cell.length)
                        return null;
                    var field = cell.parents('td').data('field');
                    var colIndex = cell.parents('.grid-wrapper').find('.grid-header-wrapper').find('.grid-headerRow').children('[data-field="' + field + '"]').data('index');
                    return { field: field, columnIndex: colIndex };
                }
            });

        Object.defineProperties(
            gridElem[0].grid, {
                'bindEvents': {
                    /**
                     * Binds event handlers to events
                     * @method _bindGridEventss
                     * @for Grid DOM element
                     * @protected
                     * @param {string} evt - a string representing an event that the grid can cause
                     * @param {*} funcs - the event handler
                     * @returns {boolean} - indicates that the provided function(s) were or were not added as event listeners.
                     */
                    value: function _bindGridEvents(evt, funcs) {
                        if (typeof funcs !== 'function' && funcs.constructor !== Array) return false;
                        if (typeof funcs === 'function') funcs = [funcs];
                        if (~events.indexOf(evt)) {
                            storage.grids[gridId].events[evt].concat(funcs);
                            return true;
                        }
                        return false;
                    },
                    writable: false,
                    configurable: false
                },
                'unbindEvents': {
                    /**
                     * Unbinds an event handler from the specified event
                     * @method _unbindEvents
                     * @for Grid DOM element
                     * @protected
                     * @param {string} evt - a string representing an event that the grid can cause
                     * @param {*} funcs - the function object, or array of function objects to unbind
                     * @returns {boolean} - indicates that the provided function(s) were or were not unbound
                     */
                    value: function _unbindEvents(evt, funcs) {
                        if (~events.indexOf(evt) && (typeof funcs === 'function' || funcs.constructor === Array)) {
                            if (typeof funcs === 'function') funcs = [funcs];
                            var tmpEvts = [];
                            for (var i = 0; i < storage.grids[gridId].events[evt].length; i++) {
                                for (var j = 0; j < funcs.length; j++) {
                                    if (storage.grids[gridId].events[evt][i] !== funcs[j])
                                        tmpEvts.push(storage.grids[gridId].events[evt][i]);
                                }
                            }
                            storage.grids[gridId].events[evt] = tmpEvts;
                            return true;
                        }
                        return false;
                    },
                    writable: false,
                    configurable: false
                },
                'removeAllEventHandlers': {
                    /**
                     * Removes all registered event handlers from grid events
                     * @method _removeAllEventHandlers
                     * @for Grid DOM element
                     * @protected
                     */
                    value: function _removeAllEventHandlers() {
                        for (var i = 0; i < events.length; i++) {
                            storage.grids[gridId].events[events[i]] = [];
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'getHandledEvents': {
                    /**
                     * Returns all events for which a handler has been registered
                     * @method _getHandledEvents
                     * @for Grid DOM element
                     * @protected
                     * @readonly
                     * @default Array of grid events that currently have registered a handler
                     * @type Array
                     * @returns {Array} - The list of events that currently have a handler
                     */
                    value: function _getHandledEvents() {
                        var evts = [];
                        for (var i = 0; i < events.length; i++) {
                            if (storage.grids[gridId].events[events[i]].length)
                                evts.push(events[i]);
                        }
                        return evts;
                    },
                    writable: false,
                    configurable: false
                },
                'getAvailableEvents': {
                    /**
                     * Returns a list of the events that the grid can cause
                     * @method _getAvailableEvents
                     * @for Grid DOM element
                     * @protected
                     * @readonly
                     * @default Array of available grid events to listen for
                     * @type Array
                     * @returns {Array} - The list of all events that a handler can be registered for
                     */
                    value: function _getAvailableEvents() {
                        return events;
                    },
                    writable: false,
                    configurable: false
                },
                'getAggregates': {
                    /**
                     * Returns the aggregations for all columns
                     * @method _getAggregates
                     * @for Grid DOM element
                     * @protected
                     * @readonly
                     * @default aggregates object
                     * @type object
                     * @returns {Object} - The aggregations that are currently in use for this page of the grid
                     */
                    value: function _getAggregates() {
                        return storage.grids[gridId].summaryRow;
                    },
                    writable: false,
                    configurable: false
                },
                'getCurrentPageData': {
                    /**
                     * Returns the grid's page data.
                     * @method _getCurrentPageData
                     * @for Grid DOM element
                     * @protected
                     * @readOnly
                     * @default dataSource.data
                     * @type Array
                     * @param {int} index - The index of the grid page to return the data for.
                     * @returns {Array} - An array with either all grid page data, or a single index's data if a
                     * valid index was passed to the function
                     */
                    value: function _getCurrentPageData(index) {
                        var rows = [],
                            result = [],
                            tmpRowModel,
                            validRow;
                        if (typeof index === 'number' && index > -1 && index <= storage.grids[gridId].dataSource.data.length) {
                            validRow = findValidRows(index);
                            if (validRow) rows.push(validRow);
                        }
                        else {
                            for (var i = 0; i < storage.grids[gridId].pageSize; i++) {
                                validRow = findValidRows(i);
                                if (validRow) rows.push(validRow);
                            }
                        }

                        for (var j = 0; j < rows.length; j++) {
                            tmpRowModel = {};
                            var cells = rows[j].find('td');
                            for (var k = 0; k < cells.length; k++) {
                                tmpRowModel[$(cells[k]).data('field')] = $(cells[k]).text();
                            }
                            result.push(tmpRowModel);
                        }
                        return result;

                        function findValidRows(index) {
                            var counter = 0;
                            var row = null;
                            storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                                if ($(this).hasClass('grouped_row_header'))
                                    return true;
                                if (counter === index) {
                                    row = $(this);
                                    return false;
                                }
                                counter++;
                            });
                            return row;
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'getCurrentDataSourceData': {
                    /**
                     * Returns the grid's dataSource data
                     * @method _getCurrentDataSourceData
                     * @for Grid DOM element
                     * @protected
                     * @param {int} index - The index of the dataSource.data to return the data for.
                     * @returns {Array} - An array with either all grid page data, or a single index's data if a
                     * valid index was passed to the function
                     */
                    value: function _getCurrentDataSourceData(index) {
                        var i;
                        if (typeof index === 'number' && index > -1 && index <= storage.grids[gridId].dataSource.data.length) {
                            var val = cloneGridData([].concat(storage.grids[gridId].dataSource.data[index]));
                            delete val[0]._initialRowIndex;
                            return val;
                        }
                        else {
                            var gd = cloneGridData(storage.grids[gridId].dataSource.data);
                            for (i = 0; i < gd.length; i++) {
                                delete gd[i]._initialRowIndex;
                            }
                            return gd;
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updatePageData': {
                    /**
                     * Updates the grid's page data; will also update the dataSource
                     * @method _updatePageData
                     * @for Grid DOM element
                     * @protected
                     * @param {object} data
                     */
                    value: function _updatePageData(data) {
                        if (data != null && typeof data === 'object' && data.constructor === Array) {
                            storage.grids[gridId].dataSource.data = data;
                            storage.grids[gridId].pageSize = data.length;
                            storage.grids[gridId].dataSource.rowCount = data.length;
                            storage.grids[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(storage.grids[gridId], storage.grids[gridId].grid);
                            storage.grids[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(storage.grids[gridId], storage.grids[gridId].grid);
                            buildHeaderAggregations(storage.grids[gridId], gridId);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updateRowData': {
                    /**
                     * Updates the specified grid's row's data via the .index property
                     * @method _updateRowData
                     * @for Grid DOM element
                     * @protected
                     * @param {object} rowData
                     */
                    value: function _updateRowData(rowData) {
                        var appliedUpdate = false;
                        if (!rowData)
                            return;
                        if (rowData.constructor === Array) {
                            for (var i = 0; i < rowData.length; i++) {
                                if (typeof rowData[i].index !== 'number' || rowData[i].index >= storage.grids[gridId].dataSource.data.length)
                                    continue;
                                storage.grids[gridId].dataSource.data[rowData[i].index] = rowData[i].data;
                                appliedUpdate = true;
                            }
                        }
                        else if (typeof rowData.index === 'number') {
                            storage.grids[gridId].dataSource.data[rowData.index] = rowData.data;
                            appliedUpdate = true;
                        }

                        if (appliedUpdate) {
                            storage.grids[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(storage.grids[gridId], storage.grids[gridId].grid);
                            storage.grids[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(storage.grids[gridId], storage.grids[gridId].grid);
                            buildHeaderAggregations(storage.grids[gridId], gridId);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updateCellData': {
                    /**
                     * Updates the specified grid's cell's data via the .index and .field properties
                     * @method _updateCellData
                     * @for Grid DOM element
                     * @protected
                     * @param {object} cellData
                     * @param {boolean} setAsDirty
                     */
                    value: function _updateCellData(cellData, setAsDirty) {
                        if (!cellData) return;
                        if (cellData.constructor === Array) {
                            cellData.forEach(function cellIterationCallback(cell) {
                                applyUpdate(cell, setAsDirty);
                            });
                        }
                        else applyUpdate(cellData, setAsDirty);

                        function applyUpdate(cell, setAsDirty) {
                            if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > storage.grids[gridId].dataSource.data.length)
                                return;
                            if (storage.grids[gridId].columns[cell.field]) {
                                var dataType = storage.grids[gridId].columns[cell.field].type;
                                if (!dataType)
                                    dataType = 'string';
                                if (dataType !== 'time' && dataType !== 'date' && dataType !== 'datetime') {
                                    if (typeof cell.value !== dataType)
                                        return;
                                }
                                else {
                                    var re = new RegExp(dataTypes[dataType]);
                                    if (!re.test(cell.value)) return;
                                }
                                storage.grids[gridId].dataSource.data[cell.index][cell.field] = cell.value;
                                var tableCell;
                                if (storage.grids[gridId].groupedBy) {
                                    var counter = 0;
                                    storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                                        if ($(this).hasClass('grouped_row_header'))
                                            return true;
                                        if (counter === cell.index) {
                                            tableCell = $(this).find('[data-field="' + cell.field + '"]');
                                            return false;
                                        }
                                        counter++;
                                    });
                                }
                                else
                                    tableCell = storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
                                var text = getFormattedCellText(gridId, cell.field, cell.value);
                                tableCell.text(text);
                                if (setAsDirty) tableCell.prepend('<span class="dirty"></span>');
                            }
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'destroy': {
                    /**
                     * Destroys the grid widget - includes the dataSource and the DOM element
                     * @method _destroy
                     * @for Grid DOM element
                     * @protected
                     */
                    value: function _destroy() {
                        findChildren(storage.grids[gridId].grid.children());
                        delete storage.grids[gridId];

                        function findChildren(nodes) {
                            for (var i = 0; i < nodes.length; i++) {
                                var child = $(nodes[i]);
                                while (child.children().length)
                                    findChildren(child.children());
                                child.off();
                                child.remove();
                            }
                        }
                    },
                    writable: false,
                    configurable: false
                }
            });

        var keys = Object.getOwnPropertyNames(gridElem[0].grid);
        for (var i = 0; i < keys.length; i++) {
            Object.preventExtensions(gridElem[0].grid[keys[i]]);
        }
    }

    /**
     * Abstraction for getting grid data so the 'create' function doesn't
     * care whether it was passed in, or if there is a server call to get it.
     * @method getInitialGridData
     * @for grid
     * @private
     * @param {object} dataSource - The dataSource for grid creation
     * @param {function} callback - The callback function
     */
    function getInitialGridData(dataSource, callback) {
        if (dataSource && typeof dataSource.data === 'object')
            callback(null, { data: dataSource.data, rowCount: dataSource.rowCount });
        else if (typeof dataSource.get == 'function') {
            dataSource.get({
                pageSize: 25,
                pageNum: 1
            }, function gridDataCallback(data) {
                if (data)
                    callback(null, data);
                else
                    callback(true, {});
            });
        }
        else
            callback(true, {});
    }

    /**
     * Initializes an instance of the grid after retrieving the dataSource data.
     * Sets the internal instance of the grid's data, calls to create the footer and content
     * @method initializeGrid
     * @for grid
     * @private
     * @param {integer} id
     * @param {object} gridData
     * @param {object} gridElem
     */
    function initializeGrid(id, gridData, gridElem) {
        var storageData = cloneGridData(gridData);
        storageData.events = {
            beforeCellEdit: typeof storageData.beforeCellEdit === 'object' && storageData.beforeCellEdit.constructor === Array ? storageData.beforeCellEdit : [],
            cellEditChange: typeof storageData.cellEditChange === 'object' && storageData.cellEditChange.constructor === Array ? storageData.cellEditChange : [],
            afterCellEdit: typeof storageData.afterCellEdit === 'object' && storageData.afterCellEdit.constructor === Array ? storageData.afterCellEdit : [],
            pageRequested: typeof storageData.pageRequested === 'object' && storageData.pageRequested.constructor === Array ? storageData.pageRequested : [],
            beforeDataBind: typeof storageData.beforeDataBind === 'object' && storageData.beforeDataBind.constructor === Array ? storageData.beforeDataBind : [],
            afterDataBind: typeof storageData.afterDataBind === 'object' && storageData.afterDataBind.constructor === Array ? storageData.afterDataBind : [],
            columnReorder: typeof storageData.columnReorder === 'object' && storageData.columnReorder.constructor === Array ? storageData.columnReorder : []
        };

        for (var event in storageData.events) {
            if (storageData.events[event].length) {
                storageData.events[event] = storageData.events[event].map(function mapEventsCallback(fn) {
                    if (typeof fn == 'function') return fn;
                });
            }
        }

        delete storageData.beforeCellEdit;
        delete storageData.cellEditChange;
        delete storageData.afterCellEdit;
        delete storageData.pageRequested;
        delete storageData.beforeDataBind;
        delete storageData.afterDataBind;
        delete storageData.columnReorder;

        storageData.originalData = cloneGridData(gridData.dataSource.data);
        storageData.pageNum = 1;
        storageData.pageSize = gridData.pageSize || 25;
        storageData.grid = gridElem;
        storageData.currentEdit = {};
        storageData.pageRequest = {};
        storageData.putRequest = {};
        storageData.resizing = false;
        storageData.sortedOn = [];
        if (!storageData.dataSource.rowCount) storageData.dataSource.rowCount = gridData.dataSource.data.length;

        var eventObj = { element: storageData.grid };
        callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

        storage.grids[id] = storageData;

        if (gridData.summaryRow && gridData.summaryRow.positionAt === 'top') buildHeaderAggregations(gridData, id);

        createGridFooter(gridData, gridElem);
        createGridContent(gridData, gridElem);

        callGridEventHandlers(storageData.events.afterDataBind, storageData.grid, eventObj);
    }

    function addNewColumns(newData, gridElem) {
        var oldGrid = $(gridElem).find('.grid-wrapper');
        var id = oldGrid.data('grid_id');
        var oldData = storage.grids[id].data;

        for (var i = 0; i < newData.length; i++) {
            for (var col in newData[i]) {
                if (!oldData.data[i][col]) {
                    oldData.data[i][col] = newData[i][col];
                }
                if (!oldData.columns[col]) {
                    oldData.columns[col] = {
                        field: col,
                        title: col,
                        index: Object.keys(oldData.columns).length
                    };
                }
            }
        }

        gridElem.removeChild(oldGrid);
        create(oldData, gridElem);
    }

    /**
     * Creates the grid's headers given the column metadata passed to the create function
     * @method createGridHeaders
     * @for grid
     * @private
     * @param {object} gridData
     * @param {object} gridElem
     */
    function createGridHeaders(gridData, gridElem) {
        var gridHeader = gridElem.find('.grid-header-div');
        var gridHeadWrap = gridHeader.find('.grid-header-wrapper');
        var headerTable = $('<table></table>').appendTo(gridHeadWrap);
        headerTable.css('width','auto');
        var colgroup = $('<colgroup></colgroup>').appendTo(headerTable);
        var headerTHead = $('<thead></thead>').appendTo(headerTable);
        var headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead);
        var index = 0;

        if (gridData.groupedBy && gridData.groupedBy !== 'none') {
            colgroup.append('<col class="group_col"/>');
            headerRow.append('<th class="grid-header-cell grouped_cell"></th>');
        }

        for (var col in gridData.columns) {
            if (typeof gridData.columns[col] !== 'object')
                continue;
            $('<col/>').appendTo(colgroup);
            var text = gridData.columns[col].title || col;
            var th = $('<th id="' + col + '_grid_id_' + gridHeader.data('grid_header_id') + '" data-field="' + col + '" data-index="' + index + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof gridData.columns[col].attributes === 'object' && gridData.columns[col].attributes.headerClasses && gridData.columns[col].attributes.headerClasses.constructor ===  Array) {
                for (var i = 0; i < gridData.columns[col].attributes.headerClasses.length; i++) {
                    th.addClass(gridData.columns[col].attributes.headerClasses[i]);
                }
            }

            if (gridData.reorderable === true && (typeof gridData.columns[col].reorderable === 'undefined' || gridData.columns[col].reorderable === true)) {
                th.prop('draggable', true);
                setDragAndDropListeners(th);
            }
            if (gridData.sortable === true && (typeof gridData.columns[col].sortable === 'undefined' || gridData.columns[col].sortable === true)) {
                setSortableClickListener(th);
            }
            if (gridData.columns[col].filterable === true) {
                setFilterableClickListener(th, gridData, col);
                createCellEditSaveDiv(gridElem);
            }

            if (gridData.columns[col].editable || gridData.columns[col].selectable)
                createCellEditSaveDiv(gridElem);

            $('<a class="header-anchor" href="#"></a>').appendTo(th).text(text);

            index++;
        }
        headerTable.css('width','');
        setColWidth(gridData, gridElem);
    }

    /**
     * Builds the header's aggregations row if specified to be displayed at the
     * top of the grid
     * @method buildHeaderAggregations
     * @for grid
     * @private
     * @param {object} gridData
     * @param {integer} gridId
     */
    function buildHeaderAggregations(gridData, gridId) {
        var sum = buildAggregatesRow(gridData, gridId);
        if (sum) {
            var headerTHead = $('#grid-header-' + gridId).find('thead');
            var sumRow = headerTHead.find('.summary-row-header');
            if (sumRow.length)
                sumRow.remove();
            sumRow = $('<tr class=summary-row-header></tr>').appendTo(headerTHead);
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                sumRow.append('<th class="grid-header-cell grouped_cell"></th>');
            }
            for (var col in sum) {
                var text = sum[col] != null ? sum[col] : '';
                sumRow.append('<td data-field="' + col + '" class=summary-cell-header>' + text + '</td>');
            }
        }
    }

    /**
     * Gets the aggregations - either passed in with metadata if server-side paging,
     * or calculates the aggregations if client-side paging.
     * @method buildAggregatesRow
     * @for grid
     * @private
     * @param {object} gridData
     * @param {integer} gridId
     * @returns {object}
     */
    function buildAggregatesRow(gridData, gridId) {
        var aggData = {},
            data = gridData.alteredData ? gridData.alteredData :  gridData.dataSource.data,
            total, i;
        for (var col in gridData.columns) {
            var type = typeof gridData.columns[col].type === 'string' ? gridData.columns[col].type : '';
            var text;
            if (!gridData.summaryRow[col]) {
                aggData[col] = '';
                continue;
            }
            if (typeof gridData.dataSource.get === 'function') {
                if (gridData.summaryRow[col].type && gridData.summaryRow[col].value) {
                    text = getFormattedCellText(gridId, col, gridData.summaryRow[col].value);
                    aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                }
                else
                    aggData[col] = null;
            }
            else {
                switch (gridData.summaryRow[col].type) {
                    case 'count':
                        text = getFormattedCellText(gridId, col, gridData.dataSource.rowCount);
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'average':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        var avg = parseFloat(total/parseFloat(gridData.dataSource.rowCount)).toFixed(2);
                        text = getFormattedCellText(gridId, col, avg);
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'total':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        if (type === 'currency') total = total.toFixed(2);
                        text = getFormattedCellText(gridId, col, total);
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'min':
                        var min;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!min || parseFloat(data[i][col]) < min) min = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, min);
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'max':
                        var max;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!max || parseFloat(data[i][col]) > max) max = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, max);
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case '':
                        aggData[col] = null;
                        break;
                }
            }
        }
        for (col in gridData.columns) {
            if (aggData[col] != null)
                return aggData;
        }
        return null;
    }

    /**
     * Creates the body of the grid. Sets the text in each cell and wires
     * up the event listeners
     * @method createGridContent
     * @for grid
     * @private
     * @param {object} gridData
     * @param {object} gridElem
     */
    function createGridContent(gridData, gridElem) {
        var contentHeight;
        var footerHeight = parseFloat(gridElem.find('.grid-footer-div').css('height'));
        var headerHeight = parseFloat(gridElem.find('.grid-header-div').css('height'));
        var toolbarHeight = 0;
        if (gridElem.find('.toolbar'))
            toolbarHeight = parseFloat(gridElem.find('.toolbar').css('height'));

        contentHeight = gridData.height && isNumber(gridData.height) ? gridData.height - (headerHeight + footerHeight + toolbarHeight) + 'px' : '250px';
        var gridContent = gridElem.find('.grid-content-div').css('height', contentHeight);
        var id = gridContent.data('grid_content_id');
        var gcOffsets = gridContent.offset();
        var top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop();
        var left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
        var loader = $('<span id="loader-span" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
        var contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent);
        var colGroup = $('<colgroup></colgroup>').appendTo(contentTable);
        var contentTBody = $('<tbody></tbody>').appendTo(contentTable);
        var columns = [];
        gridElem.find('th').each(function headerIterationCallback(idx, val) {
            if (!$(val).hasClass('group_spacer'))
                columns.push($(val).data('field'));
        });

        var rowStart = 0;
        var rowEnd = gridData.dataSource.data.length;
        var curRow;
        var rows = gridData.rows;

        for (var i = (rowStart); i < rowEnd; i++) {
            gridData.dataSource.data[i]._initialRowIndex = i;
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                if (!curRow || gridData.dataSource.data[i][gridData.groupedBy] !== curRow) {
                    curRow = gridData.dataSource.data[i][gridData.groupedBy];
                    var groupedText = getFormattedCellText(id, gridData.groupedBy, curRow);
                    var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(contentTBody);
                    var groupTitle = gridData.columns[gridData.groupedBy].title || gridData.groupedBy;
                    groupTr.append('<td colspan="' + (columns.length + 1) + '"><p class="grouped"><a class="sort-desc sortSpan group_acc_link"></a>' + groupTitle + ': ' + groupedText + '</p></td>');
                }
            }
            var tr = $('<tr></tr>').appendTo(contentTBody);
            if (i % 2) {
                tr.addClass('alt-row');
                if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
                    for (var x = 0; x < rows.alternateRows.length; x++) {
                        tr.addClass(rows.alternateRows[x]);
                    }
            }

            if (rows && rows.all && rows.all.constructor === Array) {
                for (var y = 0; y < rows.all.length; y++) {
                    tr.addClass(rows.all[y]);
                }
            }

            if (gridData.groupedBy && gridData.groupedBy !== 'none')
                tr.append('<td class="grouped_cell">&nbsp</td>');

            for (var j = 0; j < columns.length; j++) {
                var td = $('<td data-field="' + columns[j] + '" class="grid-content-cell"></td>').appendTo(tr);
                if (gridData.columns[columns[j]].attributes && gridData.columns[columns[j]].attributes.cellClasses && gridData.columns[columns[j]].attributes.cellClasses.constructor === Array) {
                    for (var z = 0; z < gridData.columns[columns[j]].attributes.cellClasses.length; z++) {
                        td.addClass(gridData.columns[columns[j]].attributes.cellClasses[z]);
                    }
                }

                td.text(getFormattedCellText(id, columns[j], gridData.dataSource.data[i][columns[j]]));
                //attach event handlers to save data
                if (gridData.columns[columns[j]].editable) makeCellEditable(id, td);
                else if (gridData.columns[columns[j]].selectable) makeCellSelectable(id, td);
            }
        }

        for (var k = 0; k < columns.length; k++) {
            colGroup.append('<col/>');
        }
        if (gridData.groupedBy && gridData.groupedBy !== 'none')
            colGroup.prepend('<col class="group_col"/>');

        if (gridData.summaryRow && gridData.summaryRow.positionAt === 'bottom') {
            var sum = buildAggregatesRow(gridData, id);
            var sumRow = $('<tr class="summary-row-footer"></tr>').appendTo(contentTBody);
            for (var col in sum) {
                sumRow.append('<td data-field="' + col + '" class="summary-cell-footer">' + sum[col] + '</td>');
            }
        }

        createGroupTrEventHandlers();

        gridContent.on('scroll', function contentDivScrollCallback(e) {
            var cDiv = $(e.currentTarget);
            var headWrap = cDiv.parents('.grid-wrapper').find('.grid-header-wrapper');
            if (storage.grids[headWrap.parent().data('grid_header_id')].resizing)
                return;
            headWrap.scrollLeft(cDiv.scrollLeft());
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var headerId = 'grid-header-' + gridContent.data('grid_content_id');
        var headDiv = $('#' + headerId);
        var sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
        headDiv.css('paddingRight', sizeDiff);

        //Once the column widths have been set (i.e. the first time creating the grid), they shouldn't change size again....
        //any time the grid is paged, sorted, filtered, etc., the cell widths shouldn't change, the new data should just be dumped into
        //the grid.
        copyGridWidth(gridElem);

        storage.grids[id].dataSource.data = gridData.dataSource.data;
        loader.remove();
        storage.grids[id].updating = false;
    }

    function createGroupTrEventHandlers() {
        $('.group_acc_link').each(function iterateAccordionsCallback(idx, val) {
            $(val).data('state', 'open');
        }).on('click', function groupedAccordionsClickListenerCallback(e) {
            var accRow = $(e.currentTarget).parents('tr');
            if ($(e.currentTarget).data('state') === 'open') {
                $(e.currentTarget).data('state', 'closed').removeClass('sort-desc').addClass('sort-asc');
                accRow.nextUntil('.grouped_row_header').css('display', 'none');
            }
            else {
                $(e.currentTarget).data('state', 'open').removeClass('sort-asc').addClass('sort-desc');
                accRow.nextUntil('.grouped_row_header').css('display', 'table-row');
            }
        });
    }

    function makeCellEditable(id, td) {
        td.on('click', function editableCellClickHandler(e) {
            var gridContent = storage.grids[id].grid.find('.grid-content-div');
            var gridData = storage.grids[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length)
                return;
            var cell = $(e.currentTarget);
            cell.text('');

            if (storage.grids[id].updating) return;
            var index = cell.parents('tr').index(),
                field = cell.data('field'),
                type = storage.grids[id].columns[field].type || '',
                val = storage.grids[id].dataSource.data[index][field],
                dataAttributes = '',
                gridValidation = storage.grids[id].useValidator ? storage.grids[id].columns[field].validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (storage.grids[id].useFormatter && storage.grids[id].columns[field].inputFormat)
                dataAttributes += ' data-inputformat="' + storage.grids[id].columns[field].inputFormat + '"';

            switch (type) {
                case 'bool':
                    input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    input[0].checked = !!(val || val === 'true');
                    dataType = 'bool';
                    break;
                case 'number':
                    inputVal = val;
                    input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'numeric';
                    break;
                case 'time':
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'time';
                    break;
                case 'date':
                    var dateVal = val === undefined ? new Date(Date.now()) : new Date(Date.parse(val));
                    inputVal = dateVal.toISOString().split('T')[0];
                    input = $('<input type="date" value="' + inputVal + '" class="input textbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'date';
                    break;
                default:
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'string';
                    break;
            }

            if (gridValidation) input.addClass('inputValidate');

            input[0].focus();

            if (dataType && dataType !== 'date' && dataType !== 'time') {
                input.on('keypress', function restrictCharsHandler(e) {
                    var code = e.charCode ? e.charCode : e.keyCode,
                        newVal;
                    if (newVal = validateCharacter.call(this, code, dataType)) {
                        var id = $(this).parents('.grid-wrapper').data('grid_id');
                        storage.grids[id].currentEdit[field] = newVal;
                    }
                    else {
                        e.preventDefault();
                        return false;
                    }
                });
            }

            if (gridValidation && dataAttributes !== '') {
                attachValidationListener(input[0]);
            }
            else {
                input.on('blur', function cellEditBlurHandler() {
                    saveCellEditData(input);
                });
            }
            callGridEventHandlers(gridData.events.beforeDataBind, gridData.grid, null);
        });
    }

    function makeCellSelectable(id, td) {
        td.on('click', function selectableCellClickHandler(e) {
            var gridContent = storage.grids[id].grid.find('.grid-content-div');
            var gridData = storage.grids[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length)
                return;
            var cell = $(e.currentTarget);
            cell.text('');
            var index = cell.parents('tr').index();
            var field = cell.data('field');
            if (storage.grids[id].updating) return;		//can't edit a cell if the grid is updating

            var gridValidation = storage.grids[id].useValidator ? storage.grids[id].columns[field].validation : null;
            var dataAttributes = '';

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell);
            var options = [];
            var setVal = gridData.dataSource.data[index][field];
            options.push(setVal);
            for (var z = 0; z < gridData.columns[field].options.length; z++) {
                if (setVal !== gridData.columns[field].options[z]) {
                    options.push(gridData.columns[field].options[z]);
                }
            }
            for (var k = 0; k < options.length; k++) {
                var opt = $('<option value="' + options[k] + '">' + options[k] + '</option>');
                select.append(opt);
            }
            select.val(setVal);
            select[0].focus();

            if (gridValidation) select.addClass('inputValidate');

            if (gridValidation && dataAttributes !== '') {
                attachValidationListener(select[0]);
            }
            else {
                select.on('blur', function cellEditBlurHandler() {
                    saveCellSelectData(select);
                });
            }
            callGridEventHandlers(gridData.events.beforeCellEdit, gridData.grid, null);
        });
    }

    function setupCellValidation(columnValidation, dataAttributes) {
        if (!grid.validation) {
            Object.defineProperty(
                grid,
                'validation',
                {
                    value: {},
                    writable: false
                }
            );
        }
        if (columnValidation.required)
            dataAttributes += 'data-required';
        if (columnValidation.customRules) {
            dataAttributes += ' data-customrules="';
            for (var rule in columnValidation.customRules) {
                dataAttributes += 'grid.validation.' + rule + ',';
                if (!grid.validation[rule]) {
                    Object.defineProperty(
                        grid.validation,
                        rule,
                        {
                            value: columnValidation.customRules[rule],
                            writable: false,
                            configurable: false
                        });
                }
            }
            dataAttributes += '"';
        }
        return dataAttributes;
    }

    /**
     * Sets the column widths of the grid's header. If width properties are supplied as part
     * of a column's metadata, the specified value is used; otherwise this function lets
     * the column choose an auto-width.
     * @param {object} gridData
     * @param {object} gridElem
     */
    function setColWidth(gridData, gridElem) {
        var columnNames = {},
            name,
            columnList = [];
        var tableDiv = gridElem.find('.grid-header-wrapper');
        for (name in gridData.columns) {
            columnNames[name] = isNumber(gridData.columns[name].width) ? gridData.columns[name].width : null;
            columnList.push(name);
        }
        var colGroups = tableDiv.find('col');

        colGroups.each(function iterateColsCallback(idx, val) {
            var i = idx;
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                i = (idx%(colGroups.length/2)) - 1;
            }
            if (gridData.groupedBy && gridData.groupedBy !== 'none' && idx === 0) {
                $(val).css('width', 27);
            }
            else if (columnNames[columnList[i]] != null) {
                    $(val).css('width', columnNames[columnList[i]]);
            }
        });
    }

    /**
     * Copies the grid's column's widths to subsequent page data so that a consistent
     * width is maintained.
     * @method copyGridWidth
     * @for grid
     * @private
     * @param {object} gridElem
     */
    function copyGridWidth(gridElem) {
        var headerCols = gridElem.find('.grid-header-div').find('col');
        var contentCols = gridElem.find('.grid-content-div').find('col');
        var headerTable = gridElem.find('.grid-header-div').find('table');
        var contentTable = gridElem.find('.grid-content-div').find('table');

        contentTable.css('width', headerTable[0].clientWidth);

        contentCols.each(function colIterationCallback(idx, val) {
            if ($(val).hasClass('group_col'))
                return;
            var width;
            if (width = $(headerCols[idx]).width())
                $(val).css('width', width);
        });
    }

    /**
     * Attaches an event listener to a specific grid cell for the
     * 'validated' event. Overrides the normal 'blur' behavior for cell editing
     * @method attachValidationListener
     * @for grid
     * @private
     * @param {object} elem
     */
    function attachValidationListener(elem) {
        $(document).one('validated', function validationHandlerCallback(e, eventData) {
            if (eventData.element === elem) {
                if (eventData.succeeded && elem.type !== 'select' && elem.type !== 'select-one')
                    saveCellEditData($(elem));
                else if (eventData.succeeded)
                    saveCellSelectData($(elem));
                else {
                    elem.focus();
                    attachValidationListener(elem);
                }
            }
            else {
                attachValidationListener(elem);
            }
        });
    }

    /**
     * On blur or successful validation if using the validator, removed the input from the
     * grid cell, saves the data in the alteredData array and set a dirty flag on the grid dom
     * element if the value changed
     * @method saveCellEditData
     * @for grid
     * @private
     * @param {object} input
     */
    function saveCellEditData(input) {
        var val;
        if (input[0].type == 'checkbox') val = input.is(':checked');
        else val = input.val();
        var gridContent = input.parents('.grid-wrapper').find('.grid-content-div'),
            cell = input.parents('td'),
            id = gridContent.data('grid_content_id'),
            index = cell.parents('tr').index(),
            field = cell.data('field'),
            type = storage.grids[id].columns[field].type || '',
            saveVal, re,
            displayVal = getFormattedCellText(id, field, val);

        input.remove();
        //Types: date, number, string, boolean, time
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.numeric);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = typeof storage.grids[id].dataSource.data[index][field] === 'string' ? parseFloat(val.replace(',', '')) : val;
                break;
            case 'date':
                saveVal = displayVal;   //this and time are the only types that have the same displayVal and saveVel
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = displayVal;   //this and date are the only types that have the same displayVal and saveVal
                break;
            default: 		//string, boolean
                saveVal = val;
                break;
        }

        cell.text(displayVal);
        storage.grids[id].currentEdit[field] = null;
        var previousVal = storage.grids[id].dataSource.data[index][field];
        if (previousVal !== saveVal && !('' === saveVal && undefined === previousVal)) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
            storage.grids[id].dataSource.data[index][field] = saveVal;
            cell.prepend('<span class="dirty"></span>');
        }
        else
            storage.grids[id].dataSource.data[index][field] = previousVal;
        callGridEventHandlers(storage.grids[id].events.afterCellEdit, storage.grids[id].grid, null);
    }

    function saveCellSelectData(select) {
        var gridContent = select.parents('.grid-wrapper').find('.grid-content-div');
        var val = select.val();
        var parentCell = select.parents('td');
        select.remove();
        var id = gridContent.data('grid_content_id');

        var index = parentCell.parents('tr').index();
        var field = parentCell.data('field');
        var text = getFormattedCellText(id, field, val);
        parentCell.text(text);
        var previousVal = storage.grids[id].dataSource.data[index][field];
        if (previousVal !== val) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
            parentCell.prepend('<span class="dirty"></span>');
            storage.grids[id].dataSource.data[index][field] = val;
        }
        callGridEventHandlers(storage.grids[id].events.afterCellEdit, storage.grids[id].grid, null);
    }

    function createCellEditSaveDiv(gridElem) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length)	//if the toolbar has already been created, don't create it again.
            return;

        var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix"></div>').prependTo(gridElem);
        var saveAnchor = $('<a href="#" class="toolbarAnchor saveToolbar"></a>').appendTo(saveBar);
        saveAnchor.append('<span class="toolbarSpan saveToolbarSpan"></span>Save Changes');

        var deleteAnchor = $('<a href="#" class="toolbarAnchor deleteToolbar"></a>').appendTo(saveBar);
        deleteAnchor.append('<span class="toolbarSpan deleteToolbarSpan">Delete Changes</span>');

        saveAnchor.on('click', function saveChangesHandler() {
            if (storage.grids[id].updating) return;
            var dirtyCells = [],
                pageNum = storage.grids[id].pageNum, i;
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                if (typeof storage.grids[id].dataSource.put !== 'function') {
                    for (i = 0; i < dirtyCells.length; i++) {
                        var index = dirtyCells[i].parents('tr').index();
                        var field = dirtyCells[i].data('field');
                        var origIndex = storage.grids[id].dataSource.data[index][field]._initialRowIndex;
                        storage.grids[id].originalData[origIndex][field] = storage.grids[id].dataSource.data[index][field];
                        dirtyCells[i].find('.dirty').remove();
                    }
                }
                else {
                    storage.grids[id].putRequest.eventType = 'save';
                    storage.grids[id].putRequest.pageNum = pageNum;
                    storage.grids[id].putRequest.models = [];
                    var putRequestModels = storage.grids[id].putRequest.models;
                    for (i = 0; i < dirtyCells.length; i++) {
                        var tmpModel = cloneGridData(storage.grids[id].dataSource.data[dirtyCells[i].parents('tr').index()]);
                        var tmpMap = tmpModel._initialRowIndex;
                        var idx = existsInPutRequest(putRequestModels, tmpModel);
                        if (~idx) {
                            putRequestModels[idx].dirtyFields.push(dirtyCells[i].data('field'));
                        }
                        else {
                            putRequestModels.push({ cleanData: storage.grids[id].originalData[tmpMap], dirtyData: tmpModel, dirtyFields: [dirtyCells[i].data('field')] });
                        }
                    }

                    for (i = 0; i < putRequestModels.length; i++) {
                        delete putRequestModels[i].dirtyData._initialRowIndex;
                    }

                    prepareGridDataUpdateRequest(id);
                }
            }
        });

        deleteAnchor.on('click', function deleteChangeHandler() {
            if (storage.grids[id].updating) return;
            var dirtyCells = [];
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                for (var i = 0; i < dirtyCells.length; i++) {
                    var field = dirtyCells[i].data('field');
                    var index = dirtyCells[i].parents('tr').index();
                    var pageNum = storage.grids[id].pageNum;
                    var rowNum = storage.grids[id].pageSize;
                    var addend = (pageNum-1)*rowNum;
                    var cellVal = storage.grids[id].originalData[index][field] !== undefined ? storage.grids[id].originalData[index][field] : '';
                    var text = getFormattedCellText(id, field, cellVal);
                    dirtyCells[i].text(text);
                    dirtyCells[i].find('.dirty').remove();
                    storage.grids[id].dataSource.data[index][field] = storage.grids[id].originalData[index + addend][field];
                }
            }
        });

        if (storage.grids[id].groupable) {
            var groupSpan = $('<span class="toolbarSpan group_span" style="float:right;"><span class="groupTextSpan">Group By: </span></span>').appendTo(saveBar);
            var columnsList = $('<select class="input select group_select" style="float:right; display: inline; width: auto;"></select>').appendTo(groupSpan);
            columnsList.append('<option value="none">None</option>');
            for (var col in storage.grids[id].columns) {
                if (storage.grids[id].columns[col].groupable !== false) {
                    var colTitle = storage.grids[id].columns[col].title || col;
                    columnsList.append('<option value="' + col + '">' + colTitle + '</option>');
                }
            }
            columnsList.on('change', function groupBySelectCallback() {
                if (storage.grids[id].updating) return;
                if (Object.keys(storage.grids[id].columns).length === storage.grids[id].grid.find('colgroup').first().find('col').length && this.value !== 'none') {
                    if (!storage.grids[id].groupedBy)
                        storage.grids[id].groupingStatusChanged = true;
                    var colGroups = storage.grids[id].grid.find('colgroup');
                    colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                        $(val).prepend('<col class="group_col"/>');
                    });
                    storage.grids[id].grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
                    storage.grids[id].grid.find('.summary-row-header').prepend('<td class="group_spacer">&nbsp</td>');
                }
                else if (this.value === 'none') {
                    storage.grids[id].groupingStatusChanged = true;
                    storage.grids[id].grid.find('colgroup').find('.group_col').remove();
                    storage.grids[id].grid.find('.group_spacer').remove();
                    storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                }
                storage.grids[id].pageRequest.groupedBy = this.value;
                storage.grids[id].pageRequest.eventType = 'group';
                preparePageDataGetRequest(id);
            });
        }
    }

    function createGridFooter(gridData, gridElem) {
        var gridFooter = gridElem.find('.grid-footer-div');
        var id = gridFooter.data('grid_footer_id');
        var count = storage.grids[id].dataSource.rowCount;
        var displayedRows = (count - storage.grids[id].pageSize) > 0 ? storage.grids[id].pageSize : count;
        var remainingPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) : 0;
        var pageNum = storage.grids[parseInt(gridFooter.data('grid_footer_id'))].pageNum;

        var first = $('<a href="#" class="grid-page-link link-disabled" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridFooter);
        var prev = $('<a href="#" class="grid-page-link link-disabled" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridFooter);
        var text = 'Page ' + storage.grids[parseInt(gridFooter.data('grid_footer_id'))].pageNum + '/' + (remainingPages + 1);
        gridFooter.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
        var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridFooter);
        var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + (remainingPages + 1) + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridFooter);

        if (!remainingPages) {
            first.addClass('link-disabled');
            prev.addClass('link-disabled');
            next.addClass('link-disabled');
            last.addClass('link-disabled');
        }

        var pageOptions = gridData.pagingOptions;
        if (pageOptions && pageOptions.constructor === Array) {
            var sizeSelectorSpan = $('<span class="page-size-span"></span>').appendTo(gridFooter);
            var sizeSelect = $('<select class="size-selector input"></select>').appendTo(sizeSelectorSpan);
            for (var i = 0; i < pageOptions.length; i++) {
                sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
            }
            sizeSelect.val(storage.grids[id].pageSize);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler() {
                var pageSize = $(this).val();
                storage.grids[id].pageRequest.pageSize = parseInt(pageSize);
                storage.grids[id].pageRequest.eventType = 'pageSize';
                preparePageDataGetRequest(id);
            });
        }

        var rowStart = 1 + (displayedRows*(pageNum-1));
        var rowEnd = displayedRows*pageNum;
        text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
        gridFooter.append('<span class="pageinfo">' + text + '</span>');

        setPagerEventListeners(gridFooter);
    }

    function setPagerEventListeners(gridFooter) {
        gridFooter.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
            $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
                e.preventDefault();
                var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
                if (link.hasClass('link-disabled')) {	//If the pager link that was clicked on is disabled, return.
                    return;
                }
                var gridFooter = link.parents('.grid-footer-div');
                var allPagers = gridFooter.find('a');
                var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
                if (storage.grids[id].updating) return;		//can't page if grid is updating
                var gridData = storage.grids[id];
                var pageSize = gridData.pageSize;
                var pagerInfo = gridFooter.find('.pageinfo');
                var pagerSpan = gridFooter.find('.grid-pagenum-span');
                var totalPages = (gridData.dataSource.rowCount - pageSize) > 0 ? Math.ceil((gridData.dataSource.rowCount - pageSize)/pageSize) + 1 : 1;
                var pageNum = parseInt(link[0].dataset.pagenum);
                gridData.pageNum = pageNum;
                var rowStart = 1 + (pageSize * (pageNum - 1));
                var rowEnd = pageSize * pageNum;

                switch (link.data('link')) {
                    case 'first':
                        link.addClass('link-disable');
                        $(allPagers[1]).addClass('link-disabled')[0].dataset.pagenum = 1;
                        $(allPagers[2]).removeClass('link-disabled')[0].dataset.pagenum = pageNum + 1;
                        $(allPagers[3]).removeClass('link-disabled');
                        break;
                    case 'prev':
                        link[0].dataset.pagenum = pageNum - 1;
                        if (pageNum === 1) {
                            link.addClass('link-disabled');
                            $(allPagers[0]).addClass('link-disabled');
                        }
                        $(allPagers[2]).removeClass('link-disabled')[0].dataset.pagenum = pageNum + 1;
                        $(allPagers[3]).removeClass('link-disabled');
                        break;
                    case 'next':
                        rowEnd = gridData.dataSource.rowCount < pageSize * pageNum ? gridData.dataSource.rowCount : pageSize * pageNum;
                        link[0].dataset.pagenum = pageNum + 1;
                        if (pageNum === totalPages) {
                            link.addClass('link-disabled');
                            $(allPagers[3]).addClass('link-disabled');
                        }
                        $(allPagers[0]).removeClass('link-disabled');
                        $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                        break;
                    case 'last':
                        rowEnd = gridData.dataSource.rowCount < pageSize * pageNum ? gridData.dataSource.rowCount : pageSize * pageNum;
                        link.addClass('link-disabled');
                        $(allPagers[2]).addClass('link-disabled')[0].dataset.pagenum = pageNum;
                        $(allPagers[0]).removeClass('link-disabled');
                        $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                        break;
                }
                pagerSpan.text('Page ' + pageNum + '/' + totalPages);
                pagerInfo.text(rowStart + ' - ' + rowEnd + ' of ' + gridData.dataSource.rowCount + ' rows');
                gridData.grid.find('.grid-content-div').empty();
                gridData.pageRequest.eventType = 'page';
                gridData.pageRequest.pageNum = pageNum;
                preparePageDataGetRequest(id);
            });
        });
    }

    function attachFilterListener(filterElem) {
        filterElem.on('click', function filterClickCallback(e) {
            e.stopPropagation();	//stop event bubbling so that the column won't also get sorted when the filter icon is clicked.
            e.preventDefault();
            var filterAnchor = $(e.target);
            var filterCell = filterAnchor.parents('th');
            var type = filterAnchor.data('type');
            var grid = filterElem.parents('.grid-wrapper');
            var id = grid.data('grid_id');
            if (storage.grids[id].updating) return;		//can't filter when the grid is updating
            var filters = grid.find('.filter-div');
            var currFilter = null;
            var field = filterAnchor.data('field');
            var title = storage.grids[id].columns[field].title || null;

            if (filters.length) {
                filters.each(function iterateFiltersCallback(idx, val) {
                    var filter = $(val);
                    if (filter.data('parentfield') === filterAnchor.data('field')) {
                        filter.removeClass('hiddenFilter');
                        currFilter = $(val);
                    }
                    else {
                        filter.addClass('hiddenFilter');
                    }
                });
            }

            if (!currFilter) {
                createFilterDiv(type, field, grid, title);
                currFilter = grid.find('.filter-div');
            }
            var filterCellOffset = filterCell.offset();
            currFilter.css('top', (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
            currFilter.css('left', (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
        });
    }

    function createFilterDiv(type, field, grid, title) {
        var filterDiv = $('<div class="filter-div" data-parentfield="' + field + '" data-type="' + type + '"></div>').appendTo(grid);
        var domName = title ? title : type;
        var filterInput, resetButton, button,
            span = $('<span class="filterTextSpan">Filter rows where ' + domName + ' is:</span>').appendTo(filterDiv),
            select = $('<select class="filterSelect select"></select>').appendTo(filterDiv);
        select.append('<option value="eq">Equal to:</option>');
        switch (type) {
            case 'number':
                select.append('<option value="neq">Not equal to:</option>');
                select.append('<option value="gte">Greater than or equal to:</option>');
                select.append('<option value="gt">Greater than:</option>');
                select.append('<option value="lte">Less than or equal to:</option>');
                select.append('<option value="lt">Less than:</option>');
                filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'date':
                select.append('<option value="neq">Not equal to:</option>');
                select.append('<option value="gte">Equal to or later than:</option>');
                select.append('<option value="gt">Later than:</option>');
                select.append('<option value="lte">Equal to or before:</option>');
                select.append('<option value="lt">Before:</option>');
                filterInput = $('<input type="date" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'time':
                select.append('<option value="neq">Not equal to:</option>');
                select.append('<option value="gte">Equal to or later than:</option>');
                select.append('<option value="gt">Later than:</option>');
                select.append('<option value="lte">Equal to or before:</option>');
                select.append('<option value="lt">Before:</option>');
                filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'boolean':
                var optSelect = $('<select class="filterSelect"></select>').appendTo(span);
                optSelect.append('<option value="true">True</option>');
                optSelect.append('<option value="false">False</option>');
                break;
            case 'string':
                select.append('<option value="neq">Not equal to:</option>');
                select.append('<option value="ct">Contains:</option>');
                select.append('<option value="nct">Does not contain:</option>');
                filterInput = $('<input class="filterInput input" type="text" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
        }
        resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
        button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
        resetButton.on('click', resetButtonClickHandler);
        button.on('click', filterButtonClickHandler);
        if (filterInput && type !=='time' && type !== 'date')
            filterInputValidation(filterInput);
    }

    function filterInputValidation(input) {
        input.on('keypress', function restrictCharsHandler(e) {
            var code = e.charCode? e.charCode : e.keyCode,
                type = $(this).parents('.filter-div').data('type');
            if (!validateCharacter.call(this, code, type)) {
                e.preventDefault();
                return false;
            }
        });
    }

    function resetButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div');
        var value = filterDiv.find('.filterInput').val();
        var gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[gridId].updating) return;		//can't filter if grid is updating
        var gridData = storage.grids[gridId];

        if (value === '' && gridData.filterVal === '') return;
        filterDiv.find('.filterInput').val('');

        filterDiv.addClass('hiddenFilter');

        gridData.pageRequest.filteredOn = null;
        gridData.pageRequest.filterVal = null;
        gridData.pageRequest.filterType = null;
        gridData.filteredOn = null;
        gridData.filterVal = null;
        gridData.filterType = null;
        gridData.pageRequest.eventType = 'filter';
        storage.grids[gridId].alteredData = cloneGridData(storage.grids[gridId].originalData);
        preparePageDataGetRequest(gridId);
    }

    function filterButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            selected = filterDiv.find('.filterSelect').val(),
            value = filterDiv.find('.filterInput').val(),
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[gridId].updating) return;		//can't filter if grid is updating
        var gridData = storage.grids[gridId],
            type = filterDiv.data('type'),
            errors = filterDiv.find('.filter-div-error'),
            re;

        if (dataTypes[type]) {
            re = new RegExp(dataTypes[type]);
            if (!re.test(value) && !errors.length) {
                $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
                return;
            }
        }

        if (errors.length)
            errors.remove();

        if (value === '' && gridData.filterVal === '') return;

        filterDiv.addClass('hiddenFilter');

        gridData.pageRequest.filteredOn = $(this).data('field');
        gridData.pageRequest.filterVal = value;
        gridData.pageRequest.filterType = selected;
        gridData.pageRequest.eventType = 'filter';
        preparePageDataGetRequest(gridId);
    }

    function createGridColumnsFromArray(gridData, gridElem) {
        var headerCol = {};
        var index = 0;
        for (var i = 0; i < gridData.length; i++) {
            for (var col in gridData[i]) {
                if (!headerCol[col]) {
                    headerCol[col] = {};
                    headerCol[col].field = col;
                    headerCol[col].title = col;
                    headerCol[col].reorderable = true;
                    headerCol[col].sortable = true;
                    index++;
                }
            }
        }
        var newGridData = {
            columns: headerCol,
            data: gridData
        };
        createGridHeaders(newGridData, gridElem);
    }

    function setDragAndDropListeners(elem) {
        elem.on('dragstart', function handleDragStartCallback(e) {
            e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
        });
        elem.on('drop', handleDropCallback);
        elem.on('dragover', function handleHeaderDragOverCallback(e) {
            e.preventDefault();
        });
        elem.on('mouseleave', mouseLeaveHandlerCallback);
    }

    function handleDropCallback(e) {
        var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
        var targetCol = $(e.currentTarget);
        var id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null;
        var droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
        if (!id || !droppedId) return;  //atleast one of the involved dom elements is not a grid column
        if (id !== droppedId) return;   //can't swap columns from different grids
        if (storage.grids[id].updating) return;		//can't resort columns if grid is updating
        if (droppedCol[0].cellIndex === targetCol[0].cellIndex)
            return;
        if (droppedCol[0].id === 'sliderDiv')
            return;

        var parentDiv = targetCol.parents('.grid-header-div');
        var parentDivId = parentDiv.data('grid_header_id');
        var gridWrapper = parentDiv.parent('.grid-wrapper');
        var colGroups = gridWrapper.find('colgroup');

        var droppedIndex = droppedCol[0].dataset.index;
        var targetIndex = targetCol[0].dataset.index;

        var droppedClone = droppedCol.clone(false, true);
        var targetClone = targetCol.clone(false, true);

        var droppedEvents = $._data(droppedCol[0], 'events');
        var targetEvents = $._data(targetCol[0], 'events');
        if (droppedEvents.click)
            setSortableClickListener(droppedClone);
        setDragAndDropListeners(droppedClone);
        if (targetEvents.click)
            setSortableClickListener(targetClone);
        setDragAndDropListeners(targetClone);

        if (droppedClone.find('.filterSpan').length)
            attachFilterListener(droppedClone.find('.filterSpan'));
        if (targetClone.find('.filterSpan').length)
            attachFilterListener(targetClone.find('.filterSpan'));

        droppedCol.replaceWith(targetClone);
        targetCol.replaceWith(droppedClone);

        droppedClone[0].dataset.index = targetIndex;
        targetClone[0].dataset.index = droppedIndex;

        swapContentCells(parentDivId, droppedIndex, targetIndex);

        var targetWidth = $(colGroups[0].children[droppedIndex]).width();
        var droppedWidth = $(colGroups[0].children[targetIndex]).width();

        $(colGroups[0].children[droppedIndex]).width(droppedWidth);
        $(colGroups[0].children[targetIndex]).width(targetWidth);
        $(colGroups[1].children[droppedIndex]).width(droppedWidth);
        $(colGroups[1].children[targetIndex]).width(targetWidth);

        var sumRow = parentDiv.find('.summary-row-header');
        if (sumRow.length) {
            var droppedColSum = null,
                targetColSum = null;
            sumRow.children().each(function iterateSumRowCellsCallback(idx, val) {
                if ($(val).data('field') === droppedCol.data('field')) {
                    droppedColSum = $(val);
                }
                else if ($(val).data('field') === targetCol.data('field')) {
                    targetColSum = $(val);
                }
            });
            if (droppedColSum.length && targetColSum.length) {
                var droppedColSumClone = droppedColSum.clone(true, true);
                var targetColSumClone = targetColSum.clone(true, true);
                droppedColSum.replaceWith(targetColSumClone);
                targetColSum.replaceWith(droppedColSumClone);
            }
        }
        e.preventDefault();
        var evtObj = {
            element: storage.grids[id].grid,
            droppedColumn: droppedCol.data('field'),
            targetColumn: targetCol.data('field'),
            droppedIndex: droppedIndex,
            targetIndex: targetIndex
        };
        callGridEventHandlers(storage.grids[id].events.columnReorder, storage.grids[id].grid, evtObj);
    }

    function mouseLeaveHandlerCallback(e) {
        var target = $(e.currentTarget);
        var targetOffset = target.offset();
        var targetWidth = target.innerWidth();
        var mousePos = { x: e.originalEvent.pageX, y: e.originalEvent.pageY };
        var sliderDiv = $('#sliderDiv');

        if (Math.abs(mousePos.x - (targetOffset.left + targetWidth)) < 10) {
            if (!sliderDiv.length) {
                var parentDiv = target.parents('.grid-header-wrapper');
                sliderDiv = $('<div id=sliderDiv style="width:10px; height:' + target.innerHeight() + 'px; cursor: col-resize; position: absolute" draggable=true><div></div></div>').appendTo(parentDiv);
                sliderDiv.on('dragstart', function handleResizeDragStartCallback(e) {
                    e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
                    storage.grids[parentDiv.parent().data('grid_header_id')].resizing = true;
                });
                sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                    storage.grids[parentDiv.parent().data('grid_header_id')].resizing = false;
                });
                sliderDiv.on('dragover', function handleResizeDragOverCallback(e) {
                    e.preventDefault();
                });
                sliderDiv.on('drop', function handleResizeDropCallback(e) {
                    e.preventDefault();
                });
                sliderDiv.on('drag', handleResizeDragCallback);
            }
            sliderDiv.data('targetindex', target[0].id);
            sliderDiv.css('top', targetOffset.top + 'px');
            sliderDiv.css('left', (targetOffset.left + targetWidth -4) + 'px');
            sliderDiv.css('position', 'absolute');
        }
    }

    function setSortableClickListener(elem) {
        elem.on('click', function handleHeaderClickCallback() {
            var headerDiv = elem.parents('.grid-header-div');
            var id = parseInt(headerDiv.data('grid_header_id'));
            if (storage.grids[id].updating) return;		//can't sort if grid is updating
            var field = elem.data('field'),
                foundColumn = false;
            for (var i = 0; i < storage.grids[id].sortedOn.length; i++) {
                //if we find the field in the list of sorted columns....
                if (storage.grids[id].sortedOn[i].field === field) {
                    foundColumn = true;
                    //...if it had been sorted ascending, change it to descending...
                    if (storage.grids[id].sortedOn[i].sortDirection === 'asc') {
                        storage.grids[id].sortedOn[i].sortDirection = 'desc';
                        elem.find('.sortSpan').addClass('sort-desc').removeClass('sort-asc');
                    }
                    else {
                        //...otherwise, remove it from the collection of sorted columns
                        elem[0].dataset.order = 'default';
                        storage.grids[id].sortedOn =  storage.grids[id].sortedOn.filter(function filterSortedColumns(item) {
                            return item.field !== 'field';
                        });
                        elem.find('.sortSpan').removeClass('sort-desc').removeClass('sort-asc');
                        storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                    }
                }
            }

            if (!foundColumn) {
                storage.grids[id].sortedOn.push({ field: field, sortDirection: 'asc' });
            }

            //var previousSorted = headerDiv.find('[data-order]');
            var order;//, className;
            if (elem[0].dataset.order === undefined || elem[0].dataset.order == 'default')
                order = 'desc';
            else if (elem[0].dataset.order === 'desc')
                order = 'asc';
            else
                order = 'default';

            /*elem[0].dataset.order = order;
            if (previousSorted.length) {
                if (previousSorted.data('field') !== elem.data('field')) {
                    $('.sortSpan').remove();	//may need to target the "previousSorted" element before removing the sortSpan, but something isn't working correctly with that, so for now this'll do.
                    previousSorted[0].removeAttribute('data-order');
                    if (order === 'desc')
                        className = 'sort-desc sortSpan';
                    else if (order === 'asc')
                        className = 'sort-asc sortSpan';
                    else {
                        className = '';
                        storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                    }
                    elem.find('.header-anchor').append('<span class="' + className + '">Sort</span>');
                }
                else {
                    var span = elem.find('.sortSpan');
                    if (order === 'desc')
                        span.addClass('sort-desc').removeClass('sort-asc');
                    else if (order === 'asc')
                        span.removeClass('sort-desc').addClass('sort-asc');
                    else {
                        span.removeClass('sort-desc').removeClass('sort-asc');
                        storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                    }
                }
            }
            else {
                if (order === 'desc')
                    className = 'sort-desc sortSpan';
                else if (order === 'asc')
                    className = 'sort-asc sortSpan';
                else {
                    className = '';
                    storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                }
                elem.find('.header-anchor').append('<span class="' + className + '">Sort</span>');
            }*/
            storage.grids[id].pageRequest.sortedOn = elem.data('field');
            storage.grids[id].pageRequest.sortedBy = order;
            storage.grids[id].pageRequest.eventType = 'sort';
            preparePageDataGetRequest(id);
        });
    }

    function setFilterableClickListener(elem, gridData, col) {
        var type = gridData.columns[col].type || 'string';
        var anchor = $('<a href="#"></a>').appendTo(elem);
        anchor.append('<span class="filterSpan" data-type="' + type + '" data-field="' + elem.data('field') + '"></span>');
        attachFilterListener(anchor);
        $(document).on('click', function hideFilterHandler(e) {
            if (!$(e.target).hasClass('filter-div')) {
                if ($(e.target).parents('.filter-div').length < 1) {
                    $(document).find('.filter-div').each(function iterateFilterDivsCallback(idx, val) {
                        $(val).addClass('hiddenFilter');
                    });
                }
            }
        });
        $(document).on('scroll', function scrollFilterHandler() {
            $(document).find('.filter-div').each(function iterateFilterDivsCallback(idx, val) {
                var filter = $(val);
                if (!filter.hasClass('hiddenFilter')) {
                    var gridWrapper = filter.parents('.grid-wrapper');
                    var filterCell = gridWrapper.find('th').filter(function headerIterationCallback(idx, val) {
                        return $(val).data('field') === filter.data('parentfield');
                    });
                    var filterCellOffset = filterCell.offset();
                    filter.css('top', (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
                    filter.css('left', (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
                }
            });
        });
    }

    function handleResizeDragCallback(e) {
        e.preventDefault();
        var sliderDiv = $(e.currentTarget);
        var id = sliderDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[id].updating) return;		//can't resize columns if grid is updating
        var targetCell = document.getElementById(sliderDiv.data('targetindex'));
        var targetBox = targetCell.getBoundingClientRect();
        var endPos = e.originalEvent.pageX;
        var startPos = targetBox.left;
        var width = endPos - startPos;
        var space = endPos - targetBox.right;

        if (width > 11) {
            var index = targetCell.dataset.index;
            var gridWrapper = $(targetCell).parents('.grid-wrapper');
            var colGroups = gridWrapper.find('colgroup');
            var tables = gridWrapper.find('table');
            if (storage.grids[id].groupedBy && storage.grids[id].groupedBy !== 'none')
                index++;

            var contentDiv = gridWrapper.find('.grid-content-div');
            var scrollLeft = contentDiv.scrollLeft();
            var clientWidth = contentDiv[0].clientWidth;
            var scrollWidth = contentDiv[0].scrollWidth;
            var add = scrollLeft + clientWidth;
            var isTrue = add === scrollWidth;

            if (space < 0 && scrollWidth > clientWidth && isTrue) {
                space -= -3;
                width -= -3;
            }

            for (var i = 0; i < colGroups.length; i++) {
                var currWidth = $(tables[i]).width();
                $(colGroups[i].children[index]).width(width);
                $(tables[i]).width(currWidth + space);

            }
            sliderDiv.css('left', e.originalEvent.pageX + 'px');
        }
    }

    function swapContentCells(gridId, droppedIndex, targetIndex) {
        var gridData = storage.grids[gridId];
        $('#grid-content-' + gridId).find('tr').each(function iterateContentRowsCallback(idx, val) {
            if ($(val).hasClass('grouped_row_header'))
                return true;
            var droppedIdx = 1 + parseInt(droppedIndex);
            var targetIdx = 1 + parseInt(targetIndex);
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                droppedIdx++;
                targetIdx++;
            }
            var droppedCell = $(val).children('td:nth-child(' + droppedIdx + ')');
            var targetCell = $(val).children('td:nth-child(' + targetIdx + ')');

            var droppedClone = droppedCell.clone(true, true);
            var targetClone = targetCell.clone(true, true);
            targetCell.replaceWith(droppedClone);
            droppedCell.replaceWith(targetClone);

            droppedClone[0].dataset.index = targetIndex;
            targetClone[0].dataset.index = droppedIndex;
        });
    }

    //All page request-related functions call here. This sets up the request object and then calls either
    //the internal or the supplied GET function to get a new page of grid data.
    function preparePageDataGetRequest(id) {
        storage.grids[id].updating = true;
        var gridData = storage.grids[id];
        var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
        var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;
        //var sortedOn = gridData.pageRequest.sortedOn || gridData.sortedOn || null;
        //var sortedBy = gridData.pageRequest.sortedBy || gridData.sortedBy || null;
        var sortedOn = gridData.sortedOn.length ? gridData.sortedOn : null;
        var filteredOn = gridData.pageRequest.filteredOn || gridData.filteredOn || null;
        var filterVal = gridData.pageRequest.filterVal || gridData.filterVal || null;
        var filterType = gridData.pageRequest.filterType || gridData.filterType || null;
        var groupedBy = gridData.pageRequest.groupedBy || gridData.groupedBy || null;

        var requestObj = {};
        if (gridData.sortable) {
            requestObj.sortedOn = sortedOn;
            //requestObj.sortedBy = sortedBy;
        }

        if (gridData.filterable) {
            requestObj.filteredOn = filteredOn;
            requestObj.filterVal = filterVal;
            requestObj.filterType = filterType;
        }

        if (gridData.groupable) {
            requestObj.groupedBy = groupedBy;
        }

        requestObj.pageSize = pageSize;
        requestObj.pageNum = gridData.eventType === 'filter' ? 1 : pageNum;

        gridData.grid.find('.grid-content-div').empty();

        callGridEventHandlers(storage.grids[id].events.pageRequested, gridData.grid, { element: gridData.grid });

        if (gridData.dataSource.get && typeof gridData.dataSource.get === 'function')
            gridData.dataSource.get(requestObj, getPageDataRequestCallback);
        else {
            if (!gridData.alteredData)
                gridData.alteredData = cloneGridData(gridData.originalData);
            getPageData(requestObj, id, getPageDataRequestCallback);
        }

        function getPageDataRequestCallback(response) {
            var groupingStatus = gridData.groupingStatusChanged;
            if (response) {
                //TODO: create a generic function to validate grid-data data types
                //TODO: see if the closure will preserve the known values above - migt have tried this before because I can't imagine why I wouldn't already be making use of the closure.b
                gridData.dataSource.data = response.data;
                gridData.pageSize = requestObj.pageSize;
                gridData.pageNum = requestObj.pageNum;
                gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.length;
                gridData.groupedBy = requestObj.groupedBy;
                gridData.sortedOn = requestObj.sortedOn;
                //gridData.sortedBy = requestObj.sortedBy;
                gridData.filteredOn = requestObj.filteredOn;
                gridData.filterVal = requestObj.filterVal;
                gridData.filterType = requestObj.filterType;
                gridData.groupingStatusChanged = false;

                if (gridData.pageRequest.eventType === 'newGrid' || groupingStatus)
                    setColWidth(gridData, storage.grids[id].grid);

                createGridContent(gridData, storage.grids[id].grid);
                if (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === 'pageSize') {
                    gridData.grid.find('.grid-footer-div').empty();
                    createGridFooter(gridData, gridData.grid);
                }
                if (gridData.pageRequest.eventType === 'filter' && gridData.summaryRow && gridData.summaryRow.positionAt === 'top') {
                    buildHeaderAggregations(gridData, id);
                }
                gridData.pageRequest = {};
            }
        }
    }

    function prepareGridDataUpdateRequest(id) {
        storage.grids[id].updating = true;
        var requestObj = {
            models: storage.grids[id].putRequest.models,
            pageNum: storage.grids[id].putRequest.pageNum
        };

        storage.grids[id].dataSource.put(requestObj, updatePageDataPutRequestCallback);

        function updatePageDataPutRequestCallback(response) {
            storage.grids[id].updating = false;
            if (response) {
                storage.grids[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var index = $(val).parents('tr').index();
                    var field = $(val).parents('td').data('field');
                    var origIdx = storage.grids[id].dataSource.data[index]._initialRowIndex;
                    storage.grids[id].originalData[origIdx][field] = storage.grids[id].dataSource.data[index][field];
                    $(val).remove();
                });
            }
            else {
                storage.grids[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var cell = $(val).parents('td');
                    var index = cell.parents('tr').index();
                    var field = cell.data('field');
                    cell.text(getFormattedCellText(id, cell.data('field'), storage.grids[id].originalData[index][field]));
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
    function getPageData(requestObj, id, callback) {
        var eventType = storage.grids[id].pageRequest.eventType;
        var fullGridData = cloneGridData(storage.grids[id].alteredData);

        if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
            limitPageData(requestObj, fullGridData, callback);
            return;
        }

        if (requestObj.filteredOn) {
            if (requestObj.filterVal !== '') {
                var dataType = storage.grids[id].columns[requestObj.filteredOn].type || 'string';
                fullGridData = filterGridData(requestObj.filterType, requestObj.filterVal, requestObj.filteredOn, dataType, cloneGridData(storage.grids[id].originalData));
            }
            else fullGridData = cloneGridData(storage.grids[id].originalData);
            requestObj.pageNum = 1;		//reset the page to the first page when a filter is applied or removed.
            storage.grids[id].alteredData = fullGridData;
        }

        if (requestObj.groupedBy) {	//Need to group the columns first, before sorting. Sorting grouped columns is going to be a bitch!
            var groupedData = groupColumns(fullGridData, requestObj.groupedBy);
            if (requestObj.sortedOn.length) {
                var sortedGroup = [];
                for (var group in groupedData.groupings) {
                    //sortedGroup = sortedGroup.concat(mergeSort(groupedData.groupings[group], requestObj.sortedOn, storage.grids[id].columns[requestObj.sortedOn].type || 'string'));
                    sortedGroup = sortedGroup.concat(sortGridData(requestObj.sortedOn, groupedData.groupings[group] || cloneGridData(storage.grids[id].originalData), id));
                }
                if (requestObj.sortedBy === 'asc') sortedGroup.reverse();
                storage.grids[id].alteredData = fullGridData;
                limitPageData(requestObj, sortedGroup, callback);
                return;
            }
            storage.grids[id].alteredData = fullGridData;
            limitPageData(requestObj, groupedData.groupedData, callback);
            return;
        }

        if (requestObj.sortedOn.length && !requestObj.groupedBy) {
            sortGridData(requestObj.sortedOn, fullGridData || cloneGridData(storage.grids[id].originalData), id);
        }
        storage.grids[id].alteredData = fullGridData;
        limitPageData(requestObj, fullGridData, callback);
    }

    //==========================================================================================================================//
    //																															//
    //													HELPER FUNCTIONS														//
    //==========================================================================================================================//

    function limitPageData(requestObj, fullGridData, callback) {
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

        callback({ rowCount: fullGridData.length, data: returnData });
    }

    function filterGridData(filterType, value, field, dataType, gridData) {
        var filteredData = [], curVal, baseVal;

        for (var i = 0, length = gridData.length; i < length; i++) {
            if (dataType === 'time') {
                curVal = getNumbersFromTime(gridData[i][field]);
                baseVal = getNumbersFromTime(value);

                if (gridData[i][field].indexOf('PM') > -1)
                    curVal[0] += 12;
                if (value.indexOf('PM') > -1)
                    baseVal[0] += 12;

                curVal = convertTimeArrayToSeconds(curVal);
                baseVal = convertTimeArrayToSeconds(baseVal);
            }
            else if (dataType === 'number') {
                curVal = parseFloat(gridData[i][field]);
                baseVal = parseFloat(value);
            }
            else if (dataType === 'date') {
                curVal = new Date(gridData[i][field]);
                baseVal = new Date(value);
            }
            else {
                curVal = gridData[i][field];
                baseVal = value;
            }
            if (comparator(curVal, baseVal, filterType))
                filteredData.push(gridData[i]);
        }
    }

    function comparator(val, base, type) {
        switch (type) {
            case 'eq':
                return val === base;
            case 'neq':
                return val !== base;
            case 'gte':
                return val >= base;
            case 'gt':
                return val > base;
            case 'lte':
                return val <= base;
            case 'lt':
                return val < base;
            case 'ct':
                return ~val.toLowerCase().indexOf(base.toLowerCase());
            case 'nct':
                return !~val.toLowerCase().indexOf(base.toLowerCase());
        }
    }

    function groupColumns(data, field) {
        var groupings = {};
        for (var i = 0; i < data.length; i++) {
            if (groupings[data[i][field]])
                groupings[data[i][field]].push(data[i]);
            else
                groupings[data[i][field]] = [data[i]];
        }

        var groupedData = [];
        for (var group in groupings) {
            groupedData = groupedData.concat(groupings[group]);
        }

        return { groupings: groupings, groupedData: groupedData };
    }

    function sortGridData (sortedItems, gridData, gridId) {
        for (var i = 0; i < sortedItems.length; i++) {
            if (i === 0)
                gridData = mergeSort(gridData, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string');
            else {
                var sortedGridData = [];
                for (var j = 0; j < gridData.length; j++) {
                    var itemsToSort = [];
                    if (!itemsToSort.length || itemsToSort[0][sortedItems[i-1].field] === gridData[j][sortedItems[i-1].field])
                        itemsToSort.push(gridData[j]);
                    else {
                        if (itemsToSort.length === 1) sortedGridData.concat(itemsToSort);
                        else sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }
                    /*else if (itemsToSort.length === 1) {
                        sortedGridData.concat(itemsToSort);
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }
                    else {
                        sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }*/
                }
                gridData = sortedGridData;
            }
        }
        return gridData;
    }

    /**
     * @method Merge-Sort algorithm for grid data client-side sorting
     * @param {object} data - the grid's data
     * @param {object} sortObj - object that contains the field that the grid data is being sorted on and the direction of the sort
     * @param {string} type - the type of the data (string, number, time, date, boolean)
     * @returns {*}
     */
    function mergeSort(data, sortObj, type) {
        if (data.length < 2) return data;
        var middle = parseInt(data.length / 2);
        var left   = data.slice(0, middle);
        var right  = data.slice(middle, data.length);
        return merge(mergeSort(left, sortObj, type), mergeSort(right, sortObj, type), sortObj, type);
    }

    function merge(left, right, sortObj, type) {
        var result = [], leftVal, rightVal;
        while (left.length && right.length) {
            if (type === 'time') {
                leftVal = getNumbersFromTime(left[0][sortObj.field]);
                rightVal = getNumbersFromTime(right[0][sortObj.field]);

                if (~left[0][sortObj.field].indexOf('PM'))
                    leftVal[0] += 12;
                if (~right[0][sortObj.field].indexOf('PM'))
                    rightVal[0] += 12;

                leftVal = convertTimeArrayToSeconds(leftVal);
                rightVal = convertTimeArrayToSeconds(rightVal);
            }
            else if (type === 'number') {
                leftVal = parseFloat(left[0][sortObj.field]);
                rightVal = parseFloat(right[0][sortObj.field]);
            }
            else if (type === 'date') {
                leftVal = new Date(left[0][sortObj.field]);
                rightVal = new Date(right[0][sortObj.field]);
            }
            else {
                leftVal = left[0][sortObj.field];
                rightVal = right[0][sortObj.field];
            }
            var operator = sortObj.sortDirection === 'asc' ? 'lte' : 'gte';
            comparator(leftVal, rightVal, operator) ? result.push(left.shift()) : result.push(right.shift());
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    function callGridEventHandlers(events, context, param) {
        if (events.length) {
            for (var x = 0; x < events.pageRequested.length; x++)
                events[x].call(context, param);
        }
    }

    function existsInPutRequest(putRequest, model) {
        for (var i = 0; i < putRequest.length; i++) {
            if (model._initialRowIndex == putRequest[i].dirtyData._initialRowIndex)
                return i;
        }
        return -1;
    }

    function getFormattedCellText(gridId, column, value) {
        var text;
        switch(storage.grids[gridId].columns[column].type) {
            case 'number':
                text = formatNumericCellData(value, storage.grids[gridId].columns[column].format);
                break;
            case 'date':
                text = formatDateCellData(value, storage.grids[gridId].columns[column].format);
                break;
            case 'time':
                text = formatTimeCellData(value, column, gridId);
                break;
            case 'string':
            case 'boolean':
                text = value;
                break;
            default:
                text = value;
        }

        var template = storage.grids[gridId].columns[column].template;
        if (template) {
            if (typeof template === 'function')
                return template(text);
            else if (typeof template === 'string')
                return template.replace('{{data}}', text);
            return text;
        }
        return text;
    }

    function getNumbersFromTime(val) {
        var re = new RegExp(dataTypes.time);
        if (!re.test(val))
            return [];
        var timeGroups = re.exec(val);
        var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
        var minutes, seconds, meridiem, retVal = [];
        if (timeGroups[2]) {
            minutes = +timeGroups[3] || 0;
            seconds = +timeGroups[4]  || 0;
            meridiem = timeGroups[5] || null;
        }
        else if (timeGroups[6]) {
            minutes = +timeGroups[8] || 0;
            seconds = +timeGroups[9] || 0;
        }
        else{
            minutes = 0;
            seconds = 0;
        }
        retVal.push(hours);
        retVal.push(minutes);
        retVal.push(seconds);
        if (meridiem)
            retVal.push(meridiem);
        return retVal;
    }

    function convertTimeArrayToSeconds(timeArray) {
        var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
        return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
    }

    function validateCharacter(code, dataType) {
        var key = String.fromCharCode(code),
            newVal = insertKey($(this), key),
            re = new RegExp(dataTypes[dataType]);
        if (!re.test(newVal)) {
            return null;
        }
        return newVal;
    }

    dataTypes = {
        string: '\.*',
        number: '^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$',
        boolean: '^true|false$',
        numeric: '^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$',
        numericTemp: '^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]{0,2})?|0(?:\\.[0-9]{0,2})?|(?:\\.[0-9]{1,2})?)$',
        integer: '^\\-?\\d+$',
        time: '^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$',
        date: '^(?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\2|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\5))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\8)|(?:(29|30)(\\/|-|\\.)' +
        '(0?[1,3-9]|1[0-2])\\11)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\15)|(?:(29)(\\/|-|\\.)(0?2))\\18)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
        '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\22|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\25)((?:1[6-9]|[2-9]\\d)?\\d{2}))))' +
        '|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\29)(29))))|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)' +
        '(?:(?:(?:(0?[13578]|1[02])\\33(31))|(?:(0?[1,3-9]|1[0-2])\\33(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\33(0?[1-9]|1\\d|2[0-8]))))$'
    };

    events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

    aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

    function formatTimeCellData(time, column, gridId) {
        var timeArray = getNumbersFromTime(time),
            formattedTime,
            format = storage.grids[gridId].columns[column].format,
            timeFormat = storage.grids[gridId].columns[column].timeFormat;

        if (timeArray.length < 2) return '';    //TODO: should an empty string be returned here, or the value that was entered?

        if (timeFormat && timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
            timeArray[0] = timeArray[0] === 12 ? 0 : (timeArray[0] + 12);
        else if (timeFormat && timeFormat === '12' && timeArray[0] > 12) {
            timeArray[0] = (timeArray[0] - 12);
            timeArray[3] = 'PM';
        }
        else if (timeFormat && timeFormat === '12' && timeArray.length < 4)
            timeArray[3] = 'AM';

        timeArray[0] = timeArray[0] ? timeArray[0] : '00';
        timeArray[1] = timeArray[1] ? timeArray[1] : '00';
        timeArray[2] = timeArray[2] ? timeArray[2] : '00';
        var meridiem = timeArray[3] || 'AM';

        if (timeArray.length && format) {
            formattedTime = format.replace('hh', timeArray[0]).replace('mm', timeArray[1]).replace('ss', timeArray[2]).replace('A/PM', meridiem);
            return timeArray.length === 4 ? formattedTime + ' ' + timeArray[3] : formattedTime;
        }
        else if (timeArray.length) {
            formattedTime = timeArray[0] + ':' + timeArray[1] + ':' + timeArray[2] + ' ' + timeArray[3];
            return timeArray.length === 3 ? formattedTime + ' ' + timeArray[3] : formattedTime;
        }

        return '';
    }

    function formatDateCellData(date, format) {
        var parseDate = Date.parse(date);
        if (!isNaN(parseDate) && format) {
            var tempDate = new Date(parseDate);
            var dd = tempDate.getUTCDate();
            var mm = tempDate.getUTCMonth() + 1;
            var yy = tempDate.getUTCFullYear();
            return format.replace('mm', mm).replace('dd', dd).replace('yyyy', yy);
        }
        else if (!isNaN(parseDate))
            return new Date(parseDate);
        return '';
    }

    function formatNumericCellData(num, format) {
        if (!format) return num;
        var formatSections = [];
        var dataSections = [];
        var formatObject = (~format.indexOf('P') || ~format.indexOf('C')) ? createCurrencyOrPercentFormat(format) : verifyFormat(format);
        format = formatObject.value;

        var formatDecimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
        formatSections[0] = format.substring(0, formatDecimalIndex).split('').reverse().join('');
        if (formatDecimalIndex < format.length)
            formatSections[1] = format.substring(formatDecimalIndex + 1, format.length);

        var decimals = formatSections[1] ? formatSections[1].length : 0;

        if (formatObject.alterer)
            num = formatObject.alterer(+num);
        num = roundNumber(+num, decimals);
        var sign = 0 > +num ? -1 : 1;
        num = num.toString();
        num = num.replace(new RegExp(',', 'g'), '').replace('-', '');   //remove all commas: either the format didn't specify commas, or we will replace them later
        var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length;
        dataSections[0] = num.substring(0, dataDecimalIndex).split('').reverse().join('');
        if (dataDecimalIndex < format.length)
            dataSections[1] = num.substring(dataDecimalIndex + 1, num.length);
        else if (formatDecimalIndex < format.length)
            dataSections[1] = '';

        var wholeNums = [];
        var charsSinceComma = 0;
        if (formatSections[0].length) {
            var finalCharIndex, i;
            if (formatSections[0].length) {
                finalCharIndex = formatSections[0].length > dataSections[0].length ? formatSections[0].length : dataSections[0].length;
                for (i = 0; i < finalCharIndex; i++) {
                    if (formatObject.shouldInsertSeparators && charsSinceComma === 3 && (dataSections[0].charAt(i) || formatSections[0].charAt(i) === '0')) {
                        wholeNums.push(',');
                        charsSinceComma = 0;
                    }
                    if (dataSections[0].charAt(i)) {
                        wholeNums.push(dataSections[0].charAt(i));
                        charsSinceComma++;
                    }
                    else if (formatSections[0].charAt(i) === '0') {
                        wholeNums.push('0');
                        charsSinceComma++;
                    }
                    else
                        break;
                }
            }
            wholeNums = wholeNums.reverse().join('');

            var fractionNums = [];
            if (formatSections.length > 1) {
                finalCharIndex = formatSections[1].length > dataSections[1].length ? formatSections[1].length : dataSections[1].length;
                for (i = 0; i < finalCharIndex; i++) {
                    if (formatSections[1].charAt(i) && dataSections[1].charAt(i))
                        fractionNums.push(dataSections[1].charAt(i));
                    else if (formatSections[1].charAt(i) === '0')
                        fractionNums.push('0');
                    else
                        break;
                }
            }
            fractionNums = fractionNums.join('');

            var value = fractionNums.length ? wholeNums + '.' + fractionNums : wholeNums;
            return sign === -1 ? formatObject.prependedSymbol + '-' + value + formatObject.appendedSymbol : formatObject.prependedSymbol + value + formatObject.appendedSymbol;
        }
        return num;
    }

    function verifyFormat(format) {
        var formatSections = [];
        format = format.replace(/[^0#,.]/g , '');

        var decimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
        var leadingChars = format.substring(0, decimalIndex);
        var shouldInsertSeparators = leadingChars.indexOf(',') > -1;
        leadingChars = leadingChars.replace(new RegExp(',', 'g'), '');

        formatSections[0] = leadingChars;
        if (decimalIndex < format.length)
            formatSections[1] = format.substring(decimalIndex + 1, format.length).split('').reverse().join('');

        for (var i = 0; i < formatSections.length; i++) {
            var zeroFound = false;
            for (var j = 0; j < formatSections[i].length; j++) {
                if (zeroFound && formatSections[i].charAt(j) !== '0')
                    formatSections[i] = formatSections[i].substring(0, j) + '0' + formatSections[i].substring(j + 1, formatSections[i].length);
                else if (!zeroFound && formatSections[i].charAt(j) === '0')
                    zeroFound = true;
            }
        }

        return {
            value: formatSections.length < 2 ? formatSections[0] : formatSections[0] + '.' + formatSections[1].split('').reverse().join(''),
            shouldInsertSeparators: shouldInsertSeparators,
            alterer: null,
            prependedSymbol: '',
            appendedSymbol: ''
        };
    }

    function createCurrencyOrPercentFormat(format) {
        var charStripper = '\\d{0,2}]';
        var cOrP = ~format.indexOf('P') ? 'P' : 'C';
        format = format.split(cOrP);
        var wholeNums = verifyFormat(format[0]);
        var re = new RegExp('[^' + cOrP + charStripper, 'g');
        format = format[1].replace(re, '');
        var numDecimals = 2,
            newFormat;
        if (format.length)
            numDecimals = parseInt(format.substring(0,2));

        if (wholeNums.value && numDecimals)
            newFormat = wholeNums.value + '.';
        else if (wholeNums.value)
            newFormat = wholeNums.value;
        else if (numDecimals && cOrP === 'C')
            newFormat = '0.';
        else if (numDecimals && cOrP === 'P')
            newFormat = '00.';
        else
            newFormat = cOrP === 'C' ? '0' : '00';

        for (var i = 0; i < numDecimals; i++) {
            newFormat += '0';
        }
        return {
            value: newFormat,
            shouldInsertSeparators: wholeNums.shouldInsertSeparators,
            alterer: cOrP == 'C' ? null : x100,
            prependedSymbol: cOrP === 'C' ? '$' : '',
            appendedSymbol: cOrP === 'P' ? '%' : ''
        };
    }

    function x100(val) {
        return val * 100;
    }

    function roundNumber(val, dec) {
        var pow = Math.pow(10, dec || 0);
        return Math.round((val*pow))/pow;
    }

    function insertKey(input, key) {		//Inserts the new character to it's position in the string based on cursor position
        var loc = getInputSelection(input[0]);
        return input.val().substring(0, loc.start) + key + input.val().substring(loc.end, input.val().length);
    }

    function getInputSelection(el) {		//Finds the cursor position in the input string - includes highlighted ranges.
        var start = 0, end = 0, normalizedValue, range,
            textInputRange, len, endRange;

        if (typeof el.selectionStart == 'number' && typeof el.selectionEnd == 'number') {
            start = el.selectionStart;
            end = el.selectionEnd;
        }
        else {
            range = document.selection.createRange();

            if (range && range.parentElement() == el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, '\n');

                // Create a working TextRange that lives only in the input
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = el.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    start = end = len;
                }
                else {
                    start = -textInputRange.moveStart('character', -len);
                    start += normalizedValue.slice(0, start).split('\n').length - 1;

                    if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                        end = len;
                    }
                    else {
                        end = -textInputRange.moveEnd('character', -len);
                        end += normalizedValue.slice(0, end).split('\n').length - 1;
                    }
                }
            }
        }

        return { start: start, end: end };
    }

    function cloneGridData(gridData) { //Clones grid data so pass-by-reference doesn't mess up the values in other grids.
        if (gridData == null || typeof (gridData) !== 'object')
            return gridData;

        if (Object.prototype.toString.call(gridData) === '[object Array]')
            return cloneArray(gridData);

        var temp = {};
        for (var key in gridData)
            temp[key] = cloneGridData(gridData[key]);

        return temp;
    }

    function cloneArray(arr) {
        var length = arr.length,
            newArr = new arr.constructor(length);

        if (length && typeof arr[0] == 'string' && hasOwnProperty.call(arr, 'index')) {
            newArr.index = arr.index;
            newArr.input = arr.input;
        }

        var index = -1;
        while (++index < length) {
            newArr[index] = cloneGridData(arr[index]);
        }
        return newArr;
    }

    function isDomElement(node) {
        return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === 'object';
    }

    function isNumber(value) {
        return typeof value === 'number' && value === value;
    }

    storage = {
        gridCount: 1,
        grids: []
    };

    Object.defineProperty(
        storage,
        'count',
        {
            get: function _getCount() {
                return this.gridCount++;
            }
        }
    );

    var gridApi = {};

    return Object.defineProperties(
        gridApi, {
            'getGridInstance': {
                value: function getGridInstance(elem) {
                    elem = $(elem);
                    for (var i = 0; i < storage.grids.length; i++) {
                        if (elem[0] === storage.grids[i].grid[0])
                            return storage.grids[i].grid[0].grid;
                    }
                },
                writable: false,
                configurable: false
            },
            'createGrid': {
                get: function _createGrid() {
                    return create;
                }
            },
            'addNewColumns': {
                get: function _addNewColumns() {
                    return addNewColumns;
                }
            }
        }
    );
})(jQuery);