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