import { gridState } from './gridState';
import { general_util } from './general_util';
import { copyGridWidth } from './grid_util';
import { headerGenerator } from './headerGenerator';
import { contentGenerator } from './contentGenerator';
import { pagerGenerator } from './pagerGenerator';
import { aggregateGenerator } from './aggregate_generator';

function createGridInstanceFunctions(gridId) {
    var gridConfig = gridState.getInstance(gridId),
        gridElem = gridConfig.grid;

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
                        gridConfig.events[evt] = gridConfig.events[evt].concat(funcs);
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
                    if (general_util.events.includes(evt) && (funcs || (typeof funcs === 'function' || Array.isArray(funcs)))) {
                        if (typeof funcs === 'function') funcs = [funcs];
                        var tmpEvts = [];
                        gridConfig.events[evt] = gridConfig.events[evt].filter(function _unbindEvents(e) {
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
                        gridConfig.events[evt] = tmpEvts;
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
                    general_util.events.forEach(function _removeEventHandlers(evt) {
                        gridConfig.events[evt] = [];
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
                 * @type function
                 * @returns {Array} - The list of events that currently have a handler
                 */
                value: function _getHandledEvents() {
                    return general_util.events.filter(function _findHandledEvents(evt) {
                        return gridConfig.events[evt].length;
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
                 * @type function
                 * @returns {Array} - The list of all events that a handler can be registered for
                 */
                value: function _getAvailableEvents() {
                    return general_util.events;
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
                    var colIdx = gridConfig.columnIndices[col];
                    if (colIdx != null) {
                        gridConfig.columns[colIdx].isHidden = true;
                        var column = gridConfig.grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]'),
                            columnIdx = column.data('index');
                        column.css('display', 'none');
                        gridConfig.grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', 'none');
                        var colGroups = gridConfig.grid.find('colgroup');
                        var group1 = $(colGroups[0]).find('col');
                        var group2 = $(colGroups[1]).find('col');
                        var offset = columnIdx;
                        if (gridConfig.drillDown)
                            ++offset;
                        if (gridConfig.groupedBy)
                            offset += gridConfig.groupedBy.length;
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
                    col = gridConfig.columnIndices[col];
                    if (gridConfig.columns[col] && gridConfig.columns[col].isHidden) {
                        gridConfig.columns[col].isHidden = false;
                        gridConfig.grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', '');
                        gridConfig.grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', '');
                        gridConfig.grid.find('colgroup').append('<col>');
                        headerGenerator.setColWidth(gridConfig, gridConfig.grid);
                        copyGridWidth(gridConfig.grid);
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
                    if (!gridConfig.columnIndices[field]) {
                        for (var i = 0; i < gridConfig.dataSource.data.length; i++) {
                            gridConfig.dataSource.data[i][field] = data[i] ? data[i] : null;
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

                        gridConfig.columns.push(newCol);
                        if (gridConfig.aggregates) gridConfig.aggregates[field] = {
                            type: newCol.type
                        };

                        gridConfig.hasAddedColumn = true;
                        gridConfig.grid.find('.grid-header-wrapper').empty();
                        headerGenerator.createHeaders(gridConfig, gridElem);
                        gridConfig.grid.find('.grid-content-div').empty();
                        //setColWidth(gridState[gridId], gridState[gridId].grid);
                        contentGenerator.createContent(gridConfig, gridConfig.grid);
                        gridConfig.grid.find('.grid-pager-div').empty();
                        pagerGenerator.createPager(gridConfig, gridConfig.grid);
                        aggregateGenerator.createAggregates(gridId);
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
                    Object.keys(gridConfig.dataSource.data[0]).forEach(function _applyNullProps(prop) {
                        if (data[prop] === undefined) data[prop] = null;
                    });
                    gridConfig.originalData.push(cloneGridData(data));   //clone data here for original data
                    gridConfig.dataSource.data.push(cloneGridData(data));    //clone here to keep cloned original data from being updated when data source data is updated
                    gridConfig.dataSource.rowCount++;
                    if (gridConfig.dataSource.dataMap)
                        gridConfig.dataSource.dataMap[gridConfig.dataSource.rowCount] = gridConfig.dataSource.rowCount;
                    gridConfig.pageSize++;
                    gridConfig.grid.find('.grid-content-div').empty();
                    contentGenerator.createContent(gridConfig, gridConfig.grid);
                    gridConfig.grid.find('.grid-pager-div').empty();
                    pagerGenerator.createPager(gridConfig, gridConfig.grid);
                    aggregateGenerator.createAggregates(gridId);
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
                 * @type function
                 * @returns {Object} - The aggregations that are currently in use for this page of the grid
                 */
                value: function _getAggregates() {
                    return gridConfig.gridAggregations;
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
                 * @type function
                 * @param {int} index - The index of the grid page to return the data for.
                 * @returns {Array} - An array with either all grid page data, or a single index's data if a
                 * valid index was passed to the function
                 */
                value: function _getCurrentPageData(index) {
                    var rows = [],
                        result = [],
                        tmpRowModel,
                        validRow;
                    if (typeof index === 'number' && index > -1 && index <= gridConfig.dataSource.data.length) {
                        validRow = findValidRows(index);
                        if (validRow) rows.push(validRow);
                    }
                    else {
                        for (var i = 0; i < gridConfig.pageSize; i++) {
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
                        gridConfig.grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
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
                    if (typeof index === 'number' && index > -1 && index <= gridConfig.dataSource.data.length)
                        return cloneGridData([].concat(gridConfig.dataSource.data[index]));
                    else return cloneGridData(gridConfig.dataSource.data);
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
                        gridConfig.dataSource.data = data;
                        gridConfig.pageSize = data.length;
                        gridConfig.dataSource.rowCount = data.length;
                        gridConfig.grid.find('.grid-content-div').empty();
                        contentGenerator.createContent(gridConfig, gridConfig.grid);
                        gridConfig.grid.find('.grid-pager-div').empty();
                        pagerGenerator.createPager(gridConfig, gridConfig.grid);
                        aggregateGenerator.createAggregates(gridId);
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
                            if (typeof rowData[i].index !== 'number' || rowData[i].index >= gridConfig.dataSource.data.length)
                                continue;
                            gridConfig.dataSource.data[rowData[i].index] = rowData[i].data;
                            appliedUpdate = true;
                        }
                    }
                    else if (typeof rowData.index === 'number') {
                        gridConfig.dataSource.data[rowData.index] = rowData.data;
                        appliedUpdate = true;
                    }

                    if (appliedUpdate) {
                        gridConfig.grid.find('.grid-content-div').empty();
                        contentGenerator.createContent(gridConfig, gridConfig.grid);
                        gridConfig.grid.find('.grid-pager-div').empty();
                        pagerGenerator.createPager(gridConfig, gridConfig.grid);
                        aggregateGenerator.createAggregates(gridId);
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
                        if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > gridConfig.dataSource.data.length)
                            return;
                        var column = gridConfig.columns[gridConfig.columnIndices[cell.field]];
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
                            gridConfig.dataSource.data[cell.index][cell.field] = cell.value;
                            var tableCell;
                            if (gridConfig.groupedBy) {
                                var counter = 0;
                                gridConfig.grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
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
                                tableCell = gridConfig.grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
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
                    gridConfig.grid.children().each(function _removeChildrenFromDOM(child) {
                        $(child).remove();
                    });
                    var gridElem = gridConfig.grid;
                    delete gridConfig;
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

export { createGridInstanceFunctions };