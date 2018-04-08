/**
 * Attaches click handlers to each pager
 * @param {object} gridPager - The grid's DOM pager element
 */
function setPagerEventListeners(gridPager) {
    gridPager.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
        $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
            e.preventDefault();
            var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
            if (link.hasClass('link-disabled')) {   //If the pager link that was clicked on is disabled, return.
                return;
            }
            var gridPager = link.parents('.grid-pager-div');
            var allPagers = gridPager.find('a');
            var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
            if (gridState[id].updating) return;     //can't page if grid is updating
            var gridData = gridState[id];
            var pageSize = gridData.pageSize;
            var pagerInfo = gridPager.find('.pageinfo');
            var pagerSpan = gridPager.find('.grid-pagenum-span');
            var totalPages = (gridData.dataSource.rowCount - pageSize) > 0 ? Math.ceil((gridData.dataSource.rowCount - pageSize)/pageSize) + 1 : 1;
            var pageNum = parseInt(link[0].dataset.pagenum);
            gridData.pageNum = pageNum;
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
                    rowEnd = gridData.dataSource.rowCount < pageSize * pageNum ? gridData.dataSource.rowCount : pageSize * pageNum;
                    link[0].dataset.pagenum = pageNum + 1;
                    if (pageNum === totalPages) {
                        link.addClass('link-disabled');
                        $(allPagers[3]).addClass('link-disabled');
                    }
                    $(allPagers[0]).removeClass('link-disabled');
                    $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                    break;
                case 'last':
                    rowEnd = gridData.dataSource.rowCount < pageSize * pageNum ? gridData.dataSource.rowCount : pageSize * pageNum;
                    link.addClass('link-disabled');
                    $(allPagers[2]).addClass('link-disabled')[0].dataset.pagenum = pageNum;
                    $(allPagers[0]).removeClass('link-disabled');
                    $(allPagers[1]).removeClass('link-disabled')[0].dataset.pagenum = pageNum - 1;
                    break;
            }
            pagerSpan.text('Page ' + pageNum + '/' + totalPages);
            pagerInfo.text(rowStart + ' - ' + rowEnd + ' of ' + gridData.dataSource.rowCount + ' rows');
            gridData.grid.find('.grid-content-div').empty();
            gridData.pageRequest.eventType = 'page';
            gridData.pageRequest.pageNum = pageNum;
            preparePageDataGetRequest(id);
        });
    });
}

export { setPagerEventListeners };