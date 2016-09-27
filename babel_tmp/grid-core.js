'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
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
 - Refactor aggregates row so that it works with server-side paging as well - DONE
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
 - Refactor column width calculations - DONE
 - Fix sorting chevron to not display on top of filter icon when column name is same size as column - DONE
 - Examine headers and fix DOM structure - DONE
 - Remove unused regex values & update 'inputTypes' to use validateCharacter function - DONE
 - Find out what the hell 'groupingStatusChanged' is used for - DONE
 - Update sorting to handle multi-sort - DONE
 - Add server paging + data saving/filtering/sorting - DONE
 - Update API event methods to work with array and namespace - DONE
 - Add "transform" function to be called for the cell data in a column - DONE
 - Create new regex string - one for character input validation, one for submit validation - DONE
 - Prevent filtering on non-safe values/add character validation on input to filtering divs - DONE
 - Determine what to do with input or grid data that does not pass formatting - DONE
 - Ensure all types are implemented across the board (number, time, date, boolean, string) - DONE
 - Fix dirty markers positioning - DONE
 - Fix selectable cells to compare values based on type - DONE
 - Add handler for mounsedown/mouseup event to highlight multiple cells/rows - DONE
 - Fix the 'selecting' status - DONE
 - Make the overlay unable to visually extend beyond the containing div but track the actual dimensions - DONE
 - Work on selecting rows/cells when user scrolls up/down and then changes mouse/scroll direction. - DONE
 - Add grid instance functions that get/set selected grid rows/cells - DONE
 - Update unit tests for new/altered grid instance functionality - DONE
 - Add grid-to-excel export functionality - should work with grid selection - DONE
 - Add multiple-grouping capability - DONE
 - Add number formatting (n) - DONE
 - Add group-aggregate calculations - DONE
 - Refactor aggregate calculations - DONE
 - Add functionality to show/hide columns - DONE
 - Dynamically add new columns - DONE
 - Ensure 'null' does not display in row where no data is provided - DONE
 - Fix dirty span display on empty grid cells - DONE
 - Implement reorderable group items to support 're-grouping' - DONE
 - Make dirty cells check against original data, not the previous value in the cell/dataSource - DONE
 - Fix grid from forgetting a cell has changed values - DONE
 - Fix drop-downs from populating options with same value twice when cell value is same an provided option - DONE
 - Add menu option to specify OR, AND, NOT filters - DONE
 - Add ability to create an arbitrary number of nested filter groups - DONE
 - Add grid config option to restrict number of nested filter groups - DONE
 - Remove all empty filter rows from DOM when closing advanced filters modal - DONE
 - Update existing filtering to new filter object model
 - Make sure that when adding advanced filters, basic filters are cleared out (in DOM and cache), and vise versa
 - Fix boolean filtering
 - Make more enums (event types)
 - UPDATE TO ES6
 - Determine a shared way to check for and reset the columnAdded property of the grid state cache
 > right now, if a column is added and then the column toggle menu is viewed, it will reset the property, but then other
 > grid functionalities won't know a column has been added. Need a way for a single functionality to know if a column has been added,
 > and if that specific functionality has handled the added column or not without repeating the same data for each functionality
 - Add null/empty string values to filtering selectors
 - Add ability to lock/freeze columns
 - Restrict handling of rapid-fire events: scroll, mouse move, mouse out, mouse leave, drag, etc
 - Add integration tests if possible
 - Add type checking - passed in grid data
 - Thoroughly test date & time regex usages
 */

exports.createGrid = createGrid;

var _gridFormattersAndValidators = require('./gridFormattersAndValidators');

var _gridEnumsAndConfigs = require('./gridEnumsAndConfigs');

var _gridDataHelpers = require('./gridDataHelpers');

var _gridHelpers = require('./gridHelpers');

var _expressionParserTmp = require('./expressionParserTmp');

var _gridGroup = require('./grid-group');

var _gridSort = require('./grid-sort');

var _gridFilter = require('./grid-filter');

var _gridExcel = require('./grid-excel');

var _gridSelect = require('./grid-select');

var _gridEdit = require('./grid-edit');

var _gridReorder_resize = require('./grid-reorder_resize');

/*exported grid*/
/**
 * grid module - object for creating and manipulating grid widgets
 * @class grid
 * @function _grid
 * @param {object} $ - jQuery alias
 */
'use strict';
var generateId,
    gridState = [],
    groupMenuText = 'Drag and drop a column header here to group by that column';

/**
 * Exposed on the grid module. Called to create a grid widget.
 * @function create
 * @static
 * @param {object} gridData - The dataSource object needed to initialize the grid
 * @param {object} gridElem - The DOM element that should be used to create the grid widget
 */
