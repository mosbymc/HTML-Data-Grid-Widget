import { gridState } from './gridState';
import { general_util } from './general_util';
import { preparePageDataGetRequest } from './pageRequests';
import { cloneGridData } from './grid_util';

/**
 * Sets a click handler for all sortable columns on the column header
 * @param {object} elem - The DOM element that has the click handler attached
 */
function setSortableClickListener(elem) {
    elem.on('click', function handleHeaderClickCallback(e) {
        var headerDiv = elem.parents('.grid-header-div');
        var id = general_util.parseInt(headerDiv.data('grid_header_id')),
            gridConfig = gridState.getInstance(id);
        if (gridConfig.updating) return;     //can't sort if grid is updating
        var field = elem.data('field'),
            foundColumn = false;

        if (gridConfig.groupedBy.length) {
            for (var j = 0; j < gridConfig.groupedBy.length; j++) {
                if (gridConfig.groupedBy[j].field === field) return; //can't sort on a grouped column
            }
        }

        for (var i = 0; i < gridConfig.sortedOn.length; i++) {
            //if we find the field in the list of sorted columns....
            if (gridConfig.sortedOn[i].field === field) {
                foundColumn = true;
                //...if it had been sorted ascending, change it to descending...
                if (gridConfig.sortedOn[i].sortDirection === 'asc') {
                    gridConfig.sortedOn[i].sortDirection = 'desc';
                    elem.find('.sortSpan').addClass('sort-desc').removeClass('sort-asc');
                }
                else {
                    //...otherwise, remove it from the collection of sorted columns
                    gridConfig.sortedOn =  gridConfig.sortedOn.filter(function filterSortedColumns(item) {
                        return item.field !== field;
                    });
                    elem.find('.sortSpan').remove();
                    //TODO: why am I doing this here?
                    gridConfig.alteredData = cloneGridData(gridConfig.originalData);
                }
            }
        }

        if (!foundColumn) {
            gridConfig.sortedOn.push({ field: field, sortDirection: 'asc' });
            elem.find('.header-anchor').append('<span class="sort-asc sortSpan">Sort</span>');
        }
        gridConfig.pageRequest.eventType = 'sort';
        preparePageDataGetRequest(id);
        e.preventDefault();
    });
}

/**
 * Add the filter icon to a filterable grid header and attaches an event listener when the icon is clicked
 * @param {object} elem - The grid header element whose column values are filterable
 * @param {object} gridConfig - The metadata describing the grid's behavior and attributes
 * @param {string} col - The name of the field associated with the filterable grid column
 */
function setFilterableClickListener(elem, gridConfig, col) {
    var type = gridConfig.columns[gridConfig.columnIndices[col]].type || 'string';
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
 * Creates the drag events for column resizing
 * @param {Object} elem - Returns the DOM element that has the drag events attached
 */
function setDragAndDropListeners(elem) {
    elem.on('dragstart', function handleDragStartCallback(e) {
        e.originalEvent.dataTransfer.setData('text/plain', e.currentTarget.id);
        $(e.currentTarget).data('dragging', true);
    });
    elem.on('drop', function handleDropCallback(e) {
        var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
        droppedCol.data('dragging', false);
        var targetCol = $(e.currentTarget),
            id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null,
            droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
        if (id == null || droppedId == null || id !== droppedId) return;  //at least one of the involved dom elements is not a grid column, or they are from different grids
        var gridConfig = gridState.getInstance(id);
        if (gridConfig.updating) return;     //can't resort columns if grid is updating
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
        if (gridConfig.resizable) {
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

        if (gridConfig.groupedBy && gridConfig.groupedBy.length && gridConfig.groupedBy !== 'none') {
            ++droppedIndex;
            ++targetIndex;
        }

        if (gridConfig.drillDown) {
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
            element: gridConfig.grid,
            droppedColumn: droppedCol.data('field'),
            targetColumn: targetCol.data('field'),
            droppedIndex: droppedIndex,
            targetIndex: targetIndex
        };
        callGridEventHandlers(gridConfig.events.columnReorder, gridConfig.grid, evtObj);
    });
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
        if (!col.isHidden && general_util.isNumber(col.width)) return prev + col.width;
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

function mouseLeaveHandlerCallback(e) {
    var target = $(e.currentTarget),
        targetOffset = target.offset(),
        targetWidth = target.innerWidth(),
        mousePos = { x: e.originalEvent.pageX, y: e.originalEvent.pageY },
        parentDiv = target.parents('.grid-header-wrapper'),
        id = parentDiv.parent().data('grid_header_id'),
        sliderDiv = $('#sliderDiv' + id),
        gridConfig = gridState.getInstance(id);

    if (Math.abs(mousePos.x - (targetOffset.left + targetWidth)) < 10) {
        if (!sliderDiv.length) {
            sliderDiv = $('<div id="sliderDiv' + id + '" style="width:10px; height:' + target.innerHeight() + 'px; cursor: col-resize; position: absolute" draggable=true><div></div></div>').appendTo(parentDiv);
            sliderDiv.on('dragstart', function handleResizeDragStartCallback(e) {
                e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
                gridConfig.resizing = true;
            });
            sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                gridConfig.resizing = false;
            });
            sliderDiv.on('dragover', function handleResizeDragOverCallback(e) {
                e.preventDefault();
            });
            sliderDiv.on('drop', function handleResizeDropCallback(e) {
                e.preventDefault();
            });
            sliderDiv.on('drag', handleResizeDragCallback);
            sliderDiv.on('dblclick', function doubleClickHandler() {
                var targetCol = gridConfig.grid.find('#' + sliderDiv.data('targetindex')),
                    targetColIdx = targetCol.data('index');
                if (targetColIdx === gridConfig.columns.length - 1) return;
                if (gridConfig.drillDown) ++targetColIdx;
                if (gridConfig.groupedBy && gridConfig.groupedBy.length) {
                    targetColIdx = targetColIdx + gridConfig.groupedBy.length;
                }

                var colGroups = gridConfig.grid.find('colgroup').filter(function removeParentOrChildCols() {
                    var cg = $(this);
                    if (gridConfig.parentGridId != null) {
                        return cg.parents('tr.drill-down-parent').length;
                    }
                    else return !cg.parents('tr.drill-down-parent').length;
                });

                var headerCol = $($(colGroups[0]).children()[targetColIdx]),
                    contentCol = $($(colGroups[1]).children()[targetColIdx]);

                var tables = gridConfig.grid.find('table').filter(function removeParentOrChildCols() {
                    var cg = $(this);
                    if (gridConfig.parentGridId != null) {
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
                    column = gridConfig.columns[gridConfig.columnIndices[targetCol.data('field')]];

                if (column.sortable) maxLength += 16;

                if (column.filterable) maxLength += 40;

                if (aggregateCell && aggregateCell.innerText.length * aggregateMultiplier > maxLength)
                    maxLength = aggregateCell.innerText.length * aggregateMultiplier;

                $(tables[1]).find('tr').each(function findTargetContentCells() {
                    var row = $(this);
                    if (gridConfig.parentGridId != null) {
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
        var droppedIdx = 1 + general_util.parseInt(droppedIndex);
        var targetIdx = 1 + general_util.parseInt(targetIndex);
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

var header_util = {
    setSortableClickListener: setSortableClickListener,
    setFilterableClickListener: setFilterableClickListener,
    setDragAndDropListeners: setDragAndDropListeners,
    setColWidth: setColWidth,
    mouseLeaveHandlerCallback: mouseLeaveHandlerCallback
};

export { header_util };