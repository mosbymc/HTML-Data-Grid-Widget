import { gridState } from './gridState';
import { general_util } from './general_util';

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
        var gridConfig = gridState.getInstance(gridId),
            exportOptions = gridConfig.grid.find('#excel_grid_id_' + gridId);
        if (!exportOptions.length) {
            exportOptions = $('<div id="excel_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '" style="display: none;"></div>');
            var exportList = $('<ul class="menu-list"></ul>');
            if (gridConfig.dataSource.rowCount <= gridConfig.pageSize)
                exportList.append('<li data-value="page" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Current Page Data</span></a></li>');
            exportList.append('<li data-value="all" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">All Page Data</span></a></li>');
            if (gridConfig.selectable && gridConfig.grid.find('.selected').length) {
                exportList.append('<li data-value="select" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Selected Grid Data</span></a></li>');
            }
            var options = exportList.find('li');
            options.on('click', function excelExportItemClickHandler() {
                exportDataAsExcelFile(gridId, this.dataset.value);
                gridConfig.grid.find('.grid_menu').addClass('hiddenMenu');
                toggle(exportOptions, {duration: 20, callback: function checkForMouseOver() {

                    }});
            });
            exportOptions.append(exportList);
            gridConfig.grid.append(exportOptions);
        }
        else exportOptions.removeClass('hidden_menu_item');

        if (exportOptions.css('display') === 'none') {
            var groupAnchorOffset = menuAnchor.offset(),
                newMenuOffset = menu.offset();
            exportOptions.css('top', (groupAnchorOffset.top - 3 - $(window).scrollTop()));
            exportOptions.css('left', newMenuOffset.left + (menu.outerWidth() - exportOptions.outerWidth()));
            toggle(exportOptions, {duration: 200, callback: function checkForMouseOver() {}});
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
    if (excelExporter && typeof excelExporter.createWorkBook === general_util.jsTypes.function) {
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
    var columns = getGridColumns(gridId),
        gridConfig = gridState.getInstance(gridId);
    switch (option) {
        case 'select':
            //TODO: this is a bad namespace; need to rework the unfortunate grid.grid section
            //TODO: need to also create a better way to get the selected grid data as it appears in the dataSource
            var selectedData = gridConfig.grid[0].grid.selectedData;
            if (!selectedData.length) return;
            var data = [], currentRow = selectedData[0].rowIndex;
            selectedData.forEach(function _constructObjects(item, idx) {
                if (!data.length || currentRow !== item.rowIndex) {
                    var tmpObj = {};
                    tmpObj[item.field] = selectedData[idx].data;
                    data.push(tmpObj);
                    currentRow = selectedData[idx].rowIndex;
                }
                else data[data.length - 1][item.field] = item.data;
            });
            callback({ data: data, columns: columns});
            break;
        case 'all':
            if (typeof gridConfig.dataSource.get === general_util.jsTypes.function && gridConfig.dataSource.rowCount > gridConfig.pageSize) {
                gridConfig.dataSource.get(createExcelRequestObject(gridId), function excelDataCallback(response) {
                    callback({ data: response.data, columns: columns});
                });
            }
            else callback({ data: gridConfig.originalData, columns: columns });
            break;
        case 'page':
        default:
            callback({ data: gridConfig.dataSource.data, columns: columns });
    }
}

function getGridColumns(gridId) {
    return gridState.getInstance(gridId).columns.filter(function _returnDisplayedColumns(col) {
        return !col.isHidden;
    });
}

function createExcelRequestObject(gridId) {
    var gridConfig = gridState.getInstance(gridId),
        requestObj = {};
    if (gridConfig.sortable) requestObj.sortedOn = gridConfig.sortedOn.length ? gridConfig.sortedOn : [];
    if (gridConfig.filterable) requestObj.filters = gridConfig.filters.filterGroup && gridConfig.filters.filterGroup.length? gridConfig.filters : { conjunct: null, filterGroup: [] };
    if (gridConfig.groupable) requestObj.groupedBy = gridConfig.groupedBy.length? gridConfig.groupedBy : [];

    requestObj.pageSize = gridConfig.dataSource.rowCount;
    requestObj.pageNum = 1;
    return requestObj;
}

export { exportDataAsExcelFile };