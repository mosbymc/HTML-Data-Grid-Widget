/**
 * Sets a click handler for all sortable columns on the column header
 * @param {object} elem - The DOM element that has the click handler attached
 */
function setSortableClickListener(elem) {
    elem.on('click', function handleHeaderClickCallback(e) {
        var headerDiv = elem.parents('.grid-header-div');
        var id = parseInt(headerDiv.data('grid_header_id'));
        if (gridState[id].updating) return;     //can't sort if grid is updating
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
        e.preventDefault();
    });
}

/**
 * Add the filter icon to a filterable grid header and attaches an event listener when the icon is clicked
 * @param {object} elem - The grid header element whose column values are filterable
 * @param {object} gridData - The metadata describing the grid's behavior and attributes
 * @param {string} col - The name of the field associated with the filterable grid column
 */
function setFilterableClickListener(elem, gridData, col) {
    var type = gridData.columns[gridData.columnIndices[col]].type || 'string';
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
        if (!col.isHidden && isNumber(col.width)) return prev + col.width;
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

var header_util = {
    setSortableClickListener: setSortableClickListener,
    setFilterableClickListener: setFilterableClickListener,
    setDragAndDropListeners: setDragAndDropListeners,
    setColWidth: setColWidth
};

export { header_util };