function createGrid(gridData, gridElem) {
    if (gridData && (0, _gridHelpers.isDomElement)(gridElem)) {
        var id = generateId();
        if (id > 0) {
            //test to check if previously created grids still exist
            var tmp = id - 1;
            while (tmp > -1) {
                //iterate through all previous grids
                if (gridState[tmp] != null && !$('body').find('#' + gridState[tmp].grid[0].id).length) //if not found in the body
                    delete gridState[tmp]; //remove the data from storage
                tmp--;
            }
        }
        gridElem = $(gridElem);
        var wrapperDiv = $('<div id="grid-wrapper-' + id + '" data-grid_id="' + id + '" class=grid-wrapper></div>').appendTo(gridElem);
        var headerDiv = $('<div id="grid-header-' + id + '" data-grid_header_id="' + id + '" class=grid-header-div></div>').appendTo(wrapperDiv);
        headerDiv.append('<div class=grid-header-wrapper></div>');
        wrapperDiv.append('<div id="grid-content-' + id + '" data-grid_content_id="' + id + '" class=grid-content-div></div>');
        wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');

        gridState[id] = {};
        gridElem[0].grid = {};

        createGridInstanceMethods(gridElem, id);

        gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === 'function' ? validator.setAdditionalEvents(['blur', 'change']) : gridData.useValidator = false;
        gridData.useFormatter = gridData.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === 'function';

        if (gridData.constructor === Array) createGridColumnsFromArray(gridData, gridElem);else {
            createGridHeaders(gridData, gridElem);
            getInitialGridData(gridData.dataSource, function initialGridDataCallback(err, res) {
                if (!err) {
                    gridData.dataSource.data = res.data;
                    gridData.dataSource.rowCount = res.rowCount || 25;
                    if (res.aggregations) {
                        for (var col in gridData.aggregates) {
                            if (res.aggregations[col]) gridData.aggregates[col].value = res.aggregations[col];
                        }
                    }
                } else {
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
 * @param {number} gridId - The id of this grid's instance
 */
function createGridInstanceMethods(gridElem, gridId) {

    Object.defineProperty(gridElem[0].grid, 'exportToExcel', {
        value: function _exportToExcel(exportType) {
            if (!_gridExcel.isExcelInitialized) (0, _gridExcel.excel_init)(gridState[gridId]);
            (0, _gridExcel.exportDataAsExcelFile)(gridId, exportType || 'page');
        }
    });

    Object.defineProperty(gridElem[0].grid, 'activeCellData', {
        /**
         * Returns the DOM element for the current active cell in the grid and metadata about the cell
         * @method activeCellData
         * @for Grid DOM element
         * @protected
         * @readonly
         * @type string
         * @returns {object|null} - An object containing the active cell's current value, row index, column index,
         * column field, and the DOM element itself
         */
        get: function _getActiveCellData() {
            var cell = gridElem.find('.active-cell');
            if (!cell.length) return null;
            var field = cell.parents('td').data('field');
            var colIndex = cell.parents('.grid-wrapper').find('.grid-header-wrapper').find('.grid-headerRow').children('[data-field="' + field + '"]').data('index');
            if (cell[0].type === 'checkbox') return { data: cell[0].checked, row: cell.parents('tr').index(), column: colIndex, field: field };
            return { data: cell.val(), row: cell.parents('tr').index(), column: colIndex, field: field, cell: cell.parents('td')[0] };
        },
        configurable: false
    });

    Object.defineProperty(gridElem[0].grid, 'selected', {
        /**
         * Returns the collection of selected grid items (row or columns) as an array.
         * @returns {Array} - The collection of selected grid items
         */
        get: function _getSelectedItems() {
            var selectedItems = [];
            gridElem.find('.selected').each(function iteratedSelectedGridItems(idx, val) {
                selectedItems.push(val);
            });
            return selectedItems;
        },
        /**
         * Sets the selected row and/or columns of the grid.
         * @param {Array} itemArray - Ay array of objects that have a zero-based 'rowIndex' property to indicate which row is to be selected.
         * Optionally each object may have a zero-based 'columnIndex' property that indicates which column of the row to select.
         */
        set: function _setSelectedItems(itemArray) {
            if (!itemArray || itemArray.constructor !== Array) return;
            for (var i = 0; i < itemArray.length; i++) {
                if (typeof itemArray[i].rowIndex !== 'number') continue;
                var row = gridElem.find('.grid-content-div').find('tbody').children('tr:nth-child(' + (itemArray[i].rowIndex + 1) + ')');
                if (typeof itemArray[i].columnIndex === 'number') {
                    row.children('td:nth-child(' + (itemArray[i].columnIndex + 1) + ')').addClass('selected');
                } else row.addClass('selected');
            }
        },
        configurable: false
    });

    Object.defineProperty(gridElem[0].grid, 'selectedData', {
        /**
         * Returns metadata about each selected item in the grid.
         */
        get: function _getSelectedGridItemData() {
            var data = [];
            gridElem.find('.selected').each(function getSelectedElementData(index, value) {
                var item = $(value);
                if (value.tagName.toLowerCase() === 'tr') {
                    var rowIndex = item.index();
                    $(value).children().each(function iterateTableCells(idx, val) {
                        var cell = $(val);
                        data.push({ rowIndex: rowIndex, columnIndex: cell.index(), data: cell.text(), field: cell.data('field') });
                    });
                } else {
                    data.push({ rowIndex: item.parents('tr').index(), columnIndex: item.index(), data: item.text(), field: item.data('field') });
                }
            });
            return data;
        },
        configurable: false
    });

    Object.defineProperties(gridElem[0].grid, {
        'bindEvents': {
            /**
             * Binds event handlers to events
             * @method bindEvents
             * @for Grid DOM element
             * @protected
             * @param {string} evt - a string representing an event that the grid can cause
             * @param {*} funcs - the event handler
             * @returns {boolean} - indicates that the provided function(s) were or were not added as event listeners.
             */
            value: function _bindGridEvents(evt, funcs) {
                if (!funcs || typeof funcs !== 'function' && funcs.constructor !== Array) return false;
                if (typeof funcs === 'function') funcs = [funcs];
                if (~_gridEnumsAndConfigs.events.indexOf(evt)) {
                    gridState[gridId].events[evt] = gridState[gridId].events[evt].concat(funcs);
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
             * @method unbindEvents
             * @for Grid DOM element
             * @protected
             * @param {string} evt - a string representing an event that the grid can cause
             * @param {*} funcs - the function object, or array of function objects to unbind
             * @returns {boolean} - indicates that the provided function(s) were or were not unbound
             */
            value: function _unbindEvents(evt, funcs) {
                if (~_gridEnumsAndConfigs.events.indexOf(evt) && (funcs || typeof funcs === 'function' || funcs.constructor === Array)) {
                    if (typeof funcs === 'function') funcs = [funcs];
                    var tmpEvts = [];
                    for (var i = 0; i < gridState[gridId].events[evt].length; i++) {
                        for (var j = 0; j < funcs.length; j++) {
                            if (gridState[gridId].events[evt][i] !== funcs[j]) tmpEvts.push(gridState[gridId].events[evt][i]);
                        }
                    }
                    gridState[gridId].events[evt] = tmpEvts;
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
             * @method removeAllEventHandlers
             * @for Grid DOM element
             * @protected
             */
            value: function _removeAllEventHandlers() {
                for (var i = 0; i < _gridEnumsAndConfigs.events.length; i++) {
                    gridState[gridId].events[_gridEnumsAndConfigs.events[i]] = [];
                }
            },
            writable: false,
            configurable: false
        },
        'getHandledEvents': {
            /**
             * Returns all events for which a handler has been registered
             * @method getHandledEvents
             * @for Grid DOM element
             * @protected
             * @readonly
             * @default Array of grid events that currently have registered a handler
             * @type Array
             * @returns {Array} - The list of events that currently have a handler
             */
            value: function _getHandledEvents() {
                var evts = [];
                for (var i = 0; i < _gridEnumsAndConfigs.events.length; i++) {
                    if (gridState[gridId].events[_gridEnumsAndConfigs.events[i]].length) evts.push(_gridEnumsAndConfigs.events[i]);
                }
                return evts;
            },
            writable: false,
            configurable: false
        },
        'getAvailableEvents': {
            /**
             * Returns a list of the events that the grid can cause
             * @method getAvailableEvents
             * @for Grid DOM element
             * @protected
             * @readonly
             * @default Array of available grid events to listen for
             * @type Array
             * @returns {Array} - The list of all events that a handler can be registered for
             */
            value: function _getAvailableEvents() {
                return _gridEnumsAndConfigs.events;
            },
            writable: false,
            configurable: false
        },
        'hideColumn': {
            /**
             * Hides a column that is being displayed in the grid
             * @param {string} col - The name of the column to hide
             */
            value: function _hideColumn(col) {
                if (gridState[gridId].columns[col]) {
                    gridState[gridId].columns[col].isHidden = true;
                    gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', 'none');
                    gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', 'none');
                    var colGroups = gridState[gridId].grid.find('colgroup');
                    var group1 = $(colGroups[0]).find('col');
                    var group2 = $(colGroups[1]).find('col');
                    if (gridState[gridId].groupedBy.length) {
                        for (var i = 0; i < group1.length; i++) {
                            if (!group1[i].hasClass('group_col')) {
                                $(group1[i]).remove();
                                $(group2[i]).remove();
                            }
                        }
                    } else {
                        $(group1[0]).remove();
                        $(group2[0]).remove();
                    }
                }
            },
            writable: false,
            configurable: false
        },
        'showColumn': {
            /**
             * Displays a column that was previously hidden from view in the grid
             * @param {string} col - The name of the hidden column
             */
            value: function _showColumn(col) {
                if (gridState[gridId].columns[col] && gridState[gridId].columns[col].isHidden) {
                    gridState[gridId].columns[col].isHidden = false;
                    gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', '');
                    gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', '');
                    gridState[gridId].grid.find('colgroup').append('col');
                    setColWidth(gridState[gridId], gridState[gridId].grid);
                }
            },
            writable: false,
            configurable: false
        },
        'addColumn': {
            /**
             * Adds a new column to the grid
             * @param {string|Object} column - Either the name of the column to be added to the grid,
             * or a column object akin to what is passed into the grid to initialize the widget.
             * @param {Array} data - A collection of values for the new column. Need to match the existing
             * rows in the grid because they will be paired with them; both in the display and in the model.
             */
            value: function _addColumn(column, data) {
                if ((typeof column === 'undefined' ? 'undefined' : _typeof(column)) !== 'object' && typeof column !== 'string' || !data || !data.length) return;
                var field = (typeof column === 'undefined' ? 'undefined' : _typeof(column)) === 'object' ? column.field || 'field' : column,
                    newCol;
                if (!gridState[gridId].columns[field]) {
                    for (var i = 0; i < gridState[gridId].dataSource.data.length; i++) {
                        gridState[gridId].dataSource.data[i][field] = data[i] ? data[i] : null;
                    }
                    if ((typeof column === 'undefined' ? 'undefined' : _typeof(column)) === 'object') newCol = column;else {
                        newCol = {};
                    }
                    newCol.filterable = newCol.filterable || false;
                    newCol.editable = newCol.editable || false;
                    newCol.selectable = newCol.selectable || false;
                    newCol.title = newCol.title || field;
                    newCol.type = newCol.type || 'string';

                    gridState[gridId].columns[field] = newCol;
                    if (gridState[gridId].aggregates) gridState[gridId].aggregates[field] = {
                        type: newCol.type
                    };

                    gridState[gridId].hasAddedColumn = true;
                    gridState[gridId].grid.find('.grid-header-wrapper').empty();
                    createGridHeaders(gridState[gridId], gridElem);
                    gridState[gridId].grid.find('.grid-content-div').empty();
                    setColWidth(gridState[gridId], gridState[gridId].grid);
                    createGridContent(gridState[gridId], gridState[gridId].grid);
                    gridState[gridId].grid.find('.grid-footer-div').empty();
                    createGridFooter(gridState[gridId], gridState[gridId].grid);
                    buildHeaderAggregations(gridId);
                }
            },
            writable: false,
            configurable: false
        },
        'addRow': {
            /**
             * Adds a new row to the table; with either 'null' values if no data was passed in, or with the values given
             * @param {Object} data - A javascript model object with the same properties as the grid's model collection objects.
             */
            value: function _addRow(data) {
                var newModel = {},
                    prop;
                if (!data) {
                    for (prop in gridState[gridId].dataSource.data[0]) {
                        if (prop !== '_initialRowIndex') newModel[prop] = null;
                    }
                } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
                    for (prop in gridState[gridId].dataSource.data[0]) {
                        if (typeof data[prop] !== 'undefined') newModel[prop] = data[prop];else newModel[prop] = null;
                    }
                }
                gridState[gridId].originalData.push(newModel);
                var dataSourceModel = (0, _gridHelpers.cloneGridData)(newModel);
                dataSourceModel._initialRowIndex = gridState[gridId].dataSource.data.length;
                gridState[gridId].dataSource.data.push(dataSourceModel);
                gridState[gridId].dataSource.rowCount++;

                gridState[gridId].pageSize = gridState[gridId].pageSize + 1;
                gridState[gridId].grid.find('.grid-content-div').empty();
                createGridContent(gridState[gridId], gridState[gridId].grid);
                gridState[gridId].grid.find('.grid-footer-div').empty();
                createGridFooter(gridState[gridId], gridState[gridId].grid);
                buildHeaderAggregations(gridId);
            },
            writable: false,
            configurable: false
        },
        'getAggregates': {
            /**
             * Returns the aggregations for all columns
             * @method getAggregates
             * @for Grid DOM element
             * @protected
             * @readonly
             * @default aggregates object
             * @type object
             * @returns {Object} - The aggregations that are currently in use for this page of the grid
             */
            value: function _getAggregates() {
                return gridState[gridId].gridAggregations;
            },
            writable: false,
            configurable: false
        },
        'getCurrentPageData': {
            /**
             * Returns the grid's page data.
             * @method getCurrentPageData
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
                if (typeof index === 'number' && index > -1 && index <= gridState[gridId].dataSource.data.length) {
                    validRow = findValidRows(index);
                    if (validRow) rows.push(validRow);
                } else {
                    for (var i = 0; i < gridState[gridId].pageSize; i++) {
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
                    gridState[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                        if ($(this).hasClass('grouped_row_header')) return true;
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
             * @method getCurrentDataSourceData
             * @for Grid DOM element
             * @protected
             * @param {int} index - The index of the dataSource.data to return the data for.
             * @returns {Array} - An array with either all grid page data, or a single index's data if a
             * valid index was passed to the function
             */
            value: function _getCurrentDataSourceData(index) {
                var i;
                if (typeof index === 'number' && index > -1 && index <= gridState[gridId].dataSource.data.length) {
                    var val = (0, _gridHelpers.cloneGridData)([].concat(gridState[gridId].dataSource.data[index]));
                    delete val[0]._initialRowIndex;
                    return val;
                } else {
                    var gd = (0, _gridHelpers.cloneGridData)(gridState[gridId].dataSource.data);
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
             * @method updatePageData
             * @for Grid DOM element
             * @protected
             * @param {object} data
             */
            value: function _updatePageData(data) {
                if (data != null && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data.constructor === Array) {
                    gridState[gridId].dataSource.data = data;
                    gridState[gridId].pageSize = data.length;
                    gridState[gridId].dataSource.rowCount = data.length;
                    gridState[gridId].grid.find('.grid-content-div').empty();
                    createGridContent(gridState[gridId], gridState[gridId].grid);
                    gridState[gridId].grid.find('.grid-footer-div').empty();
                    createGridFooter(gridState[gridId], gridState[gridId].grid);
                    buildHeaderAggregations(gridId);
                }
            },
            writable: false,
            configurable: false
        },
        'updateRowData': {
            /**
             * Updates the specified grid's row's data via the .index property
             * @method updateRowData
             * @for Grid DOM element
             * @protected
             * @param {object} rowData
             */
            value: function _updateRowData(rowData) {
                var appliedUpdate = false;
                if (!rowData) return;
                if (rowData.constructor === Array) {
                    for (var i = 0; i < rowData.length; i++) {
                        if (typeof rowData[i].index !== 'number' || rowData[i].index >= gridState[gridId].dataSource.data.length) continue;
                        gridState[gridId].dataSource.data[rowData[i].index] = rowData[i].data;
                        appliedUpdate = true;
                    }
                } else if (typeof rowData.index === 'number') {
                    gridState[gridId].dataSource.data[rowData.index] = rowData.data;
                    appliedUpdate = true;
                }

                if (appliedUpdate) {
                    gridState[gridId].grid.find('.grid-content-div').empty();
                    createGridContent(gridState[gridId], gridState[gridId].grid);
                    gridState[gridId].grid.find('.grid-footer-div').empty();
                    createGridFooter(gridState[gridId], gridState[gridId].grid);
                    buildHeaderAggregations(gridId);
                }
            },
            writable: false,
            configurable: false
        },
        'updateCellData': {
            /**
             * Updates the specified grid's cell's data via the .index and .field properties
             * @method updateCellData
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
                } else applyUpdate(cellData, setAsDirty);

                function applyUpdate(cell, setAsDirty) {
                    if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > gridState[gridId].dataSource.data.length) return;
                    if (gridState[gridId].columns[cell.field]) {
                        var dataType = gridState[gridId].columns[cell.field].type;
                        if (!dataType) dataType = 'string';
                        if (dataType !== 'time' && dataType !== 'date' && dataType !== 'datetime') {
                            if (_typeof(cell.value) !== dataType) return;
                        } else {
                            var re = new RegExp(gridEnums.dataTypes[dataType]);
                            if (!re.test(cell.value)) return;
                        }
                        gridState[gridId].dataSource.data[cell.index][cell.field] = cell.value;
                        var tableCell;
                        if (gridState[gridId].groupedBy) {
                            var counter = 0;
                            gridState[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                                if ($(this).hasClass('grouped_row_header')) return true;
                                if (counter === cell.index) {
                                    tableCell = $(this).find('[data-field="' + cell.field + '"]');
                                    return false;
                                }
                                counter++;
                            });
                        } else tableCell = gridState[gridId].grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
                        var text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, cell.field, cell.value) || cell.value;
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
             * @method destroy
             * @for Grid DOM element
             * @protected
             */
            value: function _destroy() {
                findChildren(gridState[gridId].grid.children());
                delete gridState[gridId];

                function findChildren(nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        var child = $(nodes[i]);
                        while (child.children().length) {
                            findChildren(child.children());
                        }child.off();
                        child.remove();
                    }
                }
            },
            writable: false,
            configurable: false
        },
        'removeSelection': {
            /**
             * Removes all selected grid items
             */
            value: function _removeSelection() {
                gridElem.find('.selected').each(function removeSelectedClass(idx, val) {
                    $(val).removeClass('selected');
                });
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
    if (dataSource && _typeof(dataSource.data) === 'object') callback(null, { data: dataSource.data, rowCount: dataSource.rowCount });else if (typeof dataSource.get == 'function') {
        dataSource.get({ pageSize: 25, pageNum: 1 }, function gridDataCallback(data) {
            if (data) callback(null, data);else callback(true, {});
        });
    } else callback(true, {});
}

/**
 * Initializes an instance of the grid after retrieving the dataSource data.
 * Sets the internal instance of the grid's data, calls to create the footer and content
 * @method initializeGrid
 * @for grid
 * @private
 * @param {number} id
 * @param {object} gridData
 * @param {object} gridElem
 */
function initializeGrid(id, gridData, gridElem) {
    var storageData = (0, _gridHelpers.cloneGridData)(gridData);
    storageData.events = {
        beforeCellEdit: _typeof(storageData.beforeCellEdit) === 'object' && storageData.beforeCellEdit.constructor === Array ? storageData.beforeCellEdit : [],
        cellEditChange: _typeof(storageData.cellEditChange) === 'object' && storageData.cellEditChange.constructor === Array ? storageData.cellEditChange : [],
        afterCellEdit: _typeof(storageData.afterCellEdit) === 'object' && storageData.afterCellEdit.constructor === Array ? storageData.afterCellEdit : [],
        pageRequested: _typeof(storageData.pageRequested) === 'object' && storageData.pageRequested.constructor === Array ? storageData.pageRequested : [],
        beforeDataBind: _typeof(storageData.beforeDataBind) === 'object' && storageData.beforeDataBind.constructor === Array ? storageData.beforeDataBind : [],
        afterDataBind: _typeof(storageData.afterDataBind) === 'object' && storageData.afterDataBind.constructor === Array ? storageData.afterDataBind : [],
        columnReorder: _typeof(storageData.columnReorder) === 'object' && storageData.columnReorder.constructor === Array ? storageData.columnReorder : []
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

    storageData.originalData = (0, _gridHelpers.cloneGridData)(gridData.dataSource.data);
    storageData.pageNum = 1;
    storageData.pageSize = gridData.pageSize || 25;
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
    if (!storageData.dataSource.rowCount) storageData.dataSource.rowCount = gridData.dataSource.data.length;

    var eventObj = { element: storageData.grid };
    callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

    gridState[id] = storageData;
    if (gridData.aggregates && typeof gridData.dataSource.get === 'function') {
        constructAggregationsFromServer(id, storageData.gridAggregations);
        buildHeaderAggregations(id);
    }

    createGridFooter(storageData, gridElem);
    createGridContent(storageData, gridElem);
    callGridEventHandlers(storageData.events.afterDataBind, storageData.grid, eventObj);
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
    var gridHeader = gridElem.find('.grid-header-div'),
        gridHeadWrap = gridHeader.find('.grid-header-wrapper'),
        headerTable = $('<table></table>').appendTo(gridHeadWrap);
    headerTable.css('width', 'auto');
    var colgroup = $('<colgroup></colgroup>').appendTo(headerTable),
        headerTHead = $('<thead></thead>').appendTo(headerTable),
        headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead),
        index = 0,
        id = gridHeader.data('grid_header_id'),
        i,
        columnCount = 0;

    //TODO: I think this will work for data that is already grouped; specifically when adding a new column. However, it may work or be
    //TODO: adjusted to work with data coming from the server on widget creation
    if (gridData.groupedBy && gridData.groupedBy.length) {
        for (i = 0; i < gridData.groupedBy.length; i++) {
            colgroup.prepend('<col class="group_col"/>');
            headerRow.prepend('<th class="group_spacer">&nbsp</th>');
        }
    }

    for (var col in gridData.columns) {
        columnCount++;
        if (_typeof(gridData.columns[col]) !== 'object') continue;
        $('<col/>').appendTo(colgroup);
        var text = gridData.columns[col].title || col;
        var th = $('<th id="' + col + '_grid_id_' + id + '" data-field="' + col + '" data-index="' + index + '" class=grid-header-cell></th>').appendTo(headerRow);

        if (_typeof(gridData.columns[col].attributes) === 'object' && gridData.columns[col].attributes.headerClasses && gridData.columns[col].attributes.headerClasses.constructor === Array) {
            for (i = 0; i < gridData.columns[col].attributes.headerClasses.length; i++) {
                th.addClass(gridData.columns[col].attributes.headerClasses[i]);
            }
        }

        if (gridData.reorderable === true && (typeof gridData.columns[col].reorderable === 'undefined' || gridData.columns[col].reorderable === true)) {
            th.prop('draggable', true);
            (0, _gridReorder_resize.setDragAndDropListeners)(th);
        }
        if (gridData.sortable === true && (typeof gridData.columns[col].sortable === 'undefined' || gridData.columns[col].sortable === true)) {
            (0, _gridSort.setSortableClickListener)(th);
            gridData.sortable = true;
        }

        if (gridData.columns[col].filterable === true) {
            (0, _gridFilter.setFilterableClickListener)(th, gridData, col);
            gridData.filterable = true;
            gridData.advancedFiltering = gridData.advancedFiltering != null ? gridData.advancedFiltering : false;
        }

        if (gridData.columns[col].editable || gridData.columns[col].selectable || gridData.groupable) createGridToolbar(gridData, gridElem, gridData.columns[col].editable || gridData.columns[col].selectable);

        $('<a class="header-anchor" href="#"></a>').appendTo(th).text(text);
        index++;
    }
    headerTable.css('width', '');
    gridData.numColumns = columnCount;
    setColWidth(gridData, gridElem);
}

/**
 * Builds the header's aggregations row if specified to be displayed at the
 * top of the grid
 * @method buildHeaderAggregations
 * @for grid
 * @private
 * @param {number} gridId
 */
function buildHeaderAggregations(gridId) {
    var aggrs = gridState[gridId].gridAggregations;
    if (aggrs) {
        var headerTHead = $('#grid-header-' + gridId).find('thead');
        var aggRow = headerTHead.find('.summary-row-header');
        if (aggRow.length) aggRow.remove();
        aggRow = $('<tr class=summary-row-header></tr>').appendTo(headerTHead);
        if (gridState[gridId].groupedBy.length) {
            for (var i = 0; i < gridState[gridId].groupedBy.length; i++) {
                aggRow.append('<td class="group_spacer">&nbsp</td>');
            }
        }
        for (var col in aggrs) {
            var text = aggrs[col].text || '';
            aggRow.append('<td data-field="' + col + '" class=summary-cell-header>' + text + '</td>');
        }
    }
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
    var contentHeight,
        footerHeight = parseFloat(gridElem.find('.grid-footer-div').css('height')),
        headerHeight = parseFloat(gridElem.find('.grid-header-div').css('height')),
        toolbarHeight = 0;
    if (gridElem.find('.toolbar')) toolbarHeight = parseFloat(gridElem.find('.toolbar').css('height'));

    contentHeight = gridData.height && (0, _gridHelpers.isNumber)(parseFloat(gridData.height)) ? gridData.height - (headerHeight + footerHeight + toolbarHeight) + 'px' : '250px';
    var gridContent = gridElem.find('.grid-content-div').css('height', contentHeight),
        id = gridContent.data('grid_content_id'),
        gcOffsets = gridContent.offset(),
        top = gcOffsets.top + gridContent.height() / 2 + $(window).scrollTop(),
        left = gcOffsets.left + gridContent.width() / 2 + $(window).scrollLeft(),
        loader = $('<span id="loader-span" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left),
        contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
        colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
        contentTBody = $('<tbody></tbody>').appendTo(contentTable),
        text,
        i,
        j,
        k,
        item;
    if (gridData.selectable) (0, _gridSelect.attachTableSelectHandler)(contentTBody);
    var columns = [];
    gridElem.find('th').each(function headerIterationCallback(idx, val) {
        if (!$(val).hasClass('group_spacer')) columns.push($(val).data('field'));
    });

    var rowEnd = gridData.pageSize > gridData.dataSource.data.length ? gridData.dataSource.data.length : gridData.pageSize,
        rows = gridData.rows,
        currentGroupingValues = {};

    if (gridData.groupAggregates) gridData.groupAggregations = {};

    for (i = 0; i < rowEnd; i++) {
        gridData.dataSource.data[i]._initialRowIndex = i;
        if (gridData.groupedBy && gridData.groupedBy.length) (0, _gridGroup.createGroupedRows)(id, i, columns, currentGroupingValues, contentTBody);

        var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
        if (i % 2) {
            tr.addClass('alt-row');
            if (rows && rows.alternateRows && rows.alternateRows.constructor === Array) for (j = 0; j < rows.alternateRows.length; j++) {
                tr.addClass(rows.alternateRows[j].toString());
            }
        }

        if (rows && rows.all && rows.all.constructor === Array) {
            for (j = 0; j < rows.all.length; j++) {
                tr.addClass(rows.all[j].toString());
            }
        }

        if (gridData.groupedBy.length) {
            for (j = 0; j < gridData.groupedBy.length; j++) {
                tr.append('<td class="grouped_cell">&nbsp</td>');
            }
        }

        for (j = 0; j < columns.length; j++) {
            var td = $('<td data-field="' + columns[j] + '" class="grid-content-cell"></td>').appendTo(tr);
            if (gridData.columns[columns[j]].attributes && gridData.columns[columns[j]].attributes.cellClasses && gridData.columns[columns[j]].attributes.cellClasses.constructor === Array) {
                for (k = 0; k < gridData.columns[columns[j]].attributes.cellClasses.length; k++) {
                    td.addClass(gridData.columns[columns[j]].attributes.cellClasses[k]);
                }
            }
            text = (0, _gridFormattersAndValidators.getFormattedCellText)(id, columns[j], gridData.dataSource.data[i][columns[j]]) || gridData.dataSource.data[i][columns[j]];
            text = text == null ? '' : text;
            td.text(text);
            if (gridData.aggregates) addValueToAggregations(id, columns[j], gridData.dataSource.data[i][columns[j]], gridData.gridAggregations);
            //attach event handlers to save data
            if (gridData.columns[columns[j]].editable && gridData.columns[columns[j]].editable !== 'drop-down') {
                (0, _gridEdit.makeCellEditable)(id, td);
                gridState[id].editable = true;
            } else if (gridData.columns[columns[j]].editable === 'drop-down') {
                (0, _gridEdit.makeCellSelectable)(id, td);
                gridState[id].editable = true;
            }
        }
    }

    for (i = 0; i < columns.length; i++) {
        colGroup.append('<col/>');
    }
    if (gridData.groupedBy.length) {
        for (j = 0; j < gridData.groupedBy.length; j++) {
            colGroup.prepend('<col class="group_col"/>');
        }
    }

    if (gridData.aggregates && gridData.aggregates.positionAt === 'top' && typeof gridData.dataSource.get !== 'function') buildHeaderAggregations(id);

    if (gridData.aggregates && gridData.aggregates.positionAt === 'bottom') {
        var aggrs = gridState[id].gridAggregations;
        if (aggrs) {
            var aggRow = $('<tr class="summary-row-footer"></tr>').appendTo(contentTBody);
            if (gridState[id].groupedBy.length) {
                for (i = 0; i < gridState[id].groupedBy.length; i++) {
                    aggRow.append('<td class="group_spacer">&nbsp</td>');
                }
            }
            for (item in aggrs) {
                text = aggrs[item].value || '';
                aggRow.append('<td data-field="' + item + '" class=summary-cell-header>' + text + '</td>');
            }
        }
    }

    (0, _gridGroup.createGroupTrEventHandlers)();

    gridContent.on('scroll', function contentDivScrollCallback(e) {
        var cDiv = $(e.currentTarget);
        var headWrap = cDiv.parents('.grid-wrapper').find('.grid-header-wrapper');
        if (gridState[headWrap.parent().data('grid_header_id')].resizing) return;
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

    gridState[id].dataSource.data = gridData.dataSource.data;
    loader.remove();
    gridState[id].updating = false;
}

/**
 * Takes the server's aggregate calculations and formats them for grid consumption
 * @param {number} gridId - The id of the grid widget instance
 * @param {Object} aggregationObj - The object that hold the aggregates
 */
function constructAggregationsFromServer(gridId, aggregationObj) {
    for (var col in gridState[gridId].columns) {
        if (!aggregationObj[col]) aggregationObj[col] = {};
        if (!gridState[gridId].aggregates[col]) {
            aggregationObj[col] = '';
            continue;
        }
        if (typeof gridState[gridId].dataSource.get === 'function') {
            //TODO: why do I need to check for typing here? Can't I just use it if it's available and assume a string if not?
            if (gridState[gridId].aggregates[col].type && gridState[gridId].aggregates[col].value) {
                var text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, col, gridState[gridId].aggregates[col].value) || gridState[gridId].aggregates[col].value;
                aggregationObj[col].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[col].type] + text;
            } else aggregationObj[col].text = null;
        }
    }
}

/**
 * Used for calculating both client-side full-grid aggregates, as well as grouped aggregates
 * @param {number} gridId - The id of the grid widget instance
 * @param {string} field - The name of the field being aggregated
 * @param {*} value - The value of the current row's field (i.e. a single cell in the grid)
 * @param {Object} aggregationObj - The object used to cache the aggregates
 */
function addValueToAggregations(gridId, field, value, aggregationObj) {
    var text, total;
    if (!aggregationObj[field]) aggregationObj[field] = {};
    if (value == null) return;
    switch (gridState[gridId].aggregates[field].type) {
        case 'count':
            aggregationObj[field].value = (aggregationObj[field].value || 0) + 1;
            aggregationObj[field].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[field].type] + aggregationObj[field].value;
            return;
        case 'average':
            var count = aggregationObj[field].count ? aggregationObj[field].count + 1 : 1;
            value = parseFloat(value.toString());
            total = aggregationObj[field].total ? aggregationObj[field].total + value : value;
            var avg = parseFloat(parseFloat(total / count));
            text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, field, avg.toFixed(2)) || avg.toFixed(2);
            aggregationObj[field].total = total;
            aggregationObj[field].count = count;
            aggregationObj[field].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[field].type] + text;
            aggregationObj[field].value = avg;
            return;
        case 'max':
            if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) < parseFloat(value.toString())) {
                text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, field, value) || value;
                aggregationObj[field].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[field].type] + text;
                aggregationObj[field].value = value;
            }
            return;
        case 'min':
            if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) > parseFloat(value.toString())) {
                text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, field, value) || value;
                aggregationObj[field].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[field].type] + text;
                aggregationObj[field].value = text;
            }
            return;
        case 'total':
            total = (parseFloat(aggregationObj[field].total) || 0) + parseFloat(value);
            text = (0, _gridFormattersAndValidators.getFormattedCellText)(gridId, field, total) || total;
            aggregationObj[field].total = total;
            aggregationObj[field].text = _gridEnumsAndConfigs.aggregates[gridState[gridId].aggregates[field].type] + text;
            aggregationObj[field].value = text;
            return;
        default:
            aggregationObj[field].text = null;
    }
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
        if (!gridData.columns[name].isHidden) {
            columnNames[name] = (0, _gridHelpers.isNumber)(gridData.columns[name].width) ? gridData.columns[name].width : null;
            columnList.push(name);
        }
    }
    var colGroups = tableDiv.find('col');

    colGroups.each(function iterateColsCallback(idx, val) {
        var i = idx;
        if (gridData.groupedBy && gridData.groupedBy.length) {
            i = idx % (colGroups.length / 2) - gridData.groupedBy.length;
        }
        if (gridData.groupedBy && gridData.groupedBy.length && idx < gridData.groupedBy.length) {
            $(val).css('width', 27);
        } else if (columnNames[columnList[i]] != null) {
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
        if ($(val).hasClass('group_col')) return;
        var width;
        if (width = $(headerCols[idx]).width()) $(val).css('width', width);
    });
}

/**
 * Creates the toolbar div used for saving and deleting changes as well as grouping the grid's
 * data by selected columns
 * @param {object} gridData - The collection of data displayed in the grid
 * @param {object} gridElem - The DOM element used for the grid widget
 * @param {boolean} canEdit - Indicates if a column in the grid can be edited
 */
function createGridToolbar(gridData, gridElem, canEdit) {
    var id = gridElem.find('.grid-wrapper').data('grid_id');
    if ($('#grid_' + id + '_toolbar').length) return; //if the toolbar has already been created, don't create it again.

    if (gridData.groupable) {
        var groupMenuBar = $('<div id="grid_' + id + '_group_div" class="group_div clearfix" data-grid_id="' + id + '">' + groupMenuText + '</div>').prependTo(gridElem);
        groupMenuBar.on('drop', function handleDropCallback(e) {
            //TODO: figure out why debugging this in the browser causes two server requests to be made;
            //TODO: 1 to get the grouped data that fails, and a second call when the page reloads for no apparent reason
            var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
            droppedCol.data('dragging', false);
            var dropIndicator = $('#drop_indicator_id_' + id);
            dropIndicator.css('display', 'none');
            var groupId = $(e.currentTarget).data('grid_id'),
                droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null,
                groupedItems = {};
            if (groupId == null || droppedId == null || groupId !== droppedId) return;
            if (gridState[id].updating) return; //can't group columns if grid is updating
            if (!groupMenuBar.children().length) groupMenuBar.text('');
            var field = droppedCol.data('field'),
                title = gridState[groupId].columns[field].title || field,
                foundDupe = false;

            groupMenuBar.find('.group_item').each(function iterateGroupItemsCallback(idx, val) {
                var item = $(val);
                groupedItems[item.data('field')] = item;
                if (item.data('field') === field) {
                    foundDupe = true;
                    return false;
                }
            });
            if (foundDupe) return; //can't group on the same column twice

            var groupItem = $('<div class="group_item" data-grid_id="' + groupId + '" data-field="' + field + '"></div>'),
                //.appendTo(groupMenuBar),
            groupDirSpan = $('<span class="group_sort"></span>').appendTo(groupItem);
            groupDirSpan.append('<span class="sort-asc-white groupSortSpan"></span>').append('<span>' + title + '</span>');
            var cancelButton = $('<span class="remove"></span>').appendTo(groupItem),
                groupings = [];

            if (dropIndicator.data('field')) groupItem.insertBefore(groupedItems[dropIndicator.data('field')]);else groupItem.appendTo(groupMenuBar);

            groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                var item = $(val);
                groupings.push({
                    field: item.data('field'),
                    sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                });
            });

            if (gridState[id].sortedOn && gridState[id].sortedOn.length) {
                var sortArr = [];
                for (var l = 0; l < gridState[id].sortedOn.length; l++) {
                    if (gridState[id].sortedOn[l].field !== field) sortArr.push(gridState[id].sortedOn[l]);else {
                        gridState[id].grid.find('.grid-header-wrapper').find('#' + field + '_grid_id_' + id).find('.sortSpan').remove();
                    }
                }
                gridState[id].sortedOn = sortArr;
            }

            var colGroups = gridState[id].grid.find('colgroup');
            colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                $(val).prepend('<col class="group_col"/>');
            });
            gridState[id].grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
            gridState[id].grid.find('.summary-row-header').prepend('<td class="group_spacer">&nbsp</td>');

            gridState[id].groupedBy = groupings;
            gridState[id].pageRequest.eventType = 'group';
            (0, _gridGroup.attachGroupItemEventHandlers)(groupMenuBar, groupDirSpan, cancelButton);
            preparePageDataGetRequest(id);
        });
        groupMenuBar.on('dragover', function handleHeaderDragOverCallback(e) {
            e.preventDefault();
            var gridId = groupMenuBar.data('grid_id');
            var dropIndicator = $('#drop_indicator_id_' + gridId);
            //TODO: I believe I can just reuse the existing group indicator, but I may need to change where it lives as a child of the grid
            if (!dropIndicator.length) {
                dropIndicator = $('<div id="drop_indicator_id_' + gridId + '" class="drop-indicator" data-grid_id="' + gridId + '"></div>');
                dropIndicator.append('<span class="drop-indicator-top"></span><span class="drop-indicator-bottom"></span>');
                gridState[gridId].grid.append(dropIndicator);
            }

            var groupedItems = groupMenuBar.find('.group_item');
            if (groupedItems.length) {
                var placedIndicator = false;

                groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                    var groupItem = $(val);
                    var groupItemOffset = groupItem.offset();
                    if (groupItemOffset.left < e.originalEvent.x && groupItemOffset.left + groupItem.width() > e.originalEvent.x) {
                        dropIndicator.css('left', groupItemOffset.left);
                        dropIndicator.css('top', groupItemOffset.top);
                        dropIndicator.css('height', groupItem.outerHeight());
                        dropIndicator.data('field', groupItem.data('field'));
                        placedIndicator = true;
                        return false;
                    }
                });

                if (!placedIndicator) {
                    var lastItem = groupMenuBar.find('.group_item').last();
                    dropIndicator.css('left', lastItem.offset().left + lastItem.outerWidth());
                    dropIndicator.css('top', lastItem.offset().top);
                    dropIndicator.css('height', lastItem.outerHeight());
                    dropIndicator.data('field', lastItem.data('field'));
                }
            } else {
                dropIndicator.css('height', groupMenuBar.outerHeight());
                dropIndicator.css('left', groupMenuBar.offset().left);
                dropIndicator.css('top', groupMenuBar.offset().top);
            }
            dropIndicator.css('display', 'block');
        });

        groupMenuBar.on('dragexit', function handleHeaderDragOverCallback(e) {
            e.preventDefault();
            $('#drop_indicator_id_' + groupMenuBar.data('grid_id')).css('display', 'none');
        });
    }

    if (canEdit || gridData.excelExport) {
        var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);
        if (gridData.excelExport) {
            var menuLink = $('<a href="#"></a>');
            menuLink.append('<span class="menuSpan"></span>');
            saveBar.append(menuLink);
            attachMenuClickHandler(menuLink, id);
        }
        if (canEdit) {
            var saveAnchor = $('<a href="#" class="toolbarAnchor saveToolbar"></a>').appendTo(saveBar);
            saveAnchor.append('<span class="toolbarSpan saveToolbarSpan"></span>Save Changes');

            var deleteAnchor = $('<a href="#" class="toolbarAnchor deleteToolbar"></a>').appendTo(saveBar);
            deleteAnchor.append('<span class="toolbarSpan deleteToolbarSpan">Delete Changes</span>');

            (0, _gridEdit.attachSaveAndDeleteHandlers)(id, gridElem, saveAnchor, deleteAnchor);
        }
    }
}

