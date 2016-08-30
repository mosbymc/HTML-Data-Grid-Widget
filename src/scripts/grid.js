var grid = (function _grid($) {
    'use strict';
    var dataTypes, events, aggregates, generateId,
        gridState = [],
        groupMenuText = 'Drag and drop a column header here to group by that column';

    function create(gridData, gridElem) {
        if (gridData && isDomElement(gridElem)) {
            var id = generateId();
            if (id > 0) {   
                var tmp = id - 1;
                while (tmp > -1) {  
                    if (gridState[tmp] != null && !$('body').find('#' + gridState[tmp].grid[0].id).length)     
                        delete gridState[tmp];      
                    tmp--;
                }
            }
            gridElem = $(gridElem);
            var wrapperDiv = $('<div id="grid-wrapper-' + id + '" data-grid_id="' + id + '" class=grid-wrapper></div>').appendTo(gridElem);
            var headerDiv = $('<div id="grid-header-' + id + '" data-grid_header_id="' + id + '" class=grid-header-div></div>').appendTo(wrapperDiv);
            headerDiv.append('<div class=grid-header-wrapper></div>');
            wrapperDiv.append('<div id="grid-content-' + id + '" data-grid_content_id="' + id + '" class=grid-content-div></div>');
            wrapperDiv.append('<div id="grid-footer-' + id + '" data-grid_footer_id="' + id + '" class=grid-footer-div></div>');

            gridState[id] = {};
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
                            for (var col in gridData.aggregates) {
                                if (res.aggregations[col])
                                    gridData.aggregates[col].value = res.aggregations[col];
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
            'exportToExcel',
            {
                value: function _exportToExcel(exportType) {
                    exportDataAsExcelFile(gridId, exportType || 'page');
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
                            gridState[gridId].events[evt] = gridState[gridId].events[evt].concat(funcs);
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
                            for (var i = 0; i < gridState[gridId].events[evt].length; i++) {
                                for (var j = 0; j < funcs.length; j++) {
                                    if (gridState[gridId].events[evt][i] !== funcs[j])
                                        tmpEvts.push(gridState[gridId].events[evt][i]);
                                }
                            }
                            gridState[gridId].events[evt] = tmpEvts;
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
                            gridState[gridId].events[events[i]] = [];
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'getHandledEvents': {
                    value: function _getHandledEvents() {
                        var evts = [];
                        for (var i = 0; i < events.length; i++) {
                            if (gridState[gridId].events[events[i]].length)
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
                'hideColumn': {
                    value: function _hideColumn(col) {
                        if (gridState[gridId].columns[col]) {
                            gridState[gridId].columns[col].isHidden = true;
                            gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', 'none');
                            gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', 'none');
                            var colGroups = gridState[gridId].grid.find('colgroup');
                            var group1 = $(colGroups[0]).find('col');
                            var group2 = $(colGroups[1]).find('col');
                            if (gridState[gridId].groupedBy.length) {
                                for (var i = 0; i < group1.length; i++) {
                                    if (!group1[i].hasClass('group_col')) {
                                        $(group1[i]).remove();
                                        $(group2[i]).remove();
                                    }
                                }
                            }
                            else {
                                $(group1[0]).remove();
                                $(group2[0]).remove();
                            }
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'showColumn': {
                    value: function _showColumn(col) {
                        if (gridState[gridId].columns[col] && gridState[gridId].columns[col].isHidden) {
                            gridState[gridId].columns[col].isHidden = false;
                            gridState[gridId].grid.find('.grid-header-wrapper').find('[data-field="' + col + '"]').css('display', '');
                            gridState[gridId].grid.find('.grid-content-div').find('[data-field="' + col + '"]').css('display', '');
                            gridState[gridId].grid.find('colgroup').append('col');
                            setColWidth(gridState[gridId], gridState[gridId].grid);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'addColumn': {
                    value: function _addColumn(column, data) {
                        if (typeof column !== 'object' && typeof column !== 'string' || !data || !data.length)
                            return;
                        var field = typeof column === 'object' ? column.field || 'field' : column,
                            newCol;
                        if (!gridState[gridId].columns[field]) {
                            for (var i = 0; i < gridState[gridId].dataSource.data.length; i++) {
                                gridState[gridId].dataSource.data[i][field] = data[i] ? data[i] : null;
                            }
                            if (typeof column === 'object') newCol = column;
                            else {
                                newCol = {};
                            }
                            newCol.filterable = newCol.filterable || false;
                            newCol.editable = newCol.editable || false;
                            newCol.selectable = newCol.selectable ||false;
                            newCol.title = newCol.title || field;
                            newCol.type = newCol.type || 'string';

                            gridState[gridId].columns[field] = newCol;
                            if (gridState[gridId].aggregates) gridState[gridId].aggregates[field] = {
                                type: newCol.type
                            };

                            gridState[gridId].hasAddedColumn = true;
                            gridState[gridId].grid.find('.grid-header-wrapper').empty();
                            createGridHeaders(gridState[gridId], gridElem);
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            setColWidth(gridState[gridId], gridState[gridId].grid);
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(gridState[gridId], gridState[gridId].grid);
                            buildHeaderAggregations(gridId);
                        }
                    },
                    writable: false,
                    configurable: false
                },
                'addRow': {
                    value: function _addRow(data) {
                        var newModel = {}, prop;
                        if (!data) {
                            for (prop in gridState[gridId].dataSource.data[0]) {
                                if (prop !== '_initialRowIndex') newModel[prop] = null;
                            }
                        }
                        else if (typeof data === 'object') {
                            for (prop in gridState[gridId].dataSource.data[0]) {
                                if (typeof data[prop] !== 'undefined') newModel[prop] = data[prop];
                                else newModel[prop] = null;
                            }
                        }
                        gridState[gridId].originalData.push(newModel);
                        var dataSourceModel = cloneGridData(newModel);
                        dataSourceModel._initialRowIndex = gridState[gridId].dataSource.data.length;
                        gridState[gridId].dataSource.data.push(dataSourceModel);
                        gridState[gridId].dataSource.rowCount++;

                        gridState[gridId].pageSize = gridState[gridId].pageSize + 1;
                        gridState[gridId].grid.find('.grid-content-div').empty();
                        createGridContent(gridState[gridId], gridState[gridId].grid);
                        gridState[gridId].grid.find('.grid-footer-div').empty();
                        createGridFooter(gridState[gridId], gridState[gridId].grid);
                        buildHeaderAggregations(gridId);
                    },
                    writable: false,
                    configurable: false
                },
                'getAggregates': {
                    value: function _getAggregates() {
                        return gridState[gridId].gridAggregations;
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
                        if (typeof index === 'number' && index > -1 && index <= gridState[gridId].dataSource.data.length) {
                            validRow = findValidRows(index);
                            if (validRow) rows.push(validRow);
                        }
                        else {
                            for (var i = 0; i < gridState[gridId].pageSize; i++) {
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
                            gridState[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
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
                        if (typeof index === 'number' && index > -1 && index <= gridState[gridId].dataSource.data.length) {
                            var val = cloneGridData([].concat(gridState[gridId].dataSource.data[index]));
                            delete val[0]._initialRowIndex;
                            return val;
                        }
                        else {
                            var gd = cloneGridData(gridState[gridId].dataSource.data);
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
                            gridState[gridId].dataSource.data = data;
                            gridState[gridId].pageSize = data.length;
                            gridState[gridId].dataSource.rowCount = data.length;
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(gridState[gridId], gridState[gridId].grid);
                            buildHeaderAggregations(gridId);
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
                                if (typeof rowData[i].index !== 'number' || rowData[i].index >= gridState[gridId].dataSource.data.length)
                                    continue;
                                gridState[gridId].dataSource.data[rowData[i].index] = rowData[i].data;
                                appliedUpdate = true;
                            }
                        }
                        else if (typeof rowData.index === 'number') {
                            gridState[gridId].dataSource.data[rowData.index] = rowData.data;
                            appliedUpdate = true;
                        }

                        if (appliedUpdate) {
                            gridState[gridId].grid.find('.grid-content-div').empty();
                            createGridContent(gridState[gridId], gridState[gridId].grid);
                            gridState[gridId].grid.find('.grid-footer-div').empty();
                            createGridFooter(gridState[gridId], gridState[gridId].grid);
                            buildHeaderAggregations(gridId);
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
                            if (typeof cell.index !== 'number' || typeof cell.field !== 'string' || cell.index > gridState[gridId].dataSource.data.length)
                                return;
                            if (gridState[gridId].columns[cell.field]) {
                                var dataType = gridState[gridId].columns[cell.field].type;
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
                                gridState[gridId].dataSource.data[cell.index][cell.field] = cell.value;
                                var tableCell;
                                if (gridState[gridId].groupedBy) {
                                    var counter = 0;
                                    gridState[gridId].grid.find('.grid-content-div').find('table').find('tr').each(function iterateTableRowsCallback() {
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
                                    tableCell = gridState[gridId].grid.find('.grid-content-div').find('table').find('tr:nth-child(' + (cell.index + 1) + ')').find('[data-field="' + cell.field + '"]');
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
                        findChildren(gridState[gridId].grid.children());
                        delete gridState[gridId];

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
        storageData.filteredOn = [];
        storageData.groupedBy = [];
        storageData.gridAggregations = {};
        storageData.advancedFiltering = storageData.filterable ? storageData.advancedFiltering : false;
        if (!storageData.dataSource.rowCount) storageData.dataSource.rowCount = gridData.dataSource.data.length;

        var eventObj = { element: storageData.grid };
        callGridEventHandlers(storageData.events.beforeDataBind, storageData.grid, eventObj);

        gridState[id] = storageData;
        if (gridData.aggregates && typeof gridData.dataSource.get === 'function') {
            constructAggregationsFromServer(id, storageData.gridAggregations);
            buildHeaderAggregations(id);
        }

        createGridFooter(storageData, gridElem);
        createGridContent(storageData, gridElem);
        callGridEventHandlers(storageData.events.afterDataBind, storageData.grid, eventObj);
    }

    function createGridHeaders(gridData, gridElem) {
        var gridHeader = gridElem.find('.grid-header-div'),
            gridHeadWrap = gridHeader.find('.grid-header-wrapper'),
            headerTable = $('<table></table>').appendTo(gridHeadWrap);
        headerTable.css('width','auto');
        var colgroup = $('<colgroup></colgroup>').appendTo(headerTable),
            headerTHead = $('<thead></thead>').appendTo(headerTable),
            headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead),
            index = 0,
            id = gridHeader.data('grid_header_id'), i;

        if (gridData.groupedBy && gridData.groupedBy.length) {
            for (i = 0; i < gridData.groupedBy.length; i++) {
                colgroup.prepend('<col class="group_col"/>');
                headerRow.prepend('<th class="group_spacer">&nbsp</th>');
            }
        }

        for (var col in gridData.columns) {
            if (typeof gridData.columns[col] !== 'object') continue;
            $('<col/>').appendTo(colgroup);
            var text = gridData.columns[col].title || col;
            var th = $('<th id="' + col + '_grid_id_' + id + '" data-field="' + col + '" data-index="' + index + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof gridData.columns[col].attributes === 'object' && gridData.columns[col].attributes.headerClasses && gridData.columns[col].attributes.headerClasses.constructor ===  Array) {
                for (i = 0; i < gridData.columns[col].attributes.headerClasses.length; i++) {
                    th.addClass(gridData.columns[col].attributes.headerClasses[i]);
                }
            }

            if (gridData.reorderable === true && (typeof gridData.columns[col].reorderable === 'undefined' || gridData.columns[col].reorderable === true)) {
                th.prop('draggable', true);
                setDragAndDropListeners(th);
            }
            if (gridData.sortable === true && (typeof gridData.columns[col].sortable === 'undefined' || gridData.columns[col].sortable === true)) {
                setSortableClickListener(th);
                gridData.sortable = true;
            }

            if (gridData.columns[col].filterable === true) {
                setFilterableClickListener(th, gridData, col);
                gridData.filterable = true;
                gridData.advancedFiltering = gridData.advancedFiltering != null ? gridData.advancedFiltering : false;
            }

            if (gridData.columns[col].editable || gridData.columns[col].selectable || gridData.groupable) createGridToolbar(gridData, gridElem, (gridData.columns[col].editable || gridData.columns[col].selectable));

            $('<a class="header-anchor" href="#"></a>').appendTo(th).text(text);
            index++;
        }
        headerTable.css('width','');
        setColWidth(gridData, gridElem);
    }

    function buildHeaderAggregations(gridId) {
        var aggrs = gridState[gridId].gridAggregations;
        if (aggrs) {
            var headerTHead = $('#grid-header-' + gridId).find('thead');
            var aggRow = headerTHead.find('.summary-row-header');
            if (aggRow.length)
                aggRow.remove();
            aggRow = $('<tr class=summary-row-header></tr>').appendTo(headerTHead);
            if (gridState[gridId].groupedBy.length) {
                for (var i = 0; i < gridState[gridId].groupedBy.length; i++) {
                    aggRow.append('<td class="group_spacer">&nbsp</td>');
                }
            }
            for (var col in aggrs) {
                var text = aggrs[col].text || '';
                aggRow.append('<td data-field="' + col + '" class=summary-cell-header>' + text + '</td>');
            }
        }
    }

    function createGridContent(gridData, gridElem) {
        var contentHeight,
            footerHeight = parseFloat(gridElem.find('.grid-footer-div').css('height')),
            headerHeight = parseFloat(gridElem.find('.grid-header-div').css('height')),
            toolbarHeight = 0;
        if (gridElem.find('.toolbar'))
            toolbarHeight = parseFloat(gridElem.find('.toolbar').css('height'));

        contentHeight = gridData.height && isNumber(parseFloat(gridData.height)) ? gridData.height - (headerHeight + footerHeight + toolbarHeight) + 'px' : '250px';
        var gridContent = gridElem.find('.grid-content-div').css('height', contentHeight),
            id = gridContent.data('grid_content_id'),
            gcOffsets = gridContent.offset(),
            top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop(),
            left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft(),
            loader = $('<span id="loader-span" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left),
            contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
            colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
            contentTBody = $('<tbody></tbody>').appendTo(contentTable),
            text, i, j, k, item;
        if (gridData.selectable) attachTableSelectHandler(contentTBody);
        var columns = [];
        gridElem.find('th').each(function headerIterationCallback(idx, val) {
            if (!$(val).hasClass('group_spacer'))
                columns.push($(val).data('field'));
        });

        var rowEnd = gridData.pageSize > gridData.dataSource.data.length ? gridData.dataSource.data.length : gridData.pageSize,
            rows = gridData.rows,
            currentGroupingValues = {};

        if (gridData.groupAggregates) gridData.groupAggregations = {};

        for (i = 0; i < rowEnd; i++) {
            gridData.dataSource.data[i]._initialRowIndex = i;
            if (gridData.groupedBy && gridData.groupedBy.length) createGroupedRows(id, i, columns, currentGroupingValues, contentTBody);

            var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
            if (i % 2) {
                tr.addClass('alt-row');
                if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
                    for (j = 0; j < rows.alternateRows.length; j++) {
                        tr.addClass(rows.alternateRows[j].toString());
                    }
            }

            if (rows && rows.all && rows.all.constructor === Array) {
                for (j = 0; j < rows.all.length; j++) {
                    tr.addClass(rows.all[j].toString());
                }
            }

            if (gridData.groupedBy.length) {
                for (j = 0; j < gridData.groupedBy.length; j++) {
                    tr.append('<td class="grouped_cell">&nbsp</td>');
                }
            }

            for (j = 0; j < columns.length; j++) {
                var td = $('<td data-field="' + columns[j] + '" class="grid-content-cell"></td>').appendTo(tr);
                if (gridData.columns[columns[j]].attributes && gridData.columns[columns[j]].attributes.cellClasses && gridData.columns[columns[j]].attributes.cellClasses.constructor === Array) {
                    for (k = 0; k < gridData.columns[columns[j]].attributes.cellClasses.length; k++) {
                        td.addClass(gridData.columns[columns[j]].attributes.cellClasses[k]);
                    }
                }
                text = getFormattedCellText(id, columns[j], gridData.dataSource.data[i][columns[j]]) || gridData.dataSource.data[i][columns[j]];
                text = text == null ? '' : text;
                td.text(text);
                if (gridData.aggregates) addValueToAggregations(id, columns[j], gridData.dataSource.data[i][columns[j]], gridData.gridAggregations);
                if (gridData.columns[columns[j]].editable && gridData.columns[columns[j]].editable !== 'drop-down') {
                    makeCellEditable(id, td);
                    gridState[id].editable = true;
                }
                else if (gridData.columns[columns[j]].editable === 'drop-down') {
                    makeCellSelectable(id, td);
                    gridState[id].editable = true;
                }
            }
        }

        for (i = 0; i < columns.length; i++) {
            colGroup.append('<col/>');
        }
        if (gridData.groupedBy.length) {
            for (j = 0; j < gridData.groupedBy.length; j++) {
                colGroup.prepend('<col class="group_col"/>');
            }
        }

        if (gridData.aggregates && gridData.aggregates.positionAt === 'top' && typeof gridData.dataSource.get !== 'function') buildHeaderAggregations(id);

        if (gridData.aggregates && gridData.aggregates.positionAt === 'bottom') {
            var aggrs = gridState[id].gridAggregations;
            if (aggrs) {
                var aggRow = $('<tr class="summary-row-footer"></tr>').appendTo(contentTBody);
                if (gridState[id].groupedBy.length) {
                    for (i = 0; i < gridState[id].groupedBy.length; i++) {
                        aggRow.append('<td class="group_spacer">&nbsp</td>');
                    }
                }
                for (item in aggrs) {
                    text = aggrs[item].value || '';
                    aggRow.append('<td data-field="' + item + '" class=summary-cell-header>' + text + '</td>');
                }
            }
        }

        createGroupTrEventHandlers();

        gridContent.on('scroll', function contentDivScrollCallback(e) {
            var cDiv = $(e.currentTarget);
            var headWrap = cDiv.parents('.grid-wrapper').find('.grid-header-wrapper');
            if (gridState[headWrap.parent().data('grid_header_id')].resizing)
                return;
            headWrap.scrollLeft(cDiv.scrollLeft());
        });

        var headerId = 'grid-header-' + gridContent.data('grid_content_id');
        var headDiv = $('#' + headerId);
        var sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
        headDiv.css('paddingRight', sizeDiff);

        copyGridWidth(gridElem);

        gridState[id].dataSource.data = gridData.dataSource.data;
        loader.remove();
        gridState[id].updating = false;
    }

    function createGroupedRows(gridId, rowIndex, columns, currentGroupingValues, gridContent) {
        var j, k, item,
            foundDiff = false,
            groupedDiff = [],
            gridData = gridState[gridId];
        for (j = 0; j < gridData.groupedBy.length; j++) {
            if (!currentGroupingValues[gridData.groupedBy[j].field] || currentGroupingValues[gridData.groupedBy[j].field] !== gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field]) {
                currentGroupingValues[gridData.groupedBy[j].field] = gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field];
                groupedDiff[j] = 1;
                foundDiff = true;
            }
            else {
                if (!j || !groupedDiff[j - 1]) groupedDiff[j] = 0;
                else groupedDiff[j] = 1;
            }
        }
        if (foundDiff && rowIndex) {   
            for (j = groupedDiff.length - 1; j >= 0; j--) {     
                var numItems = gridData.groupAggregations[j]._items_; 
                if (groupedDiff[j]) {                               
                    var groupAggregateRow = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                    for (k = 0; k < groupedDiff.length; k++) {
                        groupAggregateRow.append('<td colspan="1" class="grouped_cell"></td>');
                    }
                    for (item in gridData.groupAggregations[j]) {
                        if (item !== '_items_') {
                            groupAggregateRow.append('<td class="group_aggregate_cell">' + (gridData.groupAggregations[j][item].text || '') + '</td>');
                        }
                    }
                    gridData.groupAggregations[j] = {       
                        _items_: 0
                    };
                    for (k = j - 1; k >= 0; k--) {  
                        if (groupedDiff[k] && gridData.groupAggregations[k]._items_ == numItems) {    
                            groupedDiff[k] = 0;
                            gridData.groupAggregations[k] = {
                                _items_: 0
                            };
                        }
                    }
                }
            }
        }
        for (j = 0; j < groupedDiff.length; j++) {
            if (!gridData.groupAggregations[j]) {
                gridData.groupAggregations[j] = {
                    _items_: 0
                };
            }
            for (item in gridData.columns) {
                addValueToAggregations(gridId, item, gridData.dataSource.data[rowIndex][item], gridData.groupAggregations[j]);
            }
            gridData.groupAggregations[j]._items_++;
            if (groupedDiff[j]) {
                var groupedText = getFormattedCellText(gridId, gridData.groupedBy[j].field, gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field]) ||
                    gridData.dataSource.data[rowIndex][gridData.groupedBy[j].field];
                var groupTr = $('<tr class="grouped_row_header"></tr>').appendTo(gridContent);
                var groupTitle = gridData.columns[gridData.groupedBy[j].field].title || gridData.groupedBy[j].field;
                for (k = 0; k <= j; k++) {
                    var indent = k === j ? (columns.length + gridData.groupedBy.length - k) : 1;
                    groupTr.data('group-indent', indent);
                    var groupingCell = $('<td colspan="' + indent + '" class="grouped_cell"></td>').appendTo(groupTr);
                    if (k === j) {
                        groupingCell.append('<p class="grouped"><a class="group-desc sortSpan group_acc_link"></a>' + groupTitle + ': ' + groupedText + '</p></td>');
                        break;
                    }
                }
            }
        }
    }

    function constructAggregationsFromServer(gridId, aggregationObj) {
        for (var col in gridState[gridId].columns) {
            if (!aggregationObj[col]) aggregationObj[col] = {};
            if (!gridState[gridId].aggregates[col]) {
                aggregationObj[col] = '';
                continue;
            }
            if (typeof gridState[gridId].dataSource.get === 'function') {
                if (gridState[gridId].aggregates[col].type && gridState[gridId].aggregates[col].value) {
                    var text = getFormattedCellText(gridId, col, gridState[gridId].aggregates[col].value) || gridState[gridId].aggregates[col].value;
                    aggregationObj[col].text = aggregates[gridState[gridId].aggregates[col].type] + text;
                }
                else aggregationObj[col].text = null;
            }
        }
    }

    function addValueToAggregations(gridId, field, value, aggregationObj) {
        var text, total;
        if (!aggregationObj[field]) aggregationObj[field] = {};
        if (value == null) return;
        switch (gridState[gridId].aggregates[field].type) {
            case 'count':
                aggregationObj[field].value =(aggregationObj[field].value || 0) + 1;
                aggregationObj[field].text = aggregates[gridState[gridId].aggregates[field].type] + aggregationObj[field].value;
                return;
            case 'average':
                var count = aggregationObj[field].count ? aggregationObj[field].count + 1 : 1;
                value = parseFloat(value.toString());
                total = aggregationObj[field].total ? aggregationObj[field].total + value : value;
                var avg = parseFloat(parseFloat(total/count));
                text = getFormattedCellText(gridId, field, avg.toFixed(2)) || avg.toFixed(2);
                aggregationObj[field].total = total;
                aggregationObj[field].count = count;
                aggregationObj[field].text = aggregates[gridState[gridId].aggregates[field].type] + text;
                aggregationObj[field].value = avg;
                return;
            case 'max':
                if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) < parseFloat(value.toString())) {
                    text = getFormattedCellText(gridId, field, value) || value;
                    aggregationObj[field].text = aggregates[gridState[gridId].aggregates[field].type] + text;
                    aggregationObj[field].value = value;
                }
                return;
            case 'min':
                if (!aggregationObj[field].value || parseFloat(aggregationObj[field].value) > parseFloat(value.toString())) {
                    text = getFormattedCellText(gridId, field, value) || value;
                    aggregationObj[field].text = aggregates[gridState[gridId].aggregates[field].type] + text;
                    aggregationObj[field].value = text;
                }
                return;
            case 'total':
                total = (parseFloat(aggregationObj[field].total) || 0) + parseFloat(value);
                text = getFormattedCellText(gridId, field, total) || total;
                aggregationObj[field].total = total;
                aggregationObj[field].text = aggregates[gridState[gridId].aggregates[field].type] + text;
                aggregationObj[field].value = text;
                return;
            default:
                aggregationObj[field].text = null;
        }
    }

    function attachTableSelectHandler(tableBody) {
        var gridId = tableBody.parents('.grid-wrapper').data('grid_id');
        var isSelectable = gridState[gridId].selectable;
        if (isSelectable) {
            $(document).on('click', function tableBodySelectCallback(e) {
                if (e.target === tableBody[0] || $(e.target).parents('tbody')[0] === tableBody[0]) {
                    if (gridState[gridId].selecting) {
                        gridState[gridId].selecting = false;
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
                    gridState[gridId].selecting = true;
                    var contentDiv = tableBody.parents('.grid-content-div'),
                        overlay = $('<div class="selection-highlighter"></div>').appendTo(gridState[gridId].grid);
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
                        if (gridState[gridId].selecting) {
                            overlay.data('event-type', 'scroll');
                            setOverlayDimensions(contentDiv, overlay);
                        }
                    });

                    $(document).on('mousemove', function updateSelectOverlayOnMouseMoveHandler(ev) {
                        if (gridState[gridId].selecting) {
                            var domTag = ev.target.tagName.toUpperCase();
                            if (domTag === 'INPUT' || domTag === 'SELECT') return;

                            overlay.data('event-type', 'mouse');
                            overlay.data('mouse-pos-x', ev.pageX).data('mouse-pos-y', ev.pageY);
                            setOverlayDimensions(gridState[gridId].grid.find('.grid-content-div'), overlay);
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
        var contentDiv = gridState[gridId].grid.find('.grid-content-div'),
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

        var gridElems = gridState[gridId].selectable === 'multi-cell' ? contentDiv.find('td') : contentDiv.find('tr');

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
            var accRow = $(e.currentTarget).parents('tr'),
                indent = accRow.data('group-indent');
            if ($(e.currentTarget).data('state') === 'open') {
                $(e.currentTarget).data('state', 'closed').removeClass('group-desc').addClass('group-asc');
                accRow.nextAll().each(function iterateAccordionRowSiblingsToCloseCallback(idx, val) {
                    var row = $(val),
                        rowIndent = row.data('group-indent');
                    if (!rowIndent || rowIndent < indent)
                        row.css('display', 'none');
                    else return false;
                });
            }
            else {
                $(e.currentTarget).data('state', 'open').removeClass('group-asc').addClass('group-desc');
                accRow.nextAll().each(function iterateAccordionRowSiblingsToOpenCallback(idx, val) {
                    var row = $(val),
                        rowIndent = row.data('group-indent');
                    if (!rowIndent || rowIndent < indent)
                        row.css('display', 'table-row');
                    else return false;
                });
            }
        });
    }

    function makeCellEditable(id, td) {
        td.on('click', function editableCellClickHandler(e) {
            var gridContent = gridState[id].grid.find('.grid-content-div');
            var gridData = gridState[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');

            if (gridState[id].updating) return;
            var index = cell.parents('tr').index('#' + gridContent[0].id + ' .data-row'),
                field = cell.data('field'),
                type = gridState[id].columns[field].type || '',
                val = gridState[id].dataSource.data[index][field] || '',
                dataAttributes = '',
                gridValidation = gridState[id].useValidator ? gridState[id].columns[field].validation : null,
                dataType, input, inputVal;

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            if (gridState[id].useFormatter && gridState[id].columns[field].inputFormat)
                dataAttributes += ' data-inputformat="' + gridState[id].columns[field].inputFormat + '"';

            switch (type) {
                case 'boolean':
                    input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                    val = typeof gridState[id].dataSource.data[index][field] === 'string' ? gridState[id].dataSource.data[index][field] === 'true' : !!val;
                    input[0].checked = val;
                    dataType = 'boolean';
                    break;
                case 'number':
                    if (typeof gridState[id].dataSource.data[index][field] === 'string')
                        val = isNumber(parseFloat(gridState[id].dataSource.data[index][field])) ? isNumber(parseFloat(gridState[id].dataSource.data[index][field])) : 0;
                    else
                        val = isNumber(gridState[id].dataSource.data[index][field]) ? gridState[id].dataSource.data[index][field] : 0;
                    inputVal = val;
                    input = $('<input type="text" value="' + inputVal + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'number';
                    break;
                case 'time':
                    input = $('<input type="text" value="' + val + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
                    dataType = 'time';
                    break;
                case 'date':
                    var dateVal = val == null ? new Date(Date.now()) : new Date(Date.parse(val));
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
            var gridContent = gridState[id].grid.find('.grid-content-div');
            var gridData = gridState[id];
            if (e.target !== e.currentTarget) return;
            if (gridContent.find('.invalid').length) return;
            var cell = $(e.currentTarget);
            if (cell.children('span').hasClass('dirty'))
                cell.data('dirty', true);
            else cell.data('dirty', false);
            cell.text('');
            var index = cell.parents('tr').index('#' + gridContent[0].id + ' .data-row');
            var field = cell.data('field');
            if (gridState[id].updating) return;		

            var gridValidation = gridState[id].useValidator ? gridState[id].columns[field].validation : null;
            var dataAttributes = '';

            if (gridValidation) {
                dataAttributes = setupCellValidation(gridValidation, dataAttributes);
                var gridBodyId = 'grid-content-' + id.toString();
                dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
            }

            var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell);
            var options = [];
            var setVal = gridData.dataSource.data[index][field];
            if (null != setVal && '' !== setVal) options.push(setVal);
            for (var z = 0; z < gridData.columns[field].options.length; z++) {
                if (!compareValuesByType(setVal, gridData.columns[field].options[z], (gridData.columns[field].type || 'string'))) {
                    options.push(gridData.columns[field].options[z]);
                }
            }
            options.sort(function comparator(first, second) {
                switch (gridData.columns[field].type || 'string') {
                    case 'number':
                        var firstNum = parseFloat(first.toString());
                        var secondNum = parseFloat(second.toString());
                        return firstNum > secondNum ?  1 : firstNum < secondNum ? -1 : 0;
                    case 'string':
                    case 'boolean':
                        return first > second ? 1 : first < second ? -1 : 0;
                    case 'time':
                        var firstTime = getNumbersFromTime(first);
                        var secondTime = getNumbersFromTime(second);

                        if (~first.indexOf('PM'))
                            firstTime[0] += 12;
                        if (~second.indexOf('PM'))
                            secondTime[0] += 12;

                        firstTime = convertTimeArrayToSeconds(firstTime);
                        secondTime = convertTimeArrayToSeconds(secondTime);
                        return firstTime > secondTime ? 1 : firstTime < secondTime ? -1 : 0;
                    case 'date':
                        var firstDate = new Date(first);
                        var secondDate = new Date(second);
                        return firstDate > secondDate ? 1 : firstDate < secondDate ? -1 : 0;
                }
            });
            for (var k = 0; k < options.length; k++) {
                var opt = $('<option value="' + options[k] + '">' + options[k] + '</option>');
                select.append(opt);
            }
            if (null != setVal && '' !== setVal) select.val(setVal);
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
            if (!gridData.columns[name].isHidden) {
                columnNames[name] = isNumber(gridData.columns[name].width) ? gridData.columns[name].width : null;
                columnList.push(name);
            }
        }
        var colGroups = tableDiv.find('col');

        colGroups.each(function iterateColsCallback(idx, val) {
            var i = idx;
            if (gridData.groupedBy && gridData.groupedBy.length) {
                i = (idx%(colGroups.length/2)) - gridData.groupedBy.length;
            }
            if (gridData.groupedBy && gridData.groupedBy.length && idx < gridData.groupedBy.length) {
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
            index = cell.parents('tr').index('#' + gridContent[0].id + ' .data-row'),
            field = cell.data('field'),
            type = gridState[id].columns[field].type || '',
            saveVal, re, setDirtyFlag = false,
            formattedVal = getFormattedCellText(id, field, val),
            displayVal = formattedVal == null ? '' : formattedVal;

        input.remove();
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                if (typeof gridState[id].dataSource.data[index][field] === 'string') saveVal = val;
                else {
                    var tmpVal = parseFloat(val.replace(',', ''));
                    tmpVal === tmpVal ? saveVal = tmpVal : saveVal = 0;
                }
                break;
            case 'date':
                re = new RegExp(dataTypes.date);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;
                break;
            case 'boolean':
                displayVal = val.toString();
                saveVal = val;
                break;
            default:
                saveVal = val;
                break;
        }

        cell.text(displayVal || '');
        gridState[id].currentEdit[field] = null;
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {
            gridState[id].dataSource.data[index][field] = saveVal;
            if (saveVal !== gridState[id].originalData[gridState[id].dataSource.data[index]._initialRowIndex][field]) {
                setDirtyFlag = true;
                if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
                else if (previousVal != null) cell.prepend('<span class="dirty-blank"></span>');
            }
        }
        if (!setDirtyFlag && cell.data('dirty')) {
            if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
            else cell.prepend('<span class="dirty-blank"></span>');
        }
        callGridEventHandlers(gridState[id].events.afterCellEdit, gridState[id].grid, null);
    }

    function saveCellSelectData(select) {
        var gridContent = select.parents('.grid-wrapper').find('.grid-content-div'),
            val = select.val(),
            parentCell = select.parents('td');
        select.remove();
        var id = gridContent.data('grid_content_id'),
            index = parentCell.parents('tr').index('#' + gridContent[0].id + ' .data-row'),
            field = parentCell.data('field'),
            type = gridState[id].columns[field].type || '',
            displayVal = getFormattedCellText(id, field, val) || gridState[id].dataSource.data[index][field],
            re, saveVal, setDirtyFlag = false;

        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
                saveVal = displayVal;   
                break;
            case 'time':
                re = new RegExp(dataTypes.time);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;   
                break;
            default: 		
                saveVal = val;
                break;
        }

        parentCell.text(displayVal);
        var previousVal = gridState[id].dataSource.data[index][field];
        if (previousVal !== saveVal) {	
            gridState[id].dataSource.data[index][field] = saveVal;
            if (saveVal !== gridState[id].originalData[gridState[id].dataSource.data[index]._initialRowIndex][field]) {
                parentCell.prepend('<span class="dirty"></span>');
                setDirtyFlag = true;
            }
            gridState[id].dataSource.data[index][field] = saveVal;
        }
        if (!setDirtyFlag && parentCell.data('dirty')) {
            if ('' !== saveVal) parentCell.prepend('<span class="dirty"></span>');
            else parentCell.prepend('<span class="dirty-blank"></span>');
        }
        callGridEventHandlers(gridState[id].events.afterCellEdit, gridState[id].grid, null);
    }

    function createGridToolbar(gridData, gridElem, canEdit) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;	

        if (gridData.groupable) {
            var groupMenuBar = $('<div id="grid_' + id + '_group_div" class="group_div clearfix" data-grid_id="' + id + '">' + groupMenuText + '</div>').prependTo(gridElem);
            groupMenuBar.on('drop', function handleDropCallback(e) {
                var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
                droppedCol.data('dragging', false);
                var dropIndicator = $('#drop_indicator_id_' + id);
                dropIndicator.css('display', 'none');
                var groupId = $(e.currentTarget).data('grid_id'),
                    droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null,
                    groupedItems = {};
                if (groupId == null || droppedId == null || groupId !== droppedId) return;
                if (gridState[id].updating) return;		
                if (!groupMenuBar.children().length) groupMenuBar.text('');
                var field = droppedCol.data('field'),
                    title = gridState[groupId].columns[field].title || field,
                    foundDupe = false;

                groupMenuBar.find('.group_item').each(function iterateGroupItemsCallback(idx, val) {
                    var item = $(val);
                    groupedItems[item.data('field')] = item;
                    if (item.data('field') === field) {
                        foundDupe = true;
                        return false;
                    }
                });
                if (foundDupe) return;  

                var groupItem = $('<div class="group_item" data-grid_id="' + groupId + '" data-field="' + field + '"></div>'),
                    groupDirSpan = $('<span class="group_sort"></span>').appendTo(groupItem);
                groupDirSpan.append('<span class="sort-asc-white groupSortSpan"></span>').append('<span>' + title + '</span>');
                var cancelButton = $('<span class="remove"></span>').appendTo(groupItem),
                    groupings = [];

                if (dropIndicator.data('field')) groupItem.insertBefore(groupedItems[dropIndicator.data('field')]);
                else groupItem.appendTo(groupMenuBar);

                groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                    var item = $(val);
                    groupings.push({
                        field: item.data('field'),
                        sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                    });
                });

                if (gridState[id].sortedOn && gridState[id].sortedOn.length) {
                    var sortArr = [];
                    for (var l = 0; l < gridState[id].sortedOn.length; l++) {
                        if (gridState[id].sortedOn[l].field !== field) sortArr.push(gridState[id].sortedOn[l]);
                        else {
                            gridState[id].grid.find('.grid-header-wrapper').find('#' + field + '_grid_id_' + id).find('.sortSpan').remove();
                        }
                    }
                    gridState[id].sortedOn = sortArr;
                }

                var colGroups = gridState[id].grid.find('colgroup');
                colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
                    $(val).prepend('<col class="group_col"/>');
                });
                gridState[id].grid.find('.grid-headerRow').prepend('<th class="group_spacer">&nbsp</th>');
                gridState[id].grid.find('.summary-row-header').prepend('<td class="group_spacer">&nbsp</td>');

                gridState[id].groupedBy = groupings;
                gridState[id].pageRequest.eventType = 'group';
                attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton);
                preparePageDataGetRequest(id);
            });
            groupMenuBar.on('dragover', function handleHeaderDragOverCallback(e) {
                e.preventDefault();
                var gridId = groupMenuBar.data('grid_id');
                var dropIndicator = $('#drop_indicator_id_' + gridId);
                if (!dropIndicator.length) {
                    dropIndicator = $('<div id="drop_indicator_id_' + gridId + '" class="drop-indicator" data-grid_id="' + gridId + '"></div>');
                    dropIndicator.append('<span class="drop-indicator-top"></span><span class="drop-indicator-bottom"></span>');
                    gridState[gridId].grid.append(dropIndicator);
                }

                var groupedItems = groupMenuBar.find('.group_item');
                if (groupedItems.length) {
                    var placedIndicator = false;

                    groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                        var groupItem = $(val);
                        var groupItemOffset = groupItem.offset();
                        if (groupItemOffset.left < e.originalEvent.x && groupItemOffset.left + groupItem.width() > e.originalEvent.x) {
                            dropIndicator.css('left', groupItemOffset.left);
                            dropIndicator.css('top', groupItemOffset.top);
                            dropIndicator.css('height', groupItem.outerHeight());
                            dropIndicator.data('field', groupItem.data('field'));
                            placedIndicator = true;
                            return false;
                        }
                    });

                    if (!placedIndicator) {
                        var lastItem = groupMenuBar.find('.group_item').last();
                        dropIndicator.css('left', lastItem.offset().left + lastItem.outerWidth());
                        dropIndicator.css('top', lastItem.offset().top);
                        dropIndicator.css('height', lastItem.outerHeight());
                        dropIndicator.data('field', lastItem.data('field'));
                    }
                }
                else {
                    dropIndicator.css('height', groupMenuBar.outerHeight());
                    dropIndicator.css('left', groupMenuBar.offset().left);
                    dropIndicator.css('top', groupMenuBar.offset().top);
                }
                dropIndicator.css('display', 'block');
            });

            groupMenuBar.on('dragexit', function handleHeaderDragOverCallback(e) {
                e.preventDefault();
                $('#drop_indicator_id_' + groupMenuBar.data('grid_id')).css('display', 'none');
            });
        }

        if (canEdit || gridData.excelExport) {
            var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);
            if (gridData.excelExport) {
                var menuLink = $('<a href="#"></a>');
                menuLink.append('<span class="menuSpan"></span>');
                saveBar.append(menuLink);
                attachMenuClickHandler(menuLink, id);
            }
            if (canEdit) {
                var saveAnchor = $('<a href="#" class="toolbarAnchor saveToolbar"></a>').appendTo(saveBar);
                saveAnchor.append('<span class="toolbarSpan saveToolbarSpan"></span>Save Changes');

                var deleteAnchor = $('<a href="#" class="toolbarAnchor deleteToolbar"></a>').appendTo(saveBar);
                deleteAnchor.append('<span class="toolbarSpan deleteToolbarSpan">Delete Changes</span>');

                attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor);
            }
        }
    }

    function attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton) {
        groupDirSpan.on('click', function changeGroupSortDirHandler() {
            var groupElem = $(this),
                id = groupElem.parents('.group_item').data('grid_id'),
                sortSpan = groupElem.children('.groupSortSpan'),
                groupElements = [];
            if (gridState[id].updating) return;		
            if (sortSpan.hasClass('sort-asc-white')) sortSpan.removeClass('sort-asc-white').addClass('sort-desc-white');
            else sortSpan.removeClass('sort-desc-white').addClass('sort-asc-white');
            groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                var item = $(val);
                groupElements.push({
                    field: item.data('field'),
                    sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                });
            });
            gridState[id].groupedBy = groupElements;
            gridState[id].pageRequest.eventType = 'group';
            preparePageDataGetRequest(id);
        });

        cancelButton.on('click', function removeDataGrouping() {
            var groupElem = $(this),
                groupedCol = groupElem.parents('.group_item'),
                id = groupedCol.data('grid_id'),
                groupElements = [];
            if (gridState[id].updating) return;		
            gridState[id].grid.find('colgroup').first().children().first().remove();
            gridState[id].grid.find('.grid-headerRow').children('.group_spacer').first().remove();
            gridState[id].grid.find('.summary-row-header').children('.group_spacer').first().remove();
            groupedCol.remove();
            groupMenuBar.find('.group_item').each(function iterateGroupedColumnsCallback(idx, val) {
                var item = $(val);
                groupElements.push({
                    field: item.data('field'),
                    sortDirection: item.find('.groupSortSpan').hasClass('sort-asc-white') ? 'asc' : 'desc'
                });
            });
            if (!groupElements.length) groupMenuBar.text(groupMenuText);
            gridState[id].groupedBy = groupElements;
            gridState[id].pageRequest.eventType = 'group';
            preparePageDataGetRequest(id);
        });
    }

    function attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor) {
        saveAnchor.on('click', function saveChangesHandler(e) {
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [],
                pageNum = gridState[id].pageNum, i;
            gridElem.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                if (typeof gridState[id].dataSource.put !== 'function') {
                    for (i = 0; i < dirtyCells.length; i++) {
                        var index = dirtyCells[i].parents('tr').index();
                        var field = dirtyCells[i].data('field');
                        var origIndex = gridState[id].dataSource.data[index][field]._initialRowIndex;
                        gridState[id].originalData[origIndex][field] = gridState[id].dataSource.data[index][field];
                        dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                    }
                }
                else {
                    gridState[id].putRequest.eventType = 'save';
                    gridState[id].putRequest.pageNum = pageNum;
                    gridState[id].putRequest.models = [];
                    var putRequestModels = gridState[id].putRequest.models;
                    for (i = 0; i < dirtyCells.length; i++) {
                        var tmpModel = cloneGridData(gridState[id].dataSource.data[dirtyCells[i].parents('tr').index()]);
                        var tmpMap = tmpModel._initialRowIndex;
                        var idx = existsInPutRequest(putRequestModels, tmpModel);
                        if (~idx)
                            putRequestModels[idx].dirtyFields.push(dirtyCells[i].data('field'));
                        else
                            putRequestModels.push({ cleanData: gridState[id].originalData[tmpMap], dirtyData: tmpModel, dirtyFields: [dirtyCells[i].data('field')] });
                    }

                    for (i = 0; i < putRequestModels.length; i++) {
                        delete putRequestModels[i].dirtyData._initialRowIndex;
                    }

                    prepareGridDataUpdateRequest(id);
                }
            }
        });

        deleteAnchor.on('click', function deleteChangeHandler(e) {
            if (gridState[id].updating) return;
            var gridMenu = $(e.currentTarget).parents('.grid_menu');
            if (gridMenu.length)
                $('.grid_menu').addClass('hiddenMenu');
            var dirtyCells = [];
            gridElem.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                dirtyCells.push($(val).parents('td'));
            });

            if (dirtyCells.length) {
                for (var i = 0; i < dirtyCells.length; i++) {
                    var field = dirtyCells[i].data('field');
                    var index = dirtyCells[i].parents('tr').index();
                    var pageNum = gridState[id].pageNum;
                    var rowNum = gridState[id].pageSize;
                    var addend = (pageNum-1)*rowNum;
                    var cellVal = gridState[id].originalData[index][field] !== undefined ? gridState[id].originalData[index][field] : '';
                    var text = getFormattedCellText(id, field, cellVal) || cellVal;
                    dirtyCells[i].text(text);
                    dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                    gridState[id].dataSource.data[index][field] = gridState[id].originalData[index + addend][field];
                }
            }
        });
    }

    function attachMenuClickHandler(menuAnchor, gridId) {
        menuAnchor.on('click', function menuAnchorClickHandler(e) {
            e.stopPropagation();	
            e.preventDefault();
            var menu = gridState[gridId].grid.find('#menu_model_grid_id_' + gridId),
                newMenu;

            if (!menu.length) {
                newMenu = $('<div id="menu_model_grid_id_' + gridId + '" class="grid_menu" data-grid_id="' + gridId + '"></div>');
                if (gridState[gridId].editable) {
                    newMenu.append($('<ul class="menu-list"></ul>').append(createSaveDeleteMenuItems(gridId)));
                }
                if (gridState[gridId].columnToggle) {
                    newMenu.append($('<hr/>'));
                    newMenu.append(createColumnToggleMenuOptions(newMenu, gridId));
                }
                if (gridState[gridId].sortable || gridState[gridId].filterable || gridState[gridId].selectable || gridState[gridId].groupable) {
                    newMenu.append($('<hr/>'));
                    if (gridState[gridId].sortable) newMenu.append($('<ul class="menu-list"></ul>').append(createSortMenuItem()));
                    if (gridState[gridId].filterable) {
                        newMenu.append($('<ul class="menu-list"></ul>').append(createFilterMenuItems()));
                        if (gridState[gridId].advancedFiltering) {
                            newMenu.append($('<ul class="menu-list"></ul>').append(createFilterModalMenuItem(gridId)));
                        }
                    }
                    if (gridState[gridId].groupable) newMenu.append($('<ul class="menu-list"></ul>').append(createGroupMenuItem()));
                    if (gridState[gridId].selectable) newMenu.append($('<ul class="menu-list"></ul>').append(createDeselectMenuOption(gridId)));
                }
                if (gridState[gridId].excelExport) {
                    newMenu.append($('<hr/>'));
                    newMenu.append(createExcelExportMenuItems(newMenu, gridId));
                }
                gridState[gridId].grid.append(newMenu);
                $(document).on('click', function hideMenuHandler(e) {
                    var elem = $(e.target);
                    if (!elem.hasClass('grid_menu') && !elem.hasClass('menu_item_options')) {
                        if (!elem.parents('.grid_menu').length && !elem.parents('.menu_item_options').length) {
                            var gridMenu = $('.grid_menu');
                            gridMenu.addClass('hiddenMenu');
                            gridState[gridId].grid.find('.menu_item_options').css('display', 'none');
                        }
                    }
                });
            }
            else {
                newMenu = menu;
                newMenu.removeClass('hiddenMenu');
            }

            var menuAnchorOffset = menuAnchor.offset();
            newMenu.css('top', (menuAnchorOffset.top - $(window).scrollTop()));
            newMenu.css('left', (menuAnchorOffset.left - $(window).scrollLeft()));
        });
    }

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

    function createDeselectMenuOption(gridId) {
        var deSelectMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove Grid Selection</a>'));
        deSelectMenuItem.on('click', function deselectGridClickHandler(e) {
            gridState[gridId].grid.find('.selected').removeClass('selected');
            $(e.currentTarget).parents('.grid_menu').addClass('hiddenMenu');
        });
        return deSelectMenuItem;
    }

    function createSaveDeleteMenuItems(gridId) {
        var saveMenuItem = $('<li class="menu_item"></li>');
        var saveMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Save Grid Changes</a>');
        var deleteMenuItem = $('<li class="menu_item"></li>');
        var deleteMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Delete Grid Changes</a>');

        attachSaveAndDeleteHandlers(gridId, gridState[gridId].grid, saveMenuItem, deleteMenuItem);

        saveMenuItem.append(saveMenuAnchor);
        deleteMenuItem.append(deleteMenuAnchor);
        return [saveMenuItem, deleteMenuItem];
    }

    function createSortMenuItem() {
        var sortMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Sorts</a>'));
        sortMenuItem.on('click', RemoveAllColumnSorts);
        return sortMenuItem;
    }

    function createFilterMenuItems() {
        var filterMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Grid Filters</a>'));
        filterMenuItem.on('click', resetAllFilters);
        return filterMenuItem;
    }

    function createFilterModalMenuItem(gridId) {
        var filterModalMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Advanced Filters</a>'));
        filterModalMenuItem.on('click', function openAdvancedFilterModal() {
            var advancedFiltersModal = gridState[gridId].grid.find('filter_modal');
            if (!advancedFiltersModal.length) {
                advancedFiltersModal = $('<div class="filter_modal" data-grid_id="' + gridId + '">');
                var advancedFiltersContainer = $('<div class="filter_container"></div>').appendTo(advancedFiltersModal);
                addNewAdvancedFilter(advancedFiltersContainer, true );
                advancedFiltersModal.append('<input type="button" value="Apply Filter(s)" class="apply_filters_button"/>')
                    .on('click', function applyAdvancedFiltersHandler() {
                        advancedFiltersContainer.find('.filter_row_div').each(function iterateFilterRowsCallback() {

                        });
                    });
                gridState[gridId].grid.append(advancedFiltersModal);
            }
            else advancedFiltersModal.css('display', 'block');

            var gridOffset = gridState[gridId].grid.offset(),
                gridWidth = gridState[gridId].grid.width(),
                toolbarOffset = gridState[gridId].grid.find('.toolbar').offset();

            var leftLoc = gridOffset.left - (advancedFiltersModal.outerWidth() / 2) + (gridWidth / 2);

            advancedFiltersModal.css('top', toolbarOffset.top);
            advancedFiltersModal.css('left', leftLoc);

            gridState[gridId].grid.find('.grid_menu').css('display', 'none');
        });
        return filterModalMenuItem;
    }

    function addFilterButtonHandler(e) {
        addNewAdvancedFilter($(e.currentTarget).parents('.filter_container'), false );
    }

    function addNewAdvancedFilter(advancedFiltersContainer, isFirstFilter) {
        var gridId = advancedFiltersContainer.parents('.filter_modal').data('grid_id'),
            filterRowDiv = $('<div class="filter_row_div"></div>').appendTo(advancedFiltersContainer),
            columnSelector = $('<select class="input select filter_column_selector"></select>').appendTo(filterRowDiv);
        columnSelector.append('<option value="">Select a column</option>');
        for (var column in gridState[gridId].columns) {
            var curCol = gridState[gridId].columns[column];
            if (curCol.filterable) {
                columnSelector.append('<option value="' + column + '">' + (curCol.title || column) + '</option>');
            }
        }

        var filterTypeSelector = $('<select class="input select" disabled></select>').appendTo(filterRowDiv);
        $('<input type="text" class="advanced_filter_value" disabled />').appendTo(filterRowDiv);

        if (!isFirstFilter) {
            $('<input type="button" value="X" class="advanced_filter_button"/>')
                .appendTo(filterRowDiv)
                .on('click', deleteFilterButtonHandler);
        }
        else {
            $('<input type="button" value="X" class="advanced_filter_button"/>')
                .appendTo(filterRowDiv)
                .on('click', function clearFirstFilterHandler() {
                    columnSelector.find('option').remove();
                    columnSelector.append('<option value="">Select a column</option>');
                    filterTypeSelector.find('option').remove().prop('disabled', true);
                    filterRowDiv.find('.advanced_filter_value').val('').prop('disabled', true);
                });
        }
        $('<input type="button" value="+" class="advanced_filter_button"/>')
            .appendTo(filterRowDiv)
            .on('click', addFilterButtonHandler);

        columnSelector.on('change', function columnSelectorCallback() {
            columnSelector.find('option').first().remove();
            filterTypeSelector.find('option').remove();
            filterTypeSelector.prop('disabled', false);
            createFilterOptionsByDataType(filterTypeSelector, gridState[gridId].columns[columnSelector.val()].type || 'string');

            if (gridState[gridId].columns[columnSelector.val()].type !== 'boolean') {
                filterRowDiv.find('.advanced_filter_value').prop('disabled', false);
            }
        });
    }

    function deleteFilterButtonHandler(e) {
        $(e.currentTarget).parents('.filter_row_div').remove();
    }

    function RemoveAllColumnSorts(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');

        gridState[gridId].find('.sortSpan').remove();
        gridState[gridId].sortedOn = [];
        gridState[gridId].pageRequest.eventType = 'sort';
        preparePageDataGetRequest(gridId);
    }

    function createGroupMenuItem() {
        var groupMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Grouping</a>'));
        groupMenuItem.on('click', RemoveAllColumnGrouping);
        return groupMenuItem;
    }

    function RemoveAllColumnGrouping(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');

        var groupItems = gridState[gridId].grid.find('.group_item'),
            groupItemsCount = groupItems.length,
            headerColGroup = gridState[gridId].grid.find('colgroup').first();
        groupItems.remove();
        for (var i = 0; i < groupItemsCount; i++) {
            headerColGroup.children().first().remove();
        }
        gridState[gridId].grid.find('colgroup').first().children().first().remove();
        gridState[gridId].grid.find('.grid-headerRow').children('.group_spacer').remove();
        gridState[gridId].grid.find('.summary-row-header').children('.group_spacer').remove();
        gridState[gridId].grid.find('.group_div').text(groupMenuText);
        gridState[gridId].groupedBy = [];
        gridState[gridId].pageRequest.eventType = 'group';
        preparePageDataGetRequest(gridId);
    }

    function createColumnToggleMenuOptions(menu, gridId) {
        var menuList = $('<ul class="menu-list"></ul>');
        var menuItem = $('<li class="menu_item"></li>');
        var menuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Toggle Columns<span class="menu_arrow"/></span></a>');
        menuItem.on('mouseover', function columnToggleMenuItemHoverHandler() {
            var toggleOptions = gridState[gridId].grid.find('#toggle_grid_id_' + gridId);
            if (!toggleOptions.length || gridState[gridId].hasAddedColumn) {
                if (gridState[gridId].hasAddedColumn) gridState[gridId].hasAddedColumn = false;
                toggleOptions = $('<div id="toggle_grid_id_' + gridId + '" class="menu_item_options" data-grid_id="' + gridId + '" style="display: none;"></div>');
                var columnList = $('<ul class="menu-list"></ul>');
                for (var col in gridState[gridId].columns) {
                    var fieldName = gridState[gridId].columns[col].title || col;
                    var columnOption = $('<li data-value="' + col + '" class="menu_item">');
                    var columnToggle = $('<span class="excel_span"><input type="checkbox" data-field="' + col + '"> ' + fieldName + '</span>');
                    columnToggle.appendTo(columnOption);
                    columnList.append(columnOption);
                }
                var options = columnList.find('input');
                options.on('click', function excelExportItemClickHandler() {
                    var uncheckedCol = false;
                    $(this).parents('ul').find('input').each(function findTotalCheckedColumns() {
                        if (!this.checked) {
                            uncheckedCol = true;
                            return false;
                        }
                    });
                    if (uncheckedCol && this.checked) gridState[gridId].grid[0].grid.hideColumn($(this).data('field'));
                    else if (this.checked) this.checked = false;
                    else gridState[gridId].grid[0].grid.showColumn($(this).data('field'));
                });
                toggleOptions.append(columnList);
                gridState[gridId].grid.append(toggleOptions);
            }
            if (toggleOptions.css('display') === 'none') {
                var groupAnchorOffset = menuAnchor.offset(),
                    newMenuOffset = menu.offset();
                toggleOptions.css('top', (groupAnchorOffset.top - 3 - $(window).scrollTop()));
                toggleOptions.css('left', newMenuOffset.left + (menu.outerWidth() - toggleOptions.outerWidth()));
                toggle(toggleOptions, {duration: 200 });
            }
        });
        menuList.on('mouseleave', function columnToggleItemHoverHandler(evt) {
            setTimeout(function detectMouseLeave() {
                var toggleOptions = $('#toggle_grid_id_' + gridId),
                    toggleOptionsOffset = toggleOptions.offset();
                if (evt.pageX >= toggleOptionsOffset.left && evt.pageX <= (toggleOptionsOffset.left + toggleOptions.width()) && evt.pageY >= toggleOptionsOffset.top &&
                    evt.pageY <= (toggleOptionsOffset.top + toggleOptions.height())) {
                    return;
                }
                toggle(toggleOptions, { duration: 200 });
            }, 200);
        });
        menuList.append(menuItem.append(menuAnchor));
        return menuList;
    }

    function createGridFooter(gridData, gridElem) {
        var gridFooter = gridElem.find('.grid-footer-div');
        var id = gridFooter.data('grid_footer_id');
        var count = gridState[id].dataSource.rowCount;
        var displayedRows = (count - gridState[id].pageSize) > 0 ? gridState[id].pageSize : count;
        var totalPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) + 1: 0;
        var pageNum = gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum;

        var first = $('<a href="#" class="grid-page-link" data-link="first" data-pagenum="1" title="First Page"><span class="grid-page-span span-first">First Page</span></a>').appendTo(gridFooter);
        var prev = $('<a href="#" class="grid-page-link" data-link="prev" data-pagenum="1" title="Previous Page"><span class="grid-page-span span-prev">Prev Page</span></a>').appendTo(gridFooter);
        var text = 'Page ' + gridState[parseInt(gridFooter.data('grid_footer_id'))].pageNum + '/' + (totalPages);
        gridFooter.append('<span class="grid-pagenum-span page-counter">' + text + '</span>');
        var next = $('<a href="#" class="grid-page-link" data-link="next" data-pagenum="2" title="Next Page"><span class="grid-page-span span-next">Next Page</span></a>').appendTo(gridFooter);
        var last = $('<a href="#" class="grid-page-link" data-link="last" data-pagenum="' + (totalPages) + '" title="Last Page"><span class="grid-page-span span-last">Last Page</span></a>').appendTo(gridFooter);

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
                if (isNumber(parseFloat(pageOptions[i]))) {
                    sizeSelect.append('<option value="' + pageOptions[i] + '">' + pageOptions[i] + '</option>');
                    numOptions++;
                }
            }
            if (numOptions) {
                sizeSelectorSpan.appendTo(gridFooter);
                sizeSelect.appendTo(sizeSelectorSpan);
            }
            sizeSelect.val(~pageOptions.indexOf(gridState[id].pageSize) ? gridState[id].pageSize : pageOptions[0]);
            sizeSelectorSpan.append('Rows per page');

            sizeSelect.on('change', function pageSizeSelectorClickHandler() {
                var pageSize = $(this).val();
                gridState[id].pageRequest.pageSize = parseInt(pageSize);
                gridState[id].pageRequest.eventType = 'pageSize';
                preparePageDataGetRequest(id);
            });
        }

        var rowStart = 1 + (displayedRows * (pageNum - 1));
        var rowEnd = gridData.dataSource.rowCount < gridData.pageSize * pageNum ? gridData.dataSource.rowCount : gridData.pageSize * pageNum;
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
                if (gridState[id].updating) return;		
                var gridData = gridState[id];
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
            if (gridState[id].updating) return;		
            var filters = grid.find('.filter-div');
            var currFilter = null;
            var field = filterAnchor.data('field');
            var title = gridState[id].columns[field].title || field;

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
        var domName = title ? title : type,
            filterInput, resetButton, button;
        $('<span class="filterTextSpan">Filter rows where ' + domName + ' is:</span>').appendTo(filterDiv);
        var select = $('<select class="filterSelect select input"></select>').appendTo(filterDiv);

        createFilterOptionsByDataType(select, type);
        if (type !== 'boolean') {
            filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
        }
        resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
        button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
        resetButton.on('click', resetButtonClickHandler);
        button.on('click', filterButtonClickHandler);
        if (filterInput && type !=='time' && type !== 'date') filterInputValidation(filterInput);
    }

    function createFilterOptionsByDataType(select, type) {
        switch (type) {
            case 'number':
                select.append('<option value="gte">Greater than or equal to:</option>')
                    .append('<option value="gt">Greater than:</option>')
                    .append('<option value="lte">Less than or equal to:</option>')
                    .append('<option value="lt">Less than:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
            case 'date':
            case 'time':
                select.append('<option value="gte">Equal to or later than:</option>')
                    .append('<option value="gt">Later than:</option>')
                    .append('<option value="lte">Equal to or before:</option>')
                    .append('<option value="lt">Before:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
            case 'boolean':
                select.append('<option value="true">True</option>')
                    .append('<option value="false">False</option>');
                break;
            case 'string':
                select.append('<option value="ct">Contains:</option>')
                    .append('<option value="nct">Does not contain:</option>')
                    .append('<option value="eq">Equal to:</option>')
                    .append('<option value="neq">Not equal to:</option>');
                break;
        }
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

    function resetAllFilters(e) {
        var gridMenu = $(e.currentTarget).parents('.grid_menu'),
            gridId = gridMenu.data('grid_id');
        $('.grid_menu').addClass('hiddenMenu');
        gridState[gridId].grid.find('filterInput').val('');

        if (gridState[gridId].updating) return;		
        gridState[gridId].filteredOn = [];
        gridState[gridId].pageRequest.eventType = 'filter-rem';
        preparePageDataGetRequest(gridId);
    }

    function resetButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            value = filterDiv.find('.filterInput').val(),
            field = $(this).data('field'),
            remainingFilters = [],
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[gridId].updating) return;		
        var gridData = gridState[gridId];

        if (value === '' && !gridData.filteredOn.length) return;
        filterDiv.find('.filterInput').val('');

        filterDiv.addClass('hiddenFilter');

        for (var i = 0; i < gridState[gridId].filteredOn.length; i++) {
            if (gridState[gridId].filteredOn[i].field !== field) {
                remainingFilters.push(gridState[gridId].filteredOn[i]);
            }
        }

        gridData.filteredOn = remainingFilters;
        gridData.pageRequest.eventType = 'filter-rem';
        preparePageDataGetRequest(gridId);
    }

    function filterButtonClickHandler(e) {
        var filterDiv = $(e.currentTarget).parents('.filter-div'),
            selected = filterDiv.find('.filterSelect').val(),
            value = filterDiv.find('.filterInput').val(),
            gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
        if (gridState[gridId].updating) return;		
        var gridData = gridState[gridId],
            type = filterDiv.data('type'),
            errors = filterDiv.find('.filter-div-error'),
            field = $(this).data('field'),
            foundColumn = false,
            tmpFilters = [],
            updatedFilter, re;

        if (dataTypes[type]) {
            re = new RegExp(dataTypes[type]);
            if (!re.test(value) && !errors.length) {
                $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
                return;
            }
        }

        if (errors.length) errors.remove();
        if (value === '' && !gridData.filteredOn.length) return;

        for (var i = 0; i < gridState[gridId].filteredOn.length; i++) {
            if (gridState[gridId].filteredOn[i].field !== field) tmpFilters.push(gridState[gridId].filteredOn[i]);
            else {
                updatedFilter = gridState[gridId].filteredOn[i];
                foundColumn = true;
            }
        }

        tmpFilters.push(foundColumn ? updatedFilter : { field: field, value: value, filterType: selected });
        gridState[gridId].filteredOn = tmpFilters;

        filterDiv.addClass('hiddenFilter');
        gridData.pageRequest.eventType = 'filter-add';
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

    function handleDropCallback(e) {
        var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
        droppedCol.data('dragging', false);
        var targetCol = $(e.currentTarget);
        var id = targetCol.parents('.grid-header-div').length ? targetCol.parents('.grid-wrapper').data('grid_id') : null;
        var droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null;
        if (id == null || droppedId == null || id !== droppedId) return;  
        if (gridState[id].updating) return;		
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

    function setSortableClickListener(elem) {
        elem.on('click', function handleHeaderClickCallback() {
            var headerDiv = elem.parents('.grid-header-div');
            var id = parseInt(headerDiv.data('grid_header_id'));
            if (gridState[id].updating) return;		
            var field = elem.data('field'),
                foundColumn = false;

            if (gridState[id].groupedBy.length) {
                for (var j = 0; j < gridState[id].groupedBy.length; j++) {
                    if (gridState[id].groupedBy[j].field === field) return; 
                }
            }

            for (var i = 0; i < gridState[id].sortedOn.length; i++) {
                if (gridState[id].sortedOn[i].field === field) {
                    foundColumn = true;
                    if (gridState[id].sortedOn[i].sortDirection === 'asc') {
                        gridState[id].sortedOn[i].sortDirection = 'desc';
                        elem.find('.sortSpan').addClass('sort-desc').removeClass('sort-asc');
                    }
                    else {
                        gridState[id].sortedOn =  gridState[id].sortedOn.filter(function filterSortedColumns(item) {
                            return item.field !== field;
                        });
                        elem.find('.sortSpan').remove();
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
        if (gridState[id].updating) return;		
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

    function preparePageDataGetRequest(id) {
        gridState[id].updating = true;
        var gridData = gridState[id];
        var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
        var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;

        var requestObj = {};
        if (gridData.sortable) requestObj.sortedOn = gridData.sortedOn.length ? gridData.sortedOn : [];
        if (gridData.filterable) requestObj.filteredOn = gridData.filteredOn.length? gridData.filteredOn : [];
        if (gridData.groupable) requestObj.groupedBy = gridData.groupedBy.length? gridData.groupedBy : [];

        requestObj.pageSize = pageSize;
        requestObj.pageNum = gridData.eventType === 'filter' ? 1 : pageNum;

        gridData.grid.find('.grid-content-div').empty();

        callGridEventHandlers(gridState[id].events.pageRequested, gridData.grid, { element: gridData.grid });
        if (gridData.dataSource.get && typeof gridData.dataSource.get === 'function') gridData.dataSource.get(requestObj, getPageDataRequestCallback);
        else {
            if (!gridData.alteredData) gridData.alteredData = cloneGridData(gridData.originalData);
            getPageData(requestObj, id, getPageDataRequestCallback);
        }

        function getPageDataRequestCallback(response) {
            if (response) {
                gridData.dataSource.data = response.data;
                gridData.pageSize = requestObj.pageSize;
                gridData.pageNum = requestObj.pageNum;
                gridData.dataSource.rowCount = response.rowCount != null ? response.rowCount : response.data.length;
                gridData.groupedBy = requestObj.groupedBy;
                gridData.sortedOn = requestObj.sortedOn;
                gridData.filteredOn = requestObj.filteredOn;

                if (gridData.pageRequest.eventType === 'newGrid' || gridData.pageRequest.eventType === 'group')
                    setColWidth(gridData, gridState[id].grid);

                createGridContent(gridData, gridState[id].grid);
                if (gridData.pageRequest.eventType === 'filter-add' || gridData.pageRequest.eventType === 'filter-rem' || gridData.pageRequest.eventType === 'pageSize') {
                    gridData.grid.find('.grid-footer-div').empty();
                    createGridFooter(gridData, gridData.grid);
                }
                if (gridData.pageRequest.eventType === 'filter' && gridData.aggregates && gridData.aggregates.positionAt === 'top')
                    buildHeaderAggregations(id);
                gridData.pageRequest = {};
            }
        }
    }

    function prepareGridDataUpdateRequest(id) {
        gridState[id].updating = true;
        var requestObj = {
            models: gridState[id].putRequest.models,
            pageNum: gridState[id].putRequest.pageNum
        };

        gridState[id].dataSource.put(requestObj, updatePageDataPutRequestCallback);

        function updatePageDataPutRequestCallback(response) {
            gridState[id].updating = false;
            if (response) {
                gridState[id].grid.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                    var index = $(val).parents('tr').index();
                    var field = $(val).parents('td').data('field');
                    var origIdx = gridState[id].dataSource.data[index]._initialRowIndex;
                    gridState[id].originalData[origIdx][field] = gridState[id].dataSource.data[index][field];
                    $(val).remove();
                });
            }
            else {
                gridState[id].grid.find('.dirty').add('.dirty-blank').each(function iterateDirtySpansCallback(idx, val) {
                    var cell = $(val).parents('td');
                    var index = cell.parents('tr').index();
                    var field = cell.data('field');
                    var text = getFormattedCellText(id, cell.data('field'), gridState[id].originalData[index][field]) || gridState[id].originalData[index][field];
                    cell.text(text);
                    $(val).remove();
                });
            }
        }
    }

    function getPageData(requestObj, id, callback) {
        var eventType = gridState[id].pageRequest.eventType;
        var fullGridData = cloneGridData(gridState[id].alteredData);

        if (eventType === 'page' || eventType === 'pageSize' || eventType === 'newGrid') {
            limitPageData(requestObj, fullGridData, callback);
            return;
        }

        if ((requestObj.filteredOn && requestObj.filteredOn.length) || eventType === 'filter-rem') {
            fullGridData = eventType === 'filter-add' ? cloneGridData(gridState[id].alteredData) : cloneGridData(gridState[id].originalData);
            var startIdx = eventType === 'filter-add' ? requestObj.filteredOn.length - 1 : 0;
            for (var i = startIdx; i <  requestObj.filteredOn.length; i++) {
                var dataType = gridState[id].columns[requestObj.filteredOn[i].field].type || 'string';
                fullGridData = filterGridData(requestObj.filteredOn[i].filterType, requestObj.filteredOn[i].value, requestObj.filteredOn[i].field, dataType, fullGridData);
            }
            requestObj.pageNum = 1;		
            gridState[id].alteredData = fullGridData;
        }

        if (requestObj.groupedBy.length || requestObj.sortedOn.length) {
            var sortedData = sortGridData(requestObj.groupedBy.concat(requestObj.sortedOn), fullGridData || cloneGridData(gridState[id].originalData), id);
            gridState[id].alteredData = sortedData;
            limitPageData(requestObj, sortedData, callback);
            return;
        }
        gridState[id].alteredData = fullGridData;
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
        return filteredData;
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
                gridData = mergeSort(gridData, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string');
            else {
                var sortedGridData = [];
                var itemsToSort = [];
                for (var j = 0; j < gridData.length; j++) {
                    if (!itemsToSort.length || compareValuesByType(itemsToSort[0][sortedItems[i - 1].field], gridData[j][sortedItems[i - 1].field], gridState[gridId].columns[sortedItems[i - 1].field].type))
                        itemsToSort.push(gridData[j]);
                    else {
                        if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                        else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string'));
                        itemsToSort.length = 0;
                        itemsToSort.push(gridData[j]);
                    }
                    if (j === gridData.length - 1)
                        sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridState[gridId].columns[sortedItems[i].field].type || 'string'));
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
        var text,
            type = gridState[gridId].columns[column].type || 'string';
        if (value == null) return ' ';
        switch(type) {
            case 'number':
                text = formatNumericCellData(value, gridState[gridId].columns[column].format);
                break;
            case 'date':
                text = formatDateCellData(value, gridState[gridId].columns[column].format);
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

        var template = gridState[gridId].columns[column].template;
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
            minutes = timeGroups[3] || '00';
            seconds = timeGroups[4]  || '00';
            meridiem = timeGroups[5].replace(' ', '') || null;
        }
        else if (timeGroups[6]) {
            minutes = timeGroups[8] || '00';
            seconds = timeGroups[9] || '00';
        }
        else{
            minutes = '00';
            seconds = '00';
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
                if ((typeof date1 === 'object' ||typeof date1 === 'number') && (typeof date2 === 'object' || typeof date2 === 'number')) {
                    if (date1 !== date1 && date2 !== date2) return true;
                }
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

    function exportDataAsExcelFile(gridId, option) {
        if (excelExporter && typeof excelExporter.createWorkBook === 'function') {
            determineGridDataToExport(gridId, (option || 'page'), function gridDataCallback(excelDataAndColumns) {
                excelExporter.exportWorkBook(excelExporter.createWorkBook().createWorkSheet(excelDataAndColumns.data, excelDataAndColumns.columns, 'testSheet'));
            });
        }
    }

    function determineGridDataToExport(gridId, option, callback) {
        var columns = getGridColumns(gridId);
        switch (option) {
            case 'select':
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

    function getGridColumns(gridId) {
        var cols = [];
        for (var col in gridState[gridId].columns) {
            cols.push(col);
        }
        return cols;
    }

    function createExcelRequestObject(gridId) {
        var gridData = gridState[gridId];
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

        requestObj.pageSize = gridData.dataSource.rowCount;
        requestObj.pageNum = 1;
        return requestObj;
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
        dateChar: '\\d|\\-|\\\|\\.'
    };

    events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

    aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

    function formatTimeCellData(time, column, gridId) {
        var timeArray = getNumbersFromTime(time),
            formattedTime,
            format = gridState[gridId].columns[column].format || '24',
            timeFormat = gridState[gridId].columns[column].timeFormat;

        if (timeArray.length < 2) return '';

        if (timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
            timeArray[0] = timeArray[0] === '12' ? '00' : (parseInt(timeArray[0]) + 12).toString();
        else if (timeFormat === '12' && parseInt(timeArray[0]) > 12) {
            timeArray[0] = (parseInt(timeArray[0]) - 12).toString();
            timeArray[3] = 'PM';
        }
        else if (timeFormat === '12' && timeArray.length < 4)
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
        format = format.toUpperCase();
        var formatObject = (~format.indexOf('P') || ~format.indexOf('C') || ~format.indexOf('N')) ? createCurrencyNumberOrPercentFormat(format) : verifyFormat(format);
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

    function createCurrencyNumberOrPercentFormat(format) {
        var charStripper = '\\d{0,2}]',
            cPOrN = ~format.indexOf('P') ? 'P' : ~format.indexOf('N') ? 'N' : 'C';
        format = format.split(cPOrN);
        var wholeNums = verifyFormat(format[0]),
            re = new RegExp('[^' + cPOrN + charStripper, 'g');
        format = format[1].replace(re, '');
        var numDecimals = 2, newFormat;
        if (format.length)
            numDecimals = parseInt(format.substring(0,2));

        if (wholeNums.value)
            newFormat = numDecimals ? wholeNums.value + '.' : wholeNums.value;
        else if (numDecimals && cPOrN === 'C')
            newFormat = '0.';
        else if (numDecimals && cPOrN === 'P')
            newFormat = '00.';
        else if (numDecimals && cPOrN === 'N')
            newFormat = '0.';
        else newFormat = cPOrN === 'C' || cPOrN === 'N' ? '0' : '00';

        for (var i = 0; i < numDecimals; i++) {
            newFormat += '0';
        }
        return { value: newFormat,
            shouldInsertSeparators: wholeNums.shouldInsertSeparators,
            alterer: cPOrN === 'C' || cPOrN === 'N' ? null : x100,
            prependedSymbol: cPOrN === 'C' ? '$' : '',
            appendedSymbol: cPOrN === 'P' ? '%' : ''
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

    generateId = (function guid(seed) {
        return function _generateId() {
            seed++;
            return seed.toString();
        };
    })(-1);

    var gridApi = {};

    return Object.defineProperties(
        gridApi, {
            'getGridInstance': {
                value: function getGridInstance(elem) {
                    elem = $(elem);
                    for (var i = 0; i < gridState.length; i++) {
                        if (elem[0] === gridState[i].grid[0])
                            return gridState[i].grid[0].grid;
                    }
                },
                writable: false,
                configurable: false
            },
            'createGrid': {
                get: function _createGrid() {
                    return create;
                }
            }
        }
    );
})(jQuery);