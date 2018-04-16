import { gridState } from './gridState';
import { addValueToAggregations } from './aggregates_util';
import { dataTypeValueNormalizer, getFormattedCellText } from './formatter';
import { general_util } from './general_util';
import { attachValidationListener, saveCellEditData, saveCellSelectData } from './cell_editing';

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
        gridConfig = gridState.getInstance(gridId);
    gridConfig.groupedBy.forEach(function _createGroupedRows(item, idx) {
        //If the current cached value for the same field is different than the current grid's data for the same field,
        //then cache the same value and note the diff.
        if (!currentGroupingValues[item.field] || currentGroupingValues[item.field] !== gridConfig.dataSource.data[rowIndex][item.field]) {
            currentGroupingValues[item.field] = gridConfig.dataSource.data[rowIndex][item.field];
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
    if (foundDiff && rowIndex && gridConfig.groupAggregates) {   //If a diff was found...
        groupedDiff.reverse().forEach(function _findRowDiffs(item, idx) {
            var numItems = gridConfig.groupAggregations[idx]._items_; //...save the current row's number of items...
            if (item) {                               //...if there is a diff at the current row, print it to the screen
                var groupAggregateRow = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                groupedDiff.forEach(function _appendGroupingCells() {
                    groupAggregateRow.append('<td colspan="' + 1 + '" class="grouped_cell"></td>');
                });
                if (gridConfig.drillDown)
                    groupAggregateRow.append('<td colspan="1" class="grouped_cell"></td>');
                gridConfig.columns.forEach(function _createAggregateCells(col) {
                    if (col.field in gridConfig.groupAggregations[idx] && col.field !== '_items_'){
                        groupAggregateRow.append('<td class="group_aggregate_cell">' + (gridConfig.groupAggregations[idx][col.field].text || '') + '</td>');
                    }
                    else
                        groupAggregateRow.append('<td class="group_aggregate_cell"> </td>');
                });
                gridConfig.groupAggregations[idx] = {       //Then reset the current row's aggregate object...
                    _items_: 0
                };
                for (k = idx - 1; k >= 0; k--) {  //...and go backward through the diffs starting from the prior index, and compare the number of items in each diff...
                    if (groupedDiff[k] && gridConfig.groupAggregations[k]._items_ == numItems) {    //...if the number of items are equal, reset that diff as well
                        groupedDiff[k] = 0;
                        gridConfig.groupAggregations[k] = {
                            _items_: 0
                        };
                    }
                }
            }
        });
    }
    groupedDiff.forEach(function _createGroupedAggregates(item, idx) {
        if (gridConfig.groupAggregates) {
            if (gridConfig.groupAggregations && !gridConfig.groupAggregations[idx]) {
                gridConfig.groupAggregations[idx] = { _items_: 0 };
            }
            gridConfig.columns.forEach(function _aggregateValues(col) {
                if (gridConfig.aggregates)
                    addValueToAggregations(gridId, col.field, gridConfig.dataSource.data[rowIndex][col.field], gridConfig.groupAggregations[idx]);
            });
            gridConfig.groupAggregations[idx]._items_++;
        }
        if (groupedDiff[idx]) {
            var groupedText = getFormattedCellText(gridConfig.columns[gridConfig.columnIndices[gridConfig.groupedBy[idx].field]], gridConfig.dataSource.data[rowIndex][gridConfig.groupedBy[idx].field]) ||
                gridConfig.dataSource.data[rowIndex][gridConfig.groupedBy[idx].field];
            var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
            var groupTitle = gridConfig.columns[gridConfig.columnIndices[gridConfig.groupedBy[idx].field]].title || gridConfig.groupedBy[idx].field;
            for (k = 0; k <= idx; k++) {
                var indent = k === idx ? (gridConfig.columns.length + gridConfig.groupedBy.length - k) : 1;
                if (gridConfig.drillDown) ++indent;
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
 * Function used to attach any custom event handlers to each cell of a given column.
 * @param {Object} column - The name of the column in the grid config object
 * @param {Object} cellItem - The td DOM element to apply the handler(s)
 * @param {number} gridId - The id of the grid
 */
function attachCustomCellHandler(column, cellItem, gridId) {
    Object.keys(column.events).forEach(function _attachColumnEventHandlers(evt) {
        if (typeof column.events[evt] === general_util.jsTypes.function) createEventHandler(cellItem, evt, column.events[evt]);
    });

    function createEventHandler(cellItem, eventName, eventHandler) {
        cellItem.on(eventName, function genericEventHandler() {
            var row = $(this).parents('tr'),
                rowIdx = row.index();
            eventHandler.call(this, gridState.getInstance(gridId).dataSource.data[rowIdx]);
        });
    }
}

/**
 * Makes a grid cell editable on a click event. Used for grid cells whose values can be changed and whose column configuration
 * has its editable property set to true
 * @param {number} id - The id of the grid widget instance
 * @param {object} td - The grid cell to attach the click listener to
 */
function makeCellEditable(id, td) {
    td.on('click', function editableCellClickHandler(e) {
        var gridConfig = gridState.getInstance(id),
            gridContent = gridConfig.grid.find('.grid-content-div');
        if (gridConfig.updating) return;
        if (e.target !== e.currentTarget) return;
        if (gridContent.find('.invalid').length) return;
        var cell = $(e.currentTarget);
        if (cell.children('span').hasClass('dirty'))
            cell.data('dirty', true);
        else cell.data('dirty', false);
        cell.text('');

        var row = cell.parents('tr').first(),
            index = gridConfig.grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = cell.data('field'),
            column = gridConfig.columns[gridConfig.columnIndices[field]],
            type = column.type || '',
            val = column.nullable || gridConfig.dataSource.data[index][field] ? gridConfig.dataSource.data[index][field] : '',
            dataAttributes = '',
            gridValidation = gridConfig.useValidator ? column.validation : null,
            dataType, input, inputVal;

        if (gridValidation) {
            dataAttributes = setupCellValidation(gridValidation, dataAttributes);
            var gridBodyId = 'grid-content-' + id.toString();
            dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
        }

        if (gridConfig.useFormatter && column.inputFormat)
            dataAttributes += ' data-inputformat="' + column.inputFormat + '"';

        switch (type) {
            case 'boolean':
                input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                val = typeof gridConfig.dataSource.data[index][field] === general_util.jsTypes.string ? gridConfig.dataSource.data[index][field] === 'true' : !!val;
                input[0].checked = val;
                dataType = 'boolean';
                break;
            case 'number':
                if (typeof gridConfig.dataSource.data[index][field] === general_util.jsTypes.string)
                    val = general_util.isNumber(general_util.parseFloat(gridConfig.dataSource.data[index][field])) ? general_util.parseFloat(gridConfig.dataSource.data[index][field]) : 0;
                else
                    val = general_util.isNumber(gridConfig.dataSource.data[index][field]) ? gridConfig.dataSource.data[index][field] : 0;
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
        callGridEventHandlers(gridConfig.events.beforeCellEdit, gridConfig.grid, null);
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
        var gridConfig = gridState.getInstance(id),
            gridContent = gridConfig.grid.find('.grid-content-div');
        if (e.target !== e.currentTarget) return;
        if (gridContent.find('.invalid').length) return;
        var cell = $(e.currentTarget);
        if (cell.children('span').hasClass('dirty'))
            cell.data('dirty', true);
        else cell.data('dirty', false);
        cell.text('');
        var row = cell.parents('tr').first(),
            index = gridConfig.grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = cell.data('field');
        if (gridConfig.updating) return;     //can't edit a cell if the grid is updating

        var column = gridConfig.columns[gridConfig.columnIndices[field]],
            value = gridConfig.dataSource.data[index][field],
            gridValidation = gridConfig.useValidator ? column.validation : null,
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
            if (comparator(normalizedValue, dataTypeValueNormalizer(dataType, opt), general_util.booleanOps.strictEqual))
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
        callGridEventHandlers(gridConfig.events.beforeCellEdit, gridConfig.grid, null);
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
 * Applies a click handler to each cell of a drill down column to expand/collapse the parent row.
 * When clicked the first time, the new drill down grid will be created. Following time will
 * simple show/hide the elements.
 * @param {number} gridId - The id of the parent grid.
 */
function attachDrillDownAccordionHandler(gridId) {
    var gridConfig = gridState.getInstance(gridId);
    gridConfig.grid.find('.drillDown_span').on('click', function drillDownAccordionHandler() {
        var accRow = $(this).parents('tr'),
            accRowIdx = gridConfig.grid.find('.data-row').not('.drill-down-row').index(accRow);
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
                if (gridConfig.groupedBy && gridConfig.groupedBy.length) {
                    for (var i = 0; i < gridConfig.groupedBy.length; i++) {
                        drillDownRow.append('<td class="grouped_cell"></td>');
                    }
                }
                drillDownRow.append('<td class="grouped_cell"></td>');
                var drillDownCellLength = 0;
                gridConfig.grid.find('.grid-header-div').find('col').each(function getTotalGridLength() {
                    if (!$(this).hasClass('drill_down_col') && !$(this).hasClass('groupCol'))
                        drillDownCellLength += $(this).width();
                });
                var containerCell = $('<td class="drill-down-cell" colspan="' + gridConfig.columns.length + '" style="width: ' + drillDownCellLength + ';"></td>').appendTo(drillDownRow),
                    newGridId = gridConfig.grid[0].id + generateId(),
                    gridDiv = $('<div id="' + newGridId + '" class="drill_down_grid"></div>').appendTo(containerCell);
                accRow.find('.drillDown_span').data('state', 'open');
                var parentRowData = gridConfig.grid[0].grid.getCurrentDataSourceData(accRowIdx);

                if (typeof gridConfig.drillDown === general_util.jsTypes.function) {
                    drillDownCreate(gridConfig.drillDown(accRowIdx, parentRowData[0]), gridDiv[0], gridId);
                }
                else if (typeof gridConfig.drillDown === general_util.jsTypes.object) {
                    if (!gridConfig.drillDown.dataSource) gridConfig.drillDown.dataSource = {};
                    gridConfig.drillDown.dataSource.data = parentRowData[0].drillDownData;
                    gridConfig.drillDown.dataSource.rowCount = parentRowData[0].drillDownData ? parentRowData[0].drillDownData.length : 0;
                    drillDownCreate(gridConfig.drillDown, gridDiv[0], gridId);
                }
            }
        }
    });
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

var content_util = {
    attachTableSelectHandler: attachTableSelectHandler,
    createGroupedRows: createGroupedRows,
    attachCustomCellHandler: attachCustomCellHandler,
    makeCellEditable: makeCellEditable,
    makeCellSelectable: makeCellSelectable,
    createGroupTrEventHandlers: createGroupTrEventHandlers,
    attachDrillDownAccordionHandler: attachDrillDownAccordionHandler
};

export { content_util };