import { gridFormatters } from './gridFormattersAndValidators';

/**
 * Creates group header rows, pads with extra columns based on number of grouped columns, and calculates/display group aggregatges
 * if option is set
 * @param {number} gridId - The id of the grid widget instance
 * @param {number} rowIndex - The index of the current row in the grid data collection
 * @param {Array} columns - A collection of grid columns that will be displayed
 * @param {Object} currentGroupingValues - The values currently determining the rows that are grouped
 * @param {Object} gridContent - The DOM table element for the grid's content
 */
function createGroupedRows(gridId, rowIndex, columns, currentGroupingValues, gridContent) {
    var j, k, item,
        foundDiff = false,
        groupedDiff = [],
        gridData = gridState[gridId];
    for (j = 0; j < gridData.groupedBy.length; j++) {
        //If the current cached value for the same field is different than the current grid's data for the same field,
        //then cache the same value and note the diff.
        if (!currentGroupingValues[gridData.groupedBy[j].field] || currentGroupingValues[gridData.groupedBy[j].field] !== gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field]) {
            currentGroupingValues[gridData.groupedBy[j].field] = gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field];
            groupedDiff[j] = 1;
            foundDiff = true;
        }
        else {
            //Otherwise, check the previous diff; if there isn't a diff, then set the current diff to none (i.e. 0),
            //but if the previous diff was found, set the current diff.
            if (!j || !groupedDiff[j - 1]) groupedDiff[j] = 0;
            else groupedDiff[j] = 1;
        }
    }
    if (foundDiff && rowIndex) {   //If a diff was found...
        for (j = groupedDiff.length - 1; j >= 0; j--) {     //...go backwards through the grouped aggregates...
            var numItems = gridData.groupAggregations[j]._items_; //...save the current row's number of items...
            if (groupedDiff[j]) {                               //...if there is a diff at the current row, print it to the screen
                var groupAggregateRow = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                for (k = 0; k < groupedDiff.length; k++) {
                    groupAggregateRow.append('<td colspan="1" class="grouped_cell"></td>');
                }
                for (item in gridData.groupAggregations[j]) {
                    if (item !== '_items_') {
                        groupAggregateRow.append('<td class="group_aggregate_cell">' + (gridData.groupAggregations[j][item].text || '') + '</td>');
                    }
                }
                gridData.groupAggregations[j] = {       //Then reset the current row's aggregate object...
                    _items_: 0
                };
                for (k = j - 1; k >= 0; k--) {  //...and go backward through the diffs starting from the prior index, and compare the number of items in each diff...
                    if (groupedDiff[k] && gridData.groupAggregations[k]._items_ == numItems) {    //...if the number of items are equal, reset that diff as well
                        groupedDiff[k] = 0;
                        gridData.groupAggregations[k] = {
                            _items_: 0
                        };
                    }
                }
            }
        }
    }
    for (j = 0; j < groupedDiff.length; j++) {
        if (!gridData.groupAggregations[j]) {
            gridData.groupAggregations[j] = {
                _items_: 0
            };
        }
        for (item in gridData.columns) {
            addValueToAggregations(gridId, item, gridData.dataSource.data[rowIndex][item], gridData.groupAggregations[j]);
        }
        gridData.groupAggregations[j]._items_++;
        if (groupedDiff[j]) {
            var groupedText = gridFormatters.getFormattedCellText(gridId, gridData.groupedBy[j].field, gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field]) ||
                gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field];
            var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
            var groupTitle = gridData.columns[gridData.groupedBy[j].field].title || gridData.groupedBy[j].field;
            for (k = 0; k <= j; k++) {
                var indent = k === j ? (columns.length + gridData.groupedBy.length - k) : 1;
                groupTr.data('group-indent', indent);
                var groupingCell = $('<td colspan="' + indent + '" class="grouped_cell"></td>').appendTo(groupTr);
                if (k === j) {
                    groupingCell.append('<p class="grouped"><a class="group-desc sortSpan group_acc_link"></a>' + groupTitle + ': ' + groupedText + '</p></td>');
                    break;
                }
            }
        }
    }
}

/**
 * Attaches click event handlers for each grouped header row in the grid
 */
function createGroupTrEventHandlers() {
    $('.group_acc_link').each(function iterateAccordionsCallback(idx, val) {
        $(val).data('state', 'open');
    }).on('click', function groupedAccordionsClickListenerCallback(e) {
        var accRow = $(e.currentTarget).parents('tr'),
            indent = accRow.data('group-indent');
        if ($(e.currentTarget).data('state') === 'open') {
            $(e.currentTarget).data('state', 'closed').removeClass('group-desc').addClass('group-asc');
            accRow.nextAll().each(function iterateAccordionRowSiblingsToCloseCallback(idx, val) {
                var row = $(val),
                    rowIndent = row.data('group-indent');
                if (!rowIndent || rowIndent < indent)
                    row.css('display', 'none');
                else return false;
            });
        }
        else {
            $(e.currentTarget).data('state', 'open').removeClass('group-asc').addClass('group-desc');
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
        if (gridState[id].updating) return;		//can't resort columns if grid is updating
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
        if (gridState[id].updating) return;		//can't resort columns if grid is updating
        gridState[id].grid.find('colgroup').first().children().first().remove();
        gridState[id].grid.find('.grid-headerRow').children('.group_spacer').first().remove();
        gridState[id].grid.find('.summary-row-header').children('.group_spacer').first().remove();
        groupedCol.remove();
        groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
            var item = $(val);
            groupElements.push({
                field: item.data('field'),
                sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
            });
        });
        if (!groupElements.length) groupMenuBar.text(groupMenuText);
        gridState[id].groupedBy = groupElements;
        gridState[id].pageRequest.eventType = 'group';
        preparePageDataGetRequest(id);
    });
}

function createGroupMenuItem() {
    var groupMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Grouping</a>'));
    groupMenuItem.on('click', RemoveAllColumnGrouping);
    return groupMenuItem;
}

function RemoveAllColumnGrouping(e) {
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
    gridState[gridId].grid.find('colgroup').first().children().first().remove();
    gridState[gridId].grid.find('.grid-headerRow').children('.group_spacer').remove();
    gridState[gridId].grid.find('.summary-row-header').children('.group_spacer').remove();
    gridState[gridId].grid.find('.group_div').text(groupMenuText);
    gridState[gridId].groupedBy = [];
    gridState[gridId].pageRequest.eventType = 'group';
    preparePageDataGetRequest(gridId);
}

export { createGroupedRows, createGroupTrEventHandlers, attachGroupItemEventHandlers, createGroupMenuItem, RemoveAllColumnGrouping };