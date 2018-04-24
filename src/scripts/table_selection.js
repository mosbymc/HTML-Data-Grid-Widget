import { gridState } from './gridState';
import { dominator } from './dominator';
import { general_util } from './general_util';

/**
 * Attaches handlers for click, mousemove, mousedown, mouseup, and scroll events depending on the value of the selectable attribute of the grid
 * @param {object} tableBody - The body of the grid's content table
 */
function attachTableSelectHandler(tableBody) {
    var gridId = tableBody.parents('.grid-wrapper').data('grid_id'),
        gridConfig = gridState.getInstance(gridId);
    var isSelectable = gridConfig.selectable;
    if (isSelectable) {
        dominator(document).on('click', function tableBodySelectCallback(e) {
            if (e.target === tableBody[0] || dominator(e.target).parents('tbody')[0] === tableBody[0]) {
                if (gridConfig.selecting) {
                    gridConfig.selecting = false;
                    return;
                }
                dominator(gridConfig.grid).find('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                    dominator(elem).removeClass('selected');
                });
                var target = dominator(e.target);
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
        dominator(document).on('mousedown', function mouseDownDragCallback(event) {
            var target = dominator(event.target);
            if (event.target === tableBody[0] || target.parents('tbody')[0] === tableBody[0]) {
                if (target.hasClass('drill-down-parent') || target.parents('.drill-down-parent').length) return;
                if (target.hasClass('drillDown_cell') || target.parents('.drillDown_cell').length) return;
                gridConfig.selecting = true;
                var contentDiv = tableBody.parents('.grid-content-div'),
                    overlay = dominator('<div class="selection-highlighter"></div>').appendTo(gridConfig.grid);
                overlay.css('top', event.pageY).css('left', event.pageX).css('width', 0).css('height', 0);
                overlay.data('origin-y', event.pageY + contentDiv.scrollTop()).data('origin-x', event.pageX + contentDiv.scrollLeft()).data('mouse-pos-x', event.pageX).data('mouse-pos-y', event.pageY);
                overlay.data('previous-top', event.pageY).data('previous-left', event.pageX);
                overlay.data('previous-bottom', event.pageY).data('previous-right', event.pageX);
                overlay.data('origin-scroll_top', contentDiv.scrollTop()).data('origin-scroll_left', contentDiv.scrollLeft());
                overlay.data('last-scroll_top_pos', contentDiv.scrollTop()).data('last-scroll_left_pos', contentDiv.scrollLeft());
                overlay.data('actual-height', 0).data('actual-width', 0).data('event-type', 'mouse');

                dominator(document).one('mouseup', function mouseUpDragCallback() {
                    gridConfig.grid.find('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                        dominator(elem).removeClass('selected');
                    });
                    var overlay = dominator(".selection-highlighter");
                    selectHighlighted(overlay, gridId);
                    overlay.remove();
                    contentDiv.off('scroll');
                    dominator(document).off('mousemove');
                });

                contentDiv.on('scroll', function updateSelectOverlayOnScrollHandler() {
                    if (gridConfig.selecting) {
                        overlay.data('event-type', 'scroll');
                        setOverlayDimensions(contentDiv, overlay);
                    }
                });

                dominator(document).on('mousemove', function updateSelectOverlayOnMouseMoveHandler(ev) {
                    if (gridConfig.selecting) {
                        var domTag = ev.target.tagName.toUpperCase();
                        if (domTag === 'INPUT' || domTag === 'SELECT') return;

                        overlay.data('event-type', 'mouse');
                        overlay.data('mouse-pos-x', ev.pageX).data('mouse-pos-y', ev.pageY);
                        setOverlayDimensions(gridConfig.grid.find('.grid-content-div'), overlay);
                    }
                });
            }
        });
    }

    /**
     * Called by both the mousemove and scroll event handlers, this function determines the appearance of the overlay and the true
     * selection dimensions based on the distance the mouse has moved since the mousedown event, and the amount/direction of scrolling
     * @param {object} contentDiv - The div containing the table that holds the actual content (not the header table)
     * @param {object} overlay - The overlay div used to display the user's active selection
     */
    function setOverlayDimensions(contentDiv, overlay) {
        window.getSelection().removeAllRanges();

        //TODO: I'm pretty sure I don't need all the mouse-pos and previous-x values to calculate the temporary top/left/bottom/right. Try to limit the required data
        var contentOffset = contentDiv.offset(),
            ctHeight = contentDiv[0].clientHeight,
            ctWidth = contentDiv[0].clientWidth,
            ctTop = contentOffset.top,
            ctLeft = contentOffset.left,
            ctBottom = ctTop + ctHeight,
            ctRight = ctLeft + ctWidth,
            ctScrollTop = contentDiv.scrollTop(),
            ctScrollLeft = contentDiv.scrollLeft(),
            top = Math.min(overlay.data('mouse-pos-y'), ctTop, overlay.data('previous-top')),
            left = Math.min(overlay.data('mouse-pos-x'), ctLeft, overlay.data('previous-left')),
            bottom = Math.max(top, overlay.data('previous-bottom')),
            right = Math.max(left, overlay.data('previous-right')),
            trueHeight;

        if ((top === overlay.data('previous-top') || top < ctTop) && (bottom === overlay.data('previous-bottom') || bottom > ctBottom) &&
            (left === overlay.data('previous-left') || left < ctLeft) && (right === overlay.data('previous-right') || right > ctRight) &&
            ctScrollTop === overlay.data('last-scroll_top_pos') && ctScrollLeft === overlay.data('last-scroll_left_pos'))
            return;

        var dimObj = {};
        dimObj.eventType = overlay.data('event-type');
        dimObj.overlay = {};
        dimObj.overlay.smallDim = top;
        dimObj.overlay.largeDim = bottom;
        dimObj.overlay.origin = overlay.data('origin-y');
        dimObj.overlay.mousePosition = overlay.data('mouse-pos-y');
        dimObj.container = {};
        dimObj.container.smallDim = ctTop;
        dimObj.container.largeDim = ctBottom;
        dimObj.container.scrollPos = ctScrollTop;
        dimObj.container.scrollLength = contentDiv[0].scrollHeight;
        dimObj.container.clientLength = ctHeight;

        var dims = determineOverlayDimensions(dimObj);
        trueHeight = dims.trueSize;
        ctScrollTop = dims.scrollPos;
        contentDiv.scrollTop(dims.scrollPos);
        top = dims.smallDim;
        bottom = dims.largeDim;

        dimObj.overlay.smallDim = left;
        dimObj.overlay.largeDim = right;
        dimObj.overlay.origin = overlay.data('origin-x');
        dimObj.overlay.mousePosition = overlay.data('mouse-pos-x');
        dimObj.container.smallDim = ctLeft;
        dimObj.container.largeDim = ctRight;
        dimObj.container.scrollPos = ctScrollLeft;
        dimObj.container.scrollLength = contentDiv[0].scrollWidth;
        dimObj.container.clientLength = ctWidth;

        dims = determineOverlayDimensions(dimObj);
        contentDiv.scrollLeft(dims.scrollPos);

        overlay.css('top', top).css('left', dims.smallDim).css('height', (bottom - top)).css('width', (dims.largeDim - dims.smallDim));
        overlay.data('actual-height', trueHeight).data('actual-width', dims.trueSize);
        overlay.data('previous-top', top).data('previous-left', dims.smallDim).data('previous-bottom', bottom).data('previous-right', dims.largeDim);
        overlay.data('last-scroll_top_pos', ctScrollTop).data('last-scroll_left_pos', dims.scrollPos);
    }
}

/**
 * Calculates both the displayed and actual top/bottom or left/right of the highlighting overlay
 * @param {object} context - The context in which this function is being called (ie for top/bottom calc or left/right)
 * @returns {{trueSize: number, smallDim: number, largeDim: number, scrollPos: number}}
 */
function determineOverlayDimensions(context) {
    var locAdjustment, scrollAdjustment, smallDim, largeDim,
        trueSize,
        scrollPos = context.container.scrollPos;
    if (context.eventType === 'scroll') {
        if (context.overlay.origin < context.container.smallDim + context.container.scrollPos) {
            if (context.overlay.mousePosition - 20 <= context.container.smallDim && context.container.scrollPos > 0) {
                locAdjustment = context.overlay.smallDim + 25;
                scrollAdjustment = context.overlay.mousePosition - locAdjustment;
                scrollPos = context.container.scrollPos + scrollAdjustment;
                largeDim = locAdjustment;
                smallDim = context.overlay.smallDim;
            }
            else {
                smallDim = context.container.smallDim;
                largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
            }
            trueSize = largeDim + scrollPos - context.overlay.origin;
        }
        else if (context.overlay.origin > context.container.largeDim + context.container.scrollPos) {
            if (context.overlay.mousePosition + 20 >= context.container.largeDim && context.container.scrollPos < context.container.scrollLength - context.container.clientLength) {
                locAdjustment = context.container.largeDim - 25;
                scrollAdjustment = locAdjustment - context.overlay.mousePosition;
                scrollPos = context.container.scrollPos - scrollAdjustment;
                smallDim = locAdjustment;
                largeDim = context.overlay.largeDim;
            }
            else {
                smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
                largeDim = context.container.largeDim;
            }
            trueSize = context.overlay.origin - smallDim - scrollPos;
        }
        else {
            if (context.overlay.origin < context.overlay.mousePosition + context.container.scrollPos) {
                smallDim = context.overlay.origin - context.container.scrollPos;
                largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
            }
            else {
                smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
                largeDim = context.overlay.origin - context.container.scrollPos;
            }
            trueSize = largeDim - smallDim;
        }
    }
    else {
        if (context.overlay.origin > (context.container.smallDim + context.container.scrollPos) && context.overlay.origin < (context.container.largeDim + context.container.scrollPos)) {
            var minVal = Math.min((context.overlay.origin - context.container.scrollPos), context.overlay.mousePosition);
            var maxVal = minVal === (context.overlay.origin - context.container.scrollPos) ? context.overlay.mousePosition : (context.overlay.origin - context.container.scrollPos);
            smallDim = minVal < context.container.smallDim ? context.container.smallDim : minVal;
            largeDim = maxVal > context.container.largeDim ? context.container.largeDim : maxVal;
            trueSize = largeDim - smallDim;
        }
        else if (context.overlay.origin <= context.container.smallDim + context.container.scrollPos) {
            smallDim = context.container.smallDim;
            if (context.overlay.mousePosition - 20 <= context.container.smallDim && context.container.scrollPos > 0) {
                locAdjustment = smallDim + 25;
                scrollAdjustment = context.overlay.mousePosition - locAdjustment;
                scrollPos = context.container.scrollPos + scrollAdjustment;
                largeDim = locAdjustment;
            }
            else largeDim = context.overlay.mousePosition > context.container.largeDim ? context.container.largeDim : context.overlay.mousePosition;
            trueSize = largeDim + scrollPos - context.overlay.origin;
        }
        else {
            largeDim = context.container.largeDim;
            if (context.overlay.mousePosition + 20 >= context.container.largeDim && context.container.scrollPos < context.container.scrollLength - context.container.clientLength) {
                locAdjustment = largeDim - 25;
                scrollAdjustment = locAdjustment - context.overlay.mousePosition;
                scrollPos = context.container.scrollPos - scrollAdjustment;
                smallDim = locAdjustment;
            }
            else smallDim = context.overlay.mousePosition < context.container.smallDim ? context.container.smallDim : context.overlay.mousePosition;
            trueSize = context.overlay.origin - smallDim - context.container.scrollPos;
        }
    }
    return {
        trueSize: trueSize,
        smallDim: smallDim || context.overlay.smallDim,
        largeDim: largeDim || context.overlay.largeDim,
        scrollPos: scrollPos || context.container.scrollPos
    };
}

/**
 * This function is called after the mouseup event and uses the dimensions of the overlay to apply
 * the 'selected' class to all grid elements that it overlaps
 * @param {object} overlay - The overlay element created to display the user's active selection
 * @param {number} gridId - The id of the grid widget instance
 */
function selectHighlighted(overlay, gridId) {
    var gridConfig = gridState.getInstance(gridId),
        contentDiv = dominator(gridConfig.grid).find('.grid-content-div'),
        ctOffset = contentDiv.offset(),
        ctHeight = contentDiv.height,
        ctWidth = contentDiv.width(),
        width = overlay.width(),
        height = overlay.height(),
        offset = overlay.offset(),
        top = offset.top,
        left = offset.left,
        right = general_util.parseFloat(overlay.data('actual-width')) + left,
        bottom = general_util.parseFloat(overlay.data('actual-height')) + top;

    if (top + overlay.data('actual-height') > ctOffset.top + ctHeight || top + height - overlay.data('actual-height') < ctOffset.top) {
        if (overlay.data('origin-scroll_top') > overlay.data('last-scroll_top_pos')) bottom = top + overlay.data('actual-height');
        else {
            bottom = top + height;
            top = bottom - overlay.data('actual-height');
        }
    }

    if (left + overlay.data('actual-width') > ctOffset.left + ctWidth || left + width - overlay.data('actual-width') < ctOffset.left) {
        if (overlay.data('origin-scroll_left') > overlay.data('last-scroll_left_pos')) right = left + overlay.data('actual-width');
        else {
            right = left + width;
            left = right = overlay.data('actual-width');
        }
    }

    var gridElems = gridConfig.selectable === 'multi-cell' ? contentDiv.find('td') : contentDiv.find('tr');
    gridElems = gridElems.filter(function filterDrillDownRows() {
        var gridElem = $(this);
        return !gridElem.hasClass('drill-down-parent') && !gridElem.parents('.drill-down-parent').length;
    });

    gridElems.forEach(function highlightGridElemsCallback(idx, val) {
        var element = dominator(val),
            eOffset = element.offset(),
            eTop = eOffset.top,
            eLeft = eOffset.left,
            eRight = general_util.parseFloat(element.css('width')) + eLeft,
            eBottom = general_util.parseFloat(element.css('height')) + eTop;

        if (left > eRight || right < eLeft || top > eBottom || bottom < eTop) return;
        else element.addClass('selected');
    });
}

export { attachTableSelectHandler, selectHighlighted };