import { cloneGridData } from './gridHelpers';

function createSortMenuItem() {
    var sortMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Sorts</a>'));
    sortMenuItem.on('click', RemoveAllColumnSorts);
    return sortMenuItem;
}

function RemoveAllColumnSorts(e) {
    var gridMenu = $(e.currentTarget).parents('.grid_menu'),
        gridId = gridMenu.data('grid_id');
    $('.grid_menu').addClass('hiddenMenu');

    gridState[gridId].find('.sortSpan').remove();
    gridState[gridId].sortedOn = [];
    gridState[gridId].pageRequest.eventType = 'sort';
    preparePageDataGetRequest(gridId);
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
    });
}

var gridState = {},
    isSortInitialized = false;

function sort_init(gridIObj) {
    gridState = gridIObj;
    isSortInitialized = true;
}

export { createSortMenuItem, RemoveAllColumnSorts, setSortableClickListener, sort_init, isSortInitialized };