/**
 * Creates the menu for the grid's toolbar
 * @param {object} menuAnchor - A DOM anchor element to attach the click handler to
 * @param {number} gridId - The id of the current grid widget instance
 */
function attachMenuClickHandler(menuAnchor, gridId) {
    menuAnchor.on('click', function menuAnchorClickHandler(e) {
        e.stopPropagation(); //stop event bubbling so that the click won't bubble to document click handler
        e.preventDefault();
        var menu = gridState[gridId].grid.find('#menu_model_grid_id_' + gridId),
            newMenu;

        if (!menu.length) {
            newMenu = $('<div id="menu_model_grid_id_' + gridId + '" class="grid_menu" data-grid_id="' + gridId + '"></div>');
            if (gridState[gridId].editable) {
                newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridEdit.createSaveDeleteMenuItems)(gridId)));
            }
            if (gridState[gridId].columnToggle) {
                newMenu.append($('<hr/>'));
                newMenu.append(createColumnToggleMenuOptions(newMenu, gridId));
            }
            if (gridState[gridId].sortable || gridState[gridId].filterable || gridState[gridId].selectable || gridState[gridId].groupable) {
                newMenu.append($('<hr/>'));
                if (gridState[gridId].sortable) newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridSort.createSortMenuItem)()));
                if (gridState[gridId].filterable) {
                    newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridFilter.createFilterMenuItems)()));
                    if (gridState[gridId].advancedFiltering) {
                        newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridFilter.createFilterModalMenuItem)(gridId)));
                    }
                }
                if (gridState[gridId].groupable) newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridGroup.createGroupMenuItem)()));
                if (gridState[gridId].selectable) newMenu.append($('<ul class="menu-list"></ul>').append((0, _gridSelect.createDeselectMenuOption)(gridId)));
            }
            if (gridState[gridId].excelExport) {
                newMenu.append($('<hr/>'));
                newMenu.append((0, _gridExcel.createExcelExportMenuItems)(newMenu, gridId));
            }
            gridState[gridId].grid.append(newMenu);
            $(document).on('click', function hideMenuHandler(e) {
                var elem = $(e.target);
                if (!elem.hasClass('grid_menu') && !elem.hasClass('menu_item_options')) {
                    if (!elem.parents('.grid_menu').length && !elem.parents('.menu_item_options').length) {
                        gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
                        gridState[gridId].grid.find('.menu_item_options').css('display', 'none');
                    }
                }
            });
        } else {
            newMenu = menu;
            newMenu.removeClass('hiddenMenu');
        }

        var menuAnchorOffset = menuAnchor.offset();
        newMenu.css('top', menuAnchorOffset.top - $(window).scrollTop());
        newMenu.css('left', menuAnchorOffset.left - $(window).scrollLeft());
    });
}

