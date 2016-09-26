function setDragAndDropListeners(elem) {
    elem.on('dragstart', function handleDragStartCallback(e) {
        e.originalEvent.dataTransfer.setData('text/plain', e.currentTarget.id);
        $(e.currentTarget).data('dragging', true);
    });
    elem.on('drop', handleDropCallback);
    elem.on('dragover', function handleHeaderDragOverCallback(e) {
        e.preventDefault();
        var gridId = elem.parents('.grid-header-div').data('grid_header_id');
        var dropIndicator = $('#drop_indicator_id_' + gridId);
        if (!dropIndicator.length) {
            dropIndicator = $('<div id="drop_indicator_id_' + gridId + '" class="drop-indicator" data-grid_id="' + gridId + '"></div>');
            dropIndicator.append('<span class="drop-indicator-top"></span><span class="drop-indicator-bottom"></span>');
            gridState[gridId].grid.append(dropIndicator);
        }

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
    elem.on('mouseleave', mouseLeaveHandlerCallback);
}

function mouseLeaveHandlerCallback(e) {
    var target = $(e.currentTarget);
    var targetOffset = target.offset();
    var targetWidth = target.innerWidth();
    var mousePos = { x: e.originalEvent.pageX, y: e.originalEvent.pageY };
    var sliderDiv = $('#sliderDiv');

    if (Math.abs(mousePos.x - (targetOffset.left + targetWidth)) < 10) {
        if (!sliderDiv.length) {
            var parentDiv = target.parents('.grid-header-wrapper');
            sliderDiv = $('<div id=sliderDiv style="width:10px; height:' + target.innerHeight() + 'px; cursor: col-resize; position: absolute" draggable=true><div></div></div>').appendTo(parentDiv);
            sliderDiv.on('dragstart', function handleResizeDragStartCallback(e) {
                e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
                gridState[parentDiv.parent().data('grid_header_id')].resizing = true;
            });
            sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                gridState[parentDiv.parent().data('grid_header_id')].resizing = false;
            });
            sliderDiv.on('dragover', function handleResizeDragOverCallback(e) {
                e.preventDefault();
            });
            sliderDiv.on('drop', function handleResizeDropCallback(e) {
                e.preventDefault();
            });
            sliderDiv.on('drag', handleResizeDragCallback);
        }
        sliderDiv.data('targetindex', target[0].id);
        sliderDiv.css('top', targetOffset.top + 'px');
        sliderDiv.css('left', (targetOffset.left + targetWidth -4) + 'px');
        sliderDiv.css('position', 'absolute');
    }
}

function handleDropCallback(e) {
    var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
    droppedCol.data('dragging', false);
    var targetCol = $(e.currentTarget);
    var id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null;
    var droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
    if (id == null || droppedId == null || id !== droppedId) return;  //at least one of the involved dom elements is not a grid column, or they are from different grids
    if (gridState[id].updating) return;		//can't resort columns if grid is updating
    if (droppedCol[0].cellIndex === targetCol[0].cellIndex) return;
    if (droppedCol[0].id === 'sliderDiv') return;

    var parentDiv = targetCol.parents('.grid-header-div');
    var parentDivId = parentDiv.data('grid_header_id');
    var gridWrapper = parentDiv.parent('.grid-wrapper');
    var colGroups = gridWrapper.find('colgroup');

    var droppedIndex = droppedCol[0].dataset.index;
    var targetIndex = targetCol[0].dataset.index;

    var droppedClone = droppedCol.clone(false, true);
    var targetClone = targetCol.clone(false, true);

    var droppedEvents = $._data(droppedCol[0], 'events');
    var targetEvents = $._data(targetCol[0], 'events');
    if (droppedEvents.click) setSortableClickListener(droppedClone);
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

    var targetWidth = colGroups[0].children[droppedIndex].style.width;
    var droppedWidth = colGroups[0].children[targetIndex].style.width;

    colGroups[0].children[targetIndex].style.width = targetWidth;
    colGroups[0].children[droppedIndex].style.width = droppedWidth;
    colGroups[1].children[targetIndex].style.width = targetWidth;
    colGroups[1].children[droppedIndex].style.width = droppedWidth;

    var sumRow = parentDiv.find('.summary-row-header');
    if (sumRow.length) {
        var droppedColSum = null,
            targetColSum = null;
        sumRow.children().each(function iterateSumRowCellsCallback(idx, val) {
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
    e.preventDefault();
    var evtObj = {
        element: gridState[id].grid,
        droppedColumn: droppedCol.data('field'),
        targetColumn: targetCol.data('field'),
        droppedIndex: droppedIndex,
        targetIndex: targetIndex
    };
    callGridEventHandlers(gridState[id].events.columnReorder, gridState[id].grid, evtObj);
}

/**
 * Swaps the cells of a grid when a column re-ordering happens
 * @param {number} gridId - The id of the grid widget instance
 * @param {number} droppedIndex - The column index of the column that was 'dropped'
 * @param {number} targetIndex - The column index of the column that was the target of the dropped column
 */
function swapContentCells(gridId, droppedIndex, targetIndex) {
    var gridData = gridState[gridId];
    $('#grid-content-' + gridId).find('tr').each(function iterateContentRowsCallback(idx, val) {
        if ($(val).hasClass('grouped_row_header'))
            return true;
        var droppedIdx = 1 + parseInt(droppedIndex);
        var targetIdx = 1 + parseInt(targetIndex);
        if (gridData.groupedBy && gridData.groupedBy !== 'none') {
            droppedIdx++;
            targetIdx++;
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

function handleResizeDragCallback(e) {
    e.preventDefault();
    var sliderDiv = $(e.currentTarget);
    var id = sliderDiv.parents('.grid-wrapper').data('grid_id');
    if (gridState[id].updating) return;		//can't resize columns if grid is updating
    var targetCell = document.getElementById(sliderDiv.data('targetindex'));
    var targetBox = targetCell.getBoundingClientRect();
    var endPos = e.originalEvent.pageX;
    var startPos = targetBox.left;
    var width = endPos - startPos;
    var space = endPos - targetBox.right;

    if (width > 11) {
        var index = targetCell.dataset.index;
        var gridWrapper = $(targetCell).parents('.grid-wrapper');
        var colGroups = gridWrapper.find('colgroup');
        var tables = gridWrapper.find('table');
        if (gridState[id].groupedBy && gridState[id].groupedBy !== 'none')
            index++;

        var contentDiv = gridWrapper.find('.grid-content-div');
        var scrollLeft = contentDiv.scrollLeft();
        var clientWidth = contentDiv[0].clientWidth;
        var scrollWidth = contentDiv[0].scrollWidth;
        var add = scrollLeft + clientWidth;
        var isTrue = add === scrollWidth;

        if (space < 0 && scrollWidth > clientWidth && isTrue) {
            space -= -3;
            width -= -3;
        }

        for (var i = 0; i < colGroups.length; i++) {
            var currWidth = $(tables[i]).width();
            $(colGroups[i].children[index]).width(width);
            $(tables[i]).width(currWidth + space);

        }
        sliderDiv.css('left', e.originalEvent.pageX + 'px');
    }
}

var gridState = {},
    isInitialized = false;

function reorder_init(gridIObj) {
    gridState = gridIObj;
    isInitialized = true;
}

export { setDragAndDropListeners, handleDropCallback, swapContentCells, handleResizeDragCallback, reorder_init, isInitialized };