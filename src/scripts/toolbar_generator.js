import { gridState } from './gridState';
import { preparePageDataGetRequest } from './pageRequests';
import { general_util } from './general_util';
import { contentGenerator } from './contentGenerator';

var toolbarGenerator = {
    createToolbar: function _createToolbar(gridConfig, gridElem, canEdit) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;   //if the toolbar has already been created, don't create it again.

        if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && gridConfig.groupable) {
            var groupMenuBar = $('<div id="grid_' + id + '_group_div" class="group_div clearfix" data-grid_id="' + id + '">' + general_util.groupMenuText + '</div>').prependTo(gridElem);
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
                if (gridConfig.updating) return;     //can't group columns if grid is updating
                if (!groupMenuBar.children().length) groupMenuBar.text('');
                var field = droppedCol.data('field'),
                    title = gridState.getInstance(groupId).columns[gridState.getInstance(groupId).columnIndices[field]].title || field,
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

                if (gridConfig.sortedOn && gridConfig.sortedOn.length) {
                    var sortArr = [];
                    for (var l = 0; l < gridConfig.sortedOn.length; l++) {
                        if (gridConfig.sortedOn[l].field !== field) sortArr.push(gridConfig.sortedOn[l]);
                        else {
                            gridConfig.grid.find('.grid-header-wrapper').find('#' + field + '_grid_id_' + id).find('.sortSpan').remove();
                        }
                    }
                    gridConfig.sortedOn = sortArr;
                }

                var colGroups = gridConfig.grid.find('colgroup');
                colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                    $(val).prepend('<col class="group_col"/>');
                });
                gridConfig.grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
                gridConfig.grid.find('.aggregate-row').prepend('<td class="group_spacer">&nbsp</td>');

                gridConfig.groupedBy = groupings;
                gridConfig.pageRequest.eventType = 'group';
                toolbarGenerator.attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton);
                preparePageDataGetRequest(id, contentGenerator.createContent);
            });
            groupMenuBar.on('dragover', function handleHeaderDragOverCallback(e) {
                e.preventDefault();
                var gridId = groupMenuBar.data('grid_id');
                var dropIndicator = $('#drop_indicator_id_' + gridId);
                //TODO: I believe I can just reuse the existing group indicator, but I may need to change where it lives as a child of the grid
                if (!dropIndicator.length) {
                    dropIndicator = $('<div id="drop_indicator_id_' + gridId + '" class="drop-indicator" data-grid_id="' + gridId + '"></div>');
                    dropIndicator.append('<span class="drop-indicator-top"></span><span class="drop-indicator-bottom"></span>');
                    gridConfig.grid.append(dropIndicator);
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

        var shouldBuildGridMenu = gridConfig.excelExport || gridConfig.columnToggle || gridConfig.advancedFiltering || gridConfig.selectable;

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
    },
    /**
     * Attaches handlers for changing the sort direction and canceling a grouping for each grouped item
     * @param {Object} groupMenuBar - The DOM element that contains the grouped items
     * @param {Object} groupDirSpan - The DOM element used for sorting and displaying the sort direction
     * @param {Object} cancelButton - The DOM element use to remove a grouping
     */
    attachGroupItemEventHandlers: function _attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton) {
    groupDirSpan.on('click', function changeGroupSortDirHandler() {
        var groupElem = $(this),
            id = groupElem.parents('.group_item').data('grid_id'),
            sortSpan = groupElem.children('.groupSortSpan'),
            groupElements = [],
            gridConfig = gridState.getInstance(id);
        if (gridConfig.updating) return;     //can't resort columns if grid is updating
        if (sortSpan.hasClass('sort-asc-white')) sortSpan.removeClass('sort-asc-white').addClass('sort-desc-white');
        else sortSpan.removeClass('sort-desc-white').addClass('sort-asc-white');
        groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
            var item = $(val);
            groupElements.push({
                field: item.data('field'),
                sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
            });
        });
        gridConfig.groupedBy = groupElements;
        gridConfig.pageRequest.eventType = 'group';
        preparePageDataGetRequest(id);
    });

    cancelButton.on('click', function removeDataGrouping() {
        var groupElem = $(this),
            groupedCol = groupElem.parents('.group_item'),
            id = groupedCol.data('grid_id'),
            groupElements = [],
            gridConfig = gridState.getInstance(id);
        if (gridConfig.updating) return;     //can't resort columns if grid is updating
        gridConfig.grid.find('colgroup').first().children().first().remove();
        gridConfig.grid.find('.grid-headerRow').children('.group_spacer').first().remove();
        gridConfig.grid.find('.aggregate-row').children('.group_spacer').first().remove();
        groupedCol.remove();
        groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
            var item = $(val);
            groupElements.push({
                field: item.data('field'),
                sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
            });
        });
        gridConfig.grid.find('.grid-header-div').find('th [data-field="' + groupElem.data('field') + '"]').data('grouped', false);
        if (!groupElements.length) groupMenuBar.text(general_util.groupMenuText);
        gridConfig.groupedBy = groupElements;
        gridConfig.pageRequest.eventType = 'group';
        preparePageDataGetRequest(id);
    });
}
};

export { toolbarGenerator };