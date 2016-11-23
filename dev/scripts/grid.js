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
 - Fix paging when on a non-first page and the rows/page is increased  - DONE
 - Update existing filtering to new filter object model - DONE
 - Make sure that when adding advanced filters, and vise versa - DONE
 - Fix boolean filtering - DONE
 - Fix group aggregates indentation - DONE
 - Figure out why sorting a grouped columns makes the last column in the grid a bit longer each time - DONE
 - Bring the expression parser module into the grid - DONE
 - Allow function properties on 'custom' data type columns to dynamically determine each cells data - DONE
 - Implement a dbl-click handler to auto-resize columns - DONE
 - Make sure all grid functionalities are properly set - DONE
 - Add null/empty string values to filtering selectors - DONE
 - Fix ._initialRowIndex_ property setting on local grid data handling - DONE
 - Fix broken number formatter - DONE
 - Add update to .dataMap after adding rows - DONE
 - Change aggregates to array and create at as a table footer only
 - Allow column-grouping aggregates to be defined separate from grid aggregates
 - Create data store object to hold cached grid data
 - Add drag-drop columns between different grids
 - Update cell editing to include missing data types support; especially date-time
 - Remove anchors as links for grid functionality - clicking them just requires the event to halt propagation
 - Create a 'reset' for css values at the grid level
 - Code clean up
 - Remove excessive event handlers
 - Documentation
 - Refactor
 - UPDATE TO ES6
 - Determine a shared way to check for and reset the hasAddedColumn property of the grid state cache
   > right now, if a column is added and then the column toggle menu is viewed, it will reset the property, but then other
   > grid functionalities won't know a column has been added. Need a way for a single functionality to know if a column has been added,
   > and if that specific functionality has handled the added column or not without repeating the same data for each functionality
 - Add ability to lock/freeze columns
 - Restrict handling of rapid-fire events: scroll, mouse move, mouse out, mouse leave, drag, etc
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
    var dataTypes, events, aggregates, generateId, expressionParser, dataStore,
        gridState = [],
        groupMenuText = 'Drag and drop a column header here to group by that column',
        booleanOps = {
            strictEqual: 'eq',
            looseEqual: '==',
            strictNotEqual: 'neq',
            looseNotEqual: '!=',
            greaterThanOrEqual: 'gte',
            greaterThan: 'gt',
            lessThanOrEqual: 'lte',
            lessThan: 'lt',
            not: '!',
            contains: 'ct',
            notContains: 'nct'
        },
        jsTypes = {
            'function': 'function',
            'object': 'object',
            'boolean': 'boolean',
            'number': 'number',
            'symbol': 'symbol',
            'string': 'string',
            'undefined': 'undefined'
        };

    /**
     * Exposed on the grid module. Called to create a grid widget.
     * @function create
     * @static
     * @param {object} gridData - The dataSource object needed to initialize the grid
     * @param {object} gridElem - The DOM element that should be used to create the grid widget
     * @Returns {Object} - Returns an object containing the functions created for the grid widget instance
     */
    function create(gridData, gridElem) {
        if (gridData && isDomElement(gridElem)) {
            //TODO: clean this tmp code up once jsHint will stop screaming
            var im = 2;
            if (!gridData) {
                var tmp = dataStore.initializeInstance(gridData);
                im = tmp.getGridInstance();
            }
            var id = generateId(im);
            gridElem = $(gridElem).addClass('grid_elem');
            var wrapperDiv = $('<div id="grid-wrapper-' + id + '" data-grid_id="' + id + '" class="grid-wrapper"></div>').appendTo(gridElem);
            var headerDiv = $('<div id="grid-header-' + id + '" data-grid_header_id="' + id + '" class="grid-header-div"></div>').appendTo(wrapperDiv);
            headerDiv.append('<div class="grid-header-wrapper"></div>');
            wrapperDiv.append('<div id="grid-content-' + id + '" data-grid_content_id="' + id + '" class="grid-content-div"></div>');
            //wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');
            wrapperDiv.append('<div id="grid-pager-' + id + '" data-grid_pager_id="' + id + '" class="grid-pager-div"></div>');
            gridState[id] = {};
            gridElem[0].grid = {};

            createGridInstanceMethods(gridElem, id);

            (gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === jsTypes.function) ? validator.setAdditionalEvents(['blur', 'change']) : gridData.useValidator = false;
            gridData.useFormatter = gridData.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === jsTypes.function;

            gridData.columnIndices = {};
            gridData.columns.forEach(function _createColumnIndices(col, idx) {
                gridData.columnIndices[col.field] = idx;
            });
            createGridHeaders(gridData, gridElem);
            getInitialGridData(gridData.dataSource, gridData.pageSize || 25, function initialGridDataCallback(err, res) {
                if (!err) {
                    gridData.dataSource.data = res.data;
                    gridData.dataSource.rowCount = isInteger(res.rowCount) ? res.rowCount : res.data.length;
                    if (res.aggregations && gridData.dataSource.aggregates) {
                        gridData.dataSource.aggregates = gridData.dataSource.aggregates.map(function _mapAggregateValues(val) {
                            if (res.aggregations[val.field])
                                return { aggregate: val.aggregate, field: val.field, value: res.aggregations[val.field] };
                            else return { aggregate: val.aggregate, field: val.field, value: null };
                        });
                    }
                }
                else {
                    gridData.dataSource.data = {};
                    gridData.dataSource.rowCount = 0;
                }
                initializeGrid(id, gridData, gridElem);
            });
        }
        return gridElem[0].grid;
    }

    /**
     * For internal use only; called whenever a drill down grid needs to be created.
     * Forwards to createGrid function after setting the drill down's parentGridId attribute.
     * @param {Object} gridData - The grid config object for the drill down grid instance
     * @param {Object} gridElem - The DOM element used to create the drill down grid within
     * @param {number} parentId - The internal id of the parent grid
     */
    function drillDownCreate(gridData, gridElem, parentId) {
        gridData.parentGridId = parentId;
        grid.createGrid(gridData, gridElem);
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
                        /*
                         if (!funcs || (typeof funcs !== 'function' && funcs.constructor !== Array)) return false;
                         if (typeof funcs === 'function') funcs = [funcs];
                         if (~events.indexOf(evt)) {
                         */
                        if (!funcs || (typeof funcs !== 'function' && !Array.isArray(funcs))) return false;
                        if (typeof funcs === 'function') funcs = [funcs];
                        if (events.includes(evt)) {
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
                        //if (~events.indexOf(evt) && (funcs || (typeof funcs === 'function' || funcs.constructor === Array))) {
                        if (events.includes(evt) && (funcs || (typeof funcs === 'function' || Array.isArray(funcs)))) {
                            if (typeof funcs === 'function') funcs = [funcs];
                            var tmpEvts = [];
                            gridState[gridId].events[evt] = gridState[gridId].events[evt].filter(function _unbindEvents(e) {
                                return funcs.some(function _unBindEventFunctions(fn) {
                                    return e !== fn;
                                });
                            });
                            /*for (var i = 0; i < gridState[gridId].events[evt].length; i++) {
                                for (var j = 0; j < funcs.length; j++) {
                                    if (gridState[gridId].events[evt][i] !== funcs[j])
                                        tmpEvts.push(gridState[gridId].events[evt][i]);
                                }
                            }*/
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
                        events.forEach(function _removeEventHandlers(evt) {
                            gridState[gridId].events[evt] = [];
                        });
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
                        return events.filter(function _findHandledEvents(evt) {
                            return gridState[gridId].events[evt].length;
                        });
                        /*var evts = [];
                        events.forEach(function _returnHandledEvents(evt, idx) {
                            if (gridState[gridId].events[evt].length)
                                evts.push(events[idx]);
                        });
                        return evts;*/
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
                'hideColumn': {
                    /**
                     * Hides a column that is being displayed in the grid
                     * @param {string} col - The name of the column to hide
                     */
                    value: function _hideColumn(col) {
                        var colIdx = gridState[gridId].columnIndices[col];
                        if (colIdx != null) {
                            gridState[gridId].columns[colIdx].isHidden = true;
                            var column = gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]'),
                                columnIdx = column.data('index');
                            column.css('display', 'none');
                            gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', 'none');
                            var colGroups = gridState[gridId].grid.find('colgroup');
                            var group1 = $(colGroups[0]).find('col');
                            var group2 = $(colGroups[1]).find('col');
                            var offset = columnIdx;
                            if (gridState[gridId].drillDown)
                                ++offset;
                            if (gridState[gridId].groupedBy)
                                offset += gridState[gridId].groupedBy.length;
                            group1.eq(offset).remove();
                            group2.eq(offset).remove();
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
                        col = gridState[gridId].columnIndices[col];
                        if (gridState[gridId].columns[col] && gridState[gridId].columns[col].isHidden) {
                            gridState[gridId].columns[col].isHidden = false;
                            gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', '');
                            gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', '');
                            gridState[gridId].grid.find('colgroup').append('<col>');
                            setColWidth(gridState[gridId], gridState[gridId].grid);
                            copyGridWidth(gridState[gridId].grid);
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
                        if (typeof column !== 'object' && typeof column !== 'string' || !data || !data.length)
                            return;
                        var field = typeof column === 'object' ? column.field || 'field' : column,
                            newCol;
                        if (!gridState[gridId].columnIndices[field]) {
                            for (var i = 0; i < gridState[gridId].dataSource.data.length; i++) {
                                gridState[gridId].dataSource.data[i][field] = data[i] ? data[i] : null;
                            }
                            if (typeof column === 'object') newCol = column;
                            else {
                                newCol = {};
                            }
                            newCol.filterable = newCol.filterable || false;
                            newCol.editable = newCol.editable || false;
                            newCol.selectable = newCol.selectable ||false;
                            newCol.title = newCol.title || field;
                            newCol.type = newCol.type || 'string';

                            gridState[gridId].columns.push(newCol);
                            if (gridState[gridId].aggregates) gridState[gridId].aggregates[field] = {
                                type: newCol.type
                            };

                            gridState[gridId].hasAddedColumn = true;
                            gridState[gridId].grid.find('.grid-header-wrapper').empty();
                            createGridHeaders(gridState[gridId], gridElem);
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            //setColWidth(gridState[gridId], gridState[gridId].grid);
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-pager-div').empty();
                            createGridPager(gridState[gridId], gridState[gridId].grid);
                            createAggregates(gridId);
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
                        data = data || {};
                        Object.keys(gridState[gridId].dataSource.data[0]).forEach(function _applyNullProps(prop) {
                            if (data[prop] === undefined) data[prop] = null;
                        });
                        gridState[gridId].originalData.push(cloneGridData(data));   //clone data here for original data
                        gridState[gridId].dataSource.data.push(cloneGridData(data));    //clone here to keep cloned original data from being updated when data source data is updated
                        gridState[gridId].dataSource.rowCount++;
                        if (gridState[gridId].dataSource.dataMap)
                            gridState[gridId].dataSource.dataMap[gridState[gridId].dataSource.rowCount] = gridState[gridId].dataSource.rowCount;
                        gridState[gridId].pageSize++;
                        gridState[gridId].grid.find('.grid-content-div').empty();
                        createGridContent(gridState[gridId], gridState[gridId].grid);
                        gridState[gridId].grid.find('.grid-pager-div').empty();
                        createGridPager(gridState[gridId], gridState[gridId].grid);
                        createAggregates(gridId);
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
                        if (typeof index === 'number' && index > -1 && index <= gridState[gridId].dataSource.data.length)
                            return cloneGridData([].concat(gridState[gridId].dataSource.data[index]));
                        else return cloneGridData(gridState[gridId].dataSource.data);
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
                            gridState[gridId].grid.find('.grid-pager-div').empty();
                            createGridPager(gridState[gridId], gridState[gridId].grid);
                            createAggregates(gridId);
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
                            gridState[gridId].grid.find('.grid-pager-div').empty();
                            createGridPager(gridState[gridId], gridState[gridId].grid);
                            createAggregates(gridId);
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
                        //if (cellData.constructor === Array) {
                        if (Array.isArray(cellData)) {
                            cellData.forEach(function cellIterationCallback(cell) {
                                applyUpdate(cell, setAsDirty);
                            });
                        }
                        else applyUpdate(cellData, setAsDirty);

                        function applyUpdate(cell, setAsDirty) {
                            if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > gridState[gridId].dataSource.data.length)
                                return;
                            var column = gridState[gridId].columns[gridState[gridId].columnIndices[cell.field]];
                            if (column) {
                                var dataType = column.type;
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
                                var text = getFormattedCellText(column, cell.value) || cell.value;
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
                        gridState[gridId].grid.children().each(function _removeChildrenFromDOM(child) {
                            $(child).remove();
                        });
                        var gridElem = gridState[gridId].grid;
                        delete gridState[gridId];
                        return gridElem;
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
                },
                'exportToExcel': {
                    /**
                     * Exposed hook to programatically export the grid's data to excel
                     * @param {string} exportType - The type of export: current page, all data, selected data
                     */
                    value: function _exportToExcel(exportType) {
                        exportDataAsExcelFile(gridId, exportType || 'page');
                    }
                },
                'activeCellData': {
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
                },
                'selected': {
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
                     * @param {Array} itemArray - An array of objects that have a zero-based 'rowIndex' property to indicate which row is to be selected.
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
                },
                'selectedData': {
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
                /*,
                 'createDrillDown': {
                 value: function _createDrillDown() {

                 },
                 writable: false,
                 configurable: false
                 }*/
            });
    }

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
        if (dataSource && typeof dataSource.data === 'object') {
            dataSource.originalData = dataSource.data;
            limitPageData({ pageSize: pageSize, pageNum: 1 }, dataSource.data, function _cb(data) {
                callback(null, data);
            });
        }
        else if (dataSource && typeof dataSource.get == 'function') {
            dataSource.get({ pageSize: pageSize, pageNum: 1 },
                function gridDataCallback(res) {
                    if (res) {
                        dataSource.originalData = res.data;
                        callback(null, res);
                    }
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
        var originalData = cloneGridData(gridData.dataSource.originalData);
        delete gridData.dataSource.originalData;
        var storageData = cloneGridData(gridData);
        storageData.originalData = originalData;
        storageData.events = {
            beforeCellEdit: typeof storageData.beforeCellEdit === 'object' && storageData.beforeCellEdit.constructor === Array ? storageData.beforeCellEdit : [],
            cellEditChange: typeof storageData.cellEditChange === 'object' && storageData.cellEditChange.constructor === Array ? storageData.cellEditChange : [],
            afterCellEdit: typeof storageData.afterCellEdit === 'object' && storageData.afterCellEdit.constructor === Array ? storageData.afterCellEdit : [],
            pageRequested: typeof storageData.pageRequested === 'object' && storageData.pageRequested.constructor === Array ? storageData.pageRequested : [],
            beforeDataBind: typeof storageData.beforeDataBind === 'object' && storageData.beforeDataBind.constructor === Array ? storageData.beforeDataBind : [],
            afterDataBind: typeof storageData.afterDataBind === 'object' && storageData.afterDataBind.constructor === Array ? storageData.afterDataBind : [],
            columnReorder: typeof storageData.columnReorder === 'object' && storageData.columnReorder.constructor === Array ? storageData.columnReorder : []
        };

        Object.keys(storageData.events).forEach(function setEvtHandlers(evt) {
            storageData.events[evt] = storageData.events[evt].filter(function mapEventsCallback(fn) {
                return typeof fn === jsTypes.function;
            });
        });

        delete storageData.beforeCellEdit;
        delete storageData.cellEditChange;
        delete storageData.afterCellEdit;
        delete storageData.pageRequested;
        delete storageData.beforeDataBind;
        delete storageData.afterDataBind;
        delete storageData.columnReorder;

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
        if (typeof storageData.advancedFiltering === jsTypes.object) {
            storageData.advancedFiltering.groupsCount = isInteger(storageData.advancedFiltering.groupsCount) ? storageData.advancedFiltering.groupsCount : 5;
            storageData.advancedFiltering.filtersCount = isInteger(storageData.advancedFiltering.filtersCount) ? storageData.advancedFiltering.filtersCount : 10;
        }
        storageData.parentGridId = gridData.parentGridId != null ? gridData.parentGridId : null;
        if (storageData.dataSource.rowCount == null) storageData.dataSource.rowCount = gridData.dataSource.data.length;

        var eventObj = { element: storageData.grid };
        callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

        gridState[id] = storageData;
        createGridPager(storageData, gridElem);
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
        headerTable.css('width','auto');
        var colgroup = $('<colgroup></colgroup>').appendTo(headerTable),
            headerTHead = $('<thead></thead>').appendTo(headerTable),
            headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead),
            id = gridHeader.data('grid_header_id');

        if (gridData.groupedBy) {
            gridData.groupedBy.forEach(function _createGroupingCols() {
                colgroup.prepend('<col class="group_col"/>');
                headerRow.prepend('<th class="group_spacer">&nbsp</th>');
            });
        }

        if (gridData.drillDown) {
            colgroup.prepend('<col class="drill_down_col"/>');
            headerRow.prepend('<th class="drill_down_spacer">&nbsp</th>');
        }

        gridData.columns.forEach(function _createColumnHeaders(col, idx) {
            if (typeof col !== 'object') return;
            $('<col/>').appendTo(colgroup);
            var th = $('<th id="' + col.field + '_grid_id_' + id + '" data-field="' + col.field + '" data-index="' + idx + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof col.attributes === 'object' && col.attributes.headerClasses && col.attributes.headerClasses.constructor ===  Array) {
                col.attributes.headerClasses.forEach(function _applyHeaderClasses(className) {
                    th.addClass(className);
                });
            }

            if (col.type !== 'custom') {
                //th.text(text);
                if (gridData.sortable === true && (typeof col.sortable === jsTypes.undefined || col.sortable === true)) {
                    setSortableClickListener(th);
                    gridData.sortable = true;
                }

                if (col.filterable === true) {
                    setFilterableClickListener(th, gridData, col.field);
                    gridData.filterable = true;
                    gridData.advancedFiltering = gridData.advancedFiltering != null ? gridData.advancedFiltering : false;
                }

                if ((col.editable || gridData.selectable || gridData.groupable || gridData.columnToggle || gridData.excelExport || gridData.advancedFiltering))
                    createGridToolbar(gridData, gridElem, col.editable);

                $('<a class="header-anchor" href="#"></a>').appendTo(th).text(col.title || col.field);
            }
            else
                $('<span class="header-anchor"></span>').appendTo(th).text(col.title || col.field);

            if (gridData.resizable) {
                th.on('mouseleave', mouseLeaveHandlerCallback);
            }
            if (gridData.reorderable === true && (typeof col.reorderable === jsTypes.undefined || col.reorderable === true)) {
                th.prop('draggable', true);
                setDragAndDropListeners(th);
            }
        });
        headerTable.css('width','');
        setColWidth(gridData, gridElem);

        var gridContent = gridElem.find('.grid-content-div').css('height', gridData.height || 400),
            gcOffsets = gridContent.offset(),
            top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop(),
            left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
            $('<span id="loader-span_' + id + '" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
    }

    /**
     * Builds the header's aggregations row if specified to be displayed at the
     * top of the grid
     * @method createAggregates
     * @for grid
     * @private
     * @param {number} gridId
     */
    function createAggregates(gridId) {
        var gridData = gridState[gridId];
        if (typeof gridState[gridId].dataSource.get !== jsTypes.function) {
            var dataToFilter = gridData.alteredData && gridData.alteredData.length ? gridData.alteredData : gridData.originalData;
            dataToFilter.filter(function getRemainingRows(val, idx) {
                return idx > gridData.pageNum * gridData.pageSize - 1 || idx < gridData.pageNum * gridData.pageSize - gridData.pageSize;
            }).forEach(function _iterateRemainingRows(row) {
                gridData.columns.forEach(function _addColumnValsToAggregates(col) {
                    addValueToAggregations(gridId, col.field, row[col.field], gridData.gridAggregations);
                });
            });
        }
        else constructAggregationsFromServer(gridId, gridData.gridAggregations);

        var gridPager = gridState[gridId].grid.find('.grid-pager-div'),
            gridFooterDiv = $('<div id="grid-footer-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-div"></div>').insertBefore(gridPager),
            gridFooterWrap = $('<div id="grid-footer-wrapper-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-wrapper"></div>').appendTo(gridFooterDiv),
            footer = $('<table class="grid-footer"></table>').appendTo(gridFooterWrap);

        var colgroup = $('<colgroup></colgroup>').appendTo(footer),
            footerTBody = $('<tbody></tbody>').appendTo(footer),
            footerRow = footerTBody.find('.aggregate-row');
        if (footerRow.length) footerRow.remove();
        footerRow = $('<tr class="aggregate-row"></tr>').appendTo(footerTBody);

        gridState[gridId].groupedBy.forEach(function _appendSpacerCells() {
            footerRow.append('<td class="group_spacer">&nbsp</td>');
        });
        if (gridState[gridId].drillDown) footerRow.append('<td class="group_spacer">&nbsp</td>');

        var aggregates = gridState[gridId].gridAggregations;
        gridState[gridId].columns.forEach(function _createAggregates(col) {
            var text = '';
            if (col.field in aggregates) {
                aggregates[col.field].forEach(function _createAggregateText(aggregate, idx) {
                    text += aggregate.text;
                    if (idx < aggregates[col.field].length - 1) text += ', ';
                });
            }
            footerRow.append('<td data-field="' + col.field + '" class=aggregate-cell">' + text + '</td>');
            colgroup.append('<col>');
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var gridContent = gridState[gridId].grid.find('.grid-content-div'),
            sizeDiff = gridFooterWrap[0].clientWidth - gridContent[0].clientWidth;
        gridFooterWrap.css('paddingRight', sizeDiff);
    }

    /**
     * Takes the server's aggregate calculations and formats them for grid consumption
     * @param {number} gridId - The id of the grid widget instance
     * @param {Object} aggregationObj - The object that hold the aggregates
     */
    function constructAggregationsFromServer(gridId, aggregationObj) {
        gridState[gridId].columns.forEach(function _constructAggregationsFromServer(col) {
            var aggregateObj = {},
                aggregateArr = [];
            if (!aggregationObj[col.field]) aggregationObj[col.field] = [];

            gridState[gridId].dataSource.aggregates.filter(function _findAggregateColumn(val) {
                return val.field === col.field;
            }).forEach(function _getAggregateText(item) {
                if (item.aggregate && item.value) {
                    var text = getFormattedCellText(col, item.value) || item.value;
                    aggregateObj.text = aggregates[item.aggregate] + text ;
                }
                else aggregateObj.text = '';
                aggregateArr.push(aggregateObj);
            });
            aggregationObj[col.field] = aggregateArr;
        });
    }

    /**
     * Used for calculating both client-side full-grid aggregates, as well as grouped aggregates
     * @param {number} gridId - The id of the grid widget instance
     * @param {string} field - The name of the field being aggregated
     * @param {*} value - The value of the current row's field (i.e. a single cell in the grid)
     * @param {Object} aggregationObj - The object used to cache the aggregates
     */
    function addValueToAggregations(gridId, field, value, aggregationObj) {
        if (value == null) return;
        var text, total,
            column = gridState[gridId].columns[gridState[gridId].columnIndices[field]];
        if (!aggregationObj[field]) aggregationObj[field] = [];
        var aggregateArr = [];
        gridState[gridId].dataSource.aggregates.filter(function _findMatchingAggregateColumn(item) {
            return item.field === field;
        }).forEach(function _calculateAggregate(col) {
            var aggregateObj = {};
            switch (col.aggregate.toLowerCase()) {
                case 'count':
                    if (!aggregateObj.value) {
                        aggregateObj.value = gridState[gridId].dataSource.rowCount || gridState[gridId].dataSource.data.length;
                        aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + aggregateObj.value;
                        aggregateObj.aggregate = aggregates.count;
                        aggregateArr.push(aggregateObj);
                    }
                    else {
                        aggregateArr.concat(aggregationObj[field].filter(function _findMatchingAggregateObj(item) {
                            return item.aggregate === col.aggregate.toLowerCase();
                        }));
                    }
                    return;
                case 'average':
                    var count = aggregateObj.count ? aggregateObj.count + 1 : 1;
                    value = parseFloat(value.toString());
                    total = aggregateObj.total ? aggregateObj.total + value : value;
                    var avg = total/count;
                    text = getFormattedCellText(column, avg.toFixed(2)) || avg.toFixed(2);
                    aggregateObj.total = total;
                    aggregateObj.count = count;
                    aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                    aggregateObj.value = avg;
                    aggregateObj.aggregate = aggregates.average;
                    aggregateArr.push(aggregateObj);
                    return;
                case 'max':
                    if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) < parseFloat(value.toString())) {
                        text = getFormattedCellText(column, value) || value;
                        aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                        aggregateObj.value = value;
                        aggregateObj.aggregate = aggregates.max;
                        aggregateArr.push(aggregateObj);
                    }
                    else {
                        aggregateArr.concat(aggregationObj[field].filter(function _findMatchingAggregateObj(item) {
                            return item.aggregate === col.aggregate.toLowerCase();
                        }));
                    }
                    return;
                case 'min':
                    if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) > parseFloat(value.toString())) {
                        text = getFormattedCellText(column, value) || value;
                        aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                        aggregateObj.value = text;
                        aggregateObj.aggregate = aggregates.min;
                        aggregateArr.push(aggregateObj);
                    }
                    else {
                        aggregateArr.concat(aggregationObj[field].filter(function _findMatchingAggregateObj(item) {
                            return item.aggregate === col.aggregate.toLowerCase();
                        }));
                    }
                    return;
                case 'total':
                    total = (parseFloat(aggregationObj[field].total) || 0) + parseFloat(value);
                    text = getFormattedCellText(column, total) || total;
                    aggregateObj.total = total;
                    aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                    aggregateObj.value = text;
                    aggregateArr.push(aggregateObj);
                    return;
                default:
                    aggregateObj.text = null;
                    aggregateArr.push(aggregateObj);
            }
        });
        aggregationObj[field] = aggregateArr;
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
        var gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
            colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
            contentTBody = $('<tbody></tbody>').appendTo(contentTable),
            text;
        contentTBody.css('width', 'auto');
        if (typeof gridData.parentGridId !== jsTypes.number && gridData.selectable) attachTableSelectHandler(contentTBody);

        var rows = gridData.rows,
            currentGroupingValues = {};

        if (gridData.groupAggregates) gridData.groupAggregations = {};

        if (gridData.dataSource.data.length) {
            gridData.dataSource.data.forEach(function _createGridContentRows(item, idx) {
                if (gridData.groupedBy && gridData.groupedBy.length) createGroupedRows(id, idx, currentGroupingValues, contentTBody);

                var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
                if (typeof gridData.parentGridId === jsTypes.number) tr.addClass('drill-down-row');
                if (idx % 2) {
                    tr.addClass('alt-row');
                    if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
                        rows.alternateRows.forEach(function _addAlternateRowClasses(className) {
                            tr.addClass(className);
                        });
                }

                if (rows && rows.all && rows.all.constructor === Array) {
                    rows.all.forEach(function _addRowClasses(className) {
                        tr.addClass(className);
                    });
                }

                if (gridData.groupedBy.length) {
                    gridData.groupedBy.forEach(function _appendGroupingCells() {
                        tr.append('<td class="grouped_cell">&nbsp</td>');
                    });
                }

                if (gridData.drillDown)
                    tr.append('<td class="drillDown_cell"><span class="drillDown_span" data-state="closed"><a class="drillDown-asc drillDown_acc"></a></span></td>');

                gridData.columns.forEach(function _createGridCells(col) {
                    var td = $('<td data-field="' + col.field + '" class="grid-content-cell"></td>').appendTo(tr);
                    if (col.attributes && col.attributes.cellClasses && col.attributes.cellClasses.constructor === Array) {
                        col.attributes.cellClasses.forEach(function _addColumnClasses(className) {
                            td.addClass(className);
                        });
                    }
                    if (col.type !== 'custom') {
                        text = getFormattedCellText(col, item[col.field]) || item[col.field];
                        text = text == null ? 'Null' : text;
                        td.text(text);
                    }
                    else {
                        td = col.html ? $(col.html).appendTo(td) : td;
                        if (col.class)
                            td.addClass(col.class);
                        if (col.text) {
                            var customText;
                            if (typeof col.text === jsTypes.function) {
                                col.text(gridData.originalData[gridData.dataMap[idx]]);
                            }
                            else customText = col.text;
                            td.text(customText);
                        }
                    }

                    if (typeof col.events === jsTypes.object) {
                        attachCustomCellHandler(col, td, id);
                    }
                    if (gridData.dataSource.aggregates && typeof gridData.dataSource.get !== jsTypes.function) {
                        if (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === undefined)
                            addValueToAggregations(id, col.field, item[col.field], gridData.gridAggregations);
                    }
                    //attach event handlers to save data
                    if (typeof gridData.parentGridId !== jsTypes.number && (col.editable && col.editable !== 'drop-down')) {
                        makeCellEditable(id, td);
                        gridState[id].editable = true;
                    }
                    else if (typeof gridData.parentGridId !== jsTypes.number && (col.editable === 'drop-down')) {
                        makeCellSelectable(id, td);
                        gridState[id].editable = true;
                    }
                });
            });

            gridData.columns.forEach(function appendCols() { colGroup.append('<col/>'); });
            gridData.groupedBy.forEach(function _prependCols() { colGroup.prepend('<col class="group_col"/>'); });
            if (gridData.drillDown) colGroup.prepend('<col class="drill_down_col"/>');

            if (gridData.dataSource.aggregates && (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === undefined)) {
                gridData.grid.find('.grid-footer-div').remove();
                createAggregates(id);
            }

            createGroupTrEventHandlers(id);
            attachDrillDownAccordionHandler(id);
        }

        gridContent[0].addEventListener('scroll', function contentDivScrollHandler() {
            var headWrap = gridContent.parents('.grid-wrapper').first().find('.grid-header-wrapper'),
                footerWrap = gridContent.parents('.grid-wrapper').first().find('.grid-footer-wrapper');
            if (gridState[id].resizing) return;
            headWrap.scrollLeft(gridContent.scrollLeft());
            if (footerWrap.length)
                footerWrap.scrollLeft(gridContent.scrollLeft());
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var headDiv = $('#' + 'grid-header-' + gridContent.data('grid_content_id')),
            sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
        headDiv.css('paddingRight', sizeDiff);

        //Once the column widths have been set (i.e. the first time creating the grid), they shouldn't change size again....
        //any time the grid is paged, sorted, filtered, etc., the cell widths shouldn't change, the new data should just be dumped into
        //the grid.
        copyGridWidth(gridElem);

        gridState[id].dataSource.data = gridData.dataSource.data;
        gridContent.find('#loader-span_' + id).remove();
        gridState[id].updating = false;
    }

    /**
     * Function used to attach any custom event handlers to each cell of a given column.
     * @param {Object} column - The name of the column in the grid config object
     * @param {Object} cellItem - The td DOM element to apply the handler(s)
     * @param {number} gridId - The id of the grid
     */
    function attachCustomCellHandler(column, cellItem, gridId) {
        Object.keys(column.events).forEach(function _attachColumnEventHandlers(evt) {
            if (typeof column.events[evt] === jsTypes.function) createEventHandler(cellItem, evt, column.events[evt]);
        });

        function createEventHandler(cellItem, eventName, eventHandler) {
            cellItem.on(eventName, function genericEventHandler() {
                var row = $(this).parents('tr'),
                    rowIdx = row.index();
                eventHandler.call(this, gridState[gridId].dataSource.data[rowIdx]);
            });
        }
    }

    /**
     * Creates group header rows, pads with extra columns based on number of grouped columns, and calculates/display group aggregatges
     * if option is set
     * @param {number} gridId - The id of the grid widget instance
     * @param {number} rowIndex - The index of the current row in the grid data collection
     * @param {Object} currentGroupingValues - The values currently determining the rows that are grouped
     * @param {Object} gridContent - The DOM table element for the grid's content
     */
    function createGroupedRows(gridId, rowIndex, currentGroupingValues, gridContent) {
        var k,
            foundDiff = false,
            groupedDiff = [],
            gridData = gridState[gridId];
        gridData.groupedBy.forEach(function _createGroupedRows(item, idx) {
            //If the current cached value for the same field is different than the current grid's data for the same field,
            //then cache the same value and note the diff.
            if (!currentGroupingValues[item.field] || currentGroupingValues[item.field] !== gridData.dataSource.data[rowIndex][item.field]) {
                currentGroupingValues[item.field] = gridData.dataSource.data[rowIndex][item.field];
                groupedDiff[idx] = 1;
                foundDiff = true;
            }
            else {
                //Otherwise, check the previous diff; if there isn't a diff, then set the current diff to none (i.e. 0),
                //but if the previous diff was found, set the current diff.
                if (!idx || !groupedDiff[idx - 1]) groupedDiff[idx] = 0;
                else groupedDiff[idx] = 1;
            }
        });
        if (foundDiff && rowIndex && gridData.groupAggregates) {   //If a diff was found...
            groupedDiff.reverse().forEach(function _findRowDiffs(item, idx) {
                var numItems = gridData.groupAggregations[idx]._items_; //...save the current row's number of items...
                if (item) {                               //...if there is a diff at the current row, print it to the screen
                    var groupAggregateRow = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                    groupedDiff.forEach(function _appendGroupingCells() {
                        groupAggregateRow.append('<td colspan="' + 1 + '" class="grouped_cell"></td>');
                    });
                    if (gridData.drillDown)
                        groupAggregateRow.append('<td colspan="1" class="grouped_cell"></td>');
                    gridData.columns.forEach(function _createAggregateCells(col) {
                        if (col.field in gridData.groupAggregations[idx] && col.field !== '_items_'){
                            groupAggregateRow.append('<td class="group_aggregate_cell">' + (gridData.groupAggregations[idx][col.field].text || '') + '</td>');
                        }
                        else
                            groupAggregateRow.append('<td class="group_aggregate_cell"> </td>');
                    });
                    gridData.groupAggregations[idx] = {       //Then reset the current row's aggregate object...
                        _items_: 0
                    };
                    for (k = idx - 1; k >= 0; k--) {  //...and go backward through the diffs starting from the prior index, and compare the number of items in each diff...
                        if (groupedDiff[k] && gridData.groupAggregations[k]._items_ == numItems) {    //...if the number of items are equal, reset that diff as well
                            groupedDiff[k] = 0;
                            gridData.groupAggregations[k] = {
                                _items_: 0
                            };
                        }
                    }
                }
            });
        }
        groupedDiff.forEach(function _createGroupedAggregates(item, idx) {
            if (gridData.groupAggregates) {
                if (gridData.groupAggregations && !gridData.groupAggregations[idx]) {
                    gridData.groupAggregations[idx] = { _items_: 0 };
                }
                gridData.columns.forEach(function _aggregateValues(col) {
                    if (gridData.aggregates)
                        addValueToAggregations(gridId, col.field, gridData.dataSource.data[rowIndex][col.field], gridData.groupAggregations[idx]);
                });
                gridData.groupAggregations[idx]._items_++;
            }
            if (groupedDiff[idx]) {
                var groupedText = getFormattedCellText(gridData.columns[gridData.columnIndices[gridData.groupedBy[idx].field]], gridData.dataSource.data[rowIndex][gridData.groupedBy[idx].field]) ||
                    gridData.dataSource.data[rowIndex][gridData.groupedBy[idx].field];
                var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                var groupTitle = gridData.columns[gridData.columnIndices[gridData.groupedBy[idx].field]].title || gridData.groupedBy[idx].field;
                for (k = 0; k <= idx; k++) {
                    var indent = k === idx ? (gridData.columns.length + gridData.groupedBy.length - k) : 1;
                    if (gridData.drillDown) ++indent;
                    groupTr.data('group-indent', indent);
                    var groupingCell = $('<td colspan="' + indent + '" class="grouped_cell"></td>').appendTo(groupTr);
                    if (k === idx) {
                        groupingCell.append('<p class="grouped"><a class="group-desc sortSpan group_acc_link" data-state="open"></a>' + groupTitle + ': ' + groupedText + '</p>');
                        break;
                    }
                }
            }
        });
    }

    /**
     * Applies a click handler to each cell of a drill down column to expand/collapse the parent row.
     * When clicked the first time, the new drill down grid will be created. Following time will
     * simple show/hide the elements.
     * @param {number} gridId - The id of the parent grid.
     */
    function attachDrillDownAccordionHandler(gridId) {
        var gridData = gridState[gridId];
        gridData.grid.find('.drillDown_span').on('click', function drillDownAccordionHandler() {
            var accRow = $(this).parents('tr'),
                accRowIdx = gridData.grid.find('.data-row').not('.drill-down-row').index(accRow);
            if (accRow.find('.drillDown_span').data('state') === 'open') {
                accRow.find('.drillDown_span').data('state', 'closed');
                accRow.next().css('display', 'none');
            }
            else {
                if (accRow.next().hasClass('drill-down-parent')) {
                    accRow.find('.drillDown_span').data('state', 'open');
                    accRow.next().css('display', 'inline-block');
                }
                else {
                    var drillDownRow = $('<tr class="drill-down-parent"></tr>').insertAfter(accRow);
                    if (gridData.groupedBy && gridData.groupedBy.length) {
                        for (var i = 0; i < gridData.groupedBy.length; i++) {
                            drillDownRow.append('<td class="grouped_cell"></td>');
                        }
                    }
                    drillDownRow.append('<td class="grouped_cell"></td>');
                    var drillDownCellLength = 0;
                    gridData.grid.find('.grid-header-div').find('col').each(function getTotalGridLength() {
                        if (!$(this).hasClass('drill_down_col') && !$(this).hasClass('groupCol'))
                            drillDownCellLength += $(this).width();
                    });
                    var containerCell = $('<td class="drill-down-cell" colspan="' + gridData.columns.length + '" style="width: ' + drillDownCellLength + ';"></td>').appendTo(drillDownRow),
                        newGridId = gridData.grid[0].id + generateId(),
                        gridDiv = $('<div id="' + newGridId + '" class="drill_down_grid"></div>').appendTo(containerCell);
                    accRow.find('.drillDown_span').data('state', 'open');
                    var parentRowData = gridData.grid[0].grid.getCurrentDataSourceData(accRowIdx);

                    if (typeof gridData.drillDown === jsTypes.function) {
                        drillDownCreate(gridData.drillDown(accRowIdx, parentRowData[0]), gridDiv[0], gridId);
                    }
                    else if (typeof gridData.drillDown === jsTypes.object) {
                        if (!gridData.drillDown.dataSource) gridData.drillDown.dataSource = {};
                        gridData.drillDown.dataSource.data = parentRowData[0].drillDownData;
                        gridData.drillDown.dataSource.rowCount = parentRowData[0].drillDownData ? parentRowData[0].drillDownData.length : 0;
                        drillDownCreate(gridData.drillDown, gridDiv[0], gridId);
                    }
                }
            }
        });
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
                    gridState[gridId].grid.find('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                        $(elem).removeClass('selected');
                    });
                    var target = $(e.target);
                    if (target.hasClass('drill-down-parent') || target.parents('.drill-down-parent').length) return;
                    if (target.hasClass('drillDown_cell') || target.parents('.drillDown_cell').length) return;
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
                var target = $(event.target);
                if (event.target === tableBody[0] || target.parents('tbody')[0] === tableBody[0]) {
                    if (target.hasClass('drill-down-parent') || target.parents('.drill-down-parent').length) return;
                    if (target.hasClass('drillDown_cell') || target.parents('.drillDown_cell').length) return;
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
                        gridState[gridId].grid.find('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
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
        gridElems = gridElems.filter(function filterDrillDownRows() {
            var gridElem = $(this);
            return !gridElem.hasClass('drill-down-parent') && !gridElem.parents('.drill-down-parent').length;
        });

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
    function createGroupTrEventHandlers(gridId) {
        gridState[gridId].grid.find('.group_acc_link').on('click', function groupedAccordionsClickListenerCallback() {
            var elem = $(this),
                accRow = elem.parents('tr'),
                indent = accRow.data('group-indent');
            if (elem.data('state') === 'open') {
                elem.data('state', 'closed').removeClass('group-desc').addClass('group-asc');
                accRow.nextAll().each(function iterateAccordionRowSiblingsToCloseCallback(idx, val) {
                    var row = $(val),
                        rowIndent = row.data('group-indent');
                    if (!rowIndent || rowIndent < indent)
                        row.css('display', 'none');
                    else return false;
                });
            }
            else {
                elem.data('state', 'open').removeClass('group-asc').addClass('group-desc');
                accRow.nextAll().each(function iterateAccordionRowSiblingsToOpenCallback(idx, val) {
                    var row = $(val),
                        rowIndent = row.data('group-indent');
                    if (!rowIndent || rowIndent < indent)
                        row.css('display', 'table-row');
                    else return false;
                });
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
            if (gridState[id].updating) return;
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');

            var row = cell.parents('tr').first(),
                index = gridData.grid.find('tr').filter(function removeGroupAndChildRows() {
                    var r =  $(this);
                    return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
                }).index(row),
                field = cell.data('field'),
                column = gridState[id].columns[gridState[id].columnIndices[field]],
                type = column.type || '',
                val = column.nullable || gridState[id].dataSource.data[index][field] ? gridState[id].dataSource.data[index][field] : '',
                dataAttributes = '',
                gridValidation = gridState[id].useValidator ? column.validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (gridState[id].useFormatter && column.inputFormat)
                dataAttributes += ' data-inputformat="' + column.inputFormat + '"';

            switch (type) {
                case 'boolean':
                    input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    val = typeof gridState[id].dataSource.data[index][field] === jsTypes.string ? gridState[id].dataSource.data[index][field] === 'true' : !!val;
                    input[0].checked = val;
                    dataType = 'boolean';
                    break;
                case 'number':
                    if (typeof gridState[id].dataSource.data[index][field] === jsTypes.string)
                        val = isNumber(parseFloat(gridState[id].dataSource.data[index][field])) ? parseFloat(gridState[id].dataSource.data[index][field]) : 0;
                    else
                        val = isNumber(gridState[id].dataSource.data[index][field]) ? gridState[id].dataSource.data[index][field] : 0;
                    inputVal = val;
                    input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'number';
                    break;
                case 'time':
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'time';
                    break;
                case 'date':
                    var dateVal = val == null ? new Date(Date.now()) : new Date(Date.parse(val));
                    inputVal = dateVal.toISOString().split('T')[0];
                    input = $('<input type="date" value="' + inputVal + '" class="input textbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'date';
                    break;
                default:
                    input = $('<input type="text" value="' + (val || '') + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
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
            var gridContent = gridState[id].grid.find('.grid-content-div'),
                gridData = gridState[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');
            var row = cell.parents('tr').first(),
                index = gridData.grid.find('tr').filter(function removeGroupAndChildRows() {
                    var r =  $(this);
                    return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
                }).index(row),
                field = cell.data('field');
            if (gridState[id].updating) return;     //can't edit a cell if the grid is updating

            var column = gridState[id].columns[gridState[id].columnIndices[field]],
                value = gridState[id].dataSource.data[index][field],
                gridValidation = gridState[id].useValidator ? column.validation : null,
                dataAttributes = '';

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }
            var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell),
                options = column.options.map(function _copyColumnOptions(val) { return val; });
                value = column.nullable || value != null ? value : '';
                var dataType = column.type || 'string',
                normalizedValue = dataTypeValueNormalizer(dataType, value);
            if (!options.some(function _compareCellValueForUniqueness(opt) {
                if (comparator(normalizedValue, dataTypeValueNormalizer(dataType, opt), booleanOps.strictEqual))
                    return true;
            })) {
                options.reverse().push(value).reverse();
            }

            options.forEach(function _setSelectableColumnOptions(option) {
                select.append('<option value="' + option + '">' + option + '</option>');
            });
            if ('' !== value && (column.nullable || null !== value)) select.val(value);
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
            Object.keys(columnValidation.customRules).forEach(function _applyCustomValidation(rule) {
                dataAttributes += 'grid.validation.' + rule + ',';
                if (!grid.validation[rule]) {
                    Object.defineProperty(
                        grid.validation,
                        rule,
                        { value: columnValidation.customRules[rule], writable: false, configurable: false }
                    );
                }
            });
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
        var tableDiv = gridElem.find('.grid-header-wrapper'),
            totalColWidth;

        totalColWidth = gridData.columns.reduce(function _calcTotalWidth(prev, col) {
            if (!col.isHidden && isNumber(col.width)) return prev + col.width;
            return prev;
        }, 0);

        var headerCols = tableDiv.find('col');

        headerCols.each(function iterateColsCallback(idx, val) {
            var i = idx,
                numColPadders = 0,
                isGroupAndOrDrill = (gridData.groupedBy && gridData.groupedBy.length) || gridData.drillDown;
            if (isGroupAndOrDrill) {
                numColPadders = gridData.drillDown ? 1 : 0;
                numColPadders += gridData.groupedBy && gridData.groupedBy.length ? gridData.groupedBy.length : 0;
                i = idx - numColPadders;
            }
            if (isGroupAndOrDrill && idx < numColPadders) {
                $(val).css('width', 27);
            }
            else if (gridData.columns[i].width != null && (idx !== headerCols.length - 1 ||
                totalColWidth >= (tableDiv.find('table').width() + (numColPadders * 27) - 17) - gridData.columns[i].width)) {
                $(val).css('width', gridData.columns[i].width);
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
        var headerCols = gridElem.find('.grid-header-div').find('col'),
            contentCols = gridElem.find('.grid-content-div').find('col'),
            footerCols = gridElem.find('.grid-footer-div').find('col'),
            headerTable = gridElem.find('.grid-header-div').find('table'),
            contentTable = gridElem.find('.grid-content-div').find('table'),
            footerTable = gridElem.find('.grid-footer-div').find('table');

        contentTable.css('width', headerTable[0].clientWidth);
        footerTable.css('width', headerTable[0].clientWidth);

        contentCols.each(function colIterationCallback(idx, val) {
            if ($(val).hasClass('group_col')) return;
            var width;
            if (width = $(headerCols[idx]).width()) $(val).css('width', width);
        });

        footerCols.each(function colIterationCallback(idx, val) {
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
            row = cell.parents('tr').first(),
            index = gridState[id].grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = cell.data('field'),
            column = gridState[id].columns[gridState[id].columnIndices[field]],
            type = column.type || '',
            saveVal, re, setDirtyFlag = false,
            formattedVal = getFormattedCellText(column, val),
            displayVal = formattedVal == null ? 'Null' : formattedVal;

        input.remove();
        if (formattedVal !== null) {
            switch (type) {
                case 'number':
                    re = new RegExp(dataTypes.number);
                    if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                    if (typeof gridState[id].dataSource.data[index][field] === jsTypes.string) saveVal = val;
                    else {
                        var tmpVal = parseFloat(val.replace(',', ''));
                        tmpVal === tmpVal ? saveVal = tmpVal : saveVal = 0;
                    }
                    //saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                    break;
                case 'date':
                case 'time':
                case 'datetime':
                    re = new RegExp(dataTypes[type]);
                    if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                    saveVal = displayVal;
                    break;
                case 'boolean':
                    displayVal = val.toString();
                    saveVal = val;
                    break;
                default:
                    saveVal = formattedVal == null ? null : val;
                    break;
            }
        }
        else
            saveVal = val;

        cell.text(displayVal || '');
        gridState[id].currentEdit[field] = null;
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {
            gridState[id].dataSource.data[index][field] = saveVal;
            var idxOffset = 0;
            if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
                idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
            if (saveVal !== gridState[id].originalData[gridState[id].dataMap[index + idxOffset]][field]) {
                setDirtyFlag = true;
                if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
                else if (previousVal != null) cell.prepend('<span class="dirty-blank"></span>');
            }
        }
        if (!setDirtyFlag && cell.data('dirty')) {
            if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
            else cell.prepend('<span class="dirty-blank"></span>');
        }
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
            row = parentCell.parents('tr').first(),
            index = gridState[id].grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = parentCell.data('field'),
            column = gridState[id].columns[gridState[id].columnIndices[field]],
            type = column.type || '',
            formattedVal = getFormattedCellText(column, val),
            displayVal = formattedVal == null ? 'Null' : formattedVal,
            re, saveVal, setDirtyFlag = false;

        if (null !== formattedVal) {
            switch (type) {
                case 'number':
                    re = new RegExp(dataTypes.number);
                    if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                    saveVal = typeof gridState[id].dataSource.data[index][field] === jsTypes.string ? val : parseFloat(val.replace(',', ''));
                    break;
                case 'date':
                case 'time':
                case 'datetime':
                    re = new RegExp(dataTypes[type]);
                    if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                    saveVal = displayVal;
                    break;
                case 'boolean':
                    displayVal = val.toString();
                    saveVal = val;
                    break;
                default:        //string
                    saveVal = formattedVal == null ? null : val;
                    break;
            }
        }
        else
            saveVal = val;

        parentCell.text(displayVal);
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {  //if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
            gridState[id].dataSource.data[index][field] = saveVal;
            var idxOffset = 0;
            if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
                idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
            if (saveVal !== gridState[id].originalData[gridState[id].dataMap[index + idxOffset]][field]) {
                parentCell.prepend('<span class="dirty"></span>');
                setDirtyFlag = true;
            }
            gridState[id].dataSource.data[index][field] = saveVal;
        }
        if (!setDirtyFlag && parentCell.data('dirty')) {
            if ('' !== saveVal) parentCell.prepend('<span class="dirty"></span>');
            else parentCell.prepend('<span class="dirty-blank"></span>');
        }
        callGridEventHandlers(gridState[id].events.afterCellEdit, gridState[id].grid, null);
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
        if ($('#grid_' + id + '_toolbar').length) return;   //if the toolbar has already been created, don't create it again.

        if (typeof gridData.parentGridId !== jsTypes.number && gridData.groupable) {
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
                if (gridState[id].updating) return;     //can't group columns if grid is updating
                if (!groupMenuBar.children().length) groupMenuBar.text('');
                var field = droppedCol.data('field'),
                    title = gridState[groupId].columns[gridState[groupId].columnIndices[field]].title || field,
                    foundDupe = false;

                groupMenuBar.find('.group_item').each(function iterateGroupItemsCallback(idx, val) {
                    var item = $(val);
                    groupedItems[item.data('field')] = item;
                    if (item.data('field') === field) {
                        foundDupe = true;
                        return false;
                    }
                });
                if (foundDupe) return;  //can't group on the same column twice

                droppedCol.data('grouped', true);
                var groupItem = $('<div class="group_item" data-grid_id="' + groupId + '" data-field="' + field + '"></div>'),//.appendTo(groupMenuBar),
                    groupDirSpan = $('<span class="group_sort"></span>').appendTo(groupItem);
                groupDirSpan.append('<span class="sort-asc-white groupSortSpan"></span>').append('<span>' + title + '</span>');
                var cancelButton = $('<span class="remove"></span>').appendTo(groupItem),
                    groupings = [];

                if (dropIndicator.data('field')) groupItem.insertBefore(groupedItems[dropIndicator.data('field')]);
                else groupItem.appendTo(groupMenuBar);

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
                        if (gridState[id].sortedOn[l].field !== field) sortArr.push(gridState[id].sortedOn[l]);
                        else {
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
                gridState[id].grid.find('.aggregate-row').prepend('<td class="group_spacer">&nbsp</td>');

                gridState[id].groupedBy = groupings;
                gridState[id].pageRequest.eventType = 'group';
                attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton);
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
                        dropIndicator.data('field', '');
                    }
                }
                else {
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

        var shouldBuildGridMenu = gridData.excelExport || gridData.columnToggle || gridData.advancedFiltering || gridData.selectable;

        if (canEdit || shouldBuildGridMenu) {
            var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);
            if (shouldBuildGridMenu) {
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

                attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor);
            }
        }
    }

    /**
     * Attaches handlers for changing the sort direction and canceling a grouping for each grouped item
     * @param {Object} groupMenuBar - The DOM element that contains the grouped items
     * @param {Object} groupDirSpan - The DOM element used for sorting and displaying the sort direction
     * @param {Object} cancelButton - The DOM element use to remove a grouping
     */
    function attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton) {
        groupDirSpan.on('click', function changeGroupSortDirHandler() {
            var groupElem = $(this),
                id = groupElem.parents('.group_item').data('grid_id'),
                sortSpan = groupElem.children('.groupSortSpan'),
                groupElements = [];
            if (gridState[id].updating) return;     //can't resort columns if grid is updating
            if (sortSpan.hasClass('sort-asc-white')) sortSpan.removeClass('sort-asc-white').addClass('sort-desc-white');
            else sortSpan.removeClass('sort-desc-white').addClass('sort-asc-white');
            groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                var item = $(val);
                groupElements.push({
                    field: item.data('field'),
                    sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                });
            });
            gridState[id].groupedBy = groupElements;
            gridState[id].pageRequest.eventType = 'group';
            preparePageDataGetRequest(id);
        });

        cancelButton.on('click', function removeDataGrouping() {
            var groupElem = $(this),
                groupedCol = groupElem.parents('.group_item'),
                id = groupedCol.data('grid_id'),
                groupElements = [];
            if (gridState[id].updating) return;     //can't resort columns if grid is updating
            gridState[id].grid.find('colgroup').first().children().first().remove();
            gridState[id].grid.find('.grid-headerRow').children('.group_spacer').first().remove();
            gridState[id].grid.find('.aggregate-row').children('.group_spacer').first().remove();
            groupedCol.remove();
            groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                var item = $(val);
                groupElements.push({
                    field: item.data('field'),
                    sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                });
            });
            gridState[id].grid.find('.grid-header-div').find('th [data-field="' + groupElem.data('field') + '"]').data('grouped', false);
            if (!groupElements.length) groupMenuBar.text(groupMenuText);
            gridState[id].groupedBy = groupElements;
            gridState[id].pageRequest.eventType = 'group';
            preparePageDataGetRequest(id);
        });
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
            e.preventDefault();
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [],
                pageNum = gridState[id].pageNum, i;
            gridElem.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                if (typeof gridState[id].dataSource.put !== jsTypes.function) {
                    for (i = 0; i < dirtyCells.length; i++) {
                        var index = dirtyCells[i].parents('tr').index();
                        var field = dirtyCells[i].data('field');
                        var idxOffset = 0;
                        if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
                            idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
                        var origIndex = gridState[id].dataMap[index + idxOffset];
                        gridState[id].originalData[origIndex][field] = gridState[id].dataSource.data[index][field];
                        dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                    }
                }
                else {
                    gridState[id].putRequest.eventType = 'save';
                    gridState[id].putRequest.pageNum = pageNum;
                    gridState[id].putRequest.models = [];
                    var putRequestModels = gridState[id].putRequest.models;
                    for (i = 0; i < dirtyCells.length; i++) {
                        var dataIndex = dirtyCells[i].parents('tr').index();
                        var exists = putRequestModels.some(function _upsertPutRequest(cur) {
                            if (cur.dataIdx = dataIndex) {
                                cur.dirtyFields.push(dirtyCells[i].data('field'));
                                return true;
                            }
                        });
                        if (!exists) {
                            putRequestModels.push({
                                cleanData: gridState[id].originalData[dirtyCells[i].parents('tr').index()],
                                dirtyData: cloneGridData(gridState[id].dataSource.data[dataIndex]),
                                dirtyFields: [dirtyCells[i].data('field')],
                                dataIdx: dataIndex
                            });
                        }
                    }

                    prepareGridDataUpdateRequest(id);
                }
            }
        });

        deleteAnchor.on('click', function deleteChangeHandler(e) {
            e.preventDefault();
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [];
            gridElem.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                for (var i = 0; i < dirtyCells.length; i++) {
                    var field = dirtyCells[i].data('field'),
                        index = dirtyCells[i].parents('tr').index(),
                        pageNum = gridState[id].pageNum,
                        rowNum = gridState[id].pageSize,
                        addend = (pageNum-1)*rowNum,
                        column = gridState[id].columns[gridState[id].columnIndices[field]],
                        cellVal = gridState[id].originalData[index][field] !== undefined ? gridState[id].originalData[index][field] : '',
                        text = getFormattedCellText(column, cellVal) || cellVal;
                    dirtyCells[i].text(text);
                    dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                    gridState[id].dataSource.data[index][field] = gridState[id].originalData[index + addend][field];
                }
            }
        });
    }

    /**
     * Creates the menu for the grid's toolbar
     * @param {object} menuAnchor - A DOM anchor element to attach the click handler to
     * @param {number} gridId - The id of the current grid widget instance
     */
    function attachMenuClickHandler(menuAnchor, gridId) {
        menuAnchor.on('click', function menuAnchorClickHandler(e) {
            e.stopPropagation();    //stop event bubbling so that the click won't bubble to document click handler
            e.preventDefault();
            var menu = gridState[gridId].grid.find('#menu_model_grid_id_' + gridId),
                newMenu;

            if (!menu.length) {
                newMenu = $('<div id="menu_model_grid_id_' + gridId + '" class="grid_menu" data-grid_id="' + gridId + '"></div>');
                if (gridState[gridId].editable) {
                    newMenu.append($('<ul class="menu-list"></ul>').append(createSaveDeleteMenuItems(gridId)));
                }
                if (gridState[gridId].columnToggle) {
                    if (newMenu.children().length)
                        newMenu.append($('<hr/>'));
                    newMenu.append(createColumnToggleMenuOptions(newMenu, gridId));
                }
                if (gridState[gridId].sortable || gridState[gridId].filterable || gridState[gridId].selectable || gridState[gridId].groupable) {
                    if (newMenu.children().length)
                        newMenu.append($('<hr/>'));
                    if (gridState[gridId].sortable) newMenu.append($('<ul class="menu-list"></ul>').append(createSortMenuItem()));
                    if (gridState[gridId].filterable) {
                        newMenu.append($('<ul class="menu-list"></ul>').append(createFilterMenuItems()));
                        if (gridState[gridId].advancedFiltering) {
                            newMenu.append($('<ul class="menu-list"></ul>').append(createFilterModalMenuItem(gridId)));
                        }
                    }
                    if (gridState[gridId].groupable) newMenu.append($('<ul class="menu-list"></ul>').append(createGroupMenuItem()));
                    if (gridState[gridId].selectable) newMenu.append($('<ul class="menu-list"></ul>').append(createDeselectMenuOption(gridId)));
                }
                if (gridState[gridId].excelExport) {
                    if (newMenu.children().length)
                        newMenu.append($('<hr/>'));
                    newMenu.append(createExcelExportMenuItems(newMenu, gridId));
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

                $(document).on('scroll', function adjustMenuHandler() {
                    var scrollMenuAnchorOffset = menuAnchor.offset();
                    newMenu.css('top', (scrollMenuAnchorOffset.top - $(window).scrollTop()));
                    newMenu.css('left', (scrollMenuAnchorOffset.left - $(window).scrollLeft()));
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
        var menuList = $('<ul class="menu-list"></ul>');
        var menuItem = $('<li class="menu_item"></li>');
        var menuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Export to Excel<span class="menu_arrow"/></span></a>');
        menuItem.on('mouseover', function excelMenuItemHoverHandler() {
            var exportOptions = gridState[gridId].grid.find('#excel_grid_id_' + gridId);
            if (!exportOptions.length) {
                exportOptions = $('<div id="excel_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '" style="display: none;"></div>');
                var exportList = $('<ul class="menu-list"></ul>');
                if (gridState[gridId].dataSource.rowCount <= gridState[gridId].pageSize)
                    exportList.append('<li data-value="page" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Current Page Data</span></a></li>');
                exportList.append('<li data-value="all" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">All Page Data</span></a></li>');
                if (gridState[gridId].selectable && gridState[gridId].grid.find('.selected').length) {
                    exportList.append('<li data-value="select" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Selected Grid Data</span></a></li>');
                }
                var options = exportList.find('li');
                options.on('click', function excelExportItemClickHandler() {
                    exportDataAsExcelFile(gridId, this.dataset.value);
                    gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
                    toggle(exportOptions, {duration: 20, callback: function checkForMouseOver() {

                    }});
                });
                exportOptions.append(exportList);
                gridState[gridId].grid.append(exportOptions);
            }
            else exportOptions.removeClass('hidden_menu_item');

            if (exportOptions.css('display') === 'none') {
                var groupAnchorOffset = menuAnchor.offset(),
                    newMenuOffset = menu.offset();
                exportOptions.css('top', (groupAnchorOffset.top - 3 - $(window).scrollTop()));
                exportOptions.css('left', newMenuOffset.left + (menu.outerWidth() - exportOptions.outerWidth()));
                toggle(exportOptions, {duration: 200, callback: function checkForMouseOver() {}});
            }
        });
        menuList.on('mouseleave', function excelMenuItemHoverHandler(evt) {
            setTimeout(function detectMouseLeave() {
                var excelOptions = $('#excel_grid_id_' + gridId),
                    excelOptionsOffset = excelOptions.offset();
                if (evt.pageX >= excelOptionsOffset.left && evt.pageX <= (excelOptionsOffset.left + excelOptions.width()) && evt.pageY >= excelOptionsOffset.top &&
                    evt.pageY <= (excelOptionsOffset.top + excelOptions.height())) {
                    return;
                }
                toggle(excelOptions, { duration: 200 });
            }, 200);
        });
        menuList.append(menuItem.append(menuAnchor));
        return menuList;
    }

    /**
     * Creates the menu option for de-selecting the grid; The .selectable property must be
     * active for this menu option.
     * @param {number} gridId - The id of the grid widget instance
     * @returns {Object} - Returns the DOM element for the menu item
     */
    function createDeselectMenuOption(gridId) {
        var deSelectMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove Grid Selection</a>'));
        deSelectMenuItem.on('click', function deselectGridClickHandler(e) {
            gridState[gridId].grid.find('.selected').removeClass('selected');
            $(e.currentTarget).parents('.grid_menu').addClass('hiddenMenu');
        });
        return deSelectMenuItem;
    }

    /**
     * Creates the save/delete menu items. In-cell editing must be turned on
     * for at least one column for this menu option.
     * @param {number} gridId - The id of the grid widget instance
     * @returns {Array} - Returns an array of the two DOM menu items
     */
    function createSaveDeleteMenuItems(gridId) {
        var saveMenuItem = $('<li class="menu_item"></li>'),
            saveMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Save Grid Changes</a>'),
            deleteMenuItem = $('<li class="menu_item"></li>'),
            deleteMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Delete Grid Changes</a>');

        attachSaveAndDeleteHandlers(gridId, gridState[gridId].grid, saveMenuItem, deleteMenuItem);

        saveMenuItem.append(saveMenuAnchor);
        deleteMenuItem.append(deleteMenuAnchor);
        return [saveMenuItem, deleteMenuItem];
    }

    function createSortMenuItem() {
        var sortMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Sorts</a>'));
        sortMenuItem.on('click', removeAllColumnSorts);
        return sortMenuItem;
    }

    function createFilterMenuItems() {
        var filterMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Grid Filters</a>'));
        filterMenuItem.on('click', resetAllFilters);
        return filterMenuItem;
    }

    //TODO: break this out into smaller, separate functions
    function createFilterModalMenuItem(gridId) {
        var filterModalMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Advanced Filters</a>'));
        filterModalMenuItem.on('click', function openAdvancedFilterModal(e) {
            e.stopPropagation();
            var advancedFiltersModal = gridState[gridId].grid.find('.filter_modal');
            if (!advancedFiltersModal.length) {
                var toolbarHeight = gridState[gridId].grid.find('.toolbar').height(),
                    groupHeight = gridState[gridId].grid.find('.group_div').height(),
                    wrapperHeight = gridState[gridId].grid.find('.grid-wrapper').length ? gridState[gridId].grid.find('.grid-wrapper').height() : 0;

                advancedFiltersModal = $('<div class="filter_modal" data-grid_id="' + gridId + '">').css('max-height', wrapperHeight + toolbarHeight + groupHeight - 3);
                var groupSelector = '<select class="input group_conjunction"><option value="and">All</option><option value="or">Any</option></select> of the following:</span>';
                advancedFiltersModal.append('<span class="group-select" data-filter_group_num="1">Match' + groupSelector);
                var advancedFiltersContainer = $('<div class="filter_group_container" data-filter_group_num="1"></div>').appendTo(advancedFiltersModal);
                addNewAdvancedFilter(advancedFiltersContainer, true /* isFirstFilter */);

                $(document).on('click', function hideFilterModalHandler(e) {
                    var ct = $(e.target);
                    if (!ct.hasClass('filter_modal') && !ct.parents('.filter_modal').length) {
                        var filterModal = gridState[gridId].grid.find('.filter_modal');
                        filterModal.find('.advanced_filter_value')
                            .filter(':disabled').add('.invalid-grid-input').each(function removeEmptyFilters(idx, val) {
                            var filterVal = $(val);
                            var filterRow = filterVal.parent('.filter_row_div');
                            if (filterVal.data('type') === 'boolean' && filterRow.children('.filterType').val() !== null)
                                return true;
                            else if (filterRow.data('filter_idx') === 1) {
                                if (filterVal.hasClass('invalid-grid-input')) {
                                    filterVal.removeClass('invalid-grid-input');
                                    filterModal.find('span[data-filter_idx="' + filterModal.data('filter_idx') + '"]').remove();
                                    filterVal.val('');
                                    var columnSelector = filterRow.children('.filter_column_selector');
                                    columnSelector.find('option').remove();
                                    columnSelector.append('<option value="">Select a column</option>');
                                    gridState[gridId].columns.forEach(function _addFilterableOptions(col) {
                                        if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
                                    });
                                    filterVal.prop('disabled', true);
                                    filterRow.children('.filterType').prop('disabled', true).find('option').remove();
                                }
                                return true;
                            }
                            else
                                filterRow.remove();
                        });

                        filterModal.find('.filter_group_container').each(function removeEmptyFilterGroups(idx, val) {
                            var filterGrp = $(val);
                            if (!filterGrp.children('.filter_row_div').length) {
                                var filterGrpNum = filterGrp.data('filter_group_num');
                                filterModal.find('span[data-filter_group_num="' + filterGrpNum + '"]').remove();
                                filterGrp.remove();
                            }
                        });

                        filterModal.css('display', 'none');
                    }
                    else e.stopPropagation();
                });

                var applyFiltersButton = $('<input type="button" value="Apply Filter(s)" class="advanced_filters_button"/>').appendTo(advancedFiltersModal);
                applyFiltersButton.on('click', function applyAdvancedFiltersHandler() {
                    if (gridState[gridId].updating) return;     //can't filter if grid is updating
                    gridState[gridId].grid.find('filterInput').val('');

                    advancedFiltersModal.find('.advanced_filter_value').each(function checkFilterValuesForValidContent(idx, val) {
                        var currValue = $(val),
                            dataType = currValue.data('type');
                        if (dataType) {
                            var parentDiv = currValue.parent('.filter_row_div'),
                                parentIdx = parentDiv.data('filter_idx');
                            if (dataTypes[dataType]) {
                                var re = new RegExp(dataTypes[dataType]);
                                if (!re.test(currValue.val()) && !parentDiv.find('.filter_error_span').length) {
                                    currValue.addClass('invalid-grid-input');
                                    if (!parentDiv.find('span[data-filter_idx="' + parentIdx + '"]').length) {
                                        var errorSpan = $('<span class="filter_error_span hidden_error" data-filter_idx="' + parentIdx + '">Invalid ' + dataType + '</span>');
                                        parentDiv.append(errorSpan);
                                        errorSpan.css('top', parentDiv.offset().top / 2);
                                        errorSpan.css('left', parentDiv.width() - errorSpan.width());
                                    }
                                }
                                else {
                                    parentDiv.find('.filter_error_span').remove();
                                    currValue.removeClass('invalid-grid-input');
                                }
                            }
                            if (currValue.val() === '' && currValue.data('type') !== 'boolean') {
                                parentDiv.remove();
                                var filterGrp = currValue.parents('.filter_group_container');
                                //If no child filters (regardless of how nested they may be) are found inside the group, remove the entire group
                                if (!filterGrp.find('.filter_row_div').length) {
                                    advancedFiltersModal.find('span[data-filter_group_num="' + filterGrp.data('filter_group_num') + '"]').remove();
                                    filterGrp.remove();
                                }
                            }
                        }
                    });

                    if (advancedFiltersModal.find('.filter_error_span').length) return;

                    var advancedFilters = {};
                    createFilterGroups(advancedFiltersContainer, advancedFilters);
                    if (advancedFilters.filterGroup.length) {
                        gridState[gridId].filters = advancedFilters;
                        gridState[gridId].advancedFilters = advancedFilters;
                        gridState[gridId].basicFilters.filterGroup = [];

                        advancedFiltersModal.css('display', 'none');
                        gridState[gridId].pageRequest.eventType = 'filter';
                        preparePageDataGetRequest(gridId);
                    }
                });
                gridState[gridId].grid.append(advancedFiltersModal);
            }
            else advancedFiltersModal.css('display', 'block');

            var gridOffset = gridState[gridId].grid.offset(),
                gridWidth = gridState[gridId].grid.width(),
                toolbarOffset = gridState[gridId].grid.find('.toolbar').offset();

            var leftLoc = gridOffset.left - (advancedFiltersModal.outerWidth() / 2) + (gridWidth / 2);
            advancedFiltersModal.css('top', toolbarOffset.top).css('left', leftLoc);
            gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
        });
        return filterModalMenuItem;
    }

    function createFilterGroups(groupContainer, filterObject) {
        var groupConjunct = groupContainer.parents('.filter_modal').find('span[data-filter_group_num="' + groupContainer.data('filter_group_num') + '"]').children('select');
        filterObject.filterGroup = [];
        filterObject.conjunct = groupConjunct.val();
        findFilters(groupContainer, filterObject);
    }

    function findFilters(groupContainer, filterObject) {
        var gridId = groupContainer.parents('.filter_modal').data('grid_id');
        groupContainer.children('.filter_row_div').each(function iterateFilterDivsCallback() {
            createFilterObjects($(this), filterObject.filterGroup, gridId);
        });

        groupContainer.children('.filter_group_container').each(function createNestedFilterGroupsCallback(idx, val) {
            var nestedGroup = {};
            filterObject.filterGroup.push(nestedGroup);
            createFilterGroups($(val), nestedGroup);
        });
    }

    function createFilterObjects(filterDiv, filterGroupArr, gridId) {
        var field = filterDiv.find('.filter_column_selector').val(),
            operation, value,
            filterType = filterDiv.find('.filterType').val();
        if (filterType !== 'false' && filterType !== 'true') {
            operation = filterType;
            value = filterDiv.find('.advanced_filter_value').val();
        }
        else {
            operation = 'eq';
            value = filterType;
        }

        if (value) {
            filterGroupArr.push({ field: field, value: value, operation: operation, dataType: (gridState[gridId].columns[gridState[gridId].columnIndices[field]].type || 'string') });
        }
    }

    function addFilterButtonHandler(e) {
        var filterModal = $(e.currentTarget).parents('.filter_modal'),
            gridId = filterModal.data('grid_id'),
            numFiltersAllowed = gridState[gridId].columns.length;
        if (typeof gridState[gridId].advancedFiltering === jsTypes.object && typeof gridState[gridId].advancedFiltering.filtersCount === jsTypes.number)
            numFiltersAllowed = gridState[gridId].advancedFiltering.filtersCount;

        if (filterModal.find('.filter_row_div').length >= numFiltersAllowed) return;
        else if (filterModal.find('.filter_row_div').length === numFiltersAllowed - 1) filterModal.find('.add_filter_group').prop('disabled', true);

        addNewAdvancedFilter($(e.currentTarget).closest('.filter_group_container'), false /* isFirstFilter */);
    }

    function addNewAdvancedFilter(advancedFiltersContainer, isFirstFilter) {
        var gridId = advancedFiltersContainer.parents('.filter_modal').data('grid_id'),
            filterRowIdx = getFilterRowIdx(advancedFiltersContainer.parents('.filter_modal')),
            filterRowDiv = $('<div class="filter_row_div" data-filter_idx="' + filterRowIdx + '"></div>');
        isFirstFilter ? advancedFiltersContainer.append(filterRowDiv) : advancedFiltersContainer.children('.filter_row_div').last().after(filterRowDiv);

        var columnSelector = $('<select class="input filter_column_selector"></select>').appendTo(filterRowDiv);
        columnSelector.addClass('select');
        columnSelector.append('<option value="">Select a column</option>');
        gridState[gridId].columns.forEach(function _appendFilterableOption(col) {
            if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
        });

        var filterTypeSelector = $('<select class="input select filterType" disabled></select>').appendTo(filterRowDiv);
        var filterValue = $('<input type="text" class="advanced_filter_value" disabled />');
        filterValue.appendTo(filterRowDiv);
        filterValue.on('keypress', function validateFilterValueHandler(e) {
            var code = e.charCode? e.charCode : e.keyCode,
                type = $(this).data('type');
            if (!validateCharacter.call(this, code, type)) {
                e.preventDefault();
                return false;
            }
        })
        .on('mouseover', function displayErrorMessageHandler() {
            filterRowDiv.find('span[data-filter_idx="' + filterRowDiv.data('filter_idx') + '"]').removeClass('hidden_error');
        })
        .on('mouseout', function hideErrorMessageHandler() {
            filterRowDiv.find('span[data-filter_idx="' + filterRowDiv.data('filter_idx') + '"]').addClass('hidden_error');
        });

        var deleteHandler = isFirstFilter ? clearFirstFilterButtonHandler : deleteFilterButtonHandler;

        $('<input type="button" value="X" class="filter_row_button"/>').appendTo(filterRowDiv).on('click', deleteHandler);

        if (!isFirstFilter) {
            var addNewFilterButton = filterRowDiv.prev().find('.new_filter'),
                addFilterGroup = filterRowDiv.prev().find('.add_filter_group');
            addNewFilterButton.detach();
            addFilterGroup.detach();
            filterRowDiv.append(addNewFilterButton).append(addFilterGroup);
        }
        else {
            $('<input type="button" value="+" class="filter_row_button new_filter"/>')
                .appendTo(filterRowDiv)
                .on('click', addFilterButtonHandler);

            $('<input type="button" value="+ Group" class="advanced_filters_button add_filter_group"/>')
                .appendTo(filterRowDiv)
                .on('click', addFilterGroupHandler);
        }

        columnSelector.on('change', function columnSelectorCallback() {
            var columnDataType = gridState[gridId].columns[gridState[gridId].columnIndices[columnSelector.val()]].type || 'string';
            filterTypeSelector.find('option').remove();
            filterTypeSelector.prop('disabled', false);
            filterRowDiv.find('.advanced_filter_value').val('');
            createFilterOptionsByDataType(filterTypeSelector, columnDataType);

            if (columnDataType !== 'boolean')
                filterValue.prop('disabled', false);
            else
                filterValue.prop('disabled', true);
            filterValue.data('type', columnDataType);
        });
    }

    function addFilterGroupHandler() {
        var numGroupsAllowed = 0,
            filterModal = $(this).parents('.filter_modal'),
            gridId = filterModal.data('grid_id'),
            filterGroups = filterModal.find('.filter_group_container'),
            parentGroup = $(this).parents('.filter_group_container').first(),
            filterGroupCount = filterGroups.length,
            numFiltersAllowed = gridState[gridId].columns.length;
        if (typeof gridState[gridId].advancedFiltering === jsTypes.object && typeof gridState[gridId].advancedFiltering.groupsCount === jsTypes.number)
            numGroupsAllowed = gridState[gridId].advancedFiltering.groupsCount;
        else numGroupsAllowed = 3;

        if (filterGroupCount >= numGroupsAllowed) return;
        else if (filterGroupCount === numGroupsAllowed - 1)
            filterModal.find('.add_filter_group').prop('disabled', true);

        if (typeof gridState[gridId].advancedFiltering === jsTypes.object && typeof gridState[gridId].advancedFiltering.filtersCount === jsTypes.number)
            numFiltersAllowed = gridState[gridId].advancedFiltering.filtersCount;

        if (filterModal.find('.filter_row_div').length >= numFiltersAllowed) return;
        else if (filterModal.find('.filter_row_div').length === numFiltersAllowed - 1) filterModal.find('.add_filter_group').prop('disabled', true);

        var previousGroupNum = parseInt(filterGroups.last().data('filter_group_num'));

        var groupSelector = '<select class="input group_conjunction"><option value="and">All</option><option value="or">Any</option></select> of the following:</span>';
        parentGroup.append('<span class="group-select" data-filter_group_num="' + (previousGroupNum + 1) + '">Match' + groupSelector);

        var filterGroupContainer = $('<div class="filter_group_container" data-filter_group_num="' + (previousGroupNum + 1) + '"></div>');
        parentGroup.append(filterGroupContainer);
        var removeGroup = $('<span class="remove_filter_group"></span>')
            .on('click', function closeFilterGroupHandler(e) {
                var filterContainerGroup = $(e.currentTarget).closest('.filter_group_container');
                filterContainerGroup.prev('.group-select').remove();
                filterContainerGroup.remove();

                if (filterModal.find('.group_conjunction').length < numGroupsAllowed)
                    filterModal.find('.add_filter_group').prop('disabled', false);
                e.stopPropagation();
            })
            .data('filter_group_num', filterGroupCount + 1)
            .css('left', (filterGroupContainer.outerWidth()));
        filterGroupContainer.append(removeGroup).append('</br>');
        addNewAdvancedFilter(filterGroupContainer, true /* isFirstFilter */);
    }

    function deleteFilterButtonHandler(e) {
        var target = $(e.currentTarget);
        var filterRowDiv = target.parents('.filter_row_div'),
            addNewFilterButton = filterRowDiv.find('.new_filter'),
            filterModal = target.parents('.filter_modal'),
            newFilterGroupButton = filterRowDiv.find('.add_filter_group');
        if (addNewFilterButton.length) {
            filterRowDiv.prev().append(addNewFilterButton.detach());
        }
        if (newFilterGroupButton.length) {
            filterRowDiv.prev().append(newFilterGroupButton.detach());
        }
        filterRowDiv.remove();

        var gridId = filterModal.data('grid_id'),
            numFilters = filterModal.find('.filter_row_div').length,
            allowedFilters = gridState[gridId].columns.length;
        if (typeof gridState[gridId].advancedFiltering === jsTypes.object && typeof gridState[gridId].advancedFiltering.filtersCount === jsTypes.number)
            allowedFilters = gridState[gridId].advancedFiltering.filtersCount;
        if (allowedFilters > numFilters)
            filterModal.find('.add_filter_group').prop('disabled', false);
        e.stopPropagation();
    }

    function clearFirstFilterButtonHandler(e) {
        var filterRowDiv = $(e.currentTarget).parents('.filter_row_div'),
            columnSelector = filterRowDiv.find('.filter_column_selector'),
            gridId = filterRowDiv.parents('.filter_modal').data('grid_id');
        columnSelector.find('option').remove();
        columnSelector.append('<option value="">Select a column</option>');
        gridState[gridId].columns.forEach(function _appendFilterableOption(col) {
            if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
        });
        filterRowDiv.find('.filterType').prop('disabled', true).find('option').remove();
        filterRowDiv.find('.advanced_filter_value').val('').prop('disabled', true);
    }

    function getFilterRowIdx(filterModal) {
        return filterModal.find('.filter_row_div').length ? filterModal.find('.filter_row_div').last().data('filter_idx') + 1 : 1;
    }

    function removeAllColumnSorts(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');

        gridState[gridId].grid.find('.sortSpan').remove();
        if (gridState[gridId].sortedOn.length) {
            gridState[gridId].sortedOn = [];
            gridState[gridId].pageRequest.eventType = 'sort';
            preparePageDataGetRequest(gridId);
        }
        e.preventDefault();
    }

    function createGroupMenuItem() {
        var groupMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Grouping</a>'));
        groupMenuItem.on('click', removeAllColumnGrouping);
        return groupMenuItem;
    }

    function removeAllColumnGrouping(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');

        var groupItems = gridState[gridId].grid.find('.group_item'),
            groupItemsCount = groupItems.length,
            headerColGroup = gridState[gridId].grid.find('colgroup').first();
        groupItems.remove();
        for (var i = 0; i < groupItemsCount; i++) {
            headerColGroup.children().first().remove();
        }
        gridState[gridId].grid.find('.grid-headerRow').children('.group_spacer').remove();
        gridState[gridId].grid.find('.aggregate-row').children('.group_spacer').remove();
        gridState[gridId].grid.find('.group_div').text(groupMenuText);

        if (gridState[gridId].groupedBy.length) {
            gridState[gridId].groupedBy = [];
            gridState[gridId].pageRequest.eventType = 'group';
            preparePageDataGetRequest(gridId);
        }
        e.preventDefault();
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
                gridState[gridId].columns.forEach(function _createToggableColumns(col) {
                    var columnOption = $('<li data-value="' + col.field + '" class="menu_item">');
                    var columnToggle = $('<span class="excel_span"><input type="checkbox" data-field="' + col.field + '"> ' + (col.title || col.field) + '</span>');
                    columnToggle.appendTo(columnOption);
                    columnList.append(columnOption);
                });
                var options = columnList.find('input');
                options.on('click', function excelExportItemClickHandler() {
                    var uncheckedCol = false;
                    $(this).parents('ul').find('input').each(function findTotalCheckedColumns() {
                        if (!this.checked) {
                            uncheckedCol = true;
                            return false;
                        }
                    });
                    if (uncheckedCol && this.checked) gridState[gridId].grid[0].grid.hideColumn($(this).data('field'));
                    else if (this.checked) this.checked = false;
                    else gridState[gridId].grid[0].grid.showColumn($(this).data('field'));
                });
                toggleOptions.append(columnList);
                gridState[gridId].grid.append(toggleOptions);
            }
            if (toggleOptions.css('display') === 'none') {
                var groupAnchorOffset = menuAnchor.offset(),
                    newMenuOffset = menu.offset();
                toggleOptions.css('top', (groupAnchorOffset.top - 3 - $(window).scrollTop()));
                toggleOptions.css('left', newMenuOffset.left + (menu.outerWidth() - toggleOptions.outerWidth()));
                toggle(toggleOptions, {duration: 200 });
            }
        });
        menuList.on('mouseleave', function columnToggleItemHoverHandler(evt) {
            setTimeout(function detectMouseLeave() {
                var toggleOptions = $('#toggle_grid_id_' + gridId),
                    toggleOptionsOffset = toggleOptions.offset();
                if (evt.pageX >= toggleOptionsOffset.left && evt.pageX <= (toggleOptionsOffset.left + toggleOptions.width()) && evt.pageY >= toggleOptionsOffset.top &&
                    evt.pageY <= (toggleOptionsOffset.top + toggleOptions.height())) {
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
    function createGridPager(gridData, gridElem) {
        var gridPager = gridElem.find('.grid-pager-div'),
            id = gridPager.data('grid_pager_id'),
            count = gridState[id].dataSource.rowCount || gridState[id].dataSource.data.length,
            displayedRows = (count - gridState[id].pageSize) > 0 ? gridState[id].pageSize : count,
            totalPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) + 1: 1,
            pageNum = gridState[id].pageNum;

        var first = $('<a href="#" class="grid-page-link" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridPager);
        var prev = $('<a href="#" class="grid-page-link" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridPager);
        var text = 'Page ' + gridState[parseInt(gridPager.data('grid_pager_id'))].pageNum + '/' + (totalPages);
        gridPager.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
        var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridPager);
        var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + (totalPages) + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridPager);

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
                if (isNumber(parseFloat(pageOptions[i]))) {
                    sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                    numOptions++;
                }
            }
            if (numOptions) {
                sizeSelectorSpan.appendTo(gridPager);
                sizeSelect.appendTo(sizeSelectorSpan);
            }
            sizeSelect.val(~pageOptions.indexOf(gridState[id].pageSize) ? gridState[id].pageSize : pageOptions[0]);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler(e) {
                var pageSize = $(this).val(),
                displayedRows = (count - pageSize) > 0 ? pageSize : count,
                totalPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) + 1: 1;
                gridState[id].pageRequest.pageSize = parseInt(pageSize);
                gridState[id].pageRequest.eventType = 'pageSize';
                gridState[id].pageRequest.pageNum = totalPages < gridState[id].pageNum ? totalPages : gridState[id].pageNum;
                preparePageDataGetRequest(id);
                e.preventDefault();
            });
        }

        var rowStart = displayedRows ? (1 + (displayedRows * (pageNum - 1))) : 0;
        var rowEnd = gridData.dataSource.rowCount < gridData.pageSize * pageNum ? gridData.dataSource.rowCount : gridData.pageSize * pageNum;
        text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
        gridPager.append('<span class="pageinfo">' + text + '</span>');

        setPagerEventListeners(gridPager);
    }

    /**
     * Attaches click handlers to each pager
     * @param {object} gridPager - The grid's DOM pager element
     */
    function setPagerEventListeners(gridPager) {
        gridPager.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
            $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
                e.preventDefault();
                var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
                if (link.hasClass('link-disabled')) {   //If the pager link that was clicked on is disabled, return.
                    return;
                }
                var gridPager = link.parents('.grid-pager-div');
                var allPagers = gridPager.find('a');
                var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
                if (gridState[id].updating) return;     //can't page if grid is updating
                var gridData = gridState[id];
                var pageSize = gridData.pageSize;
                var pagerInfo = gridPager.find('.pageinfo');
                var pagerSpan = gridPager.find('.grid-pagenum-span');
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
            e.stopPropagation();    //stop event bubbling so that the column won't also get sorted when the filter icon is clicked.
            e.preventDefault();
            var filterAnchor = $(e.target);
            var filterCell = filterAnchor.parents('th');
            var type = filterAnchor.data('type');
            var grid = filterElem.parents('.grid-wrapper').first();
            var id = grid.data('grid_id');
            if (gridState[id].updating) return;     //can't filter when the grid is updating
            var filters = grid.find('.filter-div');
            var currFilter = null;
            var field = filterAnchor.data('field');
            var title = gridState[id].columns[gridState[id].columnIndices[field]].title || field;

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
     * @param {Object} grid - The DOM element of the grid widget instance wrapper
     * @param {string} title - The title supplied in the metadata for the grid's column
     */
    function createFilterDiv(type, field, grid, title) {
        var filterDiv = $('<div class="filter-div" data-parentfield="' + field + '" data-type="' + type + '"></div>').appendTo(grid),
            domName = title ? title : type,
            filterInput, resetButton, button,
            modalText = 'Filter rows where ' + domName,
            id = grid.data('grid_id');
        modalText = type !== 'string' ? modalText + ' is:' : modalText + ':';
        $('<span class="filterTextSpan">' + modalText + '</span>').appendTo(filterDiv);
        var select = $('<select class="filterSelect select input"></select>').appendTo(filterDiv),
            column = gridState[id].columns[gridState[id].columnIndices[field]];

        createFilterOptionsByDataType(select, type, column.nullable);

        if (column.nullable) {
            select.on('change', function handleNullValueSelect() {
                if (gridState[id].updating) return;     //can't filter if grid is updating
                var val = $(this).val(),
                    operation = val === 'null' ? 'eq' : 'neq';
                if (val === 'null' || val === 'not_null') {
                    if (filterInput) filterInput.val('');
                    var dataType = column.type || 'string',
                        extantFilters = gridState[id].basicFilters.filterGroup || [],
                        tmpFilters = [], updatedFilter = [], foundColumn,
                        errors = filterDiv.find('.filter-div-error');

                    if (errors.length) errors.remove();
                    for (var i = 0; i < extantFilters.length; i++) {
                        if (extantFilters[i].field !== field) tmpFilters.push(extantFilters[i]);
                        else {
                            updatedFilter = extantFilters[i];
                            updatedFilter.operation = operation;
                            updatedFilter.value = null;
                            foundColumn = true;
                        }
                    }

                    tmpFilters.push(foundColumn ? updatedFilter : { field: field, value: null, operation: operation, dataType: dataType });
                    gridState[id].filters = { conjunct: 'and', filterGroup: tmpFilters };
                    gridState[id].basicFilters.filterGroup = tmpFilters;
                    gridState[id].advancedFilters = {};

                    filterDiv.addClass('hiddenFilter');
                    gridState[id].pageRequest.eventType = 'filter';
                    preparePageDataGetRequest(id);
                }
            });
        }

        if (type !== 'boolean') {
            filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
        }
        resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
        button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
        resetButton.on('click', resetButtonClickHandler);
        button.on('click', filterButtonClickHandler);
        //TODO: why I am not validating date and time types here? Is it because the regular expressions were ready at the time?
        if (filterInput && type !=='time' && type !== 'date') filterInputValidation(filterInput);
    }

    function createFilterOptionsByDataType(select, type, isNullable) {
        switch (type) {
            case 'number':
                select.append('<option value="gte">Greater than or equal to:</option>')
                    .append('<option value="gt">Greater than:</option>')
                    .append('<option value="lte">Less than or equal to:</option>')
                    .append('<option value="lt">Less than:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
            case 'date':
            case 'time':
            case 'datetime':
                select.append('<option value="gte">Equal to or later than:</option>')
                    .append('<option value="gt">Later than:</option>')
                    .append('<option value="lte">Equal to or before:</option>')
                    .append('<option value="lt">Before:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
            case 'boolean':
                select.append('<option value="true">True</option>')
                    .append('<option value="false">False</option>');
                break;
            case 'string':
                select.append('<option value="ct">Contains:</option>')
                    .append('<option value="nct">Does not contain:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
        }

        if (isNullable) {
            select.append('<option value="null">Is null:</option>');
            select.append('<option value="not_null">Is not null:</option>');
        }
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
        if (gridState[gridId].updating) return;     //can't filter if grid is updating
        $('.grid_menu').addClass('hiddenMenu');
        gridState[gridId].grid.find('filterInput').val('');

        var filterModal = gridState[gridId].grid.find('.filter_modal');
        filterModal.find('.filter_group_container').each(function removeFilterGroups() {
            var grpContainer = $(this);
            if (grpContainer.data('filter_group_num') !== 1) grpContainer.remove();
            else {
                grpContainer.find('.filter_row_div').each(function removeFilterRows() {
                    var filterRow = $(this);
                    if (filterRow.data('filter_idx') !== 1) filterRow.remove();
                    else {
                        var columnSelector = filterRow.find('.filter_column_selector');
                        columnSelector.find('option').remove();
                        columnSelector.append('<option value="">Select a column</option>');
                        gridState[gridId].columns.forEach(function _addFilterableOption(col) {
                            if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
                        });

                        filterRow.find('.filterType').prop('disabled', true).find('option').remove();
                        filterRow.find('.advanced_filter_value').prop('disabled', true).removeClass('invalid-grid-input').val('');
                    }
                });
            }
        });

        filterModal.find('filter_error').remove();

        if (gridState[gridId].filters && Object.keys(gridState[gridId].filters.filterGroup).length) {
            gridState[gridId].filters = {};
            gridState[gridId].pageRequest.eventType = 'filter';
            preparePageDataGetRequest(gridId);
        }
    }

    function resetButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            value = filterDiv.find('.filterInput').val(),
            field = $(this).data('field'),
            remainingFilters = [],
            gridId = filterDiv.parents('.grid-wrapper').first().data('grid_id');
        if (gridState[gridId].updating) return;     //can't filter if grid is updating
        var gridData = gridState[gridId];

        if (value === '' && !gridData.filters.filterGroup.length) return;
        filterDiv.find('.filterInput').val('');
        filterDiv.addClass('hiddenFilter');

        for (var i = 0; i < gridState[gridId].filters.filterGroup.length; i++) {
            if (gridState[gridId].filters.filterGroup[i].field !== field) {
                remainingFilters.push(gridState[gridId].filters.filterGroup[i]);
            }
        }

        gridData.filters.filterGroup = remainingFilters;
        gridData.pageRequest.eventType = 'filter';
        preparePageDataGetRequest(gridId);
        e.preventDefault();
    }

    function filterButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            selected = filterDiv.find('.filterSelect').val(),
            value = filterDiv.find('.filterInput').val(),
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[gridId].updating) return;     //can't filter if grid is updating
        var gridData = gridState[gridId],
            type = filterDiv.data('type'),
            errors = filterDiv.find('.filter-div-error'),
            field = $(this).data('field'),
            column = gridState[gridId].columns[gridState[gridId].columnIndices[field]],
            tmpFilters = [],
            foundColumn = false,
            re, updatedFilter;

        if (dataTypes[type]) {
            re = new RegExp(dataTypes[type]);
            if (!re.test(value)) {
                if (type === 'datetime' && new RegExp(dataTypes['date']).test(value)) {
                    value += ' 00:00:00';
                }
                else {
                    $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
                    return;
                }
            }
        }

        var dataType = column.type || 'string',
            extantFilters = gridState[gridId].basicFilters.filterGroup || [];

        if (errors.length) errors.remove();
        if (value === '' && !gridData.basicFilters.length) return;
        if (dataType === 'boolean') {
            value = selected;
            selected = 'eq';
        }

        for (var i = 0; i < extantFilters.length; i++) {
            if (extantFilters[i].field !== field) tmpFilters.push(extantFilters[i]);
            else {
                updatedFilter = extantFilters[i];
                updatedFilter.operation = selected;
                updatedFilter.value = value;
                foundColumn = true;
            }
        }

        tmpFilters.push(foundColumn ? updatedFilter : { field: field, value: value, operation: selected, dataType: dataType });
        gridState[gridId].filters = { conjunct: 'and', filterGroup: tmpFilters };
        gridState[gridId].basicFilters.filterGroup = tmpFilters;
        gridState[gridId].advancedFilters = {};

        filterDiv.addClass('hiddenFilter');
        gridData.pageRequest.eventType = 'filter';
        preparePageDataGetRequest(gridId);
    }

    /**
     * Creates the drag events for column resizing
     * @param {Object} elem - Returns the DOM element that has the drag events attached
     */
    function setDragAndDropListeners(elem) {
        elem.on('dragstart', function handleDragStartCallback(e) {
            e.originalEvent.dataTransfer.setData('text/plain', e.currentTarget.id);
            $(e.currentTarget).data('dragging', true);
        });
        elem.on('drop', handleDropCallback);
        elem.on('dragover', function handleHeaderDragOverCallback(e) {
            e.preventDefault();
            var gridId = elem.parents('.grid-header-div').data('grid_header_id');
            var dropIndicator = $('#drop_indicator_id_' + gridId);
            if (!dropIndicator.length) {
                dropIndicator = $('<div id="drop_indicator_id_' + gridId + '" class="drop-indicator" data-grid_id="' + gridId + '"></div>');
                dropIndicator.append('<span class="drop-indicator-top"></span><span class="drop-indicator-bottom"></span>');
                gridState[gridId].grid.append(dropIndicator);
            }
            else
                dropIndicator.css('display', 'block');

            var originalColumn;
            gridState[gridId].grid.find('.grid-header-cell').each(function iterateGridHeadersCallback(idx, val) {
                if ($(val).data('dragging')) originalColumn = $(val);
            });

            if (originalColumn && originalColumn[0] !== elem[0]) {
                dropIndicator.css('display', 'block');
                dropIndicator.css('height', elem.outerHeight());
                if (originalColumn.offset().left < elem.offset().left) {
                    dropIndicator.css('left', elem.offset().left + elem.outerWidth());
                    dropIndicator.css('top', elem.offset().top);
                }
                else {
                    dropIndicator.css('left', elem.offset().left);
                    dropIndicator.css('top', elem.offset().top);
                }
            }
            else {
                dropIndicator.css('display', 'none');
            }
        });
        //elem.on('mouseleave', mouseLeaveHandlerCallback);
    }

    function handleDropCallback(e) {
        var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
        droppedCol.data('dragging', false);
        var targetCol = $(e.currentTarget),
            id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null,
            droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
        if (id == null || droppedId == null || id !== droppedId) return;  //at least one of the involved dom elements is not a grid column, or they are from different grids
        if (gridState[id].updating) return;     //can't resort columns if grid is updating
        if (droppedCol[0].cellIndex === targetCol[0].cellIndex) return;
        if (droppedCol[0].id === 'sliderDiv') return;

        var parentDiv = targetCol.parents('.grid-header-div'),
            parentDivId = parentDiv.data('grid_header_id'),
            gridWrapper = parentDiv.parent('.grid-wrapper'),
            colGroups = gridWrapper.find('colgroup');

        var droppedIndex = droppedCol[0].dataset.index,
            targetIndex = targetCol[0].dataset.index;

        var droppedClone = droppedCol.clone(false, true),
            targetClone = targetCol.clone(false, true);

        var droppedEvents = $._data(droppedCol[0], 'events'),
            targetEvents = $._data(targetCol[0], 'events');
        if (droppedEvents.click) setSortableClickListener(droppedClone);
        if (gridState[id].resizable) {
            droppedClone.on('mouseleave', mouseLeaveHandlerCallback);
            targetClone.on('mouseleave', mouseLeaveHandlerCallback);
        }
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

        if (gridState[id].groupedBy && gridState[id].groupedBy.length && gridState[id].groupedBy !== 'none') {
            ++droppedIndex;
            ++targetIndex;
        }

        if (gridState[id].drillDown) {
            ++droppedIndex;
            ++targetIndex;
        }

        var targetWidth = colGroups[0].children[droppedIndex].style.width;
        var droppedWidth = colGroups[0].children[targetIndex].style.width;

        colGroups[0].children[targetIndex].style.width = targetWidth;
        colGroups[0].children[droppedIndex].style.width = droppedWidth;
        colGroups[1].children[targetIndex].style.width = targetWidth;
        colGroups[1].children[droppedIndex].style.width = droppedWidth;

        if (colGroups[2]) {
            colGroups[2].children[targetIndex].style.width = targetWidth;
            colGroups[2].children[droppedIndex].style.width = droppedWidth;
        }

        var aggRow = gridWrapper.find('.aggregate-row');
        if (aggRow.length) {
            var droppedColSum = null,
                targetColSum = null;
            aggRow.children().each(function iterateSumRowCellsCallback(idx, val) {
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
        $('#drop_indicator_id_' + id).css('display', 'none');
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
        var target = $(e.currentTarget),
            targetOffset = target.offset(),
            targetWidth = target.innerWidth(),
            mousePos = { x: e.originalEvent.pageX, y: e.originalEvent.pageY },
            parentDiv = target.parents('.grid-header-wrapper'),
            id = parentDiv.parent().data('grid_header_id'),
            sliderDiv = $('#sliderDiv' + id);

        if (Math.abs(mousePos.x - (targetOffset.left + targetWidth)) < 10) {
            if (!sliderDiv.length) {
                sliderDiv = $('<div id="sliderDiv' + id + '" style="width:10px; height:' + target.innerHeight() + 'px; cursor: col-resize; position: absolute" draggable=true><div></div></div>').appendTo(parentDiv);
                sliderDiv.on('dragstart', function handleResizeDragStartCallback(e) {
                    e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
                    gridState[id].resizing = true;
                });
                sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                    gridState[id].resizing = false;
                });
                sliderDiv.on('dragover', function handleResizeDragOverCallback(e) {
                    e.preventDefault();
                });
                sliderDiv.on('drop', function handleResizeDropCallback(e) {
                    e.preventDefault();
                });
                sliderDiv.on('drag', handleResizeDragCallback);
                sliderDiv.on('dblclick', function doubleClickHandler() {
                    var targetCol = gridState[id].grid.find('#' + sliderDiv.data('targetindex')),
                        targetColIdx = targetCol.data('index');
                    if (targetColIdx === gridState[id].columns.length - 1) return;
                    if (gridState[id].drillDown) ++targetColIdx;
                    if (gridState[id].groupedBy && gridState[id].groupedBy.length) {
                        targetColIdx = targetColIdx + gridState[id].groupedBy.length;
                    }

                    var colGroups = gridState[id].grid.find('colgroup').filter(function removeParentOrChildCols() {
                        var cg = $(this);
                        if (gridState[id].parentGridId != null) {
                            return cg.parents('tr.drill-down-parent').length;
                        }
                        else return !cg.parents('tr.drill-down-parent').length;
                    });

                    var headerCol = $($(colGroups[0]).children()[targetColIdx]),
                        contentCol = $($(colGroups[1]).children()[targetColIdx]);

                    var tables = gridState[id].grid.find('table').filter(function removeParentOrChildCols() {
                        var cg = $(this);
                        if (gridState[id].parentGridId != null) {
                            return cg.parents('tr.drill-down-parent').length;
                        }
                        else return !cg.parents('tr.drill-down-parent').length;
                    });

                    var headerCell = $(tables[0]).find('th')[targetColIdx],
                        aggregateCell = $(tables[0]).find('td')[targetColIdx] || null,
                        headerMultiplier = 8.1,
                        aggregateMultiplier = 7.5,
                        contentMultiplier = 6.75,
                        maxLength = headerCell.innerText.length * headerMultiplier,
                        newWidth,
                        column = gridState[id].columns[gridState[id].columnIndices[targetCol.data('field')]];

                    if (column.sortable) maxLength += 16;

                    if (column.filterable) maxLength += 40;

                    if (aggregateCell && aggregateCell.innerText.length * aggregateMultiplier > maxLength)
                        maxLength = aggregateCell.innerText.length * aggregateMultiplier;

                    $(tables[1]).find('tr').each(function findTargetContentCells() {
                        var row = $(this);
                        if (gridState[id].parentGridId != null) {
                            if (row.parents('tr.drill-down-parent').length) {
                                if (row.find('td')[targetColIdx].innerText.length * contentMultiplier > maxLength)
                                    maxLength = row.find('td')[targetColIdx].innerText.length * contentMultiplier;
                            }
                        }
                        else {
                            if (!row.parents('tr.drill-down-parent').length) {
                                if (row.find('td')[targetColIdx].innerText.length * contentMultiplier > maxLength)
                                    maxLength = row.find('td')[targetColIdx].innerText.length * contentMultiplier;
                            }
                        }
                    });

                    newWidth = Math.ceil(maxLength) + 24;
                    tables.css('width', tables.width() - (headerCol.width() - newWidth));
                    headerCol.css('width', newWidth);
                    contentCol.css('width', newWidth);
                });
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
        elem.on('click', function handleHeaderClickCallback(e) {
            var headerDiv = elem.parents('.grid-header-div');
            var id = parseInt(headerDiv.data('grid_header_id'));
            if (gridState[id].updating) return;     //can't sort if grid is updating
            var field = elem.data('field'),
                foundColumn = false;

            if (gridState[id].groupedBy.length) {
                for (var j = 0; j < gridState[id].groupedBy.length; j++) {
                    if (gridState[id].groupedBy[j].field === field) return; //can't sort on a grouped column
                }
            }

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
                        //TODO: why am I doing this here?
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
            e.preventDefault();
        });
    }

    /**
     * Add the filter icon to a filterable grid header and attaches an event listener when the icon is clicked
     * @param {object} elem - The grid header element whose column values are filterable
     * @param {object} gridData - The metadata describing the grid's behavior and attributes
     * @param {string} col - The name of the field associated with the filterable grid column
     */
    function setFilterableClickListener(elem, gridData, col) {
        var type = gridData.columns[gridData.columnIndices[col]].type || 'string';
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
        if (gridState[id].updating) return;     //can't resize columns if grid is updating
        var targetCell = document.getElementById(sliderDiv.data('targetindex'));
        var targetBox = targetCell.getBoundingClientRect();
        var endPos = e.originalEvent.pageX;
        var startPos = targetBox.left;
        var width = endPos - startPos;
        var space = endPos - targetBox.right;

        if (width > 11) {
            var index = targetCell.dataset.index;
            var gridWrapper = $(targetCell).parents('.grid-wrapper').first();
            var colGroups = gridWrapper.find('colgroup');
            var tables = gridWrapper.find('table');
            if (gridState[id].groupedBy && gridState[id].groupedBy.length && gridState[id].groupedBy !== 'none')
                index += gridState[id].groupedBy.length;
            if (gridState[id].drillDown)
                ++index;

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
        $('#grid-content-' + gridId).find('tr').filter(function filterNestedGridRows() {
            return !$(this).hasClass('drill-down-parent') && !$(this).parents('.drill-down-parent').length;
        }).each(function iterateContentRowsCallback(idx, val) {
            if ($(val).hasClass('grouped_row_header'))
                return true;
            var droppedIdx = 1 + parseInt(droppedIndex);
            var targetIdx = 1 + parseInt(targetIndex);
            if (gridData.groupedBy && gridData.groupedBy.length && gridData.groupedBy !== 'none') {
                droppedIdx++;
                targetIdx++;
            }

            if (gridData.drillDown) {
                ++droppedIdx;
                ++targetIdx;
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

        var requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        if (gridData.filterable) requestObj.filters = gridData.filters.filterGroup && gridData.filters.filterGroup.length? gridData.filters : { conjunct: null, filterGroup: [] };
        if (gridData.groupable) requestObj.groupedBy = gridData.groupedBy.length? gridData.groupedBy : [];

        requestObj.pageSize = pageSize;
        requestObj.pageNum = gridData.pageRequest.eventType === 'filter' ? 1 : pageNum;

        gridData.grid.find('.grid-content-div').empty();

        callGridEventHandlers(gridState[id].events.pageRequested, gridData.grid, { element: gridData.grid });
        if (gridData.dataSource.get && typeof gridData.dataSource.get === jsTypes.function) gridData.dataSource.get(requestObj, getPageDataRequestCallback);
        else {
            if (!gridData.alteredData || gridData.pageRequest.eventType === 'filter') gridData.alteredData = cloneGridData(gridData.originalData);
            getPageData(requestObj, id, getPageDataRequestCallback);
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
                gridData.dataSource.data = response.data;
                gridData.pageSize = requestObj.pageSize;
                gridData.pageNum = requestObj.pageNum;// (requestObj.pageSize * requestObj.pageNum) > response.rowCount ? Math.ceil(response.data.length / requestObj.pageSize) : requestObj.pageNum;
                gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.data.length;
                gridData.groupedBy = requestObj.groupedBy || [];
                gridData.sortedOn = requestObj.sortedOn || [];
                gridData.filters = requestObj.filters || {};

                if (typeof gridData.dataSource.get === jsTypes.function) gridData.originalData = cloneGridData(response.data);

                if (gridData.pageRequest.eventType === 'newGrid' || gridData.pageRequest.eventType === 'group')
                    setColWidth(gridData, gridState[id].grid);

                if (response.aggregations && gridData.dataSource.aggregates) {
                    gridData.dataSource.aggregates = gridData.dataSource.aggregates.map(function _mapAggregateValues(val) {
                        if (response.aggregations[val.field])
                            return { aggregate: val.aggregate, field: val.field, value: response.aggregations[val.field] };
                        else return { aggregate: val.aggregate, field: val.field, value: null };
                    });
                }

                createGridContent(gridData, gridState[id].grid);
                if (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === 'pageSize') {
                    gridData.grid.find('.grid-pager-div').empty();
                    createGridPager(gridData, gridData.grid);
                }
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
    function getPageData(requestObj, id, callback) {
        var eventType = gridState[id].pageRequest.eventType,
            fullGridData = cloneGridData(gridState[id].alteredData);
        if (!gridState[id].dataMap) gridState[id].dataMap = [];

        if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
            limitPageData(requestObj, cloneGridData(gridState[id].alteredData), callback);
            return;
        }
        if (requestObj.filters && requestObj.filters.filterGroup && requestObj.filters.filterGroup.length) {
            var filtered = expressionParser.createFilterTreeFromFilterObject(requestObj.filters).filterCollection(gridState[id].originalData);
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

    //==========================================================================================================================//
    //                                                                                                                          //
    //                                                  HELPER FUNCTIONS                                                        //
    //                                                                                                                          //
    //==========================================================================================================================//

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

    /**
     * Using various equality operators, checks for truth based on the type of the operator(s)
     * @param {string|number|boolean} val - The value that is being checked against a base value
     * @param {*} base - The based value against which values are compared
     * @param {string} type - The type of equality operator(s) to be used in the comparison
     * @returns {boolean} - Returns a boolean indicating that whether the comparison was true of false
     */
    function comparator(val, base, type) {
        switch (type) {
            case 'eq':
            case '===':
                return val === base;
            case '==':
                return val == base;
            case 'neq':
            case '!==':
                return val !== base;
            case '!=':
                return val != base;
            case 'gte':
            case '>=':
                return val >= base;
            case 'gt':
            case '>':
                return val > base;
            case 'lte':
            case '<=':
                return val <= base;
            case 'lt':
            case '<':
                return val < base;
            case 'not':
            case '!':
            case 'falsey':
                return !val;
            case 'truthy':
                return !!val;
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
     * @returns {Array} - Returns an array of sorted grid data and a map for each item's original index
     */
    function sortGridData(sortedItems, gridData, gridId) {
        var dataMap = gridData.map(function _mapIndices(item, idx) {
            return [item, gridState[gridId].dataMap[idx]];
        });
        sortedItems.forEach(function _sortItems(cur, idx) {
            var columnIdx = gridState[gridId].columnIndices[cur.field];
            var column = gridState[gridId].columns[columnIdx];
            if (idx === 0)
                gridData = mergeSort(dataMap, cur, column.type || 'string');
            else {
                var sortedGridData = [];
                var itemsToSort = [];
                gridData.forEach(function _sortGridData(data, i) {
                    var prevField = sortedItems[idx - 1].field,
                        prevVal = itemsToSort.length ? itemsToSort[0][0][prevField] : null,
                        prevColIdx = itemsToSort.length ? gridState[gridId].columnIndices[prevField] : null,
                        dataType = itemsToSort.length ? gridState[gridId].columns[prevColIdx].type : null;
                    if (!itemsToSort.length || comparator(dataTypeValueNormalizer(dataType, prevVal), dataTypeValueNormalizer(dataType, gridData[i][0][prevField]), booleanOps.strictEqual))
                        itemsToSort.push(gridData[i]);
                    else {
                        if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                        else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[idx], column.type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[i]);
                    }
                    if (i === gridData.length - 1)
                        sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[idx], column.type || 'string'));
                });
                gridData = sortedGridData;
            }
        });
        return gridData;
    }

    function mergeSort(data, sortObj, type) {
        if (data.length < 2) return data;
        var middle = parseInt(data.length / 2);
        return merge(mergeSort(data.slice(0, middle), sortObj, type), mergeSort(data.slice(middle, data.length), sortObj, type), sortObj, type);
    }

    function merge(left, right, sortObj, type) {
        if (!left.length) return right;
        if (!right.length) return left;

        var operator = sortObj.sortDirection === 'asc' ? booleanOps.lessThanOrEqual : booleanOps.greaterThanOrEqual;
        if (comparator(dataTypeValueNormalizer(type, left[0][0][sortObj.field]), dataTypeValueNormalizer(type, right[0][0][sortObj.field]), operator))
            return [[cloneGridData(left[0][0]), left[0][1]]].concat(merge(left.slice(1, left.length), right, sortObj, type));
        else  return [[cloneGridData(right[0][0]), right[0][1]]].concat(merge(left, right.slice(1, right.length), sortObj, type));
    }

    function dataTypeValueNormalizer(dataType, val) {
        if (val == null) return val;
        switch(dataType) {
            case 'time':
                var value = getNumbersFromTime(val);
                if (val.indexOf('PM') > -1) value[0] += 12;
                return convertTimeArrayToSeconds(value);
            case 'datetime':
                var re = new RegExp(dataTypes['datetime']),
                    execVal1;
                if (re.test(val)) {
                    execVal1 = re.exec(val);

                    var dateComp1 = execVal1[2],
                        timeComp1 = execVal1[42];
                    timeComp1 = getNumbersFromTime(timeComp1);
                    if (timeComp1[3] && timeComp1[3] === 'PM')
                        timeComp1[0] += 12;
                    dateComp1 = new Date(dateComp1);
                    return dateComp1.getTime() + convertTimeArrayToSeconds(timeComp1);
                }
                else return 0;
            case 'number':
                return parseFloat(val);
            case 'date':
                return new Date(val);
            case 'boolean':
            default:
                return val.toString();
        }
    }

    /**
     * Calls all registered event handlers for a collection of events
     * @param {Array} events - A collection of events to
     * @param {Object} context - An object, array, or function to set as the context of the event handler
     * @param  {Object} param - An object that contains metadata about the event
     */
    function callGridEventHandlers(events, context, param) {
        if (events.length) {
            events.forEach(function callEventHandlers(fn) {
                fn.call(context, param);
            });
        }
    }

    /**
     * Formats the text in a grid cell - uses both column formats and column templates if provided
     * @param {Object} column - The column object of the grid config
     * @param {string|number} value - The value to be formatted
     * @returns {string|number} - Returns a formatted value if a column format and/or template were provided;
     * otherwise, returns the value
     */
    function getFormattedCellText(column, value) {
        var text,
            type = column.type || 'string';
        if (value == null || ('' === value && column.nullable)) return column.nullable ? null : ' ';
        switch(type) {
            case 'number':
                text = numberFormatter(value.toString(), column.format);
                break;
            case 'date':
                text = formatDate(value, column.format);
                break;
            case 'time':
                text = formatTime(value, column);
                break;
            case 'datetime':
                var re = new RegExp(dataTypes['datetime']),
                    execVal = re.exec(value),
                    timeText = formatTime(execVal[42], column),
                    dateComp = new Date(execVal[2]),
                    dateFormat = column.format || 'mm/dd/yyyy hh:mm:ss';
                dateFormat = dateFormat.substring(0, (dateFormat.indexOf(' ') || dateFormat.indexOf('T')));
                text = dateFormat.replace('dd', dateComp.getUTCDate().toString())
                        .replace('mm', (dateComp.getUTCMonth() + 1).toString())
                        .replace('yyyy', dateComp.getUTCFullYear().toString()) + ' ' + timeText;
                break;
            case 'string':
            case 'boolean':
                text = value;
                break;
            default:
                text = value;
        }

        var template = column.template;
        if (template && text !== '') {
            if (typeof template === jsTypes.function)
                return template.call(column, text);
            else if (typeof template === jsTypes.string)
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
            minutes = timeGroups[3] || '00';
            seconds = timeGroups[4]  || '00';
            meridiem = timeGroups[5].replace(' ', '') || null;
        }
        else if (timeGroups[6]) {
            minutes = timeGroups[8] || '00';
            seconds = timeGroups[9] || '00';
        }
        else{
            minutes = '00';
            seconds = '00';
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
        var hourVal = parseInt(timeArray[0].toString()) === 12 || parseInt(timeArray[0].toString()) === 24 ? parseInt(timeArray[0].toString()) - 12 : parseInt(timeArray[0]);
        return 3660 * hourVal + 60 * parseInt(timeArray[1]) + parseInt(timeArray[2]);
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
     * Exports data from grid based on user's selection (current page data, all data, or selection data if the grid is selectable is turned on)
     * @param {number} gridId - The id of the grid DOM instance
     * @param {string} option - The export option selected by the user
     */
    function exportDataAsExcelFile(gridId, option) {
        if (excelExporter && typeof excelExporter.createWorkBook === jsTypes.function) {
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
                selectedData.forEach(function _constructObjects(item, idx) {
                    if (!data.length || currentRow !== item.rowIndex) {
                        var tmpObj = {};
                        tmpObj[item.field] = selectedData[idx].data;
                        data.push(tmpObj);
                        currentRow = selectedData[idx].rowIndex;
                    }
                    else data[data.length - 1][item.field] = item.data;
                });
                callback({ data: data, columns: columns});
                break;
            case 'all':
                if (typeof gridState[gridId].dataSource.get === jsTypes.function && gridState[gridId].dataSource.rowCount > gridState[gridId].pageSize) {
                    gridState[gridId].dataSource.get(createExcelRequestObject(gridId), function excelDataCallback(response) {
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
        return gridState[gridId].columns.filter(function _returnDisplayedColumns(col) {
            return !col.isHidden;
        });
    }

    function createExcelRequestObject(gridId) {
        var gridData = gridState[gridId],
            requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        if (gridData.filterable) requestObj.filters = gridData.filters.filterGroup && gridData.filters.filterGroup.length? gridData.filters : { conjunct: null, filterGroup: [] };
        if (gridData.groupable) requestObj.groupedBy = gridData.groupedBy.length? gridData.groupedBy : [];

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
        datetime: '^(((?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\4|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\7))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\10)|(?:(29|30)(\\/|-|\\.)' +
        '(0?[1,3-9]|1[0-2])\\13)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\17)|(?:(29)(\\/|-|\\.)(0?2))\\20)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
        '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\24|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\27)' +
        '((?:1[6-9]|[2-9]\\d)?\\d{2}))))|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\31)(29))))' +
        '|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)(?:(?:(?:(0?[13578]|1[02])\\35(31))|(?:(0?[1,3-9]|1[0-2])\\35(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\35(0?[1-9]|1\\d|2[0-8])))))' +
        '(?: |T)((0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\44([0-5]\\d))?)?(?:(\\ [AP]M))$|([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\49([0-5]\\d))?)$))',
        dateChar: '\\d|\\-|\\/|\\.',
        dateTimeChar: '[\\d\\.:\\sAMP\\-\\/]'
    };

    events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

    aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

    /**
     * Given a time of day value, will return the value formatted as specified for a given column of the grid
     * @param {string} time - A string representing a time of day (eg '9:45:56 AM' or '17:36:43.222')
     * @param {Object} column - The column object of the grid config
     * @returns {string} - Returns the time formatted as specified for the given grid column
     */
    function formatTime(time, column) {
        var timeArray = getNumbersFromTime(time),
            formattedTime,
            format = column.format || 'hh:mm:ss',
            timeFormat = column.timeFormat || '24';

        if (timeArray.length < 2) return '';

        if (~format.indexOf(' ') || ~format.indexOf('T')) {
            var dateIdxEnd = ~format.indexOf(' ') ? format.indexOf(' ') : format.indexOf('T');
            format = format.substring(dateIdxEnd + 1, format.length);
        }

        if (timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
            timeArray[0] = timeArray[0] === '12' ? '00' : (parseInt(timeArray[0]) + 12).toString();
        else if (timeFormat === '12' && parseInt(timeArray[0]) > 12) {
            timeArray[0] = (parseInt(timeArray[0]) - 12).toString();
            timeArray[3] = 'PM';
        }
        else if (timeFormat === '12' && timeArray.length < 4)
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
    function formatDate(date, format) {
        if (!format) return date;
        var parseDate = Date.parse(date);
        var jsDate = new Date(parseDate);
        if (!isNaN(parseDate) && format)
            return format.replace('mm', (jsDate.getUTCMonth() + 1).toString()).replace('dd', jsDate.getUTCDate().toString()).replace('yyyy', jsDate.getUTCFullYear().toString());
        else if (!isNaN(parseDate))
            return new Date(jsDate);
        return '';
    }

    function numberFormatter(num, format) {
        if (!format) return num;
        if (/[CPN]/.test(format.toUpperCase())) return createStandardNumberFormat(num, format);
        format = format.replace(/[^0#,.]/g , '');
        var formatDecimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length,
            formatWholeNums = ensureCorrectFormat(/(0+#+)/g, format.substring(0, formatDecimalIndex).replace(',', '')),
            formatDecimals = ensureCorrectFormat(/(#+0+)/g, format.substring(formatDecimalIndex + 1, format.length));
        num = (roundNumber(+num, formatDecimals.length)).toString();
        var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length,
            dataWholeNums = num.substring(0, dataDecimalIndex).split(''),
            dataDecimalNums = num.substring(dataDecimalIndex + 1, num.length).split('');

        var wholeNums = createFormattedNumber(shoreLengths(formatWholeNums, dataWholeNums), dataWholeNums);
        if (~format.indexOf(',')) wholeNums = numberWithCommas(wholeNums);
        if (formatDecimalIndex < format.length) return wholeNums + '.' + createFormattedNumber(formatDecimals, dataDecimalNums);
        return wholeNums;
    }

    function createFormattedNumber(format, num) {
        return format.split('').reverse().map(function _createFormattedNumber(char, idx) {
            if (char === '0') return num[format.length - idx - 1] || char;
            return num[format.length - idx - 1] || '';
        }).reverse().join('');
    }

    function shoreLengths(format, num) {
        if (format.length < num.length) format = format.split('').reverse().concat('#'.repeat(num.length - format.length)).reverse().join('');
        else if (num.length < format.length) format = format.substring((format.length - num.length), format.length);
        return format;
    }

    function createStandardNumberFormat(num, format) {
        var numDecimals = format.length > 1 ? format.toUpperCase().replace(/[CPN]/, '') : 2;
        if (~format.toUpperCase().indexOf('P'))
            num = x100(+num).toString();
        num = (roundNumber(num, numDecimals)).toString();
        var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length,
            wholeNums = num.substring(0, dataDecimalIndex);
        numDecimals = isInteger(+numDecimals) ? +numDecimals : 0;

        if (numDecimals) {
            var decimals = num.substring(dataDecimalIndex + 1, num.length);
            decimals = isInteger(+decimals) ? decimals : '0';
            return numberWithCommas(wholeNums) + '.' + decimals.toString().substring(0, numDecimals).concat('0'.repeat((numDecimals - decimals.length) > 0 ? numDecimals - decimals.length : 0));
        }
        else return numberWithCommas(wholeNums);
    }

    function ensureCorrectFormat(pattern, format) {
        var matches;
        if (matches = format.match(pattern)) {
            matches.forEach(function _replace(match) {
                format = format.replace(match, '0'.repeat(match.length));
            });
        }
        return format;
    }

    function numberWithCommas(num) {
        return num.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
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
        if (gridData == null || typeof (gridData) !== jsTypes.object)
            return gridData;

        if (Object.prototype.toString.call(gridData) === '[object Array]')
            return cloneArray(gridData);

        var temp = {};
        Object.keys(gridData).forEach(function _cloneGridData(field) {
            temp[field] = cloneGridData(gridData[field]);
        });
        return temp;
    }

    /**
     * Copies the contents of an array into a new array instance
     * @param {Array} arr - The array to be copied
     * @returns {Array} - Returns a new array instance containing the values in the original
     */
    function cloneArray(arr) {
        var length = arr.length,
            newArr = new arr.constructor(length),
            index = -1;
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
        return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === jsTypes.object;
    }

    /**
     * Checks that a given variable is a number and not NaN
     * @param {number} value - The number that is being checked
     * @returns {boolean} Returns true if the value is a number, false if not
     */
    function isNumber(value) {
        return typeof value === jsTypes.number && value === value;
    }

    function isInteger(value) {
        return isNumber(value) && value % 1 === 0;
    }

    //===================================       Grid Data Store         ===================================//
    dataStore = (function _createDataStore() {
        var mutators = {
                getter: 0,
                setter: 1,
                getterSetter: 2
            },
            configConfigs = {
                groupAggregates: mutators.getterSetter,
                aggregates: mutators.getterSetter,
                dataSource: {
                    data: mutators.getterSetter,
                    rowCount: mutators.getterSetter
                },
                originalData: mutators.getterSetter,
                dataMap: mutators.getterSetter,
                events: {
                    beforeCellEdit: mutators.getterSetter,
                    cellEditChange: mutators.getterSetter,
                    afterCellEdit: mutators.getterSetter,
                    pageRequested: mutators.getterSetter,
                    beforeDataBind: mutators.getterSetter,
                    afterDataBind: mutators.getterSetter,
                    columnReorder: mutators.getterSetter
                },
                pageNum: mutators.getterSetter,
                currentEdit: mutators.getterSetter,
                pageRequest: mutators.getterSetter,
                putRequest: mutators.getterSetter,
                resizing: mutators.getterSetter,
                sortedOn: mutators.getterSetter,
                basicFilters: mutators.getterSetter,
                advancedFilters: mutators.getterSetter,
                groupedBy: mutators.getterSetter,
                gridAggregations: mutators.getterSetter
            };

        var store = {},
            _dataStore = {
                initializeInstance: function _addInstance(config, gridElem) {
                    var id = generateId();
                    store[id] = {
                        state: {},
                        instance: {}
                    };

                    store[id].state.height = config.height || 400;
                    store[id].state.useValidator = config.useValidator === true && window.validator && typeof window.validator.setAdditionalEvents === jsTypes.function;
                    if (store[id].state.useValidator) validator.setAdditionalEvents(['blur', 'change']);
                    store[id].state.userFormatter = config.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === jsTypes.function;
                    store[id].state.sortable = config.sortable || false;
                    store[id].state.reorderable = config.reorderable || false;
                    store[id].state.resizable = config.resizable || false;
                    store[id].state.groupable = config.groupable || false;
                    store[id].state.selectable = config.selectable || false;
                    store[id].state.groupAggregates = config.groupAggregates || false;
                    store[id].state.excelExport = config.excelExport || false;
                    store[id].state.columnToggle = config.columnToggle || false;
                    store[id].state.rows = config.rows || {};
                    store[id].state.advancedFiltering = config.filterable ? config.advancedFiltering : false;
                    store[id].state.pagingOptions = config.pagingOptions || null;
                    store[id].state.drillDown = config.drillDown || undefined;
                    store[id].state.aggregate = config.aggregates || {};
                    store[id].state.pageNum = 1;
                    store[id].state.pageSize = config.pageSize || 25;
                    store[id].state.grid = gridElem;
                    store[id].state.grid[0].grid = {};
                    store[id].state.currentEdit = {};
                    store[id].state.pageRequest = {};
                    store[id].state.putRequest = {};
                    store[id].state.resizing = false;
                    store[id].state.sortedOn = [];
                    store[id].state.basicFilters = {conjunct: 'and', filterGroup: null};
                    store[id].state.advancedFilters = {};
                    store[id].state.filters = {};
                    store[id].state.groupedBy = [];
                    store[id].state.gridAggregations = {};
                    store[id].state.parentGridId = config.parentGridId != null ? config.parentGridId : null;

                    if (typeof store[id].state.advancedFiltering === jsTypes.object) {
                        store[id].state.advancedFiltering.groupsCount = isInteger(store[id].state.advancedFiltering.groupsCount) ? store[id].state.advancedFiltering.groupsCount : 5;
                        store[id].state.advancedFiltering.filtersCount = isInteger(store[id].state.advancedFiltering.filtersCount) ? store[id].state.advancedFiltering.filtersCount : 10;
                    }

                    //TODO: should update this to accept a single function as well and wrap them in an array
                    store[id].state.events = {
                        beforeCellEdit: typeof config.beforeCellEdit === jsTypes.object && config.beforeCellEdit.constructor === Array ? config.beforeCellEdit : [],
                        cellEditChange: typeof config.cellEditChange === jsTypes.object && config.cellEditChange.constructor === Array ? config.cellEditChange : [],
                        afterCellEdit: typeof config.afterCellEdit === jsTypes.object && config.afterCellEdit.constructor === Array ? config.afterCellEdit : [],
                        pageRequested: typeof config.pageRequested === jsTypes.object && config.pageRequested.constructor === Array ? config.pageRequested : [],
                        beforeDataBind: typeof config.beforeDataBind === jsTypes.object && config.beforeDataBind.constructor === Array ? config.beforeDataBind : [],
                        afterDataBind: typeof config.afterDataBind === jsTypes.object && config.afterDataBind.constructor === Array ? config.afterDataBind : [],
                        columnReorder: typeof config.columnReorder === jsTypes.object && config.columnReorder.constructor === Array ? config.columnReorder : []
                    };

                    Object.keys(store[id].state.events).forEach(function setEvtHandlers(evt) {
                        store[id].state.events[evt] = store[id].state.events[evt].filter(function mapEventsCallback(fn) {
                            if (typeof fn == 'function') return fn;
                        });
                    });

                    store[id].state.columns = cloneGridData(config.columns);
                    store[id].state.columnIndices = {};
                    store[id].state.columns = store[id].state.columns.forEach(function _createColumnIndices(col, idx) {
                        config.columnIndices[col.field] = idx;
                    });
                    store[id].state.dataSource = {
                        rowCount: config.dataSource.rowCount || 25
                    };
                    store[id].state.originalData = {};
                    this.createInstanceMutators(id);
                    this.createInstanceMethods(id, store[id].instance);
                },
                getGridInstance: function _getGridInstance(id) {
                    //TODO: remove this call to destroy grid instance when complete.... need now for linter to stop being a bitch
                    this.destroyGridInstance(id);
                    return store[id].instance;
                },
                destroyGridInstance: function _destroyGridInstance(id) {
                    store[id].state.grid.children().each(function _removeChildrenFromDOM(child) {
                        $(child).remove();
                    });
                    var gridElem = store[id].state.grid;
                    delete store[id];
                    return gridElem;
                },
                getProperty: function _getProperty(nameSpace, property, id) {
                    var loc = store[id].state.concat(nameSpace.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
                        if (typeof prev[curr] !== jsTypes.object && typeof prev[curr] !== jsTypes.function) return false;
                        return prev[curr];
                    });

                    if (loc) return loc[property];
                    return false;
                },
                createInstanceMethods: function _createInstanceMethods(id, instance) {
                    instance.getProperty = function _getProperty(property) {
                        var prop;
                        if (store[id].state[property] !== undefined) prop = cloneGridData(store[id].state[property]);
                        return prop;
                    };

                    instance.setProperty = function _setProperty(property, value) {
                        value = cloneGridData(value);
                        if (!store[id].state[property]) store[id].state[property] = value;
                        else if (checkTypes(store[id].state[property], value)) {
                            store[id].state[property] = value;
                            return true;
                        }
                        return false;
                    };

                    //TODO: not sure if this is something I want to run every time a property is updated on instance state...
                    //TODO: could be times when property needs to be updated, but type should change; maybe allow a flag param
                    function checkTypes(standard, value) {
                        if (value == null || typeof value !== jsTypes.object || typeof value !== jsTypes.function)
                            return typeof value === typeof standard;
                        else if (typeof standard !== jsTypes.object && typeof standard !== jsTypes.function)
                            return false;
                        return Object.keys(value).every(function _verifyAllTypes(prop) {
                            return checkTypes(standard[prop], value[prop]);
                        });
                    }
                },
                createInstanceMutators: function _createInstanceMutators(instanceId) {
                    var state = store[instanceId].state,
                        instance = store[instanceId].instance;
                    Object.keys(state).forEach(function _createMutators(prop) {
                        Object.defineProperty(
                            instance,
                            prop, {
                                configurable: prop in configConfigs,
                                get: function _get() {
                                    return instance[prop];
                                }
                            }
                        );
                        if (prop in configConfigs) {
                            Object.defineProperty(
                                instance,
                                prop, {
                                    set: function _set(val) {
                                        if (!testNestedValues(instance[prop], val)) return false;
                                        instance[prop] = val;
                                    }
                                }
                            );
                        }
                    });

                    function createNewProperty(prop, val) {
                        var parentObj = null;
                        function on(prop) {
                            var loc = state.concat(prop.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
                                if (typeof prev[curr] !== jsTypes.object && typeof prev[curr] !== jsTypes.function) return false;
                                return prev[curr];
                            });

                            if (loc !== undefined || (typeof loc !== jsTypes.object && typeof loc !== jsTypes.function))  parentObj = loc;
                            else parentObj = false;
                            return {
                                withInstanceMutators: withInstanceMutators
                            };
                        }

                        function withInstanceMutators(accessors) {
                            if (parentObj === false) return false;
                            parentObj = parentObj || state;
                            if (parentObj[prop] !== undefined) return false;
                            parentObj[prop] = val;
                            Object.defineProperty(
                                instance,
                                prop, {
                                    configurable: !accessors || accessors === mutators.getterSetter,
                                    get: function _get() {
                                        return parentObj[prop];
                                    }
                                }
                            );

                            if (accessors === mutators.getterSetter) {
                                Object.defineProperty(
                                    instance,
                                    prop, {
                                        configurable: false,
                                        set: function _set(val) {
                                            parentObj[prop] = val;
                                        }
                                    }
                                );
                            }

                            return true;
                        }

                        return {
                            on: on,
                            withInstanceMutators: withInstanceMutators
                        };
                    }

                    Object.defineProperty(
                        instance,
                        'createNewProperty', {
                            writable: false,
                            configurable: false,
                            value: createNewProperty
                        }
                    );

                    return instance;
                }
            };

        function testNestedValues(standard, obj) {
            if (typeof obj !== jsTypes.object) return obj;
            return Object.keys(obj).every(function ensureTypeCorrectness(prop) {
                if (typeof standard[prop] === jsTypes.object && typeof obj[prop] === jsTypes.object)
                    return testNestedValues(standard[prop], obj[prop]);
                else if (standard[prop] && typeof standard[prop] !== typeof obj[prop])
                    return false;
                return true;
            });
        }

        return Object.create(_dataStore);
    })();

    //===================================       expression parser       ===================================//
    expressionParser = (function _expressionParser() {
        var stack = {
            init: function _init() {
                this.data = [];
                this.top = 0;
            },
            push: function _push(item) {
                this.data[this.top++] = item;
            },
            pop: function _pop() {
                return this.data[--this.top];
            },
            peek: function _peek() {
                return this.data[this.top - 1];
            },
            clear: function _clear() {
                this.top = 0;
            },
            length: function _length() {
                return this.top;
            }
        },
            associativity = { RTL: 1, LTR: 2 },
            booleanExpressionTree = {
            init: function _init() {
                this.tree = null;
                this.context = null;
                this.rootNode = null;
                return this;
            }
        };

        booleanExpressionTree.setTree = function _setTree(tree) {
            this.queue = tree;
            this.rootNode = tree[this.queue.length - 1];
            return this;
        };
        booleanExpressionTree.createTree = function _createTree() {
            this.queue.pop();
            if (this.queue.length)
                this.rootNode.addChildren(this.queue);
        };
        booleanExpressionTree.filterCollection = function _filterCollection(collection) {
            var dataMap = [];
            return {
                filteredData: collection.filter(function collectionFilter(curr, idx) {
                    this.context = curr;
                    var isTrue = this.rootNode.evaluate();
                    if (isTrue) dataMap.push(idx);
                    return this.rootNode.value;
                }, this),
                filteredDataMap: dataMap
            };
        };
        booleanExpressionTree.internalGetContext = function _internalGetContext() {
            return this.context;
        };
        booleanExpressionTree.getContext = function _getContext() {
            return this.internalGetContext.bind(this);
        };
        booleanExpressionTree.isTrue = function _isTrue(item) {
            this.context = item;
            return this.rootNode.value;
        };

        var astNode = {
            createNode: function _createNode(node) {
                var operatorCharacteristics = getOperatorPrecedence(node);
                if (operatorCharacteristics) {
                    this.operator = node;
                    this.numberOfOperands = getNumberOfOperands(this.operator);
                    this.precedence = operatorCharacteristics.precedence;
                    this.associativity = operatorCharacteristics.associativity;
                    this.children = [];
                }
                else {
                    this.field = node.field;
                    this.standard = node.value;
                    this.operation = node.operation;
                    this.dataType = node.dataType;
                    this.context = null;
                }
                this._value = null;
                this.getContext = null;
                this.queue = null;
            }
        };

        astNode.createTree = function _createTree(queue) {
            this.queue = queue.reverse();
            this.tree = this.queue;
            this.addChildren(this.queue);
        };

        astNode.addChildren = function _addChildren(tree) {
            if (this.children && this.children.length < this.numberOfOperands) {
                var child = tree.pop();
                child.addChildren(tree);
                this.children.push(child);
                child = tree.pop();
                child.addChildren(tree);
                this.children.push(child);
            }
            return this;
        };

        astNode.addChild = function _addChild(child) {
            if (this.children && this.children.length < this.numberOfOperands)
                this.children.push(child);
            return this;
        };

        astNode.evaluate = function _evaluate() {
            if (this.children && this.children.length) {
                switch (this.operator) {
                    case 'or': return this.children[1].evaluate() || this.children[0].evaluate();
                    case 'and': return this.children[1].evaluate() && this.children[0].evaluate();
                    case 'xor': return !!(this.children[1].evaluate() ^ this.children[0].evaluate());
                    case 'nor': return !(this.children[1].evaluate() || this.children[0].evaluate());
                    case 'nand': return !(this.children[1].evaluate() && this.children[0].evaluate());
                    case 'xnor': return !(this.children[1].evaluate() ^ this.children[0].evaluate());
                }
            }
            else {
                this._value = comparator(dataTypeValueNormalizer(this.dataType, this.getContext()[this.field]), dataTypeValueNormalizer(this.dataType, this.standard), this.operation);
                return this._value;
            }
        };

        astNode.getValue = function _getValue() {
            if (this._value == null) this._value = this.evaluate();
            return this._value;
        };

        Object.defineProperty(astNode, 'value', {
            get: function _getValue() {
                if (this._value == null) this._value = this.evaluate();
                return this._value;
            }
        });

        function getNodeContext(bet) {
            return bet.internalGetContext.bind(bet);
        }

        function createFilterTreeFromFilterObject(filterObject) {
            var ret = Object.create(booleanExpressionTree);
            ret.init();
            var operandStack = Object.create(stack);
            operandStack.init();
            var queue = [],
                topOfStack;

            iterateFilterGroup(filterObject, operandStack, queue, getNodeContext(ret));

            while (operandStack.length()) {
                topOfStack = operandStack.peek();
                if (topOfStack.operator !== '(') queue.push(operandStack.pop());
                else operandStack.pop();
            }

            ret.setTree(queue);
            ret.createTree();
            return ret;
        }

        function iterateFilterGroup(filterObject, stack, queue, contextGetter) {
            var conjunction = filterObject.conjunct,
                idx = 0,
                topOfStack;

            while (idx < filterObject.filterGroup.length) {
                if (idx > 0) {
                    var conjunctObj = Object.create(astNode);
                    conjunctObj.createNode(conjunction);
                    pushConjunctionOntoStack(conjunctObj, stack, queue);
                }
                if (filterObject.filterGroup[idx].conjunct) {
                    var paren = Object.create(astNode);
                    paren.createNode('(');
                    stack.push(paren);
                    iterateFilterGroup(filterObject.filterGroup[idx], stack, queue, contextGetter);
                    while (stack.length()) {
                        topOfStack = stack.peek();
                        if (topOfStack.operator !== '(') queue.push(stack.pop());
                        else {
                            stack.pop();
                            break;
                        }
                    }
                }
                else {
                    var leafNode = Object.create(astNode);
                    leafNode.createNode(filterObject.filterGroup[idx]);
                    leafNode.getContext = contextGetter;
                    queue.push(leafNode);
                }
                ++idx;
            }
        }

        function pushConjunctionOntoStack(conjunction, stack, queue) {
            while (stack.length()) {
                var topOfStack = stack.peek();
                if ((conjunction.associativity === associativity.LTR && conjunction.precedence <= topOfStack.precedence) ||
                    (conjunction.associativity === associativity.RTL && conjunction.precedence < topOfStack.precedence))
                    queue.push(stack.pop());
                else
                    break;
            }
            stack.push(conjunction);
        }

        function getNumberOfOperands(operator) {
            switch (operator) {
                case '!':
                    return 1;
                case '(':
                case ')':
                    return 0;
                default:
                    return 2;
            }
        }

        function getOperatorPrecedence(operator) {
            switch (operator) {
                case '!':
                    return { precedence: 1, associativity: associativity.LTR };
                case 'and':
                    return { precedence: 2, associativity: associativity.RTL };
                case 'xor':
                    return { precedence: 3, associativity: associativity.RTL };
                case 'or':
                    return { precedence: 4, associativity: associativity.RTL };
                case '(':
                case ')':
                    return { precedence: null, associativity: null };
                default:
                    return null;
            }
        }

        return {
            createFilterTreeFromFilterObject: createFilterTreeFromFilterObject
        };
    })();

    generateId = (function uid(seed) {
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
            }
        }
    );
})(jQuery);