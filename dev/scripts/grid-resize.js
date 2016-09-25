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

/**
 * Handler for column resizing - alters the width of a grid column based on mouse movement
 * @param {object} e - The drag event that was fired by the browser
 */
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

export { mouseLeaveHandlerCallback, handleResizeDragCallback };