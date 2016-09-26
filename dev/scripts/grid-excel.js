import { getGridColumns } from './gridHelpers';

/**
 * Creates the excel export sub-menu options and attached handlers
 * @param {object} menu - The DOM menu-element
 * @param {number}gridId - The id of the current grid widget instance
 * @returns {*|HTMLElement}
 */
function createExcelExportMenuItems(menu, gridId) {
    var menuList = $('<ul class="menu-list"></ul>');
    var menuItem = $('<li class="menu_item"></li>');
    var menuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Export to Excel<span class="menu_arrow"/></span></a>');
    menuItem.on('mouseover', function excelMenuItemHoverHandler() {
        var exportOptions = gridState[gridId].grid.find('#excel_grid_id_' + gridId);
        if (!exportOptions.length) {
            exportOptions = $('<div id="excel_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '" style="display: none;"></div>');
            var exportList = $('<ul class="menu-list"></ul>');
            var gridPage = $('<li data-value="page" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Current Page Data</span></a></li>');
            var allData = $('<li data-value="all" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">All Page Data</span></a></li>');
            exportList.append(gridPage).append(allData);
            if (gridState[gridId].selectable) {
                var gridSelection = $('<li data-value="select" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Selected Grid Data</span></a></li>');
                exportList.append(gridSelection);
            }
            var options = exportList.find('li');
            options.on('click', function excelExportItemClickHandler() {
                exportDataAsExcelFile(gridId, this.dataset.value);
                gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
            });
            exportOptions.append(exportList);
            gridState[gridId].grid.append(exportOptions);
        }
        else exportOptions.removeClass('hidden_menu_item');

        if (exportOptions.css('display') === 'none') {
            var groupAnchorOffset = menuAnchor.offset(),
                newMenuOffset = menu.offset();
            exportOptions.css('top', (groupAnchorOffset.top - 3 - $(window).scrollTop()));
            exportOptions.css('left', newMenuOffset.left + (menu.outerWidth() - exportOptions.outerWidth()));
            toggle(exportOptions, {duration: 200, callback: function checkForMouseOver() {

            }});
        }
    });
    menuList.on('mouseleave', function excelMenuItemHoverHandler(evt) {
        setTimeout(function detectMouseLeave() {
            var excelOptions = $('#excel_grid_id_' + gridId),
                excelOptionsOffset = excelOptions.offset();
            if (evt.pageX >= excelOptionsOffset.left && evt.pageX <= (excelOptionsOffset.left + excelOptions.width()) && evt.pageY >= excelOptionsOffset.top &&
                evt.pageY <= (excelOptionsOffset.top + excelOptions.height())) {
                return;
            }
            toggle(excelOptions, { duration: 200 });
        }, 200);
    });
    menuList.append(menuItem.append(menuAnchor));
    return menuList;
}

/**
 * Exports data from grid based on user's selection (current page data, all data, or selection data if the grid is selectable is turned on)
 * @param {number} gridId - The id of the grid DOM instance
 * @param {string} option - The export option selected by the user
 */
function exportDataAsExcelFile(gridId, option) {
    if (excelExporter && typeof excelExporter.createWorkBook === 'function') {
        determineGridDataToExport(gridId, (option || 'page'), function gridDataCallback(excelDataAndColumns) {
            excelExporter.exportWorkBook(excelExporter.createWorkBook().createWorkSheet(excelDataAndColumns.data, excelDataAndColumns.columns, 'testSheet'));
        });
    }
}

/**
 * Determines what grid data to export to excel based on user's selected menu option
 * @param {number} gridId - The id of the grid DOM instance
 * @param {string} option - The export option selected by the user
 * @param {function} callback - The callback function; Needed for server-side data requests
 */
function determineGridDataToExport(gridId, option, callback) {
    var columns = getGridColumns(gridState[gridId]);
    switch (option) {
        case 'select':
            //TODO: this is a bad namespace; need to rework the unfortunate grid.grid section
            //TODO: need to also create a better way to get the selected grid data as it appears in the dataSource
            var selectedData = gridState[gridId].grid[0].grid.selectedData;
            if (!selectedData.length) return;
            var data = [], currentRow = selectedData[0].rowIndex;
            for (var i = 0; i < selectedData.length; i++) {
                if (!data.length || currentRow !== selectedData[i].rowIndex) {
                    var tmpObj = {};
                    tmpObj[selectedData[i].field] = selectedData[i].data;
                    data.push(tmpObj);
                    currentRow = selectedData[i].rowIndex;
                }
                else {
                    data[data.length - 1][selectedData[i].field] = selectedData[i].data;
                }
            }
            callback({ data: data, columns: columns});
            break;
        case 'all':
            if (typeof gridState[gridId].dataSource.get === 'function') {
                var reqObj = createExcelRequestObject(gridId);
                gridState[gridId].dataSource.get(reqObj, function excelDataCallback(response) {
                    callback({ data: response.data, columns: columns});
                });
            }
            else callback({ data: gridState[gridId].originalData, columns: columns });
            break;
        case 'page':
        default:
            callback({ data: gridState[gridId].dataSource.data, columns: columns });
    }
}

//TODO: why am I creating the request object differently here than in the normal grid page get request?
function createExcelRequestObject(gridId) {
    //MCM
    var gridData = gridState[gridId];
    var sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
    var filters = gridData.pageRequest.filters || gridData.filters || null;
    var filteredOn = gridData.pageRequest.filteredOn || gridData.filteredOn || null;
    var filterVal = gridData.pageRequest.filterVal || gridData.filterVal || null;
    var filterType = gridData.pageRequest.filterType || gridData.filterType || null;
    var groupedBy = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupedBy : gridData.groupedBy || null;
    var groupSortDirection = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupSortDirection : gridData.groupSortDirection || null;

    var requestObj = {};
    if (gridData.sortable) requestObj.sortedOn = sortedOn;

    if (gridData.filterable) {
        requestObj.filters = filters;
        requestObj.filteredOn = filteredOn;
        requestObj.filterVal = filterVal;
        requestObj.filterType = filterType;
    }

    if (gridData.groupable) {   //TODO: not sure if the data can be grouped in excel; maybe a pivot table, but that will come much later, if at all.
        requestObj.groupedBy = groupedBy;
        requestObj.groupSortDirection = groupSortDirection;
    }

    requestObj.pageSize = gridData.dataSource.rowCount;
    requestObj.pageNum = 1;
    return requestObj;
}

var gridState = {},
    isInitialized = false;

function excel_init(gridIObj) {
    gridState = gridIObj;
    isInitialized = true;
}

export { createExcelExportMenuItems, exportDataAsExcelFile, determineGridDataToExport, createExcelRequestObject, excel_init, isInitialized };