function createColumnToggleMenuOptions(menu, gridId) {
    var menuList = $('<ul class="menu-list"></ul>');
    var menuItem = $('<li class="menu_item"></li>');
    var menuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Toggle Columns<span class="menu_arrow"/></span></a>');
    menuItem.on('mouseover', function columnToggleMenuItemHoverHandler() {
        var toggleOptions = gridState[gridId].grid.find('#toggle_grid_id_' + gridId);
        if (!toggleOptions.length || gridState[gridId].hasAddedColumn) {
            if (gridState[gridId].hasAddedColumn) gridState[gridId].hasAddedColumn = false;
            toggleOptions = $('<div id="toggle_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '" style="display: none;"></div>');
            var columnList = $('<ul class="menu-list"></ul>');
            for (var col in gridState[gridId].columns) {
                var fieldName = gridState[gridId].columns[col].title || col;
                var columnOption = $('<li data-value="' + col + '" class="menu_item">');
                var columnToggle = $('<span class="excel_span"><input type="checkbox" data-field="' + col + '"> ' + fieldName + '</span>');
                columnToggle.appendTo(columnOption);
                columnList.append(columnOption);
            }
            var options = columnList.find('input');
            options.on('click', function excelExportItemClickHandler() {
                var uncheckedCol = false;
                $(this).parents('ul').find('input').each(function findTotalCheckedColumns() {
                    if (!this.checked) {
                        uncheckedCol = true;
                        return false;
                    }
                });
                if (uncheckedCol && this.checked) gridState[gridId].grid[0].grid.hideColumn($(this).data('field'));else if (this.checked) this.checked = false;else gridState[gridId].grid[0].grid.showColumn($(this).data('field'));
            });
            toggleOptions.append(columnList);
            gridState[gridId].grid.append(toggleOptions);
        }
        if (toggleOptions.css('display') === 'none') {
            var groupAnchorOffset = menuAnchor.offset(),
                newMenuOffset = menu.offset();
            toggleOptions.css('top', groupAnchorOffset.top - 3 - $(window).scrollTop());
            toggleOptions.css('left', newMenuOffset.left + (menu.outerWidth() - toggleOptions.outerWidth()));
            toggle(toggleOptions, { duration: 200 });
        }
    });
    menuList.on('mouseleave', function columnToggleItemHoverHandler(evt) {
        setTimeout(function detectMouseLeave() {
            var toggleOptions = $('#toggle_grid_id_' + gridId),
                toggleOptionsOffset = toggleOptions.offset();
            if (evt.pageX >= toggleOptionsOffset.left && evt.pageX <= toggleOptionsOffset.left + toggleOptions.width() && evt.pageY >= toggleOptionsOffset.top && evt.pageY <= toggleOptionsOffset.top + toggleOptions.height()) {
                return;
            }
            toggle(toggleOptions, { duration: 200 });
        }, 200);
    });
    menuList.append(menuItem.append(menuAnchor));
    return menuList;
}

/**
 * Creates the footer for the grid widget
 * @param {object} gridData - The metadata describing this grid widget instance
 * @param {object} gridElem - The DOM element that contains the grid widget
 */
function createGridFooter(gridData, gridElem) {
    var gridFooter = gridElem.find('.grid-footer-div');
    var id = gridFooter.data('grid_footer_id');
    var count = gridState[id].dataSource.rowCount;
    var displayedRows = count - gridState[id].pageSize > 0 ? gridState[id].pageSize : count;
    var totalPages = count - displayedRows > 0 ? Math.ceil((count - displayedRows) / displayedRows) + 1 : 0;
    var pageNum = gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum;

    var first = $('<a href="#" class="grid-page-link" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridFooter);
    var prev = $('<a href="#" class="grid-page-link" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridFooter);
    var text = 'Page ' + gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum + '/' + totalPages;
    gridFooter.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
    var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridFooter);
    var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + totalPages + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridFooter);

    if (pageNum === 1) {
        first.addClass('link-disabled');
        prev.addClass('link-disabled');
    }
    if (pageNum === totalPages) {
        next.addClass('link-disabled');
        last.addClass('link-disabled');
    }

    var pageOptions = gridData.pagingOptions;
    if (pageOptions && pageOptions.constructor === Array) {
        var sizeSelectorSpan = $('<span class="page-size-span"></span>'),
            sizeSelect = $('<select class="size-selector input"></select>'),
            numOptions = 0;
        for (var i = 0; i < pageOptions.length; i++) {
            if ((0, _gridHelpers.isNumber)(parseFloat(pageOptions[i]))) {
                sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                numOptions++;
            }
        }
        if (numOptions) {
            sizeSelectorSpan.appendTo(gridFooter);
            sizeSelect.appendTo(sizeSelectorSpan);
        }
        sizeSelect.val(~pageOptions.indexOf(gridState[id].pageSize) ? gridState[id].pageSize : pageOptions[0]);
        sizeSelectorSpan.append('Rows per page');

        sizeSelect.on('change', function pageSizeSelectorClickHandler() {
            var pageSize = $(this).val();
            gridState[id].pageRequest.pageSize = parseInt(pageSize);
            gridState[id].pageRequest.eventType = 'pageSize';
            preparePageDataGetRequest(id);
        });
    }

    var rowStart = 1 + displayedRows * (pageNum - 1);
    var rowEnd = gridData.dataSource.rowCount < gridData.pageSize * pageNum ? gridData.dataSource.rowCount : gridData.pageSize * pageNum;
    text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
    gridFooter.append('<span class="pageinfo">' + text + '</span>');

    setPagerEventListeners(gridFooter);
}

/**
 * Attaches click handlers to each pager
 * @param {object} gridFooter - The grid's DOM footer element
 */
function setPagerEventListeners(gridFooter) {
    gridFooter.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
        $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
            e.preventDefault();
            var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
            if (link.hasClass('link-disabled')) {
                //If the pager link that was clicked on is disabled, return.
                return;
            }
            var gridFooter = link.parents('.grid-footer-div');
            var allPagers = gridFooter.find('a');
            var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
            if (gridState[id].updating) return; //can't page if grid is updating
            var gridData = gridState[id];
            var pageSize = gridData.pageSize;
            var pagerInfo = gridFooter.find('.pageinfo');
            var pagerSpan = gridFooter.find('.grid-pagenum-span');
            var totalPages = gridData.dataSource.rowCount - pageSize > 0 ? Math.ceil((gridData.dataSource.rowCount - pageSize) / pageSize) + 1 : 1;
            var pageNum = parseInt(link[0].dataset.pagenum);
            gridData.pageNum = pageNum;
            var rowStart = 1 + pageSize * (pageNum - 1);
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

//All page request-related functions call here. This sets up the request object and then calls either
//the internal or the supplied GET function to get a new page of grid data.
function preparePageDataGetRequest(id) {
    gridState[id].updating = true;
    var gridData = gridState[id];
    var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
    var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;

    var requestObj = {};
    if (gridData.sortable) requestObj.sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
    if (gridData.filterable) requestObj.filters = gridData.filters.filterGroup && gridData.filters.filterGroup.length ? gridData.filters : { conjunct: null, filterGroup: [] };
    if (gridData.groupable) requestObj.groupedBy = gridData.groupedBy.length ? gridData.groupedBy : [];

    requestObj.pageSize = pageSize;
    requestObj.pageNum = gridData.eventType === 'filter' ? 1 : pageNum;

    gridData.grid.find('.grid-content-div').empty();

    callGridEventHandlers(gridState[id].events.pageRequested, gridData.grid, { element: gridData.grid });
    if (gridData.dataSource.get && typeof gridData.dataSource.get === 'function') gridData.dataSource.get(requestObj, getPageDataRequestCallback);else {
        if (!gridData.alteredData) gridData.alteredData = gridHelpers.cloneGridData(gridData.originalData);
        getPageData(requestObj, id, getPageDataRequestCallback);
    }

    function getPageDataRequestCallback(response) {
        if (response) {
            gridData.dataSource.data = response.data;
            gridData.pageSize = requestObj.pageSize;
            gridData.pageNum = requestObj.pageNum;
            gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.data.length;
            gridData.groupedBy = requestObj.groupedBy;
            gridData.sortedOn = requestObj.sortedOn;
            gridData.filters = requestObj.filters;

            if (gridData.pageRequest.eventType === 'newGrid' || gridData.pageRequest.eventType === 'group') setColWidth(gridData, gridState[id].grid);

            createGridContent(gridData, gridState[id].grid);
            if (gridData.pageRequest.eventType === 'filter-add' || gridData.pageRequest.eventType === 'filter-rem' || gridData.pageRequest.eventType === 'pageSize') {
                gridData.grid.find('.grid-footer-div').empty();
                createGridFooter(gridData, gridData.grid);
            }
            if (gridData.pageRequest.eventType === 'filter' && gridData.aggregates && gridData.aggregates.positionAt === 'top') buildHeaderAggregations(id);
            gridData.pageRequest = {};
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
                var origIdx = gridState[id].dataSource.data[index]._initialRowIndex;
                gridState[id].originalData[origIdx][field] = gridState[id].dataSource.data[index][field];
                $(val).remove();
            });
        } else {
            gridState[id].grid.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                var cell = $(val).parents('td');
                var index = cell.parents('tr').index();
                var field = cell.data('field');
                var text = gridFormatters.getFormattedCellText(id, cell.data('field'), gridState[id].originalData[index][field]) || gridState[id].originalData[index][field];
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
function getPageData(requestObj, id, callback) {
    var eventType = gridState[id].pageRequest.eventType;
    var fullGridData = gridHelpers.cloneGridData(gridState[id].alteredData);

    if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
        limitPageData(requestObj, fullGridData, callback);
        return;
    }
    if (requestObj.filters && requestObj.filters.filterGroup && requestObj.filters.filterGroup.length) {
        fullGridData = (0, _expressionParserTmp.createFilterTreeFromFilterObject)(requestObj.filters).filterCollection(gridHelpers.cloneGridData(gridState[id].originalData));
        requestObj.pageNum = 1; //reset the page to the first page when a filter is applied or removed.
        gridState[id].alteredData = fullGridData;
    }
    if (requestObj.groupedBy.length || requestObj.sortedOn.length) {
        var sortedData = gridDataHelpers.sortGridData(requestObj.groupedBy.concat(requestObj.sortedOn), fullGridData || gridHelpers.cloneGridData(gridState[id].originalData), id);
        gridState[id].alteredData = sortedData;
        limitPageData(requestObj, sortedData, callback);
        return;
    }
    gridState[id].alteredData = fullGridData;
    limitPageData(requestObj, fullGridData, callback);
}

//==========================================================================================================================//
//																															//
//													HELPER FUNCTIONS														//
//==========================================================================================================================//

function limitPageData(requestObj, fullGridData, callback) {
    var returnData;
    if (requestObj.pageSize >= fullGridData.length) returnData = fullGridData;else {
        returnData = [];
        var startRow = (requestObj.pageNum - 1) * requestObj.pageSize;
        var endRow = fullGridData.length >= startRow + parseInt(requestObj.pageSize) ? startRow + parseInt(requestObj.pageSize) : fullGridData.length;

        for (var i = startRow; i < endRow; i++) {
            returnData.push(fullGridData[i]);
        }
    }

    callback({ rowCount: fullGridData.length, data: returnData });
}

/**
 * Calls all registered event handlers for a collection of events
 * @param {Array} events - A collection of events to
 * @param {Object} context - An object, array, or function to set as the context of the event handler
 * @param  {Object} param - An object that contains metadata about the event
 */
function callGridEventHandlers(events, context, param) {
    if (events.length) {
        for (var x = 0; x < events.length; x++) {
            events[x].call(context, param);
        }
    }
}

function existsInPutRequest(putRequest, model) {
    for (var i = 0; i < putRequest.length; i++) {
        if (model._initialRowIndex == putRequest[i].dirtyData._initialRowIndex) return i;
    }
    return -1;
}

generateId = function _generateId(seed) {
    return function guid() {
        seed++;
        return seed.toString();
    };
}(-1);

//var gridApi = {};

/*return Object.defineProperties(
    gridApi, {
        'getGridInstance': {
            value: function getGridInstance(elem) {
                elem = $(elem);
                for (var i = 0; i < gridState.length; i++) {
                    if (elem[0] === gridState[i].grid[0])
                        return gridState[i].grid[0].grid;
                }
            },
            writable: false,
            configurable: false
        }
    }
);*/