var grid = (function _grid($) {
    'use strict';
    var dataTypes, events, storage, aggregates;

    function create(gridData, gridElem) {
        if (gridData && isDomElement(gridElem)) {
            var id = storage.count;
            if (id > 0) {   
                var tmp = id - 1;
                while (tmp > -1) {  
                    if (storage.grids[tmp] != null && !$('body').find('#' + storage.grids[tmp].grid[0].id).length)     
                        delete storage.grids[tmp];      
                    tmp--;
                }
            }
            gridElem = $(gridElem);
            var wrapperDiv = $('<div id="grid-wrapper-' + id + '" data-grid_id="' + id + '" class=grid-wrapper></div>').appendTo(gridElem);
            var headerDiv = $('<div id="grid-header-' + id + '" data-grid_header_id="' + id + '" class=grid-header-div></div>').appendTo(wrapperDiv);
            headerDiv.append('<div class=grid-header-wrapper></div>');
            wrapperDiv.append('<div id="grid-content-' + id + '" data-grid_content_id="' + id + '" class=grid-content-div></div>');
            wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');

            storage.grids[id] = {};
            gridElem[0].grid = {};

            createGridInstanceMethods(gridElem, id);

            (gridData.useValidator === true && window.validator && typeof validator.setAdditionalEvents === 'function') ? validator.setAdditionalEvents(['blur', 'change']) : gridData.useValidator = false;
            gridData.useFormatter = gridData.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === 'function';

            if (gridData.constructor === Array) createGridColumnsFromArray(gridData, gridElem);
            else {
                createGridHeaders(gridData, gridElem);
                getInitialGridData(gridData.dataSource, function initialGridDataCallback(err, res) {
                    if (!err) {
                        gridData.dataSource.data = res.data;
                        gridData.dataSource.rowCount = res.rowCount || 25;
                        if (res.aggregations) {
                            for (var col in gridData.summaryRow) {
                                if (res.aggregations[col])
                                    gridData.summaryRow[col].value = res.aggregations[col];
                            }
                        }
                    }
                    else {
                        gridData.dataSource.data = {};
                        gridData.dataSource.rowCount = 0;
                    }
                    initializeGrid(id, gridData, gridElem);
                });
            }
        }
    }

    function createGridInstanceMethods(gridElem, gridId) {

        Object.defineProperty(
            gridElem[0].grid,
            'export',
            {
                value: function _export() {
                    exportDataAsExcelFile(gridElem.find('.grid-content-div').find('table').html());
                }
            }
        );

        Object.defineProperty(
            gridElem[0].grid,
            'activeCellData',
            {
                get: function _getActiveCellData() {
                    var cell = gridElem.find('.active-cell');
                    if (!cell.length)
                        return null;
                    var field = cell.parents('td').data('field');
                    var colIndex = cell.parents('.grid-wrapper').find('.grid-header-wrapper').find('.grid-headerRow').children('[data-field="' + field + '"]').data('index');
                    if (cell[0].type === 'checkbox')
                        return { data: cell[0].checked, row: cell.parents('tr').index(), column: colIndex, field: field };
                    return { data: cell.val(), row: cell.parents('tr').index(), column: colIndex, field: field, cell: cell.parents('td')[0] };
                },
                configurable: false
            });

        Object.defineProperty(
            gridElem[0].grid,
            'selected',
            {
                get: function _getSelectedItems() {
                    var selectedItems = [];
                    gridElem.find('.selected').each(function iteratedSelectedGridItems(idx, val) {
                        selectedItems.push(val);
                    });
                    return selectedItems;
                },
                set: function _setSelectedItems(itemArray) {
                    if (!itemArray || itemArray.constructor !== Array) return;
                    for (var i = 0; i < itemArray.length; i++) {
                        if (typeof itemArray[i].rowIndex !== 'number') continue;
                        var row = gridElem.find('.grid-content-div').find('tbody').children('tr:nth-child(' + (itemArray[i].rowIndex + 1) + ')');
                        if (typeof itemArray[i].columnIndex === 'number') {
                            row.children('td:nth-child(' + (itemArray[i].columnIndex + 1) + ')').addClass('selected');
                        }
                        else
                            row.addClass('selected');
                    }
                },
                configurable: false
            }
        );

        Object.defineProperty(
            gridElem[0].grid,
            'selectedData',
            {
                get: function _getSelectedGridItemData() {
                    var data = [];
                    gridElem.find('.selected').each(function getSelectedElementData(index, value) {
                        var item = $(value);
                        if (value.tagName.toLowerCase() === 'tr') {
                            var rowIndex = item.index();
                            $(value).children().each(function iterateTableCells(idx, val) {
                                var cell = $(val);
                                data.push({ rowIndex: rowIndex, columnIndex: cell.index(), data: cell.text(), field: cell.data('field') });
                            });
                        }
                        else {
                            data.push({ rowIndex: item.parents('tr').index(), columnIndex: item.index(), data: item.text(), field: item.data('field') });
                        }
                    });
                    return data;
                },
                configurable: false
            }
        );



        Object.defineProperties(
            gridElem[0].grid, {
                'bindEvents': {
                    value: function _bindGridEvents(evt, funcs) {
                        if (!funcs || (typeof funcs !== 'function' && funcs.constructor !== Array)) return false;
                        if (typeof funcs === 'function') funcs = [funcs];
                        if (~events.indexOf(evt)) {
                            storage.grids[gridId].events[evt] = storage.grids[gridId].events[evt].concat(funcs);
                            return true;
                        }
                        return false;
                    },
                    writable: false,
                    configurable: false
                },
                'unbindEvents': {
                    value: function _unbindEvents(evt, funcs) {
                        if (~events.indexOf(evt) && (funcs || (typeof funcs === 'function' || funcs.constructor === Array))) {
                            if (typeof funcs === 'function') funcs = [funcs];
                            var tmpEvts = [];
                            for (var i = 0; i < storage.grids[gridId].events[evt].length; i++) {
                                for (var j = 0; j < funcs.length; j++) {
                                    if (storage.grids[gridId].events[evt][i] !== funcs[j])
                                        tmpEvts.push(storage.grids[gridId].events[evt][i]);
                                }
                            }
                            storage.grids[gridId].events[evt] = tmpEvts;
                            return true;
                        }
                        return false;
                    },
                    writable: false,
                    configurable: false
                },
                'removeAllEventHandlers': {
                    value: function _removeAllEventHandlers() {
                        for (var i = 0; i < events.length; i++) {
                            storage.grids[gridId].events[events[i]] = [];
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'getHandledEvents': {
                    value: function _getHandledEvents() {
                        var evts = [];
                        for (var i = 0; i < events.length; i++) {
                            if (storage.grids[gridId].events[events[i]].length)
                                evts.push(events[i]);
                        }
                        return evts;
                    },
                    writable: false,
                    configurable: false
                },
                'getAvailableEvents': {
                    value: function _getAvailableEvents() {
                        return events;
                    },
                    writable: false,
                    configurable: false
                },
                'getAggregates': {
                    value: function _getAggregates() {
                        return storage.grids[gridId].summaryRow;
                    },
                    writable: false,
                    configurable: false
                },
                'getCurrentPageData': {
                    value: function _getCurrentPageData(index) {
                        var rows = [],
                            result = [],
                            tmpRowModel,
                            validRow;
                        if (typeof index === 'number' && index > -1 && index <= storage.grids[gridId].dataSource.data.length) {
                            validRow = findValidRows(index);
                            if (validRow) rows.push(validRow);
                        }
                        else {
                            for (var i = 0; i < storage.grids[gridId].pageSize; i++) {
                                validRow = findValidRows(i);
                                if (validRow) rows.push(validRow);
                            }
                        }

                        for (var j = 0; j < rows.length; j++) {
                            tmpRowModel = {};
                            var cells = rows[j].find('td');
                            for (var k = 0; k < cells.length; k++) {
                                tmpRowModel[$(cells[k]).data('field')] = $(cells[k]).text();
                            }
                            result.push(tmpRowModel);
                        }
                        return result;

                        function findValidRows(index) {
                            var counter = 0;
                            var row = null;
                            storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                                if ($(this).hasClass('grouped_row_header'))
                                    return true;
                                if (counter === index) {
                                    row = $(this);
                                    return false;
                                }
                                counter++;
                            });
                            return row;
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'getCurrentDataSourceData': {
                    value: function _getCurrentDataSourceData(index) {
                        var i;
                        if (typeof index === 'number' && index > -1 && index <= storage.grids[gridId].dataSource.data.length) {
                            var val = cloneGridData([].concat(storage.grids[gridId].dataSource.data[index]));
                            delete val[0]._initialRowIndex;
                            return val;
                        }
                        else {
                            var gd = cloneGridData(storage.grids[gridId].dataSource.data);
                            for (i = 0; i < gd.length; i++) {
                                delete gd[i]._initialRowIndex;
                            }
                            return gd;
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updatePageData': {
                    value: function _updatePageData(data) {
                        if (data != null && typeof data === 'object' && data.constructor === Array) {
                            storage.grids[gridId].dataSource.data = data;
                            storage.grids[gridId].pageSize = data.length;
                            storage.grids[gridId].dataSource.rowCount = data.length;
                            storage.grids[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(storage.grids[gridId], storage.grids[gridId].grid);
                            storage.grids[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(storage.grids[gridId], storage.grids[gridId].grid);
                            buildHeaderAggregations(storage.grids[gridId], gridId);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updateRowData': {
                    value: function _updateRowData(rowData) {
                        var appliedUpdate = false;
                        if (!rowData)
                            return;
                        if (rowData.constructor === Array) {
                            for (var i = 0; i < rowData.length; i++) {
                                if (typeof rowData[i].index !== 'number' || rowData[i].index >= storage.grids[gridId].dataSource.data.length)
                                    continue;
                                storage.grids[gridId].dataSource.data[rowData[i].index] = rowData[i].data;
                                appliedUpdate = true;
                            }
                        }
                        else if (typeof rowData.index === 'number') {
                            storage.grids[gridId].dataSource.data[rowData.index] = rowData.data;
                            appliedUpdate = true;
                        }

                        if (appliedUpdate) {
                            storage.grids[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(storage.grids[gridId], storage.grids[gridId].grid);
                            storage.grids[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(storage.grids[gridId], storage.grids[gridId].grid);
                            buildHeaderAggregations(storage.grids[gridId], gridId);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'updateCellData': {
                    value: function _updateCellData(cellData, setAsDirty) {
                        if (!cellData) return;
                        if (cellData.constructor === Array) {
                            cellData.forEach(function cellIterationCallback(cell) {
                                applyUpdate(cell, setAsDirty);
                            });
                        }
                        else applyUpdate(cellData, setAsDirty);

                        function applyUpdate(cell, setAsDirty) {
                            if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > storage.grids[gridId].dataSource.data.length)
                                return;
                            if (storage.grids[gridId].columns[cell.field]) {
                                var dataType = storage.grids[gridId].columns[cell.field].type;
                                if (!dataType)
                                    dataType = 'string';
                                if (dataType !== 'time' && dataType !== 'date' && dataType !== 'datetime') {
                                    if (typeof cell.value !== dataType)
                                        return;
                                }
                                else {
                                    var re = new RegExp(dataTypes[dataType]);
                                    if (!re.test(cell.value)) return;
                                }
                                storage.grids[gridId].dataSource.data[cell.index][cell.field] = cell.value;
                                var tableCell;
                                if (storage.grids[gridId].groupedBy) {
                                    var counter = 0;
                                    storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
                                        if ($(this).hasClass('grouped_row_header'))
                                            return true;
                                        if (counter === cell.index) {
                                            tableCell = $(this).find('[data-field="' + cell.field + '"]');
                                            return false;
                                        }
                                        counter++;
                                    });
                                }
                                else
                                    tableCell = storage.grids[gridId].grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
                                var text = getFormattedCellText(gridId, cell.field, cell.value) || cell.value;
                                tableCell.text(text);
                                if (setAsDirty) tableCell.prepend('<span class="dirty"></span>');
                            }
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'destroy': {
                    value: function _destroy() {
                        findChildren(storage.grids[gridId].grid.children());
                        delete storage.grids[gridId];

                        function findChildren(nodes) {
                            for (var i = 0; i < nodes.length; i++) {
                                var child = $(nodes[i]);
                                while (child.children().length)
                                    findChildren(child.children());
                                child.off();
                                child.remove();
                            }
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'removeSelection': {
                    value: function _removeSelection() {
                        gridElem.find('.selected').each(function removeSelectedClass(idx, val) {
                            $(val).removeClass('selected');
                        });
                    },
                    writable: false,
                    configurable: false
                }
            });

        var keys = Object.getOwnPropertyNames(gridElem[0].grid);
        for (var i = 0; i < keys.length; i++) {
            Object.preventExtensions(gridElem[0].grid[keys[i]]);
        }
    }

    function getInitialGridData(dataSource, callback) {
        if (dataSource && typeof dataSource.data === 'object')
            callback(null, { data: dataSource.data, rowCount: dataSource.rowCount });
        else if (typeof dataSource.get == 'function') {
            dataSource.get({ pageSize: 25, pageNum: 1 },
                function gridDataCallback(data) {
                if (data) callback(null, data);
                else callback(true, {});
            });
        }
        else callback(true, {});
    }

    function initializeGrid(id, gridData, gridElem) {
        var storageData = cloneGridData(gridData);
        storageData.events = {
            beforeCellEdit: typeof storageData.beforeCellEdit === 'object' && storageData.beforeCellEdit.constructor === Array ? storageData.beforeCellEdit : [],
            cellEditChange: typeof storageData.cellEditChange === 'object' && storageData.cellEditChange.constructor === Array ? storageData.cellEditChange : [],
            afterCellEdit: typeof storageData.afterCellEdit === 'object' && storageData.afterCellEdit.constructor === Array ? storageData.afterCellEdit : [],
            pageRequested: typeof storageData.pageRequested === 'object' && storageData.pageRequested.constructor === Array ? storageData.pageRequested : [],
            beforeDataBind: typeof storageData.beforeDataBind === 'object' && storageData.beforeDataBind.constructor === Array ? storageData.beforeDataBind : [],
            afterDataBind: typeof storageData.afterDataBind === 'object' && storageData.afterDataBind.constructor === Array ? storageData.afterDataBind : [],
            columnReorder: typeof storageData.columnReorder === 'object' && storageData.columnReorder.constructor === Array ? storageData.columnReorder : []
        };

        for (var event in storageData.events) {
            if (storageData.events[event].length) {
                storageData.events[event] = storageData.events[event].map(function mapEventsCallback(fn) {
                    if (typeof fn == 'function') return fn;
                });
            }
        }

        delete storageData.beforeCellEdit;
        delete storageData.cellEditChange;
        delete storageData.afterCellEdit;
        delete storageData.pageRequested;
        delete storageData.beforeDataBind;
        delete storageData.afterDataBind;
        delete storageData.columnReorder;

        storageData.originalData = cloneGridData(gridData.dataSource.data);
        storageData.pageNum = 1;
        storageData.pageSize = gridData.pageSize || 25;
        storageData.grid = gridElem;
        storageData.currentEdit = {};
        storageData.pageRequest = {};
        storageData.putRequest = {};
        storageData.resizing = false;
        storageData.sortedOn = [];
        if (!storageData.dataSource.rowCount) storageData.dataSource.rowCount = gridData.dataSource.data.length;

        var eventObj = { element: storageData.grid };
        callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

        storage.grids[id] = storageData;

        if (gridData.summaryRow && gridData.summaryRow.positionAt === 'top') buildHeaderAggregations(gridData, id);

        createGridFooter(gridData, gridElem);
        createGridContent(gridData, gridElem);

        callGridEventHandlers(storageData.events.afterDataBind, storageData.grid, eventObj);
    }

    function addNewColumns(newData, gridElem) {
        var oldGrid = $(gridElem).find('.grid-wrapper');
        var id = oldGrid.data('grid_id');
        var oldData = storage.grids[id].data;

        for (var i = 0; i < newData.length; i++) {
            for (var col in newData[i]) {
                if (!oldData.data[i][col]) {
                    oldData.data[i][col] = newData[i][col];
                }
                if (!oldData.columns[col]) {
                    oldData.columns[col] = { field: col, title: col, index: Object.keys(oldData.columns).length };
                }
            }
        }

        gridElem.removeChild(oldGrid);
        create(oldData, gridElem);
    }

    function createGridHeaders(gridData, gridElem) {
        var gridHeader = gridElem.find('.grid-header-div');
        var gridHeadWrap = gridHeader.find('.grid-header-wrapper');
        var headerTable = $('<table></table>').appendTo(gridHeadWrap);
        headerTable.css('width','auto');
        var colgroup = $('<colgroup></colgroup>').appendTo(headerTable);
        var headerTHead = $('<thead></thead>').appendTo(headerTable);
        var headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead);
        var index = 0;

        if (gridData.groupedBy && gridData.groupedBy !== 'none') {
            colgroup.append('<col class="group_col"/>');
            headerRow.append('<th class="grid-header-cell grouped_cell"></th>');
        }

        for (var col in gridData.columns) {
            if (typeof gridData.columns[col] !== 'object')
                continue;
            $('<col/>').appendTo(colgroup);
            var text = gridData.columns[col].title || col;
            var th = $('<th id="' + col + '_grid_id_' + gridHeader.data('grid_header_id') + '" data-field="' + col + '" data-index="' + index + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof gridData.columns[col].attributes === 'object' && gridData.columns[col].attributes.headerClasses && gridData.columns[col].attributes.headerClasses.constructor ===  Array) {
                for (var i = 0; i < gridData.columns[col].attributes.headerClasses.length; i++) {
                    th.addClass(gridData.columns[col].attributes.headerClasses[i]);
                }
            }

            if (gridData.reorderable === true && (typeof gridData.columns[col].reorderable === 'undefined' || gridData.columns[col].reorderable === true)) {
                th.prop('draggable', true);
                setDragAndDropListeners(th);
            }
            if (gridData.sortable === true && (typeof gridData.columns[col].sortable === 'undefined' || gridData.columns[col].sortable === true)) {
                setSortableClickListener(th);
            }
            if (gridData.columns[col].filterable === true) {
                setFilterableClickListener(th, gridData, col);
                createCellEditSaveDiv(gridData, gridElem);
            }

            if (gridData.columns[col].editable || gridData.columns[col].selectable)
                createCellEditSaveDiv(gridData, gridElem);

            $('<a class="header-anchor" href="#"></a>').appendTo(th).text(text);

            index++;
        }
        headerTable.css('width','');
        setColWidth(gridData, gridElem);
    }

    function buildHeaderAggregations(gridData, gridId) {
        var sum = buildAggregatesRow(gridData, gridId);
        if (sum) {
            var headerTHead = $('#grid-header-' + gridId).find('thead');
            var sumRow = headerTHead.find('.summary-row-header');
            if (sumRow.length)
                sumRow.remove();
            sumRow = $('<tr class=summary-row-header></tr>').appendTo(headerTHead);
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                sumRow.append('<th class="grid-header-cell grouped_cell"></th>');
            }
            for (var col in sum) {
                var text = sum[col] != null ? sum[col] : '';
                sumRow.append('<td data-field="' + col + '" class=summary-cell-header>' + text + '</td>');
            }
        }
    }

    function buildAggregatesRow(gridData, gridId) {
        var aggData = {},
            data = gridData.alteredData ? gridData.alteredData :  gridData.dataSource.data,
            total, i;
        for (var col in gridData.columns) {
            var type = typeof gridData.columns[col].type === 'string' ? gridData.columns[col].type : '';
            var text;
            if (!gridData.summaryRow[col]) {
                aggData[col] = '';
                continue;
            }
            if (typeof gridData.dataSource.get === 'function') {
                if (gridData.summaryRow[col].type && gridData.summaryRow[col].value) {
                    text = getFormattedCellText(gridId, col, gridData.summaryRow[col].value) || gridData.summaryRow[col].value;
                    aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                }
                else
                    aggData[col] = null;
            }
            else {
                switch (gridData.summaryRow[col].type) {
                    case 'count':
                        text = getFormattedCellText(gridId, col, gridData.dataSource.rowCount) || gridData.dataSource.rowCount;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'average':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        var avg = parseFloat(total/parseFloat(gridData.dataSource.rowCount)).toFixed(2);
                        text = getFormattedCellText(gridId, col, avg) || avg;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'total':
                        total = 0;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            total += parseFloat(data[i][col]);
                        }
                        if (type === 'currency') total = total.toFixed(2);
                        text = getFormattedCellText(gridId, col, total) || total;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'min':
                        var min;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!min || parseFloat(data[i][col]) < min) min = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, min) || min;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case 'max':
                        var max;
                        for (i = 0; i < gridData.dataSource.rowCount; i++) {
                            if (!max || parseFloat(data[i][col]) > max) max = parseFloat(data[i][col]);
                        }
                        text = getFormattedCellText(gridId, col, max) || max;
                        aggData[col] = aggregates[gridData.summaryRow[col].type] + text;
                        break;
                    case '':
                        aggData[col] = null;
                        break;
                }
            }
        }
        for (col in gridData.columns) {
            if (aggData[col] != null)
                return aggData;
        }
        return null;
    }

    function createGridContent(gridData, gridElem) {
        var contentHeight;
        var footerHeight = parseFloat(gridElem.find('.grid-footer-div').css('height'));
        var headerHeight = parseFloat(gridElem.find('.grid-header-div').css('height'));
        var toolbarHeight = 0;
        if (gridElem.find('.toolbar'))
            toolbarHeight = parseFloat(gridElem.find('.toolbar').css('height'));

        contentHeight = gridData.height && isNumber(parseFloat(gridData.height)) ? gridData.height - (headerHeight + footerHeight + toolbarHeight) + 'px' : '250px';
        var gridContent = gridElem.find('.grid-content-div').css('height', contentHeight);
        var id = gridContent.data('grid_content_id');
        var gcOffsets = gridContent.offset();
        var top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop();
        var left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
        var loader = $('<span id="loader-span" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
        var contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent);
        var colGroup = $('<colgroup></colgroup>').appendTo(contentTable);
        var contentTBody = $('<tbody></tbody>').appendTo(contentTable);
        if (gridData.selectable) attachTableSelectHandler(contentTBody);
        var columns = [];
        gridElem.find('th').each(function headerIterationCallback(idx, val) {
            if (!$(val).hasClass('group_spacer'))
                columns.push($(val).data('field'));
        });

        var rowStart = 0;
        var rowEnd = gridData.dataSource.data.length;
        var curRow;
        var rows = gridData.rows;

        for (var i = (rowStart); i < rowEnd; i++) {
            gridData.dataSource.data[i]._initialRowIndex = i;
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                if (!curRow || gridData.dataSource.data[i][gridData.groupedBy] !== curRow) {
                    curRow = gridData.dataSource.data[i][gridData.groupedBy];
                    var groupedText = getFormattedCellText(id, gridData.groupedBy, curRow) || curRow;
                    var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(contentTBody);
                    var groupTitle = gridData.columns[gridData.groupedBy].title || gridData.groupedBy;
                    groupTr.append('<td colspan="' + (columns.length + 1) + '"><p class="grouped"><a class="group-desc sortSpan group_acc_link"></a>' + groupTitle + ': ' + groupedText + '</p></td>');
                }
            }
            else if (!gridData.groupedBy && gridElem.find('.group_spacer').length) {
                $(document).find('.group_col').remove();
                $(document).find('.group_spacer').remove();
            }
            var tr = $('<tr></tr>').appendTo(contentTBody);
            if (i % 2) {
                tr.addClass('alt-row');
                if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
                    for (var x = 0; x < rows.alternateRows.length; x++) {
                        tr.addClass(rows.alternateRows[x]);
                    }
            }

            if (rows && rows.all && rows.all.constructor === Array) {
                for (var y = 0; y < rows.all.length; y++) {
                    tr.addClass(rows.all[y]);
                }
            }

            if (gridData.groupedBy && gridData.groupedBy !== 'none')
                tr.append('<td class="grouped_cell">&nbsp</td>');

            for (var j = 0; j < columns.length; j++) {
                var td = $('<td data-field="' + columns[j] + '" class="grid-content-cell"></td>').appendTo(tr);
                if (gridData.columns[columns[j]].attributes && gridData.columns[columns[j]].attributes.cellClasses && gridData.columns[columns[j]].attributes.cellClasses.constructor === Array) {
                    for (var z = 0; z < gridData.columns[columns[j]].attributes.cellClasses.length; z++) {
                        td.addClass(gridData.columns[columns[j]].attributes.cellClasses[z]);
                    }
                }
                var text = getFormattedCellText(id, columns[j], gridData.dataSource.data[i][columns[j]]) || gridData.dataSource.data[i][columns[j]];
                td.text(text);
                if (gridData.columns[columns[j]].editable) makeCellEditable(id, td);
                else if (gridData.columns[columns[j]].selectable) makeCellSelectable(id, td);
            }
        }

        for (var k = 0; k < columns.length; k++) {
            colGroup.append('<col/>');
        }
        if (gridData.groupedBy && gridData.groupedBy !== 'none')
            colGroup.prepend('<col class="group_col"/>');

        if (gridData.summaryRow && gridData.summaryRow.positionAt === 'bottom') {
            var sum = buildAggregatesRow(gridData, id);
            var sumRow = $('<tr class="summary-row-footer"></tr>').appendTo(contentTBody);
            for (var col in sum) {
                sumRow.append('<td data-field="' + col + '" class="summary-cell-footer">' + sum[col] + '</td>');
            }
        }

        createGroupTrEventHandlers();

        gridContent.on('scroll', function contentDivScrollCallback(e) {
            var cDiv = $(e.currentTarget);
            var headWrap = cDiv.parents('.grid-wrapper').find('.grid-header-wrapper');
            if (storage.grids[headWrap.parent().data('grid_header_id')].resizing)
                return;
            headWrap.scrollLeft(cDiv.scrollLeft());
        });

        var headerId = 'grid-header-' + gridContent.data('grid_content_id');
        var headDiv = $('#' + headerId);
        var sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
        headDiv.css('paddingRight', sizeDiff);

        copyGridWidth(gridElem);

        storage.grids[id].dataSource.data = gridData.dataSource.data;
        loader.remove();
        storage.grids[id].updating = false;
    }

    function attachTableSelectHandler(tableBody) {
        var gridId = tableBody.parents('.grid-wrapper').data('grid_id');
        var isSelectable = storage.grids[gridId].selectable;
        if (isSelectable) {
            $(document).on('click', function tableBodySelectCallback(e) {
                if (e.target === tableBody[0] || $(e.target).parents('tbody')[0] === tableBody[0]) {
                    if (storage.grids[gridId].selecting) {
                        storage.grids[gridId].selecting = false;
                        return;
                    }
                    $('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                        $(elem).removeClass('selected');
                    });
                    var target = $(e.target);
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
            $(document).on('mousedown', function mouseDownDragCallback(event) {
                if (event.target === tableBody[0] || $(event.target).parents('tbody')[0] === tableBody[0]) {
                    storage.grids[gridId].selecting = true;
                    var contentDiv = tableBody.parents('.grid-content-div'),
                        overlay = $('<div class="selection-highlighter"></div>').appendTo(storage.grids[gridId].grid);
                    overlay.css('top', event.pageY).css('left', event.pageX).css('width', 0).css('height', 0);
                    overlay.data('origin-y', event.pageY + contentDiv.scrollTop()).data('origin-x', event.pageX + contentDiv.scrollLeft()).data('mouse-pos-x', event.pageX).data('mouse-pos-y', event.pageY);
                    overlay.data('previous-top', event.pageY).data('previous-left', event.pageX);
                    overlay.data('previous-bottom', event.pageY).data('previous-right', event.pageX);
                    overlay.data('origin-scroll_top', contentDiv.scrollTop()).data('origin-scroll_left', contentDiv.scrollLeft());
                    overlay.data('last-scroll_top_pos', contentDiv.scrollTop()).data('last-scroll_left_pos', contentDiv.scrollLeft());
                    overlay.data('actual-height', 0).data('actual-width', 0).data('event-type', 'mouse');

                    $(document).one('mouseup', function mouseUpDragCallback() {
                        $('.selected').each(function iterateSelectedItemsCallback(idx, elem) {
                            $(elem).removeClass('selected');
                        });
                        var overlay = $(".selection-highlighter");
                        selectHighlighted(overlay, gridId);
                        overlay.remove();
                        contentDiv.off('scroll');
                        $(document).off('mousemove');
                    });

                    contentDiv.on('scroll', function updateSelectOverlayOnScrollHandler() {
                        if (storage.grids[gridId].selecting) {
                            overlay.data('event-type', 'scroll');
                            setOverlayDimensions(contentDiv, overlay);
                        }
                    });

                    $(document).on('mousemove', function updateSelectOverlayOnMouseMoveHandler(ev) {
                        if (storage.grids[gridId].selecting) {
                            var domTag = ev.target.tagName.toUpperCase();
                            if (domTag === 'INPUT' || domTag === 'SELECT') return;

                            overlay.data('event-type', 'mouse');
                            overlay.data('mouse-pos-x', ev.pageX).data('mouse-pos-y', ev.pageY);
                            setOverlayDimensions(storage.grids[gridId].grid.find('.grid-content-div'), overlay);
                        }
                    });
                }
            });
        }

        function setOverlayDimensions(contentDiv, overlay) {
            window.getSelection().removeAllRanges();

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

    function selectHighlighted(overlay, gridId) {
        var contentDiv = storage.grids[gridId].grid.find('.grid-content-div'),
            ctOffset = contentDiv.offset(),
            ctHeight = contentDiv.height,
            ctWidth = contentDiv.width(),
            width = overlay.width(),
            height = overlay.height(),
            offset = overlay.offset(),
            top = offset.top,
            left = offset.left,
            right = parseFloat(overlay.data('actual-width')) + left,
            bottom = parseFloat(overlay.data('actual-height')) + top;

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

        var gridElems = storage.grids[gridId].selectable === 'multi-cell' ? contentDiv.find('td') : contentDiv.find('tr');

        gridElems.each(function highlightGridElemsCallback(idx, val) {
            var element = $(val),
                eOffset = element.offset(),
                eTop = eOffset.top,
                eLeft = eOffset.left,
                eRight = parseFloat(element.css('width')) + eLeft,
                eBottom = parseFloat(element.css('height')) + eTop;

            if (left > eRight || right < eLeft || top > eBottom || bottom < eTop) return;
            else element.addClass('selected');
        });
    }

    function createGroupTrEventHandlers() {
        $('.group_acc_link').each(function iterateAccordionsCallback(idx, val) {
            $(val).data('state', 'open');
        }).on('click', function groupedAccordionsClickListenerCallback(e) {
            var accRow = $(e.currentTarget).parents('tr');
            if ($(e.currentTarget).data('state') === 'open') {
                $(e.currentTarget).data('state', 'closed').removeClass('group-desc').addClass('group-asc');
                accRow.nextUntil('.grouped_row_header').css('display', 'none');
            }
            else {
                $(e.currentTarget).data('state', 'open').removeClass('group-asc').addClass('group-desc');
                accRow.nextUntil('.grouped_row_header').css('display', 'table-row');
            }
        });
    }

    function makeCellEditable(id, td) {
        td.on('click', function editableCellClickHandler(e) {
            var gridContent = storage.grids[id].grid.find('.grid-content-div');
            var gridData = storage.grids[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            cell.text('');

            if (storage.grids[id].updating) return;
            var index = cell.parents('tr').index(),
                field = cell.data('field'),
                type = storage.grids[id].columns[field].type || '',
                val = storage.grids[id].dataSource.data[index][field],
                dataAttributes = '',
                gridValidation = storage.grids[id].useValidator ? storage.grids[id].columns[field].validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (storage.grids[id].useFormatter && storage.grids[id].columns[field].inputFormat)
                dataAttributes += ' data-inputformat="' + storage.grids[id].columns[field].inputFormat + '"';

            switch (type) {
                case 'boolean':
                    input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    input[0].checked = typeof val === 'string' ? val === 'true' : !!val;
                    dataType = 'boolean';
                    break;
                case 'number':
                    inputVal = val;
                    input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'number';
                    break;
                case 'time':
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'time';
                    break;
                case 'date':
                    var dateVal = val === undefined ? new Date(Date.now()) : new Date(Date.parse(val));
                    inputVal = dateVal.toISOString().split('T')[0];
                    input = $('<input type="date" value="' + inputVal + '" class="input textbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'date';
                    break;
                default:
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'string';
                    break;
            }

            if (gridValidation) input.addClass('inputValidate');

            input[0].focus();

            if (dataType) {
                input.on('keypress', function restrictCharsHandler(e) {
                    var code = e.charCode ? e.charCode : e.keyCode;
                    if (!validateCharacter.call(this, code, dataType)) {
                        e.preventDefault();
                        return false;
                    }
                });
            }

            if (gridValidation && dataAttributes !== '') {
                attachValidationListener(input[0]);
            }
            else {
                input.on('blur', function cellEditBlurHandler() {
                    saveCellEditData(input);
                });
            }
            callGridEventHandlers(gridData.events.beforeCellEdit, gridData.grid, null);
        });
    }

    function makeCellSelectable(id, td) {
        td.on('click', function selectableCellClickHandler(e) {
            var gridContent = storage.grids[id].grid.find('.grid-content-div');
            var gridData = storage.grids[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            cell.text('');
            var index = cell.parents('tr').index();
            var field = cell.data('field');
            if (storage.grids[id].updating) return;		

            var gridValidation = storage.grids[id].useValidator ? storage.grids[id].columns[field].validation : null;
            var dataAttributes = '';

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell);
            var options = [];
            var setVal = gridData.dataSource.data[index][field];
            options.push(setVal);
            for (var z = 0; z < gridData.columns[field].options.length; z++) {
                if (setVal !== gridData.columns[field].options[z]) {
                    options.push(gridData.columns[field].options[z]);
                }
            }
            for (var k = 0; k < options.length; k++) {
                var opt = $('<option value="' + options[k] + '">' + options[k] + '</option>');
                select.append(opt);
            }
            select.val(setVal);
            select[0].focus();

            if (gridValidation) select.addClass('inputValidate');
            if (gridValidation && dataAttributes !== '') attachValidationListener(select[0]);
            else {
                select.on('blur', function cellEditBlurHandler() {
                    saveCellSelectData(select);
                });
            }
            callGridEventHandlers(gridData.events.beforeCellEdit, gridData.grid, null);
        });
    }

    function setupCellValidation(columnValidation, dataAttributes) {
        if (!grid.validation) {
            Object.defineProperty(
                grid,
                'validation',
                { value: {}, writable: false }
            );
        }
        if (columnValidation.required) dataAttributes += 'data-required';
        if (columnValidation.customRules) {
            dataAttributes += ' data-customrules="';
            for (var rule in columnValidation.customRules) {
                dataAttributes += 'grid.validation.' + rule + ',';
                if (!grid.validation[rule]) {
                    Object.defineProperty(
                        grid.validation,
                        rule,
                        { value: columnValidation.customRules[rule], writable: false, configurable: false }
                    );
                }
            }
            dataAttributes += '"';
        }
        return dataAttributes;
    }

    function setColWidth(gridData, gridElem) {
        var columnNames = {},
            name,
            columnList = [];
        var tableDiv = gridElem.find('.grid-header-wrapper');
        for (name in gridData.columns) {
            columnNames[name] = isNumber(gridData.columns[name].width) ? gridData.columns[name].width : null;
            columnList.push(name);
        }
        var colGroups = tableDiv.find('col');

        colGroups.each(function iterateColsCallback(idx, val) {
            var i = idx;
            if (gridData.groupedBy && gridData.groupedBy !== 'none') {
                i = (idx%(colGroups.length/2)) - 1;
            }
            if (gridData.groupedBy && gridData.groupedBy !== 'none' && idx === 0) {
                $(val).css('width', 27);
            }
            else if (columnNames[columnList[i]] != null) {
                    $(val).css('width', columnNames[columnList[i]]);
            }
        });
    }

    function copyGridWidth(gridElem) {
        var headerCols = gridElem.find('.grid-header-div').find('col');
        var contentCols = gridElem.find('.grid-content-div').find('col');
        var headerTable = gridElem.find('.grid-header-div').find('table');
        var contentTable = gridElem.find('.grid-content-div').find('table');

        contentTable.css('width', headerTable[0].clientWidth);

        contentCols.each(function colIterationCallback(idx, val) {
            if ($(val).hasClass('group_col')) return;
            var width;
            if (width = $(headerCols[idx]).width()) $(val).css('width', width);
        });
    }

    function attachValidationListener(elem) {
        $(document).one('validated', function validationHandlerCallback(e, eventData) {
            if (eventData.element === elem) {
                if (eventData.succeeded && elem.type !== 'select' && elem.type !== 'select-one')
                    saveCellEditData($(elem));
                else if (eventData.succeeded)
                    saveCellSelectData($(elem));
                else {
                    elem.focus();
                    attachValidationListener(elem);
                }
            }
            else attachValidationListener(elem);
        });
    }

    function saveCellEditData(input) {
        var val;
        if (input[0].type == 'checkbox') val = input.is(':checked');
        else val = input.val();
        var gridContent = input.parents('.grid-wrapper').find('.grid-content-div'),
            cell = input.parents('td'),
            id = gridContent.data('grid_content_id'),
            index = cell.parents('tr').index(),
            field = cell.data('field'),
            type = storage.grids[id].columns[field].type || '',
            saveVal, re,
            displayVal = getFormattedCellText(id, field, val) || storage.grids[id].dataSource.data[index][field];

        input.remove();
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = typeof storage.grids[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
                saveVal = displayVal;   
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = displayVal;   
                break;
            default: 		
                saveVal = val;
                break;
        }

        cell.text(displayVal);
        storage.grids[id].currentEdit[field] = null;
        var previousVal = storage.grids[id].dataSource.data[index][field];
        if (previousVal !== saveVal && !('' === saveVal && undefined === previousVal)) {	
            storage.grids[id].dataSource.data[index][field] = saveVal;
            cell.prepend('<span class="dirty"></span>');
        }
        else
            storage.grids[id].dataSource.data[index][field] = previousVal;
        callGridEventHandlers(storage.grids[id].events.afterCellEdit, storage.grids[id].grid, null);
    }

    function saveCellSelectData(select) {
        var gridContent = select.parents('.grid-wrapper').find('.grid-content-div'),
            val = select.val(),
            parentCell = select.parents('td');
        select.remove();
        var id = gridContent.data('grid_content_id'),
            index = parentCell.parents('tr').index(),
            field = parentCell.data('field'),
            type = storage.grids[id].columns[field].type || '',
            displayVal = getFormattedCellText(id, field, val) || storage.grids[id].dataSource.data[index][field],
            re, saveVal;

        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = typeof storage.grids[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
                saveVal = displayVal;   
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
                saveVal = displayVal;   
                break;
            default: 		
                saveVal = val;
                break;
        }

        parentCell.text(displayVal);
        var previousVal = storage.grids[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {	
            parentCell.prepend('<span class="dirty"></span>');
            storage.grids[id].dataSource.data[index][field] = saveVal;
        }
        callGridEventHandlers(storage.grids[id].events.afterCellEdit, storage.grids[id].grid, null);
    }

    function createCellEditSaveDiv(gridData, gridElem) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;	

        var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);
        var saveAnchor = $('<a href="#" class="toolbarAnchor saveToolbar"></a>').appendTo(saveBar);
        saveAnchor.append('<span class="toolbarSpan saveToolbarSpan"></span>Save Changes');

        var deleteAnchor = $('<a href="#" class="toolbarAnchor deleteToolbar"></a>').appendTo(saveBar);
        deleteAnchor.append('<span class="toolbarSpan deleteToolbarSpan">Delete Changes</span>');

        saveAnchor.on('click', function saveChangesHandler() {
            if (storage.grids[id].updating) return;
            var dirtyCells = [],
                pageNum = storage.grids[id].pageNum, i;
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                if (typeof storage.grids[id].dataSource.put !== 'function') {
                    for (i = 0; i < dirtyCells.length; i++) {
                        var index = dirtyCells[i].parents('tr').index();
                        var field = dirtyCells[i].data('field');
                        var origIndex = storage.grids[id].dataSource.data[index][field]._initialRowIndex;
                        storage.grids[id].originalData[origIndex][field] = storage.grids[id].dataSource.data[index][field];
                        dirtyCells[i].find('.dirty').remove();
                    }
                }
                else {
                    storage.grids[id].putRequest.eventType = 'save';
                    storage.grids[id].putRequest.pageNum = pageNum;
                    storage.grids[id].putRequest.models = [];
                    var putRequestModels = storage.grids[id].putRequest.models;
                    for (i = 0; i < dirtyCells.length; i++) {
                        var tmpModel = cloneGridData(storage.grids[id].dataSource.data[dirtyCells[i].parents('tr').index()]);
                        var tmpMap = tmpModel._initialRowIndex;
                        var idx = existsInPutRequest(putRequestModels, tmpModel);
                        if (~idx)
                            putRequestModels[idx].dirtyFields.push(dirtyCells[i].data('field'));
                        else
                            putRequestModels.push({ cleanData: storage.grids[id].originalData[tmpMap], dirtyData: tmpModel, dirtyFields: [dirtyCells[i].data('field')] });
                    }

                    for (i = 0; i < putRequestModels.length; i++) {
                        delete putRequestModels[i].dirtyData._initialRowIndex;
                    }

                    prepareGridDataUpdateRequest(id);
                }
            }
        });

        deleteAnchor.on('click', function deleteChangeHandler() {
            if (storage.grids[id].updating) return;
            var dirtyCells = [];
            gridElem.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                for (var i = 0; i < dirtyCells.length; i++) {
                    var field = dirtyCells[i].data('field');
                    var index = dirtyCells[i].parents('tr').index();
                    var pageNum = storage.grids[id].pageNum;
                    var rowNum = storage.grids[id].pageSize;
                    var addend = (pageNum-1)*rowNum;
                    var cellVal = storage.grids[id].originalData[index][field] !== undefined ? storage.grids[id].originalData[index][field] : '';
                    var text = getFormattedCellText(id, field, cellVal) || cellVal;
                    dirtyCells[i].text(text);
                    dirtyCells[i].find('.dirty').remove();
                    storage.grids[id].dataSource.data[index][field] = storage.grids[id].originalData[index + addend][field];
                }
            }
        });

        if (gridData.groupable) {
            var groupSpan = $('<span class="toolbarSpan group_span" style="float:right;"><span class="groupTextSpan" style="float:left;">Group By: </span></span>').appendTo(saveBar);
            var columnsList = $('<select class="input select group_select" style="float:none; display: inline; width: auto;"></select>').appendTo(groupSpan);
            var dirList = $('<select class="input select group_dir_select" style="display: inline; width: auto;"></span>').appendTo(groupSpan);
            dirList.append('<option value="asc">Ascending</span>');
            dirList.append('<option value="desc">Descending</span>');
            columnsList.append('<option value="none">None</option>');
            for (var col in gridData.columns) {
                if (gridData.columns[col].groupable !== false) {
                    var colTitle = gridData.columns[col].title || col;
                    columnsList.append('<option value="' + col + '">' + colTitle + '</option>');
                }
            }
            columnsList.on('change', groupByHandler);
            dirList.on('change', groupByHandler);
        }
    }

    function groupByHandler() {
        var id = $(this).parents('.toolbar').data('grid_id');
        if (storage.grids[id].updating) return;
        var colSelector = $(this).parents('.toolbar').find('.group_select'),
            directionSelector = $(this).parents('.toolbar').find('.group_dir_select');
        if (colSelector.val() === 'none' && (!storage.grids[id].groupedBy || storage.grids[id].groupedBy === 'none')) return;
        if (Object.keys(storage.grids[id].columns).length === storage.grids[id].grid.find('colgroup').first().find('col').length && colSelector.val() !== 'none') {
            if (!storage.grids[id].groupedBy)
                storage.grids[id].groupingStatusChanged = true;
            var colGroups = storage.grids[id].grid.find('colgroup');
            colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                $(val).prepend('<col class="group_col"/>');
            });
            storage.grids[id].grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
            storage.grids[id].grid.find('.summary-row-header').prepend('<td class="group_spacer">&nbsp</td>');
        }
        else if (colSelector.val() === 'none') {
            storage.grids[id].groupingStatusChanged = true;
            storage.grids[id].grid.find('colgroup').find('.group_col').remove();
            storage.grids[id].grid.find('.group_spacer').remove();
            storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
        }
        storage.grids[id].pageRequest.groupedBy = colSelector.val() === 'none' ? undefined : colSelector.val();
        storage.grids[id].pageRequest.groupSortDirection = colSelector.val() === 'none' ? undefined : directionSelector.val();
        storage.grids[id].pageRequest.eventType = 'group';
        preparePageDataGetRequest(id);
    }

    function createGridFooter(gridData, gridElem) {
        var gridFooter = gridElem.find('.grid-footer-div');
        var id = gridFooter.data('grid_footer_id');
        var count = storage.grids[id].dataSource.rowCount;
        var displayedRows = (count - storage.grids[id].pageSize) > 0 ? storage.grids[id].pageSize : count;
        var remainingPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) : 0;
        var pageNum = storage.grids[parseInt(gridFooter.data('grid_footer_id'))].pageNum;

        var first = $('<a href="#" class="grid-page-link link-disabled" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridFooter);
        var prev = $('<a href="#" class="grid-page-link link-disabled" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridFooter);
        var text = 'Page ' + storage.grids[parseInt(gridFooter.data('grid_footer_id'))].pageNum + '/' + (remainingPages + 1);
        gridFooter.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
        var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridFooter);
        var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + (remainingPages + 1) + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridFooter);

        if (!remainingPages) {
            first.addClass('link-disabled');
            prev.addClass('link-disabled');
            next.addClass('link-disabled');
            last.addClass('link-disabled');
        }

        var pageOptions = gridData.pagingOptions;
        if (pageOptions && pageOptions.constructor === Array) {
            var sizeSelectorSpan = $('<span class="page-size-span"></span>'),
                sizeSelect = $('<select class="size-selector input"></select>'),
                numOptions = 0;
            for (var i = 0; i < pageOptions.length; i++) {
                if (isNumber(parseFloat(pageOptions[i]))) {
                    sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                    numOptions++;
                }
            }
            if (numOptions) {
                sizeSelectorSpan.appendTo(gridFooter);
                sizeSelect.appendTo(sizeSelectorSpan);
            }
            sizeSelect.val(storage.grids[id].pageSize);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler() {
                var pageSize = $(this).val();
                storage.grids[id].pageRequest.pageSize = parseInt(pageSize);
                storage.grids[id].pageRequest.eventType = 'pageSize';
                preparePageDataGetRequest(id);
            });
        }

        var rowStart = 1 + (displayedRows*(pageNum-1));
        var rowEnd = displayedRows*pageNum;
        text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
        gridFooter.append('<span class="pageinfo">' + text + '</span>');

        setPagerEventListeners(gridFooter);
    }

    function setPagerEventListeners(gridFooter) {
        gridFooter.find('a').each(function iterateGridFooterAnchorsCallback(idx, val) {
            $(val).on('click', function gridFooterAnchorClickHandlerCallback(e) {
                e.preventDefault();
                var link = e.currentTarget.tagName === 'A' ? $(e.currentTarget) : $(e.srcElement).parents('.grid-page-link');
                if (link.hasClass('link-disabled')) {	
                    return;
                }
                var gridFooter = link.parents('.grid-footer-div');
                var allPagers = gridFooter.find('a');
                var id = parseInt(link.parents('.grid-wrapper')[0].dataset.grid_id);
                if (storage.grids[id].updating) return;		
                var gridData = storage.grids[id];
                var pageSize = gridData.pageSize;
                var pagerInfo = gridFooter.find('.pageinfo');
                var pagerSpan = gridFooter.find('.grid-pagenum-span');
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

    function attachFilterListener(filterElem) {
        filterElem.on('click', function filterClickCallback(e) {
            e.stopPropagation();	
            e.preventDefault();
            var filterAnchor = $(e.target);
            var filterCell = filterAnchor.parents('th');
            var type = filterAnchor.data('type');
            var grid = filterElem.parents('.grid-wrapper');
            var id = grid.data('grid_id');
            if (storage.grids[id].updating) return;		
            var filters = grid.find('.filter-div');
            var currFilter = null;
            var field = filterAnchor.data('field');
            var title = storage.grids[id].columns[field].title || null;

            if (filters.length) {
                filters.each(function iterateFiltersCallback(idx, val) {
                    var filter = $(val);
                    if (filter.data('parentfield') === filterAnchor.data('field')) {
                        filter.removeClass('hiddenFilter');
                        currFilter = $(val);
                    }
                    else filter.addClass('hiddenFilter');
                });
            }

            if (!currFilter) {
                createFilterDiv(type, field, grid, title);
                currFilter = grid.find('.filter-div');
            }
            var filterCellOffset = filterCell.offset();
            currFilter.css('top', (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
            currFilter.css('left', (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
        });
    }

    function createFilterDiv(type, field, grid, title) {
        var filterDiv = $('<div class="filter-div" data-parentfield="' + field + '" data-type="' + type + '"></div>').appendTo(grid);
        var domName = title ? title : type;
        var filterInput, resetButton, button,
            span = $('<span class="filterTextSpan">Filter rows where ' + domName + ' is:</span>').appendTo(filterDiv),
            select = type !== 'boolean' ? $('<select class="filterSelect select"></select>').appendTo(filterDiv)
                .append('<option value="eq">Equal to:</option>').append('<option value="neq">Not equal to:</option>') : null;

        switch (type) {
            case 'number':
                select.append('<option value="gte">Greater than or equal to:</option>');
                select.append('<option value="gt">Greater than:</option>');
                select.append('<option value="lte">Less than or equal to:</option>');
                select.append('<option value="lt">Less than:</option>');
                filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'date':
            case 'time':
                select.append('<option value="gte">Equal to or later than:</option>');
                select.append('<option value="gt">Later than:</option>');
                select.append('<option value="lte">Equal to or before:</option>');
                select.append('<option value="lt">Before:</option>');
                var inputType = type === 'date' ? 'date' : 'text';
                filterInput = $('<input type="' + inputType + '" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
            case 'boolean':
                var optSelect = $('<select class="filterSelect select"></select>').appendTo(span);
                optSelect.append('<option value="true">True</option>');
                optSelect.append('<option value="false">False</option>');
                break;
            case 'string':
                select.append('<option value="ct">Contains:</option>');
                select.append('<option value="nct">Does not contain:</option>');
                filterInput = $('<input class="filterInput input" type="text" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
                break;
        }
        resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
        button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
        resetButton.on('click', resetButtonClickHandler);
        button.on('click', filterButtonClickHandler);
        if (filterInput && type !=='time' && type !== 'date') filterInputValidation(filterInput);
    }

    function filterInputValidation(input) {
        input.on('keypress', function restrictCharsHandler(e) {
            var code = e.charCode? e.charCode : e.keyCode,
                type = $(this).parents('.filter-div').data('type');
            if (!validateCharacter.call(this, code, type)) {
                e.preventDefault();
                return false;
            }
        });
    }

    function resetButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div');
        var value = filterDiv.find('.filterInput').val();
        var gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[gridId].updating) return;		
        var gridData = storage.grids[gridId];

        if (value === '' && gridData.filterVal === '') return;
        filterDiv.find('.filterInput').val('');

        filterDiv.addClass('hiddenFilter');

        gridData.pageRequest.filteredOn = null;
        gridData.pageRequest.filterVal = null;
        gridData.pageRequest.filterType = null;
        gridData.filteredOn = null;
        gridData.filterVal = null;
        gridData.filterType = null;
        gridData.pageRequest.eventType = 'filter';
        storage.grids[gridId].alteredData = cloneGridData(storage.grids[gridId].originalData);
        preparePageDataGetRequest(gridId);
    }

    function filterButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            selected = filterDiv.find('.filterSelect').val(),
            value = filterDiv.find('.filterInput').val(),
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[gridId].updating) return;		
        var gridData = storage.grids[gridId],
            type = filterDiv.data('type'),
            errors = filterDiv.find('.filter-div-error'),
            re;

        if (dataTypes[type]) {
            re = new RegExp(dataTypes[type]);
            if (!re.test(value) && !errors.length) {
                $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
                return;
            }
        }

        if (errors.length) errors.remove();
        if (value === '' && gridData.filterVal === '') return;

        filterDiv.addClass('hiddenFilter');
        gridData.pageRequest.filteredOn = $(this).data('field');
        gridData.pageRequest.filterVal = value;
        gridData.pageRequest.filterType = selected;
        gridData.pageRequest.eventType = 'filter';
        preparePageDataGetRequest(gridId);
    }

    function createGridColumnsFromArray(gridData, gridElem) {
        var headerCol = {};
        var index = 0;
        for (var i = 0; i < gridData.length; i++) {
            for (var col in gridData[i]) {
                if (!headerCol[col]) {
                    headerCol[col] = {};
                    headerCol[col].field = col;
                    headerCol[col].title = col;
                    headerCol[col].reorderable = true;
                    headerCol[col].sortable = true;
                    index++;
                }
            }
        }
        var newGridData = {
            columns: headerCol,
            data: gridData
        };
        createGridHeaders(newGridData, gridElem);
    }

    function setDragAndDropListeners(elem) {
        elem.on('dragstart', function handleDragStartCallback(e) {
            e.originalEvent.dataTransfer.setData('text', e.currentTarget.id);
        });
        elem.on('drop', handleDropCallback);
        elem.on('dragover', function handleHeaderDragOverCallback(e) {
            e.preventDefault();
        });
        elem.on('mouseleave', mouseLeaveHandlerCallback);
    }

    function handleDropCallback(e) {
        var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
        var targetCol = $(e.currentTarget);
        var id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null;
        var droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
        if (!id || !droppedId || id !== droppedId) return;  
        if (storage.grids[id].updating) return;		
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
            element: storage.grids[id].grid,
            droppedColumn: droppedCol.data('field'),
            targetColumn: targetCol.data('field'),
            droppedIndex: droppedIndex,
            targetIndex: targetIndex
        };
        callGridEventHandlers(storage.grids[id].events.columnReorder, storage.grids[id].grid, evtObj);
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
                    storage.grids[parentDiv.parent().data('grid_header_id')].resizing = true;
                });
                sliderDiv.on('dragend', function handleResizeDragEndCallback() {
                    storage.grids[parentDiv.parent().data('grid_header_id')].resizing = false;
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

    function setSortableClickListener(elem) {
        elem.on('click', function handleHeaderClickCallback() {
            var headerDiv = elem.parents('.grid-header-div');
            var id = parseInt(headerDiv.data('grid_header_id'));
            if (storage.grids[id].updating) return;		
            var field = elem.data('field'),
                foundColumn = false;

            if (storage.grids[id].groupedBy && storage.grids[id].groupedBy === field) return;   

            for (var i = 0; i < storage.grids[id].sortedOn.length; i++) {
                if (storage.grids[id].sortedOn[i].field === field) {
                    foundColumn = true;
                    if (storage.grids[id].sortedOn[i].sortDirection === 'asc') {
                        storage.grids[id].sortedOn[i].sortDirection = 'desc';
                        elem.find('.sortSpan').addClass('sort-desc').removeClass('sort-asc');
                    }
                    else {
                        storage.grids[id].sortedOn =  storage.grids[id].sortedOn.filter(function filterSortedColumns(item) {
                            return item.field !== field;
                        });
                        elem.find('.sortSpan').remove();
                        storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
                    }
                }
            }

            if (!foundColumn) {
                storage.grids[id].sortedOn.push({ field: field, sortDirection: 'asc' });
                elem.find('.header-anchor').append('<span class="sort-asc sortSpan">Sort</span>');
            }
            storage.grids[id].pageRequest.sortedOn = storage.grids[id].sortedOn;
            storage.grids[id].pageRequest.eventType = 'sort';
            preparePageDataGetRequest(id);
        });
    }

    function setFilterableClickListener(elem, gridData, col) {
        var type = gridData.columns[col].type || 'string';
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

    function handleResizeDragCallback(e) {
        e.preventDefault();
        var sliderDiv = $(e.currentTarget);
        var id = sliderDiv.parents('.grid-wrapper').data('grid_id');
        if (storage.grids[id].updating) return;		
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
            if (storage.grids[id].groupedBy && storage.grids[id].groupedBy !== 'none')
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

    function swapContentCells(gridId, droppedIndex, targetIndex) {
        var gridData = storage.grids[gridId];
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

    function preparePageDataGetRequest(id) {
        storage.grids[id].updating = true;
        var gridData = storage.grids[id];
        var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
        var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;
        var sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        var filteredOn = gridData.pageRequest.filteredOn || gridData.filteredOn || null;
        var filterVal = gridData.pageRequest.filterVal || gridData.filterVal || null;
        var filterType = gridData.pageRequest.filterType || gridData.filterType || null;
        var groupedBy = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupedBy : gridData.groupedBy || null;
        var groupSortDirection = gridData.pageRequest.eventType === 'group' ? gridData.pageRequest.groupSortDirection : gridData.groupSortDirection || null;

        var requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = sortedOn;

        if (gridData.filterable) {
            requestObj.filteredOn = filteredOn;
            requestObj.filterVal = filterVal;
            requestObj.filterType = filterType;
        }

        if (gridData.groupable) {
            requestObj.groupedBy = groupedBy;
            requestObj.groupSortDirection = groupSortDirection;
        }

        requestObj.pageSize = pageSize;
        requestObj.pageNum = gridData.eventType === 'filter' ? 1 : pageNum;

        gridData.grid.find('.grid-content-div').empty();

        callGridEventHandlers(storage.grids[id].events.pageRequested, gridData.grid, { element: gridData.grid });

        if (gridData.dataSource.get && typeof gridData.dataSource.get === 'function')
            gridData.dataSource.get(requestObj, getPageDataRequestCallback);
        else {
            if (!gridData.alteredData) gridData.alteredData = cloneGridData(gridData.originalData);
            getPageData(requestObj, id, getPageDataRequestCallback);
        }

        function getPageDataRequestCallback(response) {
            var groupingStatus = gridData.groupingStatusChanged;
            if (response) {
                gridData.dataSource.data = response.data;
                gridData.pageSize = requestObj.pageSize;
                gridData.pageNum = requestObj.pageNum;
                gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.length;
                gridData.groupedBy = requestObj.groupedBy;
                gridData.groupSortDirection = requestObj.groupSortDirection;
                gridData.sortedOn = requestObj.sortedOn;
                gridData.filteredOn = requestObj.filteredOn;
                gridData.filterVal = requestObj.filterVal;
                gridData.filterType = requestObj.filterType;
                gridData.groupingStatusChanged = false;

                if (gridData.pageRequest.eventType === 'newGrid' || groupingStatus)
                    setColWidth(gridData, storage.grids[id].grid);

                createGridContent(gridData, storage.grids[id].grid);
                if (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === 'pageSize') {
                    gridData.grid.find('.grid-footer-div').empty();
                    createGridFooter(gridData, gridData.grid);
                }
                if (gridData.pageRequest.eventType === 'filter' && gridData.summaryRow && gridData.summaryRow.positionAt === 'top')
                    buildHeaderAggregations(gridData, id);
                gridData.pageRequest = {};
            }
        }
    }

    function prepareGridDataUpdateRequest(id) {
        storage.grids[id].updating = true;
        var requestObj = {
            models: storage.grids[id].putRequest.models,
            pageNum: storage.grids[id].putRequest.pageNum
        };

        storage.grids[id].dataSource.put(requestObj, updatePageDataPutRequestCallback);

        function updatePageDataPutRequestCallback(response) {
            storage.grids[id].updating = false;
            if (response) {
                storage.grids[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var index = $(val).parents('tr').index();
                    var field = $(val).parents('td').data('field');
                    var origIdx = storage.grids[id].dataSource.data[index]._initialRowIndex;
                    storage.grids[id].originalData[origIdx][field] = storage.grids[id].dataSource.data[index][field];
                    $(val).remove();
                });
            }
            else {
                storage.grids[id].grid.find('.dirty').each(function iterateDirtySpansCallback(idx, val) {
                    var cell = $(val).parents('td');
                    var index = cell.parents('tr').index();
                    var field = cell.data('field');
                    var text = getFormattedCellText(id, cell.data('field'), storage.grids[id].originalData[index][field]) || storage.grids[id].originalData[index][field];
                    cell.text(text);
                    $(val).remove();
                });
            }
        }
    }

    function getPageData(requestObj, id, callback) {
        var eventType = storage.grids[id].pageRequest.eventType;
        var fullGridData = cloneGridData(storage.grids[id].alteredData);

        if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
            limitPageData(requestObj, fullGridData, callback);
            return;
        }

        if (requestObj.filteredOn) {
            if (requestObj.filterVal !== '') {
                var dataType = storage.grids[id].columns[requestObj.filteredOn].type || 'string';
                fullGridData = filterGridData(requestObj.filterType, requestObj.filterVal, requestObj.filteredOn, dataType, cloneGridData(storage.grids[id].originalData));
            }
            else fullGridData = cloneGridData(storage.grids[id].originalData);
            requestObj.pageNum = 1;		
            storage.grids[id].alteredData = fullGridData;
        }

        if (requestObj.groupedBy) {
            var groupedData = sortGridData([{ field: requestObj.groupedBy, sortDirection: requestObj.groupSortDirection }], fullGridData || cloneGridData(storage.grids[id].originalData), id);
            if (requestObj.sortedOn.length) {
                var sortedGroup = [];
                for (var group in groupedData.groupings) {
                    sortedGroup = sortedGroup.concat(sortGridData(requestObj.sortedOn, groupedData.groupings[group] || cloneGridData(storage.grids[id].originalData), id));
                }
                storage.grids[id].alteredData = fullGridData;
                limitPageData(requestObj, sortedGroup, callback);
                return;
            }
            storage.grids[id].alteredData = groupedData;
            limitPageData(requestObj, groupedData, callback);
            return;
        }

        if (requestObj.sortedOn.length && !requestObj.groupedBy)
            fullGridData = sortGridData(requestObj.sortedOn, fullGridData || cloneGridData(storage.grids[id].originalData), id);
        storage.grids[id].alteredData = fullGridData;
        limitPageData(requestObj, fullGridData, callback);
    }


    function limitPageData(requestObj, fullGridData, callback) {
        var returnData;
        if (requestObj.pageSize >= fullGridData.length)
            returnData = fullGridData;
        else {
            returnData = [];
            var startRow = (requestObj.pageNum-1) * (requestObj.pageSize);
            var endRow = fullGridData.length >= (startRow + parseInt(requestObj.pageSize)) ? (startRow + parseInt(requestObj.pageSize)) : fullGridData.length;

            for (var i = startRow; i < endRow; i++){
                returnData.push(fullGridData[i]);
            }
        }

        callback({ rowCount: fullGridData.length, data: returnData });
    }

    function filterGridData(filterType, value, field, dataType, gridData) {
        var filteredData = [], curVal, baseVal;

        for (var i = 0, length = gridData.length; i < length; i++) {
            if (dataType === 'time') {
                curVal = getNumbersFromTime(gridData[i][field]);
                baseVal = getNumbersFromTime(value);

                if (gridData[i][field].indexOf('PM') > -1) curVal[0] += 12;
                if (value.indexOf('PM') > -1) baseVal[0] += 12;

                curVal = convertTimeArrayToSeconds(curVal);
                baseVal = convertTimeArrayToSeconds(baseVal);
            }
            else if (dataType === 'number') {
                curVal = parseFloat(gridData[i][field]);
                baseVal = parseFloat(value);
            }
            else if (dataType === 'date') {
                curVal = new Date(gridData[i][field]);
                baseVal = new Date(value);
            }
            else {
                curVal = gridData[i][field];
                baseVal = value;
            }
            if (comparator(curVal, baseVal, filterType)) filteredData.push(gridData[i]);
        }
    }

    function comparator(val, base, type) {
        switch (type) {
            case 'eq':
                return val === base;
            case 'neq':
                return val !== base;
            case 'gte':
                return val >= base;
            case 'gt':
                return val > base;
            case 'lte':
                return val <= base;
            case 'lt':
                return val < base;
            case 'ct':
                return !!~val.toLowerCase().indexOf(base.toLowerCase());
            case 'nct':
                return !~val.toLowerCase().indexOf(base.toLowerCase());
        }
    }

    function sortGridData (sortedItems, gridData, gridId) {
        for (var i = 0; i < sortedItems.length; i++) {
            if (i === 0)
                gridData = mergeSort(gridData, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string');
            else {
                var sortedGridData = [];
                var itemsToSort = [];
                for (var j = 0; j < gridData.length; j++) {
                    if (!itemsToSort.length || compareValuesByType(itemsToSort[0][sortedItems[i - 1].field], gridData[j][sortedItems[i - 1].field], storage.grids[gridId].columns[sortedItems[i - 1].field].type))
                        itemsToSort.push(gridData[j]);
                    else {
                        if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                        else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }
                    if (j === gridData.length - 1)
                        sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], storage.grids[gridId].columns[sortedItems[i].field].type || 'string'));
                }
                gridData = sortedGridData;
            }
        }
        return gridData;
    }

    function mergeSort(data, sortObj, type) {
        if (data.length < 2) return data;
        var middle = parseInt(data.length / 2);
        var left   = data.slice(0, middle);
        var right  = data.slice(middle, data.length);
        return merge(mergeSort(left, sortObj, type), mergeSort(right, sortObj, type), sortObj, type);
    }

    function merge(left, right, sortObj, type) {
        var result = [], leftVal, rightVal;
        while (left.length && right.length) {
            if (type === 'time') {
                leftVal = getNumbersFromTime(left[0][sortObj.field]);
                rightVal = getNumbersFromTime(right[0][sortObj.field]);

                if (~left[0][sortObj.field].indexOf('PM'))
                    leftVal[0] += 12;
                if (~right[0][sortObj.field].indexOf('PM'))
                    rightVal[0] += 12;

                leftVal = convertTimeArrayToSeconds(leftVal);
                rightVal = convertTimeArrayToSeconds(rightVal);
            }
            else if (type === 'number') {
                leftVal = parseFloat(left[0][sortObj.field]);
                rightVal = parseFloat(right[0][sortObj.field]);
            }
            else if (type === 'date') {
                leftVal = new Date(left[0][sortObj.field]);
                rightVal = new Date(right[0][sortObj.field]);
            }
            else {
                leftVal = left[0][sortObj.field];
                rightVal = right[0][sortObj.field];
            }
            var operator = sortObj.sortDirection === 'asc' ? 'lte' : 'gte';
            comparator(leftVal, rightVal, operator) ? result.push(left.shift()) : result.push(right.shift());
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    function callGridEventHandlers(events, context, param) {
        if (events.length) {
            for (var x = 0; x < events.length; x++)
                events[x].call(context, param);
        }
    }

    function existsInPutRequest(putRequest, model) {
        for (var i = 0; i < putRequest.length; i++) {
            if (model._initialRowIndex == putRequest[i].dirtyData._initialRowIndex)
                return i;
        }
        return -1;
    }

    function getFormattedCellText(gridId, column, value) {
        var text;
        switch(storage.grids[gridId].columns[column].type) {
            case 'number':
                text = formatNumericCellData(value, storage.grids[gridId].columns[column].format);
                break;
            case 'date':
                text = formatDateCellData(value, storage.grids[gridId].columns[column].format);
                break;
            case 'time':
                text = formatTimeCellData(value, column, gridId);
                break;
            case 'string':
            case 'boolean':
                text = value;
                break;
            default:
                text = value;
        }

        var template = storage.grids[gridId].columns[column].template;
        if (template && text !== '') {
            if (typeof template === 'function')
                return template.call(column, text);
            else if (typeof template === 'string')
                return template.replace('{{data}}', text);
            return text;
        }
        return text;
    }

    function getNumbersFromTime(val) {
        var re = new RegExp(dataTypes.time);
        if (!re.test(val)) return [];
        var timeGroups = re.exec(val);
        var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
        var minutes, seconds, meridiem, retVal = [];
        if (timeGroups[2]) {
            minutes = +timeGroups[3] || 0;
            seconds = +timeGroups[4]  || 0;
            meridiem = timeGroups[5].replace(' ', '') || null;
        }
        else if (timeGroups[6]) {
            minutes = +timeGroups[8] || 0;
            seconds = +timeGroups[9] || 0;
        }
        else{
            minutes = 0;
            seconds = 0;
        }
        retVal.push(hours);
        retVal.push(minutes);
        retVal.push(seconds);
        if (meridiem) retVal.push(meridiem);
        return retVal;
    }

    function convertTimeArrayToSeconds(timeArray) {
        var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
        return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
    }

    function validateCharacter(code, dataType) {
        var key = String.fromCharCode(code);
        if (dataTypes[dataType]) {
            var re = new RegExp(dataTypes[dataType + 'Char']);
            return re.test(key);
        }
        return true;
    }

    function compareValuesByType (val1, val2, dataType) {
        switch (dataType) {
            case 'string':
                return val1.toString() === val2.toString();
            case 'number':
                return parseFloat(val1.toString()) === parseFloat(val2.toString());
            case 'boolean':
                return !!val1 === !!val2;
            case 'date':
                var date1 = new Date(val1),
                    date2 = new Date(val2);
                if (typeof date1 === 'object' && typeof date2 === 'object' && date1 !== date1 && date2 !== date2)
                    return true;    
                return date1 === date2;
            case 'time':
                var value1 = getNumbersFromTime(val1);
                var value2 = getNumbersFromTime(val2);
                if (value1[3] && value1[3] === 'PM')
                    value1[0] += 12;
                if (value2[3] && value2[3] === 'PM')
                    value2[0] += 12;
                return convertTimeArrayToSeconds(value1) === convertTimeArrayToSeconds(value2);
            default:
                return val1.toString() === val2.toString();
        }
    }

    function exportDataAsExcelFile(table) {

                var excel = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
        excel += "<head>";
        excel += '<meta http-equiv="Content-type" content="text/html;" />';
        excel += "</head>";
        excel += "<body>";
        excel += table.replace(/"/g, '\'');
        excel += "</body>";
        excel += "</html>";

        var uri = "data:application/vnd.ms-excel;base64,";
        var ctx = { worksheet: 'test', table: table };

        return window.open((uri + base64(format(excel, ctx))));
    }



    function base64(s) {
        return window.btoa(decodeURIComponent(encodeURIComponent(s)));
    }

    function format(s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; });
    }

    dataTypes = {
        number: '^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]+)?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]+)?|0(?:\\.[0-9]+)?|(?:\\.[0-9]+)?)$',
        numberChar: '[\\d,\\.-]',
        integer: '^\\-?\\d+$',
        time: '^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$',
        timeChar: '[\\d\\.:\\ AMP]',
        date: '^(?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\2|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\5))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\8)|(?:(29|30)(\\/|-|\\.)' +
        '(0?[1,3-9]|1[0-2])\\11)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\15)|(?:(29)(\\/|-|\\.)(0?2))\\18)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
        '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\22|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\25)((?:1[6-9]|[2-9]\\d)?\\d{2}))))' +
        '|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\29)(29))))|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)' +
        '(?:(?:(?:(0?[13578]|1[02])\\33(31))|(?:(0?[1,3-9]|1[0-2])\\33(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\33(0?[1-9]|1\\d|2[0-8]))))$',
        dateChar: '[\\d\-\\.\\\]'
    };

    events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

    aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

    function formatTimeCellData(time, column, gridId) {
        var timeArray = getNumbersFromTime(time),
            formattedTime,
            format = storage.grids[gridId].columns[column].format,
            timeFormat = storage.grids[gridId].columns[column].timeFormat;

        if (timeArray.length < 2) return '';

        if (timeFormat && timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
            timeArray[0] = timeArray[0] === 12 ? 0 : (timeArray[0] + 12);
        else if (timeFormat && timeFormat === '12' && timeArray[0] > 12) {
            timeArray[0] = (timeArray[0] - 12);
            timeArray[3] = 'PM';
        }
        else if (timeFormat && timeFormat === '12' && timeArray.length < 4)
            timeArray[3] = 'AM';

        timeArray[0] = timeArray[0] ? timeArray[0] : '00';
        timeArray[1] = timeArray[1] ? timeArray[1] : '00';
        timeArray[2] = timeArray[2] ? timeArray[2] : '00';
        var meridiem = timeArray[3] || 'AM';

        if (timeArray.length && format) {
            formattedTime = format.replace('hh', timeArray[0]).replace('mm', timeArray[1]).replace('ss', timeArray[2]).replace('A/PM', meridiem);
            return timeArray.length === 4 ? formattedTime + ' ' + timeArray[3] : formattedTime;
        }
        else if (timeArray.length) {
            formattedTime = timeArray[0] + ':' + timeArray[1] + ':' + timeArray[2] + ' ' + timeArray[3];
            return timeArray.length === 3 ? formattedTime + ' ' + timeArray[3] : formattedTime;
        }
        return '';
    }

    function formatDateCellData(date, format) {
        if (!format) return date;
        var parseDate = Date.parse(date);
        var jsDate = new Date(parseDate);
        if (!isNaN(parseDate) && format)
            return format.replace('mm', (jsDate.getUTCMonth() + 1).toString()).replace('dd', jsDate.getUTCDate().toString()).replace('yyyy', jsDate.getUTCFullYear().toString());
        else if (!isNaN(parseDate))
            return new Date(jsDate);
        return '';
    }

    function formatNumericCellData(num, format) {
        if (!format) return num;
        var formatSections = [];
        var dataSections = [];
        var formatObject = (~format.indexOf('P') || ~format.indexOf('C')) ? createCurrencyOrPercentFormat(format) : verifyFormat(format);
        format = formatObject.value;

        var formatDecimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
        formatSections[0] = format.substring(0, formatDecimalIndex).split('').reverse().join('');
        if (formatDecimalIndex < format.length)
            formatSections[1] = format.substring(formatDecimalIndex + 1, format.length);

        var decimals = formatSections[1] ? formatSections[1].length : 0;

        if (formatObject.alterer)
            num = formatObject.alterer(+num);
        num = roundNumber(+num, decimals);
        var sign = 0 > +num ? -1 : 1;
        num = num.toString();
        num = num.replace(new RegExp(',', 'g'), '').replace('-', '');   
        var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length;
        dataSections[0] = num.substring(0, dataDecimalIndex).split('').reverse().join('');
        if (dataDecimalIndex < format.length)
            dataSections[1] = num.substring(dataDecimalIndex + 1, num.length);
        else if (formatDecimalIndex < format.length)
            dataSections[1] = '';

        var wholeNums = [];
        var charsSinceComma = 0;
        if (formatSections[0].length) {
            var finalCharIndex, i;
            if (formatSections[0].length) {
                finalCharIndex = formatSections[0].length > dataSections[0].length ? formatSections[0].length : dataSections[0].length;
                for (i = 0; i < finalCharIndex; i++) {
                    if (formatObject.shouldInsertSeparators && charsSinceComma === 3 && (dataSections[0].charAt(i) || formatSections[0].charAt(i) === '0')) {
                        wholeNums.push(',');
                        charsSinceComma = 0;
                    }
                    if (dataSections[0].charAt(i)) {
                        wholeNums.push(dataSections[0].charAt(i));
                        charsSinceComma++;
                    }
                    else if (formatSections[0].charAt(i) === '0') {
                        wholeNums.push('0');
                        charsSinceComma++;
                    }
                    else break;
                }
            }
            wholeNums = wholeNums.reverse().join('');

            var fractionNums = [];
            if (formatSections.length > 1) {
                finalCharIndex = formatSections[1].length > dataSections[1].length ? formatSections[1].length : dataSections[1].length;
                for (i = 0; i < finalCharIndex; i++) {
                    if (formatSections[1].charAt(i) && dataSections[1].charAt(i))
                        fractionNums.push(dataSections[1].charAt(i));
                    else if (formatSections[1].charAt(i) === '0')
                        fractionNums.push('0');
                    else break;
                }
            }
            fractionNums = fractionNums.join('');

            var value = fractionNums.length ? wholeNums + '.' + fractionNums : wholeNums;
            return sign === -1 ? formatObject.prependedSymbol + '-' + value + formatObject.appendedSymbol : formatObject.prependedSymbol + value + formatObject.appendedSymbol;
        }
        return num;
    }

    function verifyFormat(format) {
        var formatSections = [];
        format = format.replace(/[^0#,.]/g , '');

        var decimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
        var leadingChars = format.substring(0, decimalIndex);
        var shouldInsertSeparators = leadingChars.indexOf(',') > -1;
        leadingChars = leadingChars.replace(new RegExp(',', 'g'), '');

        formatSections[0] = leadingChars;
        if (decimalIndex < format.length)
            formatSections[1] = format.substring(decimalIndex + 1, format.length).split('').reverse().join('');

        for (var i = 0; i < formatSections.length; i++) {
            var zeroFound = false;
            for (var j = 0; j < formatSections[i].length; j++) {
                if (zeroFound && formatSections[i].charAt(j) !== '0')
                    formatSections[i] = formatSections[i].substring(0, j) + '0' + formatSections[i].substring(j + 1, formatSections[i].length);
                else if (!zeroFound && formatSections[i].charAt(j) === '0')
                    zeroFound = true;
            }
        }

        return {
            value: formatSections.length < 2 ? formatSections[0] : formatSections[0] + '.' + formatSections[1].split('').reverse().join(''),
            shouldInsertSeparators: shouldInsertSeparators,
            alterer: null,
            prependedSymbol: '',
            appendedSymbol: ''
        };
    }

    function createCurrencyOrPercentFormat(format) {
        var charStripper = '\\d{0,2}]',
            cOrP = ~format.indexOf('P') ? 'P' : 'C';
        format = format.split(cOrP);
        var wholeNums = verifyFormat(format[0]),
            re = new RegExp('[^' + cOrP + charStripper, 'g');
        format = format[1].replace(re, '');
        var numDecimals = 2, newFormat;
        if (format.length)
            numDecimals = parseInt(format.substring(0,2));

        if (wholeNums.value)
            newFormat = numDecimals ? wholeNums.value + '.' : wholeNums.value;
        else if (numDecimals && cOrP === 'C')
            newFormat = '0.';
        else if (numDecimals && cOrP === 'P')
            newFormat = '00.';
        else newFormat = cOrP === 'C' ? '0' : '00';

        for (var i = 0; i < numDecimals; i++) {
            newFormat += '0';
        }
        return { value: newFormat,
            shouldInsertSeparators: wholeNums.shouldInsertSeparators,
            alterer: cOrP == 'C' ? null : x100,
            prependedSymbol: cOrP === 'C' ? '$' : '',
            appendedSymbol: cOrP === 'P' ? '%' : ''
        };
    }

    function x100(val) {
        return val * 100;
    }

    function roundNumber(val, dec) {
        var pow = Math.pow(10, dec || 0);
        return Math.round((val*pow))/pow;
    }

    function cloneGridData(gridData) { 
        if (gridData == null || typeof (gridData) !== 'object')
            return gridData;

        if (Object.prototype.toString.call(gridData) === '[object Array]')
            return cloneArray(gridData);

        var temp = {};
        for (var key in gridData)
            temp[key] = cloneGridData(gridData[key]);

        return temp;
    }

    function cloneArray(arr) {
        var length = arr.length,
            newArr = new arr.constructor(length);

        if (length && typeof arr[0] == 'string' && hasOwnProperty.call(arr, 'index')) {
            newArr.index = arr.index;
            newArr.input = arr.input;
        }

        var index = -1;
        while (++index < length) {
            newArr[index] = cloneGridData(arr[index]);
        }
        return newArr;
    }

    function isDomElement(node) {
        return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === 'object';
    }

    function isNumber(value) {
        return typeof value === 'number' && value === value;
    }

    storage = {
        gridCount: 1,
        grids: []
    };

    Object.defineProperty(
        storage,
        'count',
        {
            get: function _getCount() {
                return this.gridCount++;
            }
        }
    );

    var gridApi = {};

    return Object.defineProperties(
        gridApi, {
            'getGridInstance': {
                value: function getGridInstance(elem) {
                    elem = $(elem);
                    for (var i = 0; i < storage.grids.length; i++) {
                        if (elem[0] === storage.grids[i].grid[0])
                            return storage.grids[i].grid[0].grid;
                    }
                },
                writable: false,
                configurable: false
            },
            'createGrid': {
                get: function _createGrid() {
                    return create;
                }
            },
            'addNewColumns': {
                get: function _addNewColumns() {
                    return addNewColumns;
                }
            }
        }
    );
})(jQuery);