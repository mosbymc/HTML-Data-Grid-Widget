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

export { attachGroupItemEventHandlers };