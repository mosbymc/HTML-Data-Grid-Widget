import { gridState } from './gridState';
import { general_util } from './general_util';

function createGroupMenuItem() {
    var groupMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Grouping</a>'));
    groupMenuItem.on('click', removeAllColumnGrouping);
    return groupMenuItem;
}

function removeAllColumnGrouping(e) {
    var gridMenu = $(e.currentTarget).parents('.grid_menu'),
        gridId = gridMenu.data('grid_id');
    $('.grid_menu').addClass('hiddenMenu');

    var groupItems = gridState.getInstance(gridId).grid.find('.group_item'),
        groupItemsCount = groupItems.length,
        headerColGroup = gridState.getInstance(gridId).grid.find('colgroup').first();
    groupItems.remove();
    for (var i = 0; i < groupItemsCount; i++) {
        headerColGroup.children().first().remove();
    }
    gridState[gridId].grid.find('.grid-headerRow').children('.group_spacer').remove();
    gridState[gridId].grid.find('.aggregate-row').children('.group_spacer').remove();
    gridState[gridId].grid.find('.group_div').text(general_util.groupMenuText);

    if (gridState[gridId].groupedBy.length) {
        gridState[gridId].groupedBy = [];
        gridState[gridId].pageRequest.eventType = 'group';
        preparePageDataGetRequest(gridId);
    }
    e.preventDefault();
}

export { createGroupMenuItem };