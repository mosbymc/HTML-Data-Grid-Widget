import { copyGridWidth } from "./grid_util";
import { dominator } from './dominator';
import { general_util } from './general_util';
import { dataTypeValueNormalizer, getFormattedCellText } from './formatter';
import { gridState } from "./gridState";
import { attachValidationListener, saveCellEditData, saveCellSelectData } from './cell_editing';
import { callGridEventHandlers, comparator } from './grid_util';
import { aggregateGenerator } from './aggregate_generator';
import { attachTableSelectHandler } from './table_selection';

var contentGenerator = {
    createContent: function _createContent(gridConfig) {
        var gridElem = dominator(gridConfig.grid),
            gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = dominator({ type: 'table', id: gridElem.attributes('id') + '_content', styles: [{ name: height, value: 'auto' }] }).appendTo(gridContent),
            colGroup = dominator({ type: 'colgroup' }).appendTo(contentTable),
            contentTBody = dominator({ type: 'tbody' }).appendTo(contentTable),
            text;

        contentTBody.css('width', 'auto');

        /*
        var gridElem = gridConfig.grid,
            gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
            colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
            contentTBody = $('<tbody></tbody>').appendTo(contentTable),
            text;
        */
        //contentTBody.css('width', 'auto');
        if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && gridConfig.selectable) attachTableSelectHandler(contentTBody);

        var rows = gridConfig.rows,
            currentGroupingValues = {};

        if (gridConfig.groupAggregates) gridConfig.groupAggregations = {};

        if (gridConfig.dataSource.data.length) {
            gridConfig.dataSource.data.forEach(function _createGridContentRows(item, idx) {
                if (gridConfig.groupedBy && gridConfig.groupedBy.length) contentGenerator.createGroupedRows(id, idx, currentGroupingValues, contentTBody);

                var tr = dominator({ type: 'tr', classes: ['data-row'] }).appendTo(contentTBody);
                //var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
                if (typeof gridConfig.parentGridId === general_util.jsTypes.number) tr.addClass('drill-down-row');
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

                if (gridConfig.groupedBy.length) {
                    gridConfig.groupedBy.forEach(function _appendGroupingCells() {
                        tr.append({ type: 'td', classes: ['grouped_cell'], text: '&nbsp' });
                        //tr.append('<td class="grouped_cell">&nbsp</td>');
                    });
                }

                if (gridConfig.drillDown) {
                    tr.append(dominator({ type: 'td', classes: ['drillDown_cell'] }).append(dominator({ type: 'span', classes: ['drillDown_span'] })
                        .append({ type: 'a', classes: ['drillDown-asc', 'drillDown_acc'] })));
                    //tr.append('<td class="drillDown_cell"><span class="drillDown_span" data-state="closed"><a class="drillDown-asc drillDown_acc"></a></span></td>');
                }

                gridConfig.columns.forEach(function _createGridCells(col) {
                    var td = dominator({ type: 'td', classes: ['grid-content-cell'], data: [{ name: 'field', value: col.field }] }).appendTo(tr);
                    //var td = $('<td data-field="' + col.field + '" class="grid-content-cell"></td>').appendTo(tr);
                    if (col.attributes && col.attributes.cellClasses && col.attributes.cellClasses.constructor === Array) {
                        col.attributes.cellClasses.forEach(function _addColumnClasses(className) {
                            td.addClass(className);
                        });
                    }
                    if (col.type !== 'custom') {
                        text = getFormattedCellText(col, item[col.field]) || item[col.field];
                        text = text == null ? 'Null' : text;
                        //TODO: figure out how to make this work
                        td.text(text);
                    }
                    else {
                        td = col.html ? $(col.html).appendTo(td) : td;
                        if (col.class)
                            td.addClass(col.class);
                        if (col.text) {
                            var customText;
                            if (typeof col.text === general_util.jsTypes.function) {
                                col.text(gridConfig.originalData[gridConfig.dataMap[idx]]);
                            }
                            else customText = col.text;
                            td.text(customText);
                        }
                    }

                    if (typeof col.events === general_util.jsTypes.object) {
                        contentGenerator.attachCustomCellHandler(col, td, id);
                    }
                    if (gridConfig.dataSource.aggregates && typeof gridConfig.dataSource.get !== general_util.jsTypes.function) {
                        if (gridConfig.pageRequest.eventType === 'filter' || gridConfig.pageRequest.eventType === undefined)
                            aggregateGenerator.addValueToAggregations(id, col.field, item[col.field], gridConfig.gridAggregations);
                    }
                    //attach event handlers to save data
                    if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && (col.editable && col.editable !== 'drop-down')) {
                        contentGenerator.makeCellEditable(id, td);
                        gridConfig.editable = true;
                    }
                    else if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && (col.editable === 'drop-down')) {
                        contentGenerator.makeCellSelectable(id, td);
                        gridConfig.editable = true;
                    }
                });
            });

            gridConfig.columns.forEach(() => colGroup.append({ type: 'col' }));
            gridConfig.groupedBy.forEach(() => colGroup.prepend({ type: 'col', classes: ['group_col'] }));
            ////gridConfig.columns.forEach(function appendCols() { colGroup.append('<col/>'); });
            //gridConfig.groupedBy.forEach(function _prependCols() { colGroup.prepend('<col class="group_col"/>'); });
            if (gridConfig.drillDown) colGroup.prepend({ type: 'col', classes: ['drill_down_col'] });
            //if (gridConfig.drillDown) colGroup.prepend('<col class="drill_down_col"/>');

            if (gridConfig.dataSource.aggregates && (gridConfig.pageRequest.eventType === 'filter' || gridConfig.pageRequest.eventType === undefined)) {
                dominator(gridConfig.grid).find('.grid-footer-div').remove();
                gridConfig.grid.find('.grid-footer-div').remove();
                aggregateGenerator.createAggregates(id);
            }

            contentGenerator.createGroupTrEventHandlers(id);
            contentGenerator.attachDrillDownAccordionHandler(id);
        }

        gridContent[0].addEventListener('scroll', function contentDivScrollHandler() {
            var headWrap = gridContent.parents('.grid-wrapper').first().find('.grid-header-wrapper'),
                footerWrap = gridContent.parents('.grid-wrapper').first().find('.grid-footer-wrapper');
            if (gridConfig.resizing) return;
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

        gridContent.find('#loader-span_' + id).remove();
        gridConfig.updating = false;
    },

    /**
     * Creates group header rows, pads with extra columns based on number of grouped columns, and calculates/display group aggregatges
     * if option is set
     * @param {number} gridId - The id of the grid widget instance
     * @param {number} rowIndex - The index of the current row in the grid data collection
     * @param {Object} currentGroupingValues - The values currently determining the rows that are grouped
     * @param {Object} gridContent - The DOM table element for the grid's content
     */
    createGroupedRows: function _createGroupedRows(gridId, rowIndex, currentGroupingValues, gridContent) {
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
                    var groupAggregateRow = dominator({ type: 'tr', classes: ['grouped_row_header'] }).appendTo(gridContent);
                    //var groupAggregateRow = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                    groupedDiff.forEach(function _appendGroupingCells() {
                        groupAggregateRow.append({ type: 'td', attributes: [{ name: 'colspan', value: 1 }], classes: ['grouped_cell'] });
                        //groupAggregateRow.append('<td colspan="' + 1 + '" class="grouped_cell"></td>');
                    });

                    if (gridConfig.drillDown) groupAggregateRow.append({ type: 'td', attributes: [{ name: 'colspan', value: 1 }], classes: ['grouped_cell'] });
                    /*
                    if (gridConfig.drillDown)
                        groupAggregateRow.append('<td colspan="1" class="grouped_cell"></td>');
                    */
                    gridConfig.columns.forEach(function _createAggregateCells(col) {
                        if (col.field in gridConfig.groupAggregations[idx] && col.field !== '_items_'){
                            groupAggregateRow.append({ type: 'td', classes: ['group_aggregate_cell'], text: gridConfig.groupAggregations[idx][col.field].text || '' });
                            //groupAggregateRow.append('<td class="group_aggregate_cell">' + (gridConfig.groupAggregations[idx][col.field].text || '') + '</td>');
                        }
                        else
                            groupAggregateRow.append({ type: 'td', classes: ['group_aggregate_cell'] });
                            //groupAggregateRow.append('<td class="group_aggregate_cell"> </td>');
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
                        aggregateGenerator.addValueToAggregations(gridId, col.field, gridConfig.dataSource.data[rowIndex][col.field], gridConfig.groupAggregations[idx]);
                });
                gridConfig.groupAggregations[idx]._items_++;
            }
            if (groupedDiff[idx]) {
                var groupedText = getFormattedCellText(gridConfig.columns[gridConfig.columnIndices[gridConfig.groupedBy[idx].field]], gridConfig.dataSource.data[rowIndex][gridConfig.groupedBy[idx].field]) ||
                    gridConfig.dataSource.data[rowIndex][gridConfig.groupedBy[idx].field];
                var groupTr = dominator({ type: 'tr', classes: ['grouped_row_header'] }).appendTo(gridContent);
                //var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                var groupTitle = gridConfig.columns[gridConfig.columnIndices[gridConfig.groupedBy[idx].field]].title || gridConfig.groupedBy[idx].field;
                for (k = 0; k <= idx; k++) {
                    var indent = k === idx ? (gridConfig.columns.length + gridConfig.groupedBy.length - k) : 1;
                    if (gridConfig.drillDown) ++indent;
                    groupTr.data('group-indent', indent);
                    var groupingCell = dominator({ type: 'tr', attributes: [{ name: 'colspan', value: indent }], classes: ['grouped_cell'] }).appendTo(groupTr);
                    //var groupingCell = $('<td colspan="' + indent + '" class="grouped_cell"></td>').appendTo(groupTr);
                    if (k === idx) {
                        var p = dominator({ type: 'p', classes: ['grouped'], text: groupTitle + ': ' + groupedText })
                            .append({ type: 'a', classes: ['group-desc', 'sortSpan', 'group_acc_link'], data: [{ name: 'state', value: 'open' }] });
                        groupingCell.append(p);
                        //groupingCell.append('<p class="grouped"><a class="group-desc sortSpan group_acc_link" data-state="open"></a>' + groupTitle + ': ' + groupedText + '</p>');
                        break;
                    }
                }
            }
        });
    },

    /**
     * Function used to attach any custom event handlers to each cell of a given column.
     * @param {Object} column - The name of the column in the grid config object
     * @param {Object} cellItem - The td DOM element to apply the handler(s)
     * @param {number} gridId - The id of the grid
     */
    attachCustomCellHandler: function _attachCustomCellHandler(column, cellItem, gridId) {
        Object.keys(column.events).forEach(function _attachColumnEventHandlers(evt) {
            if (typeof column.events[evt] === general_util.jsTypes.function) createEventHandler(cellItem, evt, column.events[evt]);
        });

        function createEventHandler(cellItem, eventName, eventHandler) {
            cellItem.on(eventName, function genericEventHandler() {
                let row = dominator(this).parents('tr'),
                    rowIdx = row.index();
                //var row = $(this).parents('tr'),
                  //  rowIdx = row.index();
                eventHandler.call(this, gridState.getInstance(gridId).dataSource.data[rowIdx]);
            });
        }
    },

    /**
     * Makes a grid cell editable on a click event. Used for grid cells whose values can be changed and whose column configuration
     * has its editable property set to true
     * @param {number} id - The id of the grid widget instance
     * @param {object} td - The grid cell to attach the click listener to
     */
    makeCellEditable: function _makeCellEditable(id, td) {
        td.on('click', function editableCellClickHandler(e) {
            var gridConfig = gridState.getInstance(id),
                grid = dominator(gridConfig.grid),
                //gridContent = gridConfig.grid.find('.grid-content-div');
                gridContent = grid.find('.grid-content-div');
            if (gridConfig.updating) return;
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');

            var row = cell.parents('tr').first(),
                index = grid.find('tr').filter(function removeGroupAndChildRows() {
                    var r =  dominator(this);
                    return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
                }).index(row),
                field = cell.data('field'),
                column = gridConfig.columns[gridConfig.columnIndices[field]],
                type = column.type || '',
                val = column.nullable || gridConfig.dataSource.data[index][field] ? gridConfig.dataSource.data[index][field] : '',
                dataAttributes = '',
                da = [],
                gridValidation = gridConfig.useValidator ? column.validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                da = setupCellValidation2(gridValidation, da);
                var gridBodyId = 'grid-content-' + id.toString();
                da.push({ name: 'valudateon', value: 'blur' });
                da.push({ name: 'offsetHeight', value: '-6' });
                da.push({ name: 'offsetWidth', value: '8' });
                da.push({ name: 'modalid', value: gridBodyId });
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (gridConfig.useFormatter && column.inputFormat)
                da.push({ name: 'inputformat', value: column.inputFormat });
                //dataAttributes += ' data-inputformat="' + column.inputFormat + '"';

            switch (type) {
                case 'boolean':
                    input = dominator({ type: 'input', attributes: [{ name: 'type', value: 'checkbox' }], classes: ['input', 'checkbox', 'active-cell'], data: da }).appendTo(cell);
                    //input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
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
                    input = dominator({ type: 'input', attribute: [{ name: 'type', value: 'text' }, { name: 'value', value: inputVal }],
                        data: da, classes: ['input', 'textbox', 'cell-edit-input', 'active-cell'] }).appendTo(cell);
                    //input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'number';
                    break;
                case 'time':
                    input = dominator({ type: 'input', attributes: [{ name: 'type', value: 'text' }, { name: 'value', value: val }], data: da,
                        classes: ['input', 'textbox', 'cell-edit-input', 'active-cell'] }).appendTo(cell);
                    //input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'time';
                    break;
                case 'date':
                    var dateVal = val == null ? new Date(Date.now()) : new Date(Date.parse(val));
                    inputVal = dateVal.toISOString().split('T')[0];
                    input = dominator({ type: 'input', attributes: [{ name: 'type', value: 'date' }, { name: 'value', value: inputVal }], data: da,
                            classes: ['input', 'textbox', 'active-cell'] }).appendTo(cell);
                    //input = $('<input type="date" value="' + inputVal + '" class="input textbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'date';
                    break;
                default:
                    input = dominator({ type: 'input', attributes: [{ name: 'type', value: 'text' }, { name: 'value', value: val || '' }], data: da,
                            classes: ['input', 'textbox', 'cell-edit-input', 'active-cell'] }).appendTo(cell);
                    //input = $('<input type="text" value="' + (val || '') + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
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
    },

    /**
     * Makes a grid cell selectable on a click event. Used for grid cells whose values can be changed to a limited set
     * or pre-specified values and whose column configuration provided the list of values and has its selectable property set to true
     * @param {number} id - The id of the grid widget instance
     * @param {object} td - The grid cell to attach the click listener to
     */
    makeCellSelectable: function _makeCellSelectable(id, td) {
        td.on('click', function selectableCellClickHandler(e) {
            var gridConfig = gridState.getInstance(id),
                grid = dominator(gridConfig.grid),
                gridContent = grid.find('.grid-content-div');
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = dominator(e.currentTarget);
            //var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');
            var row = cell.parents('tr').first(),
                index = grid.find('tr').filter(function removeGroupAndChildRows() {
                    var r =  dominator(this);
                    return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
                }).index(row),
                field = cell.data('field');
            if (gridConfig.updating) return;     //can't edit a cell if the grid is updating

            var column = gridConfig.columns[gridConfig.columnIndices[field]],
                value = gridConfig.dataSource.data[index][field],
                gridValidation = gridConfig.useValidator ? column.validation : null,
                dataAttributes = '',
                da = [];

            if (gridValidation) {
                da = setupCellValidation2(gridValidation, da);
                var gridBodyId = 'grid-content-' + id.toString();
                da.push({ name: 'validateon', value: 'blur' });
                da.push({ name: 'offsetHeight', value: '-6' });
                da.push({ name: 'offsetWidth', value: '8' });
                da.push({ name: 'modalid', value: gridBodyId });
                //dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }
            var select = dominator({ type: 'select', data: da, classes: ['input', 'select', 'active-cell'] }).appendTo(cell),
            //var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell),
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
                select.append({ type: 'option', attributes: [{ name: 'value', value: option }], text: option });
                //select.append('<option value="' + option + '">' + option + '</option>');
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
    },

    /**
     * Attaches click event handlers for each grouped header row in the grid
     */
    createGroupTrEventHandlers: function _createGroupTrEventHandlers(gridId) {
        dominator(gridState.getInstance(gridId).grid).find('.group_acc_link').on('click', function groupedAccordionsClickListenerCallback() {
            var elem = dominator(this),
                accRow = elem.parents('tr'),
                indent = accRow.data('group-indent');

            elem.toggleClass('group-desc').toggleClass('group-asc');
            elem.data('state', elem.data('state') === 'open' ? 'closed' : 'open');
            accRow.nextAll().forEach(function _iterateAccordionRowSiblings(idx, val) {
                let row = dominator(val),
                    rowIndent = row.data('group-indent');
                if (!rowIndent || rowIndent < indent) row.css('display', elem.data('state') === 'open' ? 'table-row' : 'none');
                else return false;
            });
        });
    },

    /**
     * Applies a click handler to each cell of a drill down column to expand/collapse the parent row.
     * When clicked the first time, the new drill down grid will be created. Following time will
     * simple show/hide the elements.
     * @param {number} gridId - The id of the parent grid.
     */
    attachDrillDownAccordionHandler: function _attachDrillDownAccordionHandler(gridId) {
        var gridConfig = gridState.getInstance(gridId),
            grid = dominator(gridConfig.grid);
        grid.find('.drillDown_span').on('click', function drillDownAccordionHandler() {
            var accRow = dominator(this).parents('tr'),
                accRowIdx = grid.find('.data-row').not('.drill-down-row').index(accRow);
            //var accRow = $(this).parents('tr'),
                //accRowIdx = gridConfig.grid.find('.data-row').not('.drill-down-row').index(accRow);
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
                    var drillDownRow = dominator({ type: 'tr', classes: ['drill-down-parent'] }).insertAfter(accRow);
                    //var drillDownRow = $('<tr class="drill-down-parent"></tr>').insertAfter(accRow);
                    if (gridConfig.groupedBy && gridConfig.groupedBy.length) {
                        for (var i = 0; i < gridConfig.groupedBy.length; i++) {
                            drillDownRow.append({ type: 'td', classes: ['grouped_cell'] });
                            //drillDownRow.append('<td class="grouped_cell"></td>');
                        }
                    }
                    drillDownRow.append({ type: 'td', classes: ['grouped_cell'] });
                    //drillDownRow.append('<td class="grouped_cell"></td>');
                    var drillDownCellLength = 0;
                    grid.find('.grid-header-div').find('col').forEach(function getTotalGridLength() {
                        var t = dominator(this);
                        if (!t.hasClass('drill_down_col') && !t.hasClass('groupCol'))
                            drillDownCellLength += t.css('width');
                        //if (!$(this).hasClass('drill_down_col') && !$(this).hasClass('groupCol'))
                            //drillDownCellLength += $(this).width();
                    });
                    var containerCell = dominator({ type: 'td', attributes: [{ name: 'colspan', value: gridConfig.columns.length }],
                                        classes: ['drill-down-cell'], styles: [{ name: 'width', value: drillDownCellLength }] }).appendTo(drillDownRow),
                        gridDiv = dominator({ type: 'div', id: gridConfig.grid.id + gridState.generateId(), classes: ['drill_down_grid'] }).appendTo(containerCell);
                    //var containerCell = $('<td class="drill-down-cell" colspan="' + gridConfig.columns.length + '" style="width: ' + drillDownCellLength + ';"></td>').appendTo(drillDownRow),
                        //newGridId = gridConfig.grid[0].id + generateId(),
                        //gridDiv = $('<div id="' + newGridId + '" class="drill_down_grid"></div>').appendTo(containerCell);
                    accRow.find('.drillDown_span').data('state', 'open');
                    var parentRowData = gridConfig.grid[0].grid.getCurrentDataSourceData(accRowIdx);

                    if (typeof gridConfig.drillDown === general_util.jsTypes.function) {
                        contentGenerator.drillDownCreate(gridConfig.drillDown(accRowIdx, parentRowData[0]), gridDiv[0], gridId);
                    }
                    else if (typeof gridConfig.drillDown === general_util.jsTypes.object) {
                        if (!gridConfig.drillDown.dataSource) gridConfig.drillDown.dataSource = {};
                        gridConfig.drillDown.dataSource.data = parentRowData[0].drillDownData;
                        gridConfig.drillDown.dataSource.rowCount = parentRowData[0].drillDownData ? parentRowData[0].drillDownData.length : 0;
                        contentGenerator.drillDownCreate(gridConfig.drillDown, gridDiv[0], gridId);
                    }
                }
            }
        });
    },

    /**
     * For internal use only; called whenever a drill down grid needs to be created.
     * Forwards to createGrid function after setting the drill down's parentGridId attribute.
     * @param {Object} gridData - The grid config object for the drill down grid instance
     * @param {Object} gridElem - The DOM element used to create the drill down grid within
     * @param {number} parentId - The internal id of the parent grid
     */
    drillDownCreate: function _drillDownCreate(gridData, gridElem, parentId) {
        gridData.parentGridId = parentId;
        grid.createGrid(gridData, gridElem);
    }
};

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

function setupCellValidation2(columnValidation, dataAttributes) {
    if (!grid.validation) {
        Object.defineProperty(
            grid,
            'validation',
            { value: {}, writable: false }
        );
    }
    if (columnValidation.required) dataAttributes.push({ name: 'required', value: '' });
    if (columnValidation.customRules) {
        let attributeIdx = dataAttributes.length;
        dataAttributes.push({ name: 'customrules', value: '' });
        Object.keys(columnValidation.customRules).forEach(function _applyCustomValidation(rule) {
            dataAttributes[attributeIdx].value += 'grid.validation.' + rule + ',';
            if (!grid.validation[rule]) {
                Object.defineProperty(
                    grid.validation,
                    rule,
                    { value: columnValidation.customRules[rule], writable: false, configurable: false }
                );
            }
        });
        dataAttributes[attributeIdx].value += '"';
    }
    return dataAttributes;
}

export { contentGenerator };