import { general_util } from "./general_util";
import { preparePageDataGetRequest } from "./pageRequests";
import { gridState } from "./gridState";
import { contentGenerator } from './contentGenerator';

var pagerGenerator = {
    createPager: function _createPager(gridData, gridElem) {
        var gridPager = gridElem.find('.grid-pager-div'),
            id = gridPager.data('grid_pager_id'),
            count = gridState[id].dataSource.rowCount || gridState[id].dataSource.data.length,
            displayedRows = (count - gridState[id].pageSize) > 0 ? gridState[id].pageSize : count,
            totalPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) + 1: 1,
            pageNum = gridState[id].pageNum;

        var first = $('<a href="#" class="grid-page-link" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridPager);
        var prev = $('<a href="#" class="grid-page-link" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridPager);
        var text = 'Page ' + gridState[parseInt(gridPager.data('grid_pager_id'))].pageNum + '/' + (totalPages);
        gridPager.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
        var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridPager);
        var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + (totalPages) + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridPager);

        if (pageNum === 1) {
            first.addClass('link-disabled');
            prev.addClass('link-disabled');
        }
        if (pageNum === totalPages) {
            next.addClass('link-disabled');
            last.addClass('link-disabled');
        }

        var pageOptions = gridData.pagingOptions;
        if (pageOptions && pageOptions.constructor === Array) {
            var sizeSelectorSpan = $('<span class="page-size-span"></span>'),
                sizeSelect = $('<select class="size-selector input"></select>'),
                numOptions = 0;
            for (var i = 0; i < pageOptions.length; i++) {
                if (general_util.isNumber(general_util.parseFloat(pageOptions[i]))) {
                    sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                    numOptions++;
                }
            }
            if (numOptions) {
                sizeSelectorSpan.appendTo(gridPager);
                sizeSelect.appendTo(sizeSelectorSpan);
            }
            sizeSelect.val(~pageOptions.indexOf(gridState[id].pageSize) ? gridState[id].pageSize : pageOptions[0]);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler(e) {
                var pageSize = $(this).val(),
                    displayedRows = (count - pageSize) > 0 ? pageSize : count,
                    totalPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) + 1: 1;
                gridState[id].pageRequest.pageSize = general_util.parseInt(pageSize);
                gridState[id].pageRequest.eventType = 'pageSize';
                gridState[id].pageRequest.pageNum = totalPages < gridState[id].pageNum ? totalPages : gridState[id].pageNum;
                preparePageDataGetRequest(id, contentGenerator.createContent);
                e.preventDefault();
            });
        }

        var rowStart = displayedRows ? (1 + (displayedRows * (pageNum - 1))) : 0;
        var rowEnd = gridData.dataSource.rowCount < gridData.pageSize * pageNum ? gridData.dataSource.rowCount : gridData.pageSize * pageNum;
        text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
        gridPager.append('<span class="pageinfo">' + text + '</span>');

        pagerGenerator.setPagerEventListeners(gridPager);
    },

    /**
     * Attaches click handlers to each pager
     * @param {object} gridPager - The grid's DOM pager element
     */
    setPagerEventListener: function _setPagerEventListeners(gridPager) {
        gridPager.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
            $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
                e.preventDefault();
                var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
                if (link.hasClass('link-disabled')) {   //If the pager link that was clicked on is disabled, return.
                    return;
                }
                var gridPager = link.parents('.grid-pager-div'),
                    allPagers = gridPager.find('a'),
                    id = general_util.parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id),
                    gridConfig = gridState.getInstance(id);
                if (gridConfig.updating) return;     //can't page if grid is updating
                var pageSize = gridConfig.pageSize,
                    pagerInfo = gridPager.find('.pageinfo'),
                    pagerSpan = gridPager.find('.grid-pagenum-span'),
                    totalPages = (gridConfig.dataSource.rowCount - pageSize) > 0 ? Math.ceil((gridConfig.dataSource.rowCount - pageSize)/pageSize) + 1 : 1,
                    pageNum = general_util.parseInt(link[0].dataset.pagenum);
                gridConfig.pageNum = pageNum;
                var rowStart = 1 + (pageSize * (pageNum - 1));
                var rowEnd = pageSize * pageNum;

                switch (link.data('link')) {
                    case 'first':
                        link.addClass('link-disable');
                        $(allPagers[1]).addClass('link-disabled')[0].dataset.pagenum = 1;
                        $(allPagers[2]).removeClass('link-disabled')[0].dataset.pagenum = pageNum + 1;
                        $(allPagers[3]).removeClass('link-disabled');
                        break;
                    case 'prev':
                        link[0].dataset.pagenum = pageNum - 1;
                        if (pageNum === 1) {
                            link.addClass('link-disabled');
                            $(allPagers[0]).addClass('link-disabled');
                        }
                        $(allPagers[2]).removeClass('link-disabled')[0].dataset.pagenum = pageNum + 1;
                        $(allPagers[3]).removeClass('link-disabled');
                        break;
                    case 'next':
                        rowEnd = gridConfig.dataSource.rowCount < pageSize * pageNum ? gridConfig.dataSource.rowCount : pageSize * pageNum;
                        link[0].dataset.pagenum = pageNum + 1;
                        if (pageNum === totalPages) {
                            link.addClass('link-disabled');
                            $(allPagers[3]).addClass('link-disabled');
                        }
                        $(allPagers[0]).removeClass('link-disabled');
                        $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                        break;
                    case 'last':
                        rowEnd = gridConfig.dataSource.rowCount < pageSize * pageNum ? gridConfig.dataSource.rowCount : pageSize * pageNum;
                        link.addClass('link-disabled');
                        $(allPagers[2]).addClass('link-disabled')[0].dataset.pagenum = pageNum;
                        $(allPagers[0]).removeClass('link-disabled');
                        $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                        break;
                }
                pagerSpan.text('Page ' + pageNum + '/' + totalPages);
                pagerInfo.text(rowStart + ' - ' + rowEnd + ' of ' + gridConfig.dataSource.rowCount + ' rows');
                gridConfig.grid.find('.grid-content-div').empty();
                gridConfig.pageRequest.eventType = 'page';
                gridConfig.pageRequest.pageNum = pageNum;
                preparePageDataGetRequest(id);
            });
        });
    }
};

export { pagerGenerator };