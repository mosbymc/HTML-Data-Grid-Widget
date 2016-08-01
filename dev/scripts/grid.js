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
 - View http://docs.telerik.com/kendo-ui/api/javascript/ui/grid for events/methods/properties
 - Add integration tests if possible
 - Add type checking - passed in grid data
 - Thoroughly test date & time regex usages
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
    var dataTypes, events, aggregates, generateId,
        gridState = [];

    /**
     * Exposed on the grid module. Called to create a grid widget.
     * @function create
     * @static
     * @param {object} gridData - The dataSource object needed to initialize the grid
     * @param {object} gridElem - The DOM element that should be used to create the grid widget
     */
    function create(gridData, gridElem) {
        if (gridData && isDomElement(gridElem)) {
            var id = generateId();
            if (id > 0) {   //test to check if previously created grids still exist
                var tmp = id - 1;
                while (tmp > -1) {  //iterate through all previous grids
                    if (gridState[tmp] != null && !$('body').find('#' + gridState[tmp].grid[0].id).length)     //if not found in the body
                        delete gridState[tmp];      //remove the data from storage
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

            (gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === 'function') ? validator.setAdditionalEvents(['blur', 'change']) : gridData.useValidator = false;
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
     * @param {number} gridId - The id of this grid's instance
     */
    function createGridInstanceMethods(gridElem, gridId) {

        Object.defineProperty(
            gridElem[0].grid,
            'exportToExcel',
            {
                value: function _exportToExcel(exportType) {
                    exportDataAsExcelFile(gridId, exportType || 'page');
                }
            }
        );

        Object.defineProperty(
            gridElem[0].grid,
            'activeCellData',
            {
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
                    if (!cell.length)
                        return null;
                    var field = cell.parents('td').data('field');
                    var colIndex = cell.parents('.grid-wrapper').find('.grid-header-wrapper').find('.grid-headerRow').children('[data-field="' + field + '"]').data('index');
                    if (cell[0].type === 'checkbox')
                        return { data: cell[0].checked, row: cell.parents('tr').index(), column: colIndex, field: field };
                    return { data: cell.val(), row: cell.parents('tr').index(), column: colIndex, field: field, cell: cell.parents('td')[0] };
                },
                configurable: false
            });

        Object.defineProperty(
            gridElem[0].grid,
            'selected',
            {
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
                        }
                        else
                            row.addClass('selected');
                    }
                },
                configurable: false
            }
        );

        Object.defineProperty(
            gridElem[0].grid,
            'selectedData',
            {
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
                        }
                        else {
                            data.push({ rowIndex: item.parents('tr').index(), columnIndex: item.index(), data: item.text(), field: item.data('field') });
                        }
                    });
                    return data;
                },
                configurable: false
            }
        );



        Object.defineProperties(
            gridElem[0].grid, {
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
                        if (!funcs || (typeof funcs !== 'function' && funcs.constructor !== Array)) return false;
                        if (typeof funcs === 'function') funcs = [funcs];
                        if (~events.indexOf(evt)) {
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
                        if (~events.indexOf(evt) && (funcs || (typeof funcs === 'function' || funcs.constructor === Array))) {
                            if (typeof funcs === 'function') funcs = [funcs];
                            var tmpEvts = [];
                            for (var i = 0; i < gridState[gridId].events[evt].length; i++) {
                                for (var j = 0; j < funcs.length; j++) {
                                    if (gridState[gridId].events[evt][i] !== funcs[j])
                                        tmpEvts.push(gridState[gridId].events[evt][i]);
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
                        for (var i = 0; i < events.length; i++) {
                            gridState[gridId].events[events[i]] = [];
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
                        for (var i = 0; i < events.length; i++) {
                            if (gridState[gridId].events[events[i]].length)
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
                     * @method getAvailableEvents
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
                     * @method getAggregates
                     * @for Grid DOM element
                     * @protected
                     * @readonly
                     * @default aggregates object
                     * @type object
                     * @returns {Object} - The aggregations that are currently in use for this page of the grid
                     */
                    value: function _getAggregates() {
                        return gridState[gridId].summaryRow;
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
                        }
                        else {
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
                            var val = cloneGridData([].concat(gridState[gridId].dataSource.data[index]));
                            delete val[0]._initialRowIndex;
                            return val;
                        }
                        else {
                            var gd = cloneGridData(gridState[gridId].dataSource.data);
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
                        if (data != null && typeof data === 'object' && data.constructor === Array) {
                            gridState[gridId].dataSource.data = data;
                            gridState[gridId].pageSize = data.length;
                            gridState[gridId].dataSource.rowCount = data.length;
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(gridState[gridId], gridState[gridId].grid);
                            buildHeaderAggregations(gridState[gridId], gridId);
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
                        if (!rowData)
                            return;
                        if (rowData.constructor === Array) {
                            for (var i = 0; i < rowData.length; i++) {
                                if (typeof rowData[i].index !== 'number' || rowData[i].index >= gridState[gridId].dataSource.data.length)
                                    continue;
                                gridState[gridId].dataSource.data[rowData[i].index] = rowData[i].data;
                                appliedUpdate = true;
                            }
                        }
                        else if (typeof rowData.index === 'number') {
                            gridState[gridId].dataSource.data[rowData.index] = rowData.data;
                            appliedUpdate = true;
                        }

                        if (appliedUpdate) {
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(gridState[gridId], gridState[gridId].grid);
                            buildHeaderAggregations(gridState[gridId], gridId);
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
                        }
                        else applyUpdate(cellData, setAsDirty);

                        function applyUpdate(cell, setAsDirty) {
                            if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > gridState[gridId].dataSource.data.length)
                                return;
                            if (gridState[gridId].columns[cell.field]) {
                                var dataType = gridState[gridId].columns[cell.field].type;
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
                                gridState[gridId].dataSource.data[cell.index][cell.field] = cell.value;
                                var tableCell;
                                if (gridState[gridId].groupedBy) {
                                    var counter = 0;
                                    gridState[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
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
                                    tableCell = gridState[gridId].grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
                                var text = getFormattedCellText(gridId, cell.field, cell.value) || cell.value;
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
                                while (child.children().length)
                                    findChildren(child.children());
                                child.off();
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
        if (dataSource && typeof dataSource.data === 'object')
            callback(null, { data: dataSource.data, rowCount: dataSource.rowCount });
        else if (typeof dataSource.get == 'function') {
            dataSource.get({ pageSize: 25, pageNum: 1 },
                function gridDataCallback(data) {
                if (data) callback(null, data);
                else callback(true, {});
            });
        }
        else callback(true, {});
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
        storageData.filteredOn = [];
        if (!storageData.dataSource.rowCount) storageData.dataSource.rowCount = gridData.dataSource.data.length;

        var eventObj = { element: storageData.grid };
        callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

        gridState[id] = storageData;

        if (gridData.summaryRow && gridData.summaryRow.positionAt === 'top') buildHeaderAggregations(gridData, id);

        createGridFooter(gridData, gridElem);
        createGridContent(gridData, gridElem);

        callGridEventHandlers(storageData.events.afterDataBind, storageData.grid, eventObj);
    }

    /**
     * Adds new columns to the grid based on a collection of objects passed to the function
     * @param {Array} newData - A collection of new column names and values to add to the grid
     * @param {object} gridElem - The grid DOM widget
     */
    function addNewColumns(newData, gridElem) {
        var oldGrid = $(gridElem).find('.grid-wrapper');
        var id = oldGrid.data('grid_id');
        var oldData = gridState[id].data;

        for (var i = 0; i < newData.length; i++) {
            for (var col in newData[i]) {
                if (!oldData.data[i][col]) {
                    oldData.data[i][col] = newData[i][col];
                }
                if (!oldData.columns[col]) {
                    oldData.columns[col] = { field: col, title: col, index: Object.keys(oldData.columns).length };
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
            if (typeof gridData.columns[col] !== 'object') continue;
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
                gridData.sortable = true;
            }

            if (gridData.columns[col].filterable === true) {
                gridState[gridHeader.data('grid_header_id')].filterable = true;
                setFilterableClickListener(th, gridData, col);
                gridData.filterable = true;
            }

            if (gridData.columns[col].editable || gridData.columns[col].selectable || gridData.groupable) createCellEditSaveDiv(gridData, gridElem);

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
     * @param {number} gridId
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
                sumRow.append('<td class="group_spacer">&nbsp</td>');
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
     * @param {number} gridId
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
                    text = getFormattedCellText(gridId, col, gridData.summaryRow[col].value) || gridData.summaryRow[col].value;
                    aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                }
                else
                    aggData[col] = null;
            }
            else {
                switch (gridData.summaryRow[col].type) {
                    case 'count':
                        text = getFormattedCellText(gridId, col, gridData.dataSource.rowCount) || gridData.dataSource.rowCount;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'average':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        var avg = parseFloat(total/parseFloat(gridData.dataSource.rowCount)).toFixed(2);
                        text = getFormattedCellText(gridId, col, avg) || avg;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'total':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        if (type === 'currency') total = total.toFixed(2);
                        text = getFormattedCellText(gridId, col, total) || total;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'min':
                        var min;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!min || parseFloat(data[i][col]) < min) min = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, min) || min;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'max':
                        var max;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!max || parseFloat(data[i][col]) > max) max = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, max) || max;
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

        contentHeight = gridData.height && isNumber(parseFloat(gridData.height)) ? gridData.height - (headerHeight + footerHeight + toolbarHeight) + 'px' : '250px';
        var gridContent = gridElem.find('.grid-content-div').css('height', contentHeight);
        var id = gridContent.data('grid_content_id');
        var gcOffsets = gridContent.offset();
        var top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop();
        var left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
        var loader = $('<span id="loader-span" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
        var contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent);
        var colGroup = $('<colgroup></colgroup>').appendTo(contentTable);
        var contentTBody = $('<tbody></tbody>').appendTo(contentTable);
        if (gridData.selectable) attachTableSelectHandler(contentTBody);
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
                    var groupedText = getFormattedCellText(id, gridData.groupedBy, curRow) || curRow;
                    var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(contentTBody);
                    var groupTitle = gridData.columns[gridData.groupedBy].title || gridData.groupedBy;
                    groupTr.append('<td colspan="' + (columns.length + 1) + '"><p class="grouped"><a class="group-desc sortSpan group_acc_link"></a>' + groupTitle + ': ' + groupedText + '</p></td>');
                }
            }
            else if (!gridData.groupedBy && gridElem.find('.group_spacer').length) {
                $(document).find('.group_col').remove();
                $(document).find('.group_spacer').remove();
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
                var text = getFormattedCellText(id, columns[j], gridData.dataSource.data[i][columns[j]]) || gridData.dataSource.data[i][columns[j]];
                td.text(text);
                //attach event handlers to save data
                if (gridData.columns[columns[j]].editable && gridData.columns[columns[j]].editable !== 'drop-down') {
                    makeCellEditable(id, td);
                    gridState[id].editable = true;
                }
                else if (gridData.columns[columns[j]].editable === 'drop-down') {
                    makeCellSelectable(id, td);
                    gridState[id].editable = true;
                }
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
            if (gridState[headWrap.parent().data('grid_header_id')].resizing)
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

        gridState[id].dataSource.data = gridData.dataSource.data;
        loader.remove();
        gridState[id].updating = false;
    }

    /**
     * Attaches handlers for click, mousemove, mousedown, mouseup, and scroll events depending on the value of the selectable attribute of the grid
     * @param {object} tableBody - The body of the grid's content table
     */
    function attachTableSelectHandler(tableBody) {
        var gridId = tableBody.parents('.grid-wrapper').data('grid_id');
        var isSelectable = gridState[gridId].selectable;
        if (isSelectable) {
            $(document).on('click', function tableBodySelectCallback(e) {
                if (e.target === tableBody[0] || $(e.target).parents('tbody')[0] === tableBody[0]) {
                    if (gridState[gridId].selecting) {
                        gridState[gridId].selecting = false;
                        return;
                    }
                    $('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                        $(elem).removeClass('selected');
                    });
                    var target = $(e.target);
                    if (isSelectable === 'cell' && target[0].tagName.toUpperCase() === 'TD')
                        target.addClass('selected');
                    else if (target[0].tagName.toUpperCase() === 'TR')
                        target.addClass('selected');
                    else
                        target.parents('tr').first().addClass('selected');
                }
            });
        }
        if (isSelectable === 'multi-row' || isSelectable === 'multi-cell') {
            $(document).on('mousedown', function mouseDownDragCallback(event) {
                if (event.target === tableBody[0] || $(event.target).parents('tbody')[0] === tableBody[0]) {
                    gridState[gridId].selecting = true;
                    var contentDiv = tableBody.parents('.grid-content-div'),
                        overlay = $('<div class="selection-highlighter"></div>').appendTo(gridState[gridId].grid);
                    overlay.css('top', event.pageY).css('left', event.pageX).css('width', 0).css('height', 0);
                    overlay.data('origin-y', event.pageY + contentDiv.scrollTop()).data('origin-x', event.pageX + contentDiv.scrollLeft()).data('mouse-pos-x', event.pageX).data('mouse-pos-y', event.pageY);
                    overlay.data('previous-top', event.pageY).data('previous-left', event.pageX);
                    overlay.data('previous-bottom', event.pageY).data('previous-right', event.pageX);
                    overlay.data('origin-scroll_top', contentDiv.scrollTop()).data('origin-scroll_left', contentDiv.scrollLeft());
                    overlay.data('last-scroll_top_pos', contentDiv.scrollTop()).data('last-scroll_left_pos', contentDiv.scrollLeft());
                    overlay.data('actual-height', 0).data('actual-width', 0).data('event-type', 'mouse');

                    $(document).one('mouseup', function mouseUpDragCallback() {
                        $('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                            $(elem).removeClass('selected');
                        });
                        var overlay = $(".selection-highlighter");
                        selectHighlighted(overlay, gridId);
                        overlay.remove();
                        contentDiv.off('scroll');
                        $(document).off('mousemove');
                    });

                    contentDiv.on('scroll', function updateSelectOverlayOnScrollHandler() {
                        if (gridState[gridId].selecting) {
                            overlay.data('event-type', 'scroll');
                            setOverlayDimensions(contentDiv, overlay);
                        }
                    });

                    $(document).on('mousemove', function updateSelectOverlayOnMouseMoveHandler(ev) {
                        if (gridState[gridId].selecting) {
                            var domTag = ev.target.tagName.toUpperCase();
                            if (domTag === 'INPUT' || domTag === 'SELECT') return;

                            overlay.data('event-type', 'mouse');
                            overlay.data('mouse-pos-x', ev.pageX).data('mouse-pos-y', ev.pageY);
                            setOverlayDimensions(gridState[gridId].grid.find('.grid-content-div'), overlay);
                        }
                    });
                }
            });
        }

        /**
         * Called by both the mousemove and scroll event handlers, this function determines the appearance of the overlay and the true
         * selection dimensions based on the distance the mouse has moved since the mousedown event, and the amount/direction of scrolling
         * @param {object} contentDiv - The div containing the table that holds the actual content (not the header table)
         * @param {object} overlay - The overlay div used to display the user's active selection
         */
        function setOverlayDimensions(contentDiv, overlay) {
            window.getSelection().removeAllRanges();

            //TODO: I'm pretty sure I don't need all the mouse-pos and previous-x values to calculate the temporary top/left/bottom/right. Try to limit the required data
            var contentOffset = contentDiv.offset(),
                ctHeight = contentDiv[0].clientHeight,
                ctWidth = contentDiv[0].clientWidth,
                ctTop = contentOffset.top,
                ctLeft = contentOffset.left,
                ctBottom = ctTop + ctHeight,
                ctRight = ctLeft + ctWidth,
                ctScrollTop = contentDiv.scrollTop(),
                ctScrollLeft = contentDiv.scrollLeft(),
                top = Math.min(overlay.data('mouse-pos-y'), ctTop, overlay.data('previous-top')),
                left = Math.min(overlay.data('mouse-pos-x'), ctLeft, overlay.data('previous-left')),
                bottom = Math.max(top, overlay.data('previous-bottom')),
                right = Math.max(left, overlay.data('previous-right')),
                trueHeight;

            if ((top === overlay.data('previous-top') || top < ctTop) && (bottom === overlay.data('previous-bottom') || bottom > ctBottom) &&
                (left === overlay.data('previous-left') || left < ctLeft) && (right === overlay.data('previous-right') || right > ctRight) &&
                ctScrollTop === overlay.data('last-scroll_top_pos') && ctScrollLeft === overlay.data('last-scroll_left_pos'))
                return;

            var dimObj = {};
            dimObj.eventType = overlay.data('event-type');
            dimObj.overlay = {};
            dimObj.overlay.smallDim = top;
            dimObj.overlay.largeDim = bottom;
            dimObj.overlay.origin = overlay.data('origin-y');
            dimObj.overlay.mousePosition = overlay.data('mouse-pos-y');
            dimObj.container = {};
            dimObj.container.smallDim = ctTop;
            dimObj.container.largeDim = ctBottom;
            dimObj.container.scrollPos = ctScrollTop;
            dimObj.container.scrollLength = contentDiv[0].scrollHeight;
            dimObj.container.clientLength = ctHeight;

            var dims = determineOverlayDimensions(dimObj);
            trueHeight = dims.trueSize;
            ctScrollTop = dims.scrollPos;
            contentDiv.scrollTop(dims.scrollPos);
            top = dims.smallDim;
            bottom = dims.largeDim;

            dimObj.overlay.smallDim = left;
            dimObj.overlay.largeDim = right;
            dimObj.overlay.origin = overlay.data('origin-x');
            dimObj.overlay.mousePosition = overlay.data('mouse-pos-x');
            dimObj.container.smallDim = ctLeft;
            dimObj.container.largeDim = ctRight;
            dimObj.container.scrollPos = ctScrollLeft;
            dimObj.container.scrollLength = contentDiv[0].scrollWidth;
            dimObj.container.clientLength = ctWidth;

            dims = determineOverlayDimensions(dimObj);
            contentDiv.scrollLeft(dims.scrollPos);

            overlay.css('top', top).css('left', dims.smallDim).css('height', (bottom - top)).css('width', (dims.largeDim - dims.smallDim));
            overlay.data('actual-height', trueHeight).data('actual-width', dims.trueSize);
            overlay.data('previous-top', top).data('previous-left', dims.smallDim).data('previous-bottom', bottom).data('previous-right', dims.largeDim);
            overlay.data('last-scroll_top_pos', ctScrollTop).data('last-scroll_left_pos', dims.scrollPos);
        }
    }

    /**
     * Calculates both the displayed and actual top/bottom or left/right of the highlighting overlay
     * @param {object} context - The context in which this function is being called (ie for top/bottom calc or left/right)
     * @returns {{trueSize: number, smallDim: number, largeDim: number, scrollPos: number}}
     */
    function determineOverlayDimensions(context) {
        var locAdjustment, scrollAdjustment, smallDim, largeDim,
            trueSize,
            scrollPos = context.container.scrollPos;
        if (context.eventType === 'scroll') {
            if (context.overlay.origin < context.container.smallDim + context.container.scrollPos) {
                if (context.overlay.mousePosition - 20 <= context.container.smallDim && context.container.scrollPos > 0) {
                    locAdjustment = context.overlay.smallDim + 25;
                    scrollAdjustment = context.overlay.mousePosition - locAdjustment;
                    scrollPos = context.container.scrollPos + scrollAdjustment;
                    largeDim = locAdjustment;
                    smallDim = context.overlay.smallDim;
                }
                else {
                    smallDim = context.container.smallDim;
                    largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
                }
                trueSize = largeDim + scrollPos - context.overlay.origin;
            }
            else if (context.overlay.origin > context.container.largeDim + context.container.scrollPos) {
                if (context.overlay.mousePosition + 20 >= context.container.largeDim && context.container.scrollPos < context.container.scrollLength - context.container.clientLength) {
                    locAdjustment = context.container.largeDim - 25;
                    scrollAdjustment = locAdjustment - context.overlay.mousePosition;
                    scrollPos = context.container.scrollPos - scrollAdjustment;
                    smallDim = locAdjustment;
                    largeDim = context.overlay.largeDim;
                }
                else {
                    smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
                    largeDim = context.container.largeDim;
                }
                trueSize = context.overlay.origin - smallDim - scrollPos;
            }
            else {
                if (context.overlay.origin < context.overlay.mousePosition + context.container.scrollPos) {
                    smallDim = context.overlay.origin - context.container.scrollPos;
                    largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
                }
                else {
                    smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
                    largeDim = context.overlay.origin - context.container.scrollPos;
                }
                trueSize = largeDim - smallDim;
            }
        }
        else {
            if (context.overlay.origin > (context.container.smallDim + context.container.scrollPos) && context.overlay.origin < (context.container.largeDim + context.container.scrollPos)) {
                var minVal = Math.min((context.overlay.origin - context.container.scrollPos), context.overlay.mousePosition);
                var maxVal = minVal === (context.overlay.origin - context.container.scrollPos) ? context.overlay.mousePosition : (context.overlay.origin - context.container.scrollPos);
                smallDim = minVal < context.container.smallDim ? context.container.smallDim : minVal;
                largeDim = maxVal > context.container.largeDim ? context.container.largeDim : maxVal;
                trueSize = largeDim - smallDim;
            }
            else if (context.overlay.origin <= context.container.smallDim + context.container.scrollPos) {
                smallDim = context.container.smallDim;
                if (context.overlay.mousePosition - 20 <= context.container.smallDim && context.container.scrollPos > 0) {
                    locAdjustment = smallDim + 25;
                    scrollAdjustment = context.overlay.mousePosition - locAdjustment;
                    scrollPos = context.container.scrollPos + scrollAdjustment;
                    largeDim = locAdjustment;
                }
                else largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
                trueSize = largeDim + scrollPos - context.overlay.origin;
            }
            else {
                largeDim = context.container.largeDim;
                if (context.overlay.mousePosition + 20 >= context.container.largeDim && context.container.scrollPos < context.container.scrollLength - context.container.clientLength) {
                    locAdjustment = largeDim - 25;
                    scrollAdjustment = locAdjustment - context.overlay.mousePosition;
                    scrollPos = context.container.scrollPos - scrollAdjustment;
                    smallDim = locAdjustment;
                }
                else smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
                trueSize = context.overlay.origin - smallDim - context.container.scrollPos;
            }
        }
        return {
            trueSize: trueSize,
            smallDim: smallDim || context.overlay.smallDim,
            largeDim: largeDim || context.overlay.largeDim,
            scrollPos: scrollPos || context.container.scrollPos
        };
    }

    /**
     * This function is called after the mouseup event and uses the dimensions of the overlay to apply
     * the 'selected' class to all grid elements that it overlaps
     * @param {object} overlay - The overlay element created to display the user's active selection
     * @param {number} gridId - The id of the grid widget instance
     */
    function selectHighlighted(overlay, gridId) {
        var contentDiv = gridState[gridId].grid.find('.grid-content-div'),
            ctOffset = contentDiv.offset(),
            ctHeight = contentDiv.height,
            ctWidth = contentDiv.width(),
            width = overlay.width(),
            height = overlay.height(),
            offset = overlay.offset(),
            top = offset.top,
            left = offset.left,
            right = parseFloat(overlay.data('actual-width')) + left,
            bottom = parseFloat(overlay.data('actual-height')) + top;

        if (top + overlay.data('actual-height') > ctOffset.top + ctHeight || top + height - overlay.data('actual-height') < ctOffset.top) {
            if (overlay.data('origin-scroll_top') > overlay.data('last-scroll_top_pos')) bottom = top + overlay.data('actual-height');
            else {
                bottom = top + height;
                top = bottom - overlay.data('actual-height');
            }
        }

        if (left + overlay.data('actual-width') > ctOffset.left + ctWidth || left + width - overlay.data('actual-width') < ctOffset.left) {
            if (overlay.data('origin-scroll_left') > overlay.data('last-scroll_left_pos')) right = left + overlay.data('actual-width');
            else {
                right = left + width;
                left = right = overlay.data('actual-width');
            }
        }

        var gridElems = gridState[gridId].selectable === 'multi-cell' ? contentDiv.find('td') : contentDiv.find('tr');

        gridElems.each(function highlightGridElemsCallback(idx, val) {
            var element = $(val),
                eOffset = element.offset(),
                eTop = eOffset.top,
                eLeft = eOffset.left,
                eRight = parseFloat(element.css('width')) + eLeft,
                eBottom = parseFloat(element.css('height')) + eTop;

            if (left > eRight || right < eLeft || top > eBottom || bottom < eTop) return;
            else element.addClass('selected');
        });
    }

    /**
     * Attaches click event handlers for each grouped header row in the grid
     */
    function createGroupTrEventHandlers() {
        $('.group_acc_link').each(function iterateAccordionsCallback(idx, val) {
            $(val).data('state', 'open');
        }).on('click', function groupedAccordionsClickListenerCallback(e) {
            var accRow = $(e.currentTarget).parents('tr');
            if ($(e.currentTarget).data('state') === 'open') {
                $(e.currentTarget).data('state', 'closed').removeClass('group-desc').addClass('group-asc');
                accRow.nextUntil('.grouped_row_header').css('display', 'none');
            }
            else {
                $(e.currentTarget).data('state', 'open').removeClass('group-asc').addClass('group-desc');
                accRow.nextUntil('.grouped_row_header').css('display', 'table-row');
            }
        });
    }

    /**
     * Makes a grid cell editable on a click event. Used for grid cells whose values can be changed and whose column configuration
     * has its editable property set to true
     * @param {number} id - The id of the grid widget instance
     * @param {object} td - The grid cell to attach the click listener to
     */
    function makeCellEditable(id, td) {
        td.on('click', function editableCellClickHandler(e) {
            var gridContent = gridState[id].grid.find('.grid-content-div');
            var gridData = gridState[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            cell.text('');

            if (gridState[id].updating) return;
            var index = cell.parents('tr').index(),
                field = cell.data('field'),
                type = gridState[id].columns[field].type || '',
                val = gridState[id].dataSource.data[index][field],
                dataAttributes = '',
                gridValidation = gridState[id].useValidator ? gridState[id].columns[field].validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (gridState[id].useFormatter && gridState[id].columns[field].inputFormat)
                dataAttributes += ' data-inputformat="' + gridState[id].columns[field].inputFormat + '"';

            switch (type) {
                case 'boolean':
                    input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    input[0].checked = typeof val === 'string' ? val === 'true' : !!val;
                    dataType = 'boolean';
                    break;
                case 'number':
                    inputVal = val;
                    input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'number';
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

            if (dataType) {
                input.on('keypress', function restrictCharsHandler(e) {
                    var code = e.charCode ? e.charCode : e.keyCode;
                    if (!validateCharacter.call(this, code, dataType)) {
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
            callGridEventHandlers(gridData.events.beforeCellEdit, gridData.grid, null);
        });
    }

    /**
     * Makes a grid cell selectable on a click event. Used for grid cells whose values can be changed to a limited set
     * or pre-specified values and whose column configuration provided the list of values and has its selectable property set to true
     * @param {number} id - The id of the grid widget instance
     * @param {object} td - The grid cell to attach the click listener to
     */
    function makeCellSelectable(id, td) {
        td.on('click', function selectableCellClickHandler(e) {
            var gridContent = gridState[id].grid.find('.grid-content-div');
            var gridData = gridState[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            cell.text('');
            var index = cell.parents('tr').index();
            var field = cell.data('field');
            if (gridState[id].updating) return;		//can't edit a cell if the grid is updating

            var gridValidation = gridState[id].useValidator ? gridState[id].columns[field].validation : null;
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
            if (gridValidation && dataAttributes !== '') attachValidationListener(select[0]);
            else {
                select.on('blur', function cellEditBlurHandler() {
                    saveCellSelectData(select);
                });
            }
            callGridEventHandlers(gridData.events.beforeCellEdit, gridData.grid, null);
        });
    }

    /**
     * If the validator is being used and a column has validation functions to run when editing values, this will determine
     * the appropriate classes and data-attributes that should be applied to the cell's input in order for validation to run
     * as well as set up a namespace for the validation functions to be execute in
     * @param {object} columnValidation - The validation rules provided in the column's configuration
     * @param {string} dataAttributes - The data-attributes for the cell's input
     * @returns {string} - The final form of the data-attribute after the namespace has been created and all validation functions determined
     */
    function setupCellValidation(columnValidation, dataAttributes) {
        if (!grid.validation) {
            Object.defineProperty(
                grid,
                'validation',
                { value: {}, writable: false }
            );
        }
        if (columnValidation.required) dataAttributes += 'data-required';
        if (columnValidation.customRules) {
            dataAttributes += ' data-customrules="';
            for (var rule in columnValidation.customRules) {
                dataAttributes += 'grid.validation.' + rule + ',';
                if (!grid.validation[rule]) {
                    Object.defineProperty(
                        grid.validation,
                        rule,
                        { value: columnValidation.customRules[rule], writable: false, configurable: false }
                    );
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
            if ($(val).hasClass('group_col')) return;
            var width;
            if (width = $(headerCols[idx]).width()) $(val).css('width', width);
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
            else attachValidationListener(elem);
        });
    }

    /**
     * On blur or successful validation if using the validator, removes the input from the
     * grid cell, saves the data in the alteredData array and set a dirty flag on the grid dom
     * element if the value changed
     * @method saveCellEditData
     * @for grid
     * @private
     * @param {object} input - The input element that was edited
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
            type = gridState[id].columns[field].type || '',
            saveVal, re,
            displayVal = getFormattedCellText(id, field, val) || gridState[id].dataSource.data[index][field];

        input.remove();
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
                saveVal = displayVal;   //this and time are the only types that have the same displayVal and saveVel
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;   //this and date are the only types that have the same displayVal and saveVal
                break;
            default: 		//string, boolean
                saveVal = val;
                break;
        }

        cell.text(displayVal);
        gridState[id].currentEdit[field] = null;
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal && !('' === saveVal && undefined === previousVal)) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
            gridState[id].dataSource.data[index][field] = saveVal;
            cell.prepend('<span class="dirty"></span>');
        }
        else
            gridState[id].dataSource.data[index][field] = previousVal;
        callGridEventHandlers(gridState[id].events.afterCellEdit, gridState[id].grid, null);
    }

    /**
     * On blur or successful validation if using the validator, removes the input from the
     * grid cell, saves the data in the alteredData array and set a dirty flag on the grid dom
     * element if the value changed
     * @method saveCellSelectData
     * @for grid
     * @private
     * @param {object} select - The select dom element
     */
    function saveCellSelectData(select) {
        var gridContent = select.parents('.grid-wrapper').find('.grid-content-div'),
            val = select.val(),
            parentCell = select.parents('td');
        select.remove();
        var id = gridContent.data('grid_content_id'),
            index = parentCell.parents('tr').index(),
            field = parentCell.data('field'),
            type = gridState[id].columns[field].type || '',
            displayVal = getFormattedCellText(id, field, val) || gridState[id].dataSource.data[index][field],
            re, saveVal;

        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
                saveVal = displayVal;   //this and time are the only types that have the same displayVal and saveVel
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;   //this and date are the only types that have the same displayVal and saveVal
                break;
            default: 		//string, boolean
                saveVal = val;
                break;
        }

        parentCell.text(displayVal);
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
            parentCell.prepend('<span class="dirty"></span>');
            gridState[id].dataSource.data[index][field] = saveVal;
        }
        callGridEventHandlers(gridState[id].events.afterCellEdit, gridState[id].grid, null);
    }

    /**
     * Creates the toolbar div used for saving and deleting changes as well as grouping the grid's
     * data by selected columns
     * @param {object} gridData - The collection of data displayed in the grid
     * @param {object} gridElem - The DOM element used for the grid widget
     */
    function createCellEditSaveDiv(gridData, gridElem) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;	//if the toolbar has already been created, don't create it again.

        var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);

        if (gridData.excelExport) {
            var menuLink = $('<a href="#"></a>');
            menuLink.append('<span class="menuSpan"></span>');
            saveBar.append(menuLink);
            attachMenuClickHandler(menuLink, id);
        }

        var saveAnchor = $('<a href="#" class="toolbarAnchor saveToolbar"></a>').appendTo(saveBar);
        saveAnchor.append('<span class="toolbarSpan saveToolbarSpan"></span>Save Changes');

        var deleteAnchor = $('<a href="#" class="toolbarAnchor deleteToolbar"></a>').appendTo(saveBar);
        deleteAnchor.append('<span class="toolbarSpan deleteToolbarSpan">Delete Changes</span>');

        attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor);

        if (gridData.groupable) {
            var groupSpan = $('<span class="toolbarSpan group_span" style="float:right;"><span class="groupTextSpan" style="float:left;">Group By: </span></span>').appendTo(saveBar);
            var columnsList = $('<select class="input select group_select" style="float:none; display: inline; width: auto;"></select>').appendTo(groupSpan);
            var dirList = $('<select class="input select group_dir_select" style="display: inline; width: auto;"></span>').appendTo(groupSpan);
            dirList.append('<option value="asc">Ascending</span>');
            dirList.append('<option value="desc">Descending</span>');
            columnsList.append('<option value="none">None</option>');
            for (var col in gridData.columns) {
                if (gridData.columns[col].groupable !== false) {
                    var colTitle = gridData.columns[col].title || col;
                    columnsList.append('<option value="' + col + '">' + colTitle + '</option>');
                }
            }
            columnsList.on('change', groupByHandler);
            dirList.on('change', groupByHandler);
        }
    }

    /**
     * Attaches the click handlers for the save and delete buttons on the toolbar for saving/deleting changes made to the grid data
     * @param {number} id - the identifier of the grid instance
     * @param {object} gridElem - the grid DOM element
     * @param {object} saveAnchor - the save button DOM element
     * @param {object} deleteAnchor - the delete button DOM element
     */
    function attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor) {
        saveAnchor.on('click', function saveChangesHandler(e) {
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [],
                pageNum = gridState[id].pageNum, i;
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                if (typeof gridState[id].dataSource.put !== 'function') {
                    for (i = 0; i < dirtyCells.length; i++) {
                        var index = dirtyCells[i].parents('tr').index();
                        var field = dirtyCells[i].data('field');
                        var origIndex = gridState[id].dataSource.data[index][field]._initialRowIndex;
                        gridState[id].originalData[origIndex][field] = gridState[id].dataSource.data[index][field];
                        dirtyCells[i].find('.dirty').remove();
                    }
                }
                else {
                    gridState[id].putRequest.eventType = 'save';
                    gridState[id].putRequest.pageNum = pageNum;
                    gridState[id].putRequest.models = [];
                    var putRequestModels = gridState[id].putRequest.models;
                    for (i = 0; i < dirtyCells.length; i++) {
                        var tmpModel = cloneGridData(gridState[id].dataSource.data[dirtyCells[i].parents('tr').index()]);
                        var tmpMap = tmpModel._initialRowIndex;
                        var idx = existsInPutRequest(putRequestModels, tmpModel);
                        if (~idx)
                            putRequestModels[idx].dirtyFields.push(dirtyCells[i].data('field'));
                        else
                            putRequestModels.push({ cleanData: gridState[id].originalData[tmpMap], dirtyData: tmpModel, dirtyFields: [dirtyCells[i].data('field')] });
                    }

                    for (i = 0; i < putRequestModels.length; i++) {
                        delete putRequestModels[i].dirtyData._initialRowIndex;
                    }

                    prepareGridDataUpdateRequest(id);
                }
            }
        });

        deleteAnchor.on('click', function deleteChangeHandler(e) {
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [];
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                for (var i = 0; i < dirtyCells.length; i++) {
                    var field = dirtyCells[i].data('field');
                    var index = dirtyCells[i].parents('tr').index();
                    var pageNum = gridState[id].pageNum;
                    var rowNum = gridState[id].pageSize;
                    var addend = (pageNum-1)*rowNum;
                    var cellVal = gridState[id].originalData[index][field] !== undefined ? gridState[id].originalData[index][field] : '';
                    var text = getFormattedCellText(id, field, cellVal) || cellVal;
                    dirtyCells[i].text(text);
                    dirtyCells[i].find('.dirty').remove();
                    gridState[id].dataSource.data[index][field] = gridState[id].originalData[index + addend][field];
                }
            }
        });
    }

    /*var menuOptions = {
        editable: {
            items: {
                save: {
                    text: 'Save Grid Changes'
                },
                delete: {
                    text: 'Delete Grid Changes'
                }
            },
            type: 'click'
        },
        excelExport: {
            items: {
                export: {
                    text: 'Export to Excel'
                }
            },
            type: 'submenu'
        },
        sortable: {
            type: 'click',
            items: {
                removeSort: 'Remove Grid Sort'
            }
        },
        filterable: {
            type: 'click',
            items: {
                removeFilter: 'Remove Grid Filter'
            }
        },
        selectable: {
            type: 'click',
            items: {
                removeSelection: 'Remove Grid Selection'
            }
        }
    };*/

    /**
     * Creates the menu for the grid's toolbar
     * @param {object} menuAnchor - A DOM anchor element to attach the click handler to
     * @param {number} gridId - The id of the current grid widget instance
     */
    function attachMenuClickHandler(menuAnchor, gridId) {
        menuAnchor.on('click', function menuAnchorClickHandler(e) {
            e.stopPropagation();	//stop event bubbling so that the click won't bubble to document click handler
            e.preventDefault();
            var grid = menuAnchor.parents('.grid-wrapper'),
                menu = grid.find('#menu_id_' + gridId),
                //menuOptions = ['excelExport'],  //TODO: change this to an object so click or mouseover action can be mapped to each option
                newMenu;

            if (!menu.length) {
                //TODO: this needs to eventually be pushed into its own function and check all grid config options to display in the menu
                newMenu = $('<div id="menu_model_grid_id_' + gridId + '" class="grid_menu" data-grid_id="' + gridId + '"></div>');
                if (gridState[gridId].editable) {
                    newMenu.append($('<ul class="menu-list"></ul>').append(createSaveDeleteMenuItems(gridId)));
                }
                if (gridState[gridId].sortable || gridState[gridId].filterable || gridState[gridId].selectable) {
                    newMenu.append($('<hr/>'));
                    if (gridState[gridId].sortable) newMenu.append($('<ul class="menu-list"></ul>').append(createSortMenuItem()));
                    if (gridState[gridId].filterable) newMenu.append($('<ul class="menu-list"></ul>').append(createFilterMenuItems()));
                    if (gridState[gridId].selectable) newMenu.append($('<ul class="menu-list"></ul>').append(createDeselectMenuOption(gridId)));
                }
                if (gridState[gridId].excelExport) {
                    newMenu.append($('<hr/>'));
                    newMenu.append($('<ul class="menu-list"></ul>').append(createExcelExportMenuItems(newMenu, gridId)));
                }
                gridState[gridId].grid.append(newMenu);
                $(document).on('click', function hideMenuHandler(e) {
                    var elem = $(e.target);
                    if (!elem.hasClass('grid_menu') && !elem.hasClass('menu_item_options')) {
                        if (!elem.parents('.grid_menu').length && !elem.parents('.menu_item_options').length) {
                            $('.grid_menu').addClass('hiddenMenu');
                        }
                    }
                });
            }
            else {
                newMenu = menu;
                newMenu.removeClass('hiddenMenu');
            }

            var menuAnchorOffset = menuAnchor.offset();
            newMenu.css('top', (menuAnchorOffset.top - $(window).scrollTop()));
            newMenu.css('left', (menuAnchorOffset.left - $(window).scrollLeft()));
        });
    }

    /**
     * Creates the excel export sub-menu options and attached handlers
     * @param {object} menu - The DOM menu-element
     * @param {number}gridId - The id of the current grid widget instance
     * @returns {*|HTMLElement}
     */
    function createExcelExportMenuItems(menu, gridId) {
        var menuItem = $('<li class="menu_item"></li>');
        var menuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Export to Excel<span class="menu_arrow"/></span></a>');
        menuItem.on('mouseover', function excelMenuItemHoverHandler() {
            var exportOptions = gridState[gridId].grid.find('#excel_grid_id_' + gridId);
            if (!exportOptions.length) {
                exportOptions = $('<div id="excel_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '"></div>');
                var exportList = $('<ul class="menu-list"></ul>');
                var gridPage = $('<li data-value="page" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Current Page Data</span></a></li>');
                var allData = $('<li data-value="all" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">All Page Data</span></a></li>');
                exportList.append(gridPage).append(allData);
                if (gridState[gridId].selectable) {
                    var gridSelection = $('<li data-value="select" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Selected Grid Data</span></a></li>');
                    exportList.append(gridSelection);
                }
                var options = exportList.find('li');
                options.on('click', function excelExportItemClickHandler() {
                    exportDataAsExcelFile(gridId, this.dataset.value);
                    gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
                });
                exportOptions.append(exportList);
                gridState[gridId].grid.append(exportOptions);
            }
            else exportOptions.removeClass('hidden_menu_item');

            var groupAnchorOffset = menuAnchor.offset(),
                newMenuOffset = menu.offset();
            exportOptions.css('top', (groupAnchorOffset.top - $(window).scrollTop()));
            exportOptions.css('left', (newMenuOffset.left + menu.outerWidth() - 1 - $(window).scrollLeft()));
        });
        menuItem.on('mouseout', function excelMenuItemHoverHandler(evt) {
            var excelOptions = $('#excel_grid_id_' + gridId),
                excelOptionsOffset = excelOptions.offset();
            if (evt.pageX >= excelOptionsOffset.left && evt.pageX <= (excelOptionsOffset.left + excelOptions.width()) && evt.pageY >= excelOptionsOffset.top &&
                evt.pageY <= (excelOptionsOffset.top + excelOptions.height())) {
                excelOptions.one('mouseleave', function(e) {
                    var groupElementOffset = menuItem.offset();
                    if (e.pageX >= groupElementOffset.left && e.pageX <= (groupElementOffset.left + menuItem.outerWidth()) && e.pageY >= groupElementOffset.top &&
                        e.pageY <= (groupElementOffset.top + menuItem.outerHeight())) return;
                    gridState[gridId].grid.find('#excel_grid_id_' + gridId).addClass('hidden_menu_item');
                });
            }
            else {
                gridState[gridId].grid.find('#excel_grid_id_' + gridId).addClass('hidden_menu_item');
            }
        });
        menuItem.append(menuAnchor);
        return menuItem;
    }

    function createDeselectMenuOption(gridId) {
        var deSelectMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove Grid Selection</a>'));
        deSelectMenuItem.on('click', function deselectGridClickHandler(e) {
            gridState[gridId].grid.find('.selected').removeClass('selected');
            $(e.currentTarget).parents('.grid_menu').addClass('hiddenMenu');
        });
        return deSelectMenuItem;
    }

    function createSaveDeleteMenuItems(gridId) {
        var saveMenuItem = $('<li class="menu_item"></li>');
        var saveMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Save Grid Changes</a>');
        var deleteMenuItem = $('<li class="menu_item"></li>');
        var deleteMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Delete Grid Changes</a>');

        attachSaveAndDeleteHandlers(gridId, gridState[gridId].grid, saveMenuItem, deleteMenuItem);

        saveMenuItem.append(saveMenuAnchor);
        deleteMenuItem.append(deleteMenuAnchor);
        return [saveMenuItem, deleteMenuItem];
    }

    function createSortMenuItem() {
        var sortMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Sorts</a>'));
        sortMenuItem.on('click', RemoveAllColumnSorts);
        return sortMenuItem;
    }

    function createFilterMenuItems() {
        var filterMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Grid Filters</a>'));
        filterMenuItem.on('click', resetAllFilters);
        return filterMenuItem;
    }

    function RemoveAllColumnSorts(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');

        $('.sortSpan').remove();
        gridState[gridId].sortedOn = [];
        gridState[gridId].pageRequest.eventType = 'sort';
        preparePageDataGetRequest(gridId);
    }

    /**
     * Handler for the change event when a user selects a column from the group-by selector input.
     * This will call the function to get a new page of grid data based on the choosen grouping.
     */
    function groupByHandler() {
        var id = $(this).parents('.toolbar').data('grid_id');
        if (gridState[id].updating) return;
        var colSelector = $(this).parents('.toolbar').find('.group_select'),
            directionSelector = $(this).parents('.toolbar').find('.group_dir_select');
        if (colSelector.val() === 'none' && (!gridState[id].groupedBy || gridState[id].groupedBy === 'none')) return;
        if (Object.keys(gridState[id].columns).length === gridState[id].grid.find('colgroup').first().find('col').length && colSelector.val() !== 'none') {
            if (!gridState[id].groupedBy)
                gridState[id].groupingStatusChanged = true;
            var colGroups = gridState[id].grid.find('colgroup');
            colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                $(val).prepend('<col class="group_col"/>');
            });
            gridState[id].grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
            gridState[id].grid.find('.summary-row-header').prepend('<td class="group_spacer">&nbsp</td>');
        }
        else if (colSelector.val() === 'none') {
            gridState[id].groupingStatusChanged = true;
            gridState[id].grid.find('colgroup').find('.group_col').remove();
            gridState[id].grid.find('.group_spacer').remove();
            gridState[id].alteredData = cloneGridData(gridState[id].originalData);
        }
        gridState[id].pageRequest.groupedBy = colSelector.val() === 'none' ? undefined : colSelector.val();
        gridState[id].pageRequest.groupSortDirection = colSelector.val() === 'none' ? undefined : directionSelector.val();
        gridState[id].pageRequest.eventType = 'group';
        preparePageDataGetRequest(id);
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
        var displayedRows = (count - gridState[id].pageSize) > 0 ? gridState[id].pageSize : count;
        var remainingPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) : 0;
        var pageNum = gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum;

        var first = $('<a href="#" class="grid-page-link link-disabled" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridFooter);
        var prev = $('<a href="#" class="grid-page-link link-disabled" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridFooter);
        var text = 'Page ' + gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum + '/' + (remainingPages + 1);
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
            var sizeSelectorSpan = $('<span class="page-size-span"></span>'),
                sizeSelect = $('<select class="size-selector input"></select>'),
                numOptions = 0;
            for (var i = 0; i < pageOptions.length; i++) {
                if (isNumber(parseFloat(pageOptions[i]))) {
                    sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                    numOptions++;
                }
            }
            if (numOptions) {
                sizeSelectorSpan.appendTo(gridFooter);
                sizeSelect.appendTo(sizeSelectorSpan);
            }
            sizeSelect.val(gridState[id].pageSize);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler() {
                var pageSize = $(this).val();
                gridState[id].pageRequest.pageSize = parseInt(pageSize);
                gridState[id].pageRequest.eventType = 'pageSize';
                preparePageDataGetRequest(id);
            });
        }

        var rowStart = 1 + (displayedRows*(pageNum-1));
        var rowEnd = displayedRows*pageNum;
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
                if (link.hasClass('link-disabled')) {	//If the pager link that was clicked on is disabled, return.
                    return;
                }
                var gridFooter = link.parents('.grid-footer-div');
                var allPagers = gridFooter.find('a');
                var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
                if (gridState[id].updating) return;		//can't page if grid is updating
                var gridData = gridState[id];
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

    /**
     * Attaches a click handler to each filter element in the grid's header
     * @param {object} filterElem - The DOM element that has the click handler attached to it
     */
    function attachFilterListener(filterElem) {
        filterElem.on('click', function filterClickCallback(e) {
            e.stopPropagation();	//stop event bubbling so that the column won't also get sorted when the filter icon is clicked.
            e.preventDefault();
            var filterAnchor = $(e.target);
            var filterCell = filterAnchor.parents('th');
            var type = filterAnchor.data('type');
            var grid = filterElem.parents('.grid-wrapper');
            var id = grid.data('grid_id');
            if (gridState[id].updating) return;		//can't filter when the grid is updating
            var filters = grid.find('.filter-div');
            var currFilter = null;
            var field = filterAnchor.data('field');
            var title = gridState[id].columns[field].title || field;

            if (filters.length) {
                filters.each(function iterateFiltersCallback(idx, val) {
                    var filter = $(val);
                    if (filter.data('parentfield') === filterAnchor.data('field')) {
                        filter.removeClass('hiddenFilter');
                        currFilter = $(val);
                    }
                    else filter.addClass('hiddenFilter');
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

    /**
     * Creates the modal filter div and populates the filter types in the selector
     * @param {string} type - The type of data to be filtered (string, number, boolean, date, time)
     * @param {string} field - The column of data being filtered
     * @param {object} grid - The DOM element for the grid widget
     * @param {string} title - The title supplied in the metadata for the grid's column
     */
    function createFilterDiv(type, field, grid, title) {
        var filterDiv = $('<div class="filter-div" data-parentfield="' + field + '" data-type="' + type + '"></div>').appendTo(grid);
        var domName = title ? title : type;
        var filterInput, resetButton, button,
            span = $('<span class="filterTextSpan">Filter rows where ' + domName + ' is:</span>').appendTo(filterDiv),
            select = type !== 'boolean' ? $('<select class="filterSelect select input"></select>').appendTo(filterDiv)
                .append('<option value="eq">Equal to:</option>').append('<option value="neq">Not equal to:</option>') : null;

        switch (type) {
            case 'number':
                select.append('<option value="gte">Greater than or equal to:</option>');
                select.append('<option value="gt">Greater than:</option>');
                select.append('<option value="lte">Less than or equal to:</option>');
                select.append('<option value="lt">Less than:</option>');
                filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'date':
            case 'time':
                select.append('<option value="gte">Equal to or later than:</option>');
                select.append('<option value="gt">Later than:</option>');
                select.append('<option value="lte">Equal to or before:</option>');
                select.append('<option value="lt">Before:</option>');
                var inputType = type === 'date' ? 'date' : 'text';
                filterInput = $('<input type="' + inputType + '" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'boolean':
                var optSelect = $('<select class="filterSelect select"></select>').appendTo(span);
                optSelect.append('<option value="true">True</option>');
                optSelect.append('<option value="false">False</option>');
                break;
            case 'string':
                select.append('<option value="ct">Contains:</option>');
                select.append('<option value="nct">Does not contain:</option>');
                filterInput = $('<input class="filterInput input" type="text" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
        }
        resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
        button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
        resetButton.on('click', resetButtonClickHandler);
        button.on('click', filterButtonClickHandler);
        if (filterInput && type !=='time' && type !== 'date') filterInputValidation(filterInput);
    }

    /**
     * Attaches a keypress handler on the inputs in a filter modal
     * @param {object} input - The DOM input element
     */
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

    function resetAllFilters(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');
        gridState[gridId].grid.find('filterInput').val('');

        if (gridState[gridId].updating) return;		//can't filter if grid is updating
        gridState[gridId].filteredOn = [];
        gridState[gridId].pageRequest.eventType = 'filter-rem';
        preparePageDataGetRequest(gridId);
    }

    function resetButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            value = filterDiv.find('.filterInput').val(),
            field = $(this).data('field'),
            remainingFilters = [],
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[gridId].updating) return;		//can't filter if grid is updating
        var gridData = gridState[gridId];

        if (value === '' && !gridData.filteredOn.length) return;
        filterDiv.find('.filterInput').val('');

        filterDiv.addClass('hiddenFilter');

        for (var i = 0; i < gridState[gridId].filteredOn.length; i++) {
            if (gridState[gridId].filteredOn[i].field !== field) {
                remainingFilters.push(gridState[gridId].filteredOn[i]);
            }
        }

        gridData.filteredOn = remainingFilters;
        gridData.pageRequest.eventType = 'filter-rem';
        preparePageDataGetRequest(gridId);
    }

    function filterButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            selected = filterDiv.find('.filterSelect').val(),
            value = filterDiv.find('.filterInput').val(),
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[gridId].updating) return;		//can't filter if grid is updating
        var gridData = gridState[gridId],
            type = filterDiv.data('type'),
            errors = filterDiv.find('.filter-div-error'),
            field = $(this).data('field'),
            foundColumn = false,
            tmpFilters = [],
            updatedFilter, re;

        if (dataTypes[type]) {
            re = new RegExp(dataTypes[type]);
            if (!re.test(value) && !errors.length) {
                $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
                return;
            }
        }

        if (errors.length) errors.remove();
        if (value === '' && !gridData.filteredOn.length) return;

        for (var i = 0; i < gridState[gridId].filteredOn.length; i++) {
            if (gridState[gridId].filteredOn[i].field !== field) tmpFilters.push(gridState[gridId].filteredOn[i]);
            else {
                updatedFilter = gridState[gridId].filteredOn[i];
                foundColumn = true;
            }
        }

        tmpFilters.push(foundColumn ? updatedFilter : { field: field, value: value, filterType: selected });
        gridState[gridId].filteredOn = tmpFilters;

        filterDiv.addClass('hiddenFilter');
        gridData.pageRequest.eventType = 'filter-add';
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
        if (id == null || droppedId == null || id !== droppedId) return;  //at least one of the involved dom elements is not a grid column, or they are from different grids
        if (gridState[id].updating) return;		//can't resort columns if grid is updating
        if (droppedCol[0].cellIndex === targetCol[0].cellIndex) return;
        if (droppedCol[0].id === 'sliderDiv') return;

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
        if (droppedEvents.click) setSortableClickListener(droppedClone);
        setDragAndDropListeners(droppedClone);
        if (targetEvents.click) setSortableClickListener(targetClone);
        setDragAndDropListeners(targetClone);

        if (droppedClone.find('.filterSpan').length) attachFilterListener(droppedClone.find('.filterSpan'));
        if (targetClone.find('.filterSpan').length) attachFilterListener(targetClone.find('.filterSpan'));

        droppedCol.replaceWith(targetClone);
        targetCol.replaceWith(droppedClone);
        droppedClone[0].dataset.index = targetIndex;
        targetClone[0].dataset.index = droppedIndex;

        swapContentCells(parentDivId, droppedIndex, targetIndex);

        var targetWidth = colGroups[0].children[droppedIndex].style.width;
        var droppedWidth = colGroups[0].children[targetIndex].style.width;

        colGroups[0].children[targetIndex].style.width = targetWidth;
        colGroups[0].children[droppedIndex].style.width = droppedWidth;
        colGroups[1].children[targetIndex].style.width = targetWidth;
        colGroups[1].children[droppedIndex].style.width = droppedWidth;

        var sumRow = parentDiv.find('.summary-row-header');
        if (sumRow.length) {
            var droppedColSum = null,
                targetColSum = null;
            sumRow.children().each(function iterateSumRowCellsCallback(idx, val) {
                if ($(val).data('field') === droppedCol.data('field')) droppedColSum = $(val);
                else if ($(val).data('field') === targetCol.data('field')) targetColSum = $(val);
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
            element: gridState[id].grid,
            droppedColumn: droppedCol.data('field'),
            targetColumn: targetCol.data('field'),
            droppedIndex: droppedIndex,
            targetIndex: targetIndex
        };
        callGridEventHandlers(gridState[id].events.columnReorder, gridState[id].grid, evtObj);
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
                    gridState[parentDiv.parent().data('grid_header_id')].resizing = true;
                });
                sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                    gridState[parentDiv.parent().data('grid_header_id')].resizing = false;
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

    /**
     * Sets a click handler for all sortable columns on the column header
     * @param {object} elem - The DOM element that has the click handler attached
     */
    function setSortableClickListener(elem) {
        elem.on('click', function handleHeaderClickCallback() {
            var headerDiv = elem.parents('.grid-header-div');
            var id = parseInt(headerDiv.data('grid_header_id'));
            if (gridState[id].updating) return;		//can't sort if grid is updating
            var field = elem.data('field'),
                foundColumn = false;

            if (gridState[id].groupedBy && gridState[id].groupedBy === field) return;   //can't sort on a grouped field

            for (var i = 0; i < gridState[id].sortedOn.length; i++) {
                //if we find the field in the list of sorted columns....
                if (gridState[id].sortedOn[i].field === field) {
                    foundColumn = true;
                    //...if it had been sorted ascending, change it to descending...
                    if (gridState[id].sortedOn[i].sortDirection === 'asc') {
                        gridState[id].sortedOn[i].sortDirection = 'desc';
                        elem.find('.sortSpan').addClass('sort-desc').removeClass('sort-asc');
                    }
                    else {
                        //...otherwise, remove it from the collection of sorted columns
                        gridState[id].sortedOn =  gridState[id].sortedOn.filter(function filterSortedColumns(item) {
                            return item.field !== field;
                        });
                        elem.find('.sortSpan').remove();
                        gridState[id].alteredData = cloneGridData(gridState[id].originalData);
                    }
                }
            }

            if (!foundColumn) {
                gridState[id].sortedOn.push({ field: field, sortDirection: 'asc' });
                elem.find('.header-anchor').append('<span class="sort-asc sortSpan">Sort</span>');
            }
            gridState[id].pageRequest.eventType = 'sort';
            preparePageDataGetRequest(id);
        });
    }

    /**
     * Add the filter icon to a filterable grid header and attaches an event listener when the icon is clicked
     * @param {object} elem - The grid header element whose column values are filterable
     * @param {object} gridData - The metadata describing the grid's behavior and attributes
     * @param {string} col - The name of the field associated with the filterable grid column
     */
    function setFilterableClickListener(elem, gridData, col) {
        var type = gridData.columns[col].type || 'string';
        var anchor = $('<a href="#"></a>').appendTo(elem);
        anchor.append('<span class="filterSpan" data-type="' + type + '" data-field="' + elem.data('field') + '"></span>');
        attachFilterListener(anchor);
        if ($(document).find('.filterSpan').length < 2) {
            $(document).on('click', function hideFilterHandler(e) {
                if (!$(e.target).hasClass('filter-div')) {
                    if ($(e.target).parents('.filter-div').length < 1) {
                        $(document).find('.filter-div').each(function iterateFilterDivsCallback(idx, val) {
                            if ($(val).find('.filterInput').length)
                                $(val).find('.filterInput').val('');
                            $(val).addClass('hiddenFilter');
                        });
                    }
                }
            });
        }
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

    /**
     * Handler for column resizing - alters the width of a grid column based on mouse movement
     * @param {object} e - The drag event that was fired by the browser
     */
    function handleResizeDragCallback(e) {
        e.preventDefault();
        var sliderDiv = $(e.currentTarget);
        var id = sliderDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[id].updating) return;		//can't resize columns if grid is updating
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
            if (gridState[id].groupedBy && gridState[id].groupedBy !== 'none')
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

    /**
     * Swaps the cells of a grid when a column re-ordering happens
     * @param {number} gridId - The id of the grid widget instance
     * @param {number} droppedIndex - The column index of the column that was 'dropped'
     * @param {number} targetIndex - The column index of the column that was the target of the dropped column
     */
    function swapContentCells(gridId, droppedIndex, targetIndex) {
        var gridData = gridState[gridId];
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
        gridState[id].updating = true;
        var gridData = gridState[id];
        var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
        var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;
        var sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        var filteredOn = gridData.filteredOn.length? gridData.filteredOn : [];
        var groupedBy = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupedBy : gridData.groupedBy || null;
        var groupSortDirection = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupSortDirection : gridData.groupSortDirection || null;

        var requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = sortedOn;
        if (gridData.filterable) requestObj.filteredOn = filteredOn;

        if (gridData.groupable) {
            requestObj.groupedBy = groupedBy;
            requestObj.groupSortDirection = groupSortDirection;
        }

        requestObj.pageSize = pageSize;
        requestObj.pageNum = gridData.eventType === 'filter' ? 1 : pageNum;

        gridData.grid.find('.grid-content-div').empty();

        callGridEventHandlers(gridState[id].events.pageRequested, gridData.grid, { element: gridData.grid });
        if (gridData.dataSource.get && typeof gridData.dataSource.get === 'function')
            gridData.dataSource.get(requestObj, getPageDataRequestCallback);
        else {
            if (!gridData.alteredData) gridData.alteredData = cloneGridData(gridData.originalData);
            getPageData(requestObj, id, getPageDataRequestCallback);
        }

        function getPageDataRequestCallback(response) {
            var groupingStatus = gridData.groupingStatusChanged;
            if (response) {
                //TODO: create a generic function to validate grid-data data types
                //TODO: see if the closure will preserve the known values above - might have tried this before because I can't imagine why I wouldn't already be making use of the closure.
                gridData.dataSource.data = response.data;
                gridData.pageSize = requestObj.pageSize;
                gridData.pageNum = requestObj.pageNum;
                gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.data.length;
                gridData.groupedBy = requestObj.groupedBy;
                gridData.groupSortDirection = requestObj.groupSortDirection;
                gridData.sortedOn = requestObj.sortedOn;
                gridData.filteredOn = requestObj.filteredOn;
                gridData.groupingStatusChanged = false;

                if (gridData.pageRequest.eventType === 'newGrid' || groupingStatus)
                    setColWidth(gridData, gridState[id].grid);

                createGridContent(gridData, gridState[id].grid);
                if (gridData.pageRequest.eventType === 'filter-add' || gridData.pageRequest.eventType === 'filter-rem' || gridData.pageRequest.eventType === 'pageSize') {
                    gridData.grid.find('.grid-footer-div').empty();
                    createGridFooter(gridData, gridData.grid);
                }
                if (gridData.pageRequest.eventType === 'filter' && gridData.summaryRow && gridData.summaryRow.positionAt === 'top')
                    buildHeaderAggregations(gridData, id);
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
                gridState[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var index = $(val).parents('tr').index();
                    var field = $(val).parents('td').data('field');
                    var origIdx = gridState[id].dataSource.data[index]._initialRowIndex;
                    gridState[id].originalData[origIdx][field] = gridState[id].dataSource.data[index][field];
                    $(val).remove();
                });
            }
            else {
                gridState[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var cell = $(val).parents('td');
                    var index = cell.parents('tr').index();
                    var field = cell.data('field');
                    var text = getFormattedCellText(id, cell.data('field'), gridState[id].originalData[index][field]) || gridState[id].originalData[index][field];
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
        var fullGridData = cloneGridData(gridState[id].alteredData);

        if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
            limitPageData(requestObj, fullGridData, callback);
            return;
        }

        if ((requestObj.filteredOn && requestObj.filteredOn.length) || eventType === 'filter-rem') {
            fullGridData = eventType === 'filter-add' ? cloneGridData(gridState[id].alteredData) : cloneGridData(gridState[id].originalData);
            var startIdx = eventType === 'filter-add' ? requestObj.filteredOn.length - 1 : 0;
            for (var i = startIdx; i <  requestObj.filteredOn.length; i++) {
                var dataType = gridState[id].columns[requestObj.filteredOn[i].field].type || 'string';
                fullGridData = filterGridData(requestObj.filteredOn[i].filterType, requestObj.filteredOn[i].value, requestObj.filteredOn[i].field, dataType, fullGridData);
            }
            requestObj.pageNum = 1;		//reset the page to the first page when a filter is applied or removed.
            gridState[id].alteredData = fullGridData;
        }

        if (requestObj.groupedBy) {
            var groupedData = sortGridData([{ field: requestObj.groupedBy, sortDirection: requestObj.groupSortDirection }], fullGridData || cloneGridData(gridState[id].originalData), id);
            if (requestObj.sortedOn.length) {
                var sortedGroup = [];
                for (var group in groupedData.groupings) {
                    sortedGroup = sortedGroup.concat(sortGridData(requestObj.sortedOn, groupedData.groupings[group] || cloneGridData(gridState[id].originalData), id));
                }
                gridState[id].alteredData = fullGridData;
                limitPageData(requestObj, sortedGroup, callback);
                return;
            }
            gridState[id].alteredData = groupedData;
            limitPageData(requestObj, groupedData, callback);
            return;
        }

        if (requestObj.sortedOn && requestObj.sortedOn.length && !requestObj.groupedBy)
            fullGridData = sortGridData(requestObj.sortedOn, fullGridData || cloneGridData(gridState[id].originalData), id);
        gridState[id].alteredData = fullGridData;
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

    /**
     * Filters the grid's data when being used for client-side updates. Based on the filtered column, value, and type
     * this function will determine which data should remain in the collection
     * @param {string} filterType - The type of filter selected by the user (=, !=, >, >=, etc)
     * @param {string|number|boolean} value - The value against which the filter should apply to the grid data
     * @param {string} field - The name of the column to apply the filter to
     * @param {string} dataType - The type of data being filtered (string, number, boolean, time, date)
     * @param {Array} gridData - The collection of grid data to filter
     */
    function filterGridData(filterType, value, field, dataType, gridData) {
        var filteredData = [], curVal, baseVal;

        for (var i = 0, length = gridData.length; i < length; i++) {
            if (dataType === 'time') {
                curVal = getNumbersFromTime(gridData[i][field]);
                baseVal = getNumbersFromTime(value);

                if (gridData[i][field].indexOf('PM') > -1) curVal[0] += 12;
                if (value.indexOf('PM') > -1) baseVal[0] += 12;

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
            if (comparator(curVal, baseVal, filterType)) filteredData.push(gridData[i]);
        }
        return filteredData;
    }

    /**
     * Using various equality operators, checks to for truth based on the type of the operator(s)
     * @param {string|number|boolean} val - The value that is being checked against a base value
     * @param {*} base - The based value against which values are compared
     * @param {string} type - The type of equality operator(s) to be used in the comparison
     * @returns {boolean} - Returns a boolean indicating that whether the comparison was true of false
     */
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
                return !!~val.toLowerCase().indexOf(base.toLowerCase());
            case 'nct':
                return !~val.toLowerCase().indexOf(base.toLowerCase());
        }
    }

    /**
     * Manages sorting grid data based on the field and data type
     * @param {Array} sortedItems - An array of objects describing which columns are to be sorted and in which directions
     * @param {Array} gridData - An array containing the grid data to be sorted
     * @param {number} gridId - The id of the grid instance
     * @returns {Array} - Returns an array of sorted grid data
     */
    function sortGridData (sortedItems, gridData, gridId) {
        for (var i = 0; i < sortedItems.length; i++) {
            if (i === 0)
                gridData = mergeSort(gridData, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string');
            else {
                var sortedGridData = [];
                var itemsToSort = [];
                for (var j = 0; j < gridData.length; j++) {
                    if (!itemsToSort.length || compareValuesByType(itemsToSort[0][sortedItems[i - 1].field], gridData[j][sortedItems[i - 1].field], gridState[gridId].columns[sortedItems[i - 1].field].type))
                        itemsToSort.push(gridData[j]);
                    else {
                        if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                        else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }
                    if (j === gridData.length - 1)
                        sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string'));
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

    /**
     * Calls all registered event handlers for a collection of events
     * @param {Array} events - A collection of events to
     * @param {Object} context - An object, array, or function to set as the context of the event handler
     * @param  {Object} param - An object that contains metadata about the event
     */
    function callGridEventHandlers(events, context, param) {
        if (events.length) {
            for (var x = 0; x < events.length; x++)
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

    /**
     * Formats the text in a grid cell - uses both column formats and column templates if provided
     * @param {number} gridId - The id of the grid instance
     * @param {string} column - The column of the grid that this data will be displayed in
     * @param {string|number} value - The value to be formatted
     * @returns {string|number} - Returns a formatted value if a column format and/or template were provided;
     * otherwise, returns the value
     */
    function getFormattedCellText(gridId, column, value) {
        var text;
        switch(gridState[gridId].columns[column].type) {
            case 'number':
                text = formatNumericCellData(value, gridState[gridId].columns[column].format);
                break;
            case 'date':
                text = formatDateCellData(value, gridState[gridId].columns[column].format);
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

        var template = gridState[gridId].columns[column].template;
        if (template && text !== '') {
            if (typeof template === 'function')
                return template.call(column, text);
            else if (typeof template === 'string')
                return template.replace('{{data}}', text);
            return text;
        }
        return text;
    }

    /**
     * Given a string, this function will ensure it is in a valid time format and has a legitimate
     * time value. This returns a standard format as a response.
     * @param {string} val - The value being tested for time legitimacy
     * @returns {Array} - An array containing hours, minutes, seconds of the day (if 12 hour time format, also contains meridiem)
     */
    function getNumbersFromTime(val) {
        var re = new RegExp(dataTypes.time);
        if (!re.test(val)) return [];
        var timeGroups = re.exec(val);
        var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
        var minutes, seconds, meridiem, retVal = [];
        if (timeGroups[2]) {
            minutes = +timeGroups[3] || 0;
            seconds = +timeGroups[4]  || 0;
            meridiem = timeGroups[5].replace(' ', '') || null;
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
        if (meridiem) retVal.push(meridiem);
        return retVal;
    }

    /**
     * Given the array the 'getNumbersFromTime' function produces, this function will turn the values
     * into seconds for comparisons when filtering and sorting grid data.
     * @param {Array} timeArray - An array of the type produced by the 'getNumbersFromTime' function
     * @returns {number} - Returns a value in seconds for the time of day
     */
    function convertTimeArrayToSeconds(timeArray) {
        var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
        return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
    }

    /**
     * Validates that a given character is allowed with the given data type
     * @param {number} code - The character's key code
     * @param {string} dataType - The type of data to check for character validity
     * @returns {boolean} - Returns the tested character if valid or null if not
     */
    function validateCharacter(code, dataType) {
        var key = String.fromCharCode(code);
        if (dataTypes[dataType]) {
            var re = new RegExp(dataTypes[dataType + 'Char']);
            return re.test(key);
        }
        return true;
    }

    /**
     * Compares two values for equality after coercing both to the provided type
     * @param {string|number} val1 - The first value to check for equality
     * @param {string|number} val2 - The second value to check for equality
     * @param {string} dataType - The type of data contained in the two values
     * @returns {boolean} - Indicated equality or lack thereof
     */
    function compareValuesByType (val1, val2, dataType) {
        switch (dataType) {
            case 'string':
                return val1.toString() === val2.toString();
            case 'number':
                return parseFloat(val1.toString()) === parseFloat(val2.toString());
            case 'boolean':
                /*jshint -W018*/    //have to turn off jshint check for !! operation because there's not built-in way to turn it off in the config file and
                //like most js devs, those of jshint aren't the most savvy JSers
                return !!val1 === !!val2;
            case 'date':
                var date1 = new Date(val1),
                    date2 = new Date(val2);
                if (typeof date1 === 'object' && typeof date2 === 'object' && date1 !== date1 && date2 !== date2)
                    return true;    //invalid date values - creating a date from both values resulted in either NaN or 'Invalid Date', neither of which are equal to themselves.
                return date1 === date2;
            case 'time':
                var value1 = getNumbersFromTime(val1);
                var value2 = getNumbersFromTime(val2);
                if (value1[3] && value1[3] === 'PM')
                    value1[0] += 12;
                if (value2[3] && value2[3] === 'PM')
                    value2[0] += 12;
                return convertTimeArrayToSeconds(value1) === convertTimeArrayToSeconds(value2);
            default:
                return val1.toString() === val2.toString();
        }
    }

    /**
     * Exports data from grid based on user's selection (current page data, all data, or selection data if the grid is selectable is turned on)
     * @param {number} gridId - The id of the grid DOM instance
     * @param {string} option - The export option selected by the user
     */
    function exportDataAsExcelFile(gridId, option) {
        if (excelExporter && typeof excelExporter.createWorkBook === 'function') {
            determineGridDataToExport(gridId, (option || 'page'), function gridDataCallback(excelDataAndColumns) {
                excelExporter.exportWorkBook(excelExporter.createWorkBook().createWorkSheet(excelDataAndColumns.data, excelDataAndColumns.columns, 'testSheet'));
            });
        }
    }

    /**
     * Determines what grid data to export to excel based on user's selected menu option
     * @param {number} gridId - The id of the grid DOM instance
     * @param {string} option - The export option selected by the user
     * @param {function} callback - The callback function; Needed for server-side data requests
     */
    function determineGridDataToExport(gridId, option, callback) {
        var columns = getGridColumns(gridId);
        switch (option) {
            case 'select':
                //TODO: this is a bad namespace; need to rework the unfortunate grid.grid section
                //TODO: need to also create a better way to get the selected grid data as it appears in the dataSource
                var selectedData = gridState[gridId].grid[0].grid.selectedData;
                if (!selectedData.length) return;
                var data = [], currentRow = selectedData[0].rowIndex;
                for (var i = 0; i < selectedData.length; i++) {
                    if (!data.length || currentRow !== selectedData[i].rowIndex) {
                        var tmpObj = {};
                        tmpObj[selectedData[i].field] = selectedData[i].data;
                        data.push(tmpObj);
                        currentRow = selectedData[i].rowIndex;
                    }
                    else {
                        data[data.length - 1][selectedData[i].field] = selectedData[i].data;
                    }
                }
                callback({ data: data, columns: columns});
                break;
            case 'all':
                if (typeof gridState[gridId].dataSource.get === 'function') {
                    var reqObj = createExcelRequestObject(gridId);
                    gridState[gridId].dataSource.get(reqObj, function excelDataCallback(response) {
                        callback({ data: response.data, columns: columns});
                    });
                }
                else callback({ data: gridState[gridId].originalData, columns: columns });
                break;
            case 'page':
            default:
                callback({ data: gridState[gridId].dataSource.data, columns: columns });
        }
    }

    function getGridColumns(gridId) {
        var cols = [];
        for (var col in gridState[gridId].columns) {
            cols.push(col);
        }
        return cols;
    }

    function createExcelRequestObject(gridId) {
        var gridData = gridState[gridId];
        var sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        var filteredOn = gridData.pageRequest.filteredOn || gridData.filteredOn || null;
        var filterVal = gridData.pageRequest.filterVal || gridData.filterVal || null;
        var filterType = gridData.pageRequest.filterType || gridData.filterType || null;
        var groupedBy = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupedBy : gridData.groupedBy || null;
        var groupSortDirection = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupSortDirection : gridData.groupSortDirection || null;

        var requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = sortedOn;

        if (gridData.filterable) {
            requestObj.filteredOn = filteredOn;
            requestObj.filterVal = filterVal;
            requestObj.filterType = filterType;
        }

        if (gridData.groupable) {   //TODO: not sure if the data can be grouped in excel; maybe a pivot table, but that will come much later, if at all.
            requestObj.groupedBy = groupedBy;
            requestObj.groupSortDirection = groupSortDirection;
        }

        requestObj.pageSize = gridData.dataSource.rowCount;
        requestObj.pageNum = 1;
        return requestObj;
    }

    dataTypes = {
        number: '^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]+)?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]+)?|0(?:\\.[0-9]+)?|(?:\\.[0-9]+)?)$',
        numberChar: '[\\d,\\.-]',
        integer: '^\\-?\\d+$',
        time: '^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$',
        timeChar: '[\\d\\.:\\ AMP]',
        date: '^(?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\2|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\5))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\8)|(?:(29|30)(\\/|-|\\.)' +
        '(0?[1,3-9]|1[0-2])\\11)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\15)|(?:(29)(\\/|-|\\.)(0?2))\\18)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
        '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\22|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\25)((?:1[6-9]|[2-9]\\d)?\\d{2}))))' +
        '|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\29)(29))))|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)' +
        '(?:(?:(?:(0?[13578]|1[02])\\33(31))|(?:(0?[1,3-9]|1[0-2])\\33(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\33(0?[1-9]|1\\d|2[0-8]))))$',
        dateChar: '[\\d\-\\.\\\]'
    };

    events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

    aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

    /**
     * Given a time of day value, will return the value formatted as specified for a given column of the grid
     * @param {string} time - A string representing a time of day (eg '9:45:56 AM' or '17:36:43.222')
     * @param {string} column - The column of the grid that provided the format
     * @param {string|number} gridId - The id value of the grid this operation is being performed on
     * @returns {string} - Returns the time formatted as specified for the given grid column
     */
    function formatTimeCellData(time, column, gridId) {
        var timeArray = getNumbersFromTime(time),
            formattedTime,
            format = gridState[gridId].columns[column].format,
            timeFormat = gridState[gridId].columns[column].timeFormat;

        if (timeArray.length < 2) return '';

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

    /**
     * Takes a date value and a format and will return the date in the form provided
     * @param {string} date - The date value to be formatted
     * @param {string} format - The format that the date value should be in
     * @returns {string|Date} - Returns a formatted date if able, otherwise will return a default JS date using the date provided as the seed
     */
    function formatDateCellData(date, format) {
        if (!format) return date;
        var parseDate = Date.parse(date);
        var jsDate = new Date(parseDate);
        if (!isNaN(parseDate) && format)
            return format.replace('mm', (jsDate.getUTCMonth() + 1).toString()).replace('dd', jsDate.getUTCDate().toString()).replace('yyyy', jsDate.getUTCFullYear().toString());
        else if (!isNaN(parseDate))
            return new Date(jsDate);
        return '';
    }

    /**
     * Takes a number and a format string and will format the number according to the formatting rules
     * @param {string|number} num - The number to be formatted before it is displayed in the grid
     * @param {string} format - The format string that specifies how to format the number
     * @returns {string|number} - Returns either the number it received if unable to properly format, or a string value of the formatted number
     */
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
                    else break;
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
                    else break;
                }
            }
            fractionNums = fractionNums.join('');

            var value = fractionNums.length ? wholeNums + '.' + fractionNums : wholeNums;
            return sign === -1 ? formatObject.prependedSymbol + '-' + value + formatObject.appendedSymbol : formatObject.prependedSymbol + value + formatObject.appendedSymbol;
        }
        return num;
    }

    /**
     * Given a format, this function will ensure it is valid and strip it of all invalid characters
     * @param {string} format - A string denoting the format a value displayed in the grid should have.
     * @returns {object} - Returns an object with the validated format string and metadata about how the value to be formatted should be treated
     */
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

    /**
     * Given a format string for either currency or percent, will normalize it as a decimal format
     * @param {string} format - A string denoting the currency or percent a value in a field should take.
     * @returns {object} - Returns an object containing the normalized format string, as well as metadata on how to treat the value to be formatted.
     */
    function createCurrencyOrPercentFormat(format) {
        var charStripper = '\\d{0,2}]',
            cOrP = ~format.indexOf('P') ? 'P' : 'C';
        format = format.split(cOrP);
        var wholeNums = verifyFormat(format[0]),
            re = new RegExp('[^' + cOrP + charStripper, 'g');
        format = format[1].replace(re, '');
        var numDecimals = 2, newFormat;
        if (format.length)
            numDecimals = parseInt(format.substring(0,2));

        if (wholeNums.value)
            newFormat = numDecimals ? wholeNums.value + '.' : wholeNums.value;
        else if (numDecimals && cOrP === 'C')
            newFormat = '0.';
        else if (numDecimals && cOrP === 'P')
            newFormat = '00.';
        else newFormat = cOrP === 'C' ? '0' : '00';

        for (var i = 0; i < numDecimals; i++) {
            newFormat += '0';
        }
        return { value: newFormat,
            shouldInsertSeparators: wholeNums.shouldInsertSeparators,
            alterer: cOrP == 'C' ? null : x100,
            prependedSymbol: cOrP === 'C' ? '$' : '',
            appendedSymbol: cOrP === 'P' ? '%' : ''
        };
    }

    /**
     * Multiples a number by 100
     * @param {number} val - the number to by multiplied by 100
     * @returns {number} - returns the multiple of the number and 100
     */
    function x100(val) {
        return val * 100;
    }

    /**
     * Rounds a number to a given decimal place
     * @param {number} val - the number to be rounded
     * @param {number} dec - the number of decimals to retain after rounding
     * @returns {number} - Returns the value rounded to the nth decimal place
     */
    function roundNumber(val, dec) {
        var pow = Math.pow(10, dec || 0);
        return Math.round((val*pow))/pow;
    }

    /**
     * Clones an object and returns a new object instance with the same values as the original
     * @param {object|*} gridData - The object to be cloned
     * @returns {*} - Returns a new instance of whatever type was given to the function
     */
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

    /**
     * Copies the contents of an array into a new array instance
     * @param {Array} arr - The array to be copied
     * @returns {Array} - Returns a new array instance containing the values in the original
     */
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

    /**
     * Checks that a given variable is a DOM element
     * @param {object} node - The variable being checked
     * @returns {boolean} - Returns true if the variable is a DOM element, false if not
     */
    function isDomElement(node) {
        return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === 'object';
    }

    /**
     * Checks that a given variable is a number and not NaN
     * @param {number} value - The number that is being checked
     * @returns {boolean} Returns true if the value is a number, false if not
     */
    function isNumber(value) {
        return typeof value === 'number' && value === value;
    }

    generateId = (function guid(seed) {
        return function _generateId() {
            seed++;
            return seed.toString();
        };
    })(-1);

    var gridApi = {};

    return Object.defineProperties(
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