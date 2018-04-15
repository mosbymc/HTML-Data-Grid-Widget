import { addValueToAggregations, constructAggregationsFromServer } from './aggregates_util';
import { setPagerEventListeners } from './pager_util';
import { attachGroupItemEventHandlers } from './toolbar_util';
import { content_util } from './content_util';
import { header_util } from './header_util';
import { general_util } from './general_util';
import { dominator } from './dominator';

var viewGenerator = {
    createHeaders: function _createHeaders(gridConfig) {
        var gridElem = dominator(gridConfig.grid),
            gridHeader = gridElem.find('.grid-header-div'),
            gridHeadWrap = gridElem.find('.grid-header-wrapper'),
            headerTable = dominator({ type: 'table', styles: [{ name: 'width', value: 'auto' }] }).appendTo(gridHeadWrap);
        var colgroup = dominator({ type: 'colgroup' }).appendTo(headerTable),
            headerTHead = dominator({ type: 'thead' }).appendTo(headerTable),
            headerRow = dominator({ type: 'tr', classes: ['grid-headerRow'] }).appendTo(headerTHead),
            id = gridHeader.data('grid_header_id')[0];

        if (gridConfig.groupedBy) {
            gridConfig.groupedBy.forEach(function _createGroupingCols() {
                colgroup.prepend({ type: 'col', classes: ['group_col'] });
                headerRow.prepend({ type: 'th', classes: ['group_spacer'] });
            });
        }

        if (gridConfig.drillDown) {
            colgroup.prepend({ type: 'col', classes: ['drill_down_col'] });
            headerRow.prepend({ type: 'th', classes: ['drill_down_spacer'] });
        }


        //var gridElem = gridConfig.grid,
            //gridHeader = gridElem.find('.grid-header-div'),
            //gridHeadWrap = gridHeader.find('.grid-header-wrapper'),
            //headerTable = $('<table></table>').appendTo(gridHeadWrap);
        //headerTable.css('width','auto');
        //var colgroup = $('<colgroup></colgroup>').appendTo(headerTable),
            //headerTHead = $('<thead></thead>').appendTo(headerTable),
            //headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead),
            //id = gridHeader.data('grid_header_id');

        /*if (gridConfig.groupedBy) {
            gridConfig.groupedBy.forEach(function _createGroupingCols() {
                colgroup.prepend('<col class="group_col"/>');
                headerRow.prepend('<th class="group_spacer">&nbsp</th>');
            });
        }

        if (gridConfig.drillDown) {
            colgroup.prepend('<col class="drill_down_col"/>');
            headerRow.prepend('<th class="drill_down_spacer">&nbsp</th>');
        }*/

        gridConfig.columns.forEach(function _createColumnHeaders(col, idx) {
            if (typeof col !== 'object') return;
            dominator({ type: 'col' }).appendTo(colgroup);
            //$('<col/>').appendTo(colgroup);
            var th = dominator({ type: 'th', id: col.field + '_grid_id_' + id, attributes: [{ name: 'field', value: col.field }, { name: 'index', value: idx }], classes: ['grid-header-cell'] })
                .appendTo(headerRow);
            //var th = $('<th id="' + col.field + '_grid_id_' + id + '" data-field="' + col.field + '" data-index="' + idx + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof col.attributes === 'object' && col.attributes.headerClasses && col.attributes.headerClasses.constructor ===  Array) {
                col.attributes.headerClasses.forEach(function _applyHeaderClasses(className) {
                    th.addClass(className);
                });
            }

            if (col.type !== 'custom') {
                //th.text(text);
                if (gridConfig.sortable === true && (typeof col.sortable === general_util.jsTypes.undefined || col.sortable === true)) {
                    header_util.setSortableClickListener(th);
                    gridConfig.sortable = true;
                }

                if (col.filterable === true) {
                    header_util.setFilterableClickListener(th, gridConfig, col.field);
                    gridConfig.filterable = true;
                    gridConfig.advancedFiltering = gridConfig.advancedFiltering != null ? gridConfig.advancedFiltering : false;
                }

                if ((col.editable || gridConfig.selectable || gridConfig.groupable || gridConfig.columnToggle || gridConfig.excelExport || gridConfig.advancedFiltering))
                    viewGenerator.createToolbar(gridConfig, gridElem, col.editable);

                dominator({ type: 'a', classes: ['header-anchor'], attributes: [{ name: 'href', value: '#' }], text: col.title || col.field }).appendTo(th);
                //$('<a class="header-anchor" href="#"></a>').appendTo(th).text(col.title || col.field);
            }
            else
                dominator({ type: 'span', classes: ['header-anchor'], text: col.title || col.field }).appendTo(th);
                //$('<span class="header-anchor"></span>').appendTo(th).text(col.title || col.field);

            if (gridConfig.resizable) {
                th.on('mouseleave', mouseLeaveHandlerCallback);
            }
            if (gridConfig.reorderable === true && (typeof col.reorderable === general_util.jsTypes.undefined || col.reorderable === true)) {
                th.prop('draggable', true);
                header_util.setDragAndDropListeners(th);
            }
        });
        headerTable.css('width','');
        header_util.setColWidth(gridConfig, gridElem);

        var gridContent = gridElem.find('.grid-content-div').css('height', gridConfig.height || 400),
            gcOffsets = gridContent.offset(),
            top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop(),
            left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
        $('<span id="loader-span_' + id + '" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
    },
    createContent: function _createContent(gridConfig) {
        var gridElem = dominator(gridConfig.grid),
            gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = dominator({ type: 'table', id: gridElem.attributes('id') + '_content', styles: [{ name: height, value: 'auto' }] }).appendTo(gridContent),
            colGroup = dominator({ type: 'colgroup' }).appendTo(contentTable),
            contentTBody = dominator({ type: 'tbody' }).appendTo(contentTable),
            text;

        contentTBody.css('width', 'auto');

        /*
        var gridElem = gridConfig.grid,
            gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
            colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
            contentTBody = $('<tbody></tbody>').appendTo(contentTable),
            text;
        */
        //contentTBody.css('width', 'auto');
        if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && gridConfig.selectable) content_util.attachTableSelectHandler(contentTBody);

        var rows = gridConfig.rows,
            currentGroupingValues = {};

        if (gridConfig.groupAggregates) gridConfig.groupAggregations = {};

        if (gridConfig.dataSource.data.length) {
            gridConfig.dataSource.data.forEach(function _createGridContentRows(item, idx) {
                if (gridConfig.groupedBy && gridConfig.groupedBy.length) content_util.createGroupedRows(id, idx, currentGroupingValues, contentTBody);

                var tr = dominator({ type: 'tr', classes: ['data-row'] }).appendTo(contentTBody);
                //var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
                if (typeof gridConfig.parentGridId === general_util.jsTypes.number) tr.addClass('drill-down-row');
                if (idx % 2) {
                    tr.addClass('alt-row');
                    if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
                        rows.alternateRows.forEach(function _addAlternateRowClasses(className) {
                            tr.addClass(className);
                        });
                }

                if (rows && rows.all && rows.all.constructor === Array) {
                    rows.all.forEach(function _addRowClasses(className) {
                        tr.addClass(className);
                    });
                }

                if (gridConfig.groupedBy.length) {
                    gridConfig.groupedBy.forEach(function _appendGroupingCells() {
                        tr.append({ type: 'td', classes: ['grouped_cell'], text: '&nbsp' });
                        //tr.append('<td class="grouped_cell">&nbsp</td>');
                    });
                }

                if (gridConfig.drillDown) {
                    tr.append(dominator({ type: 'td', classes: ['drillDown_cell'] }).append(dominator({ type: 'span', classes: ['drillDown_span'] })
                        .append({ type: 'a', classes: ['drillDown-asc', 'drillDown_acc'] })));
                    //tr.append('<td class="drillDown_cell"><span class="drillDown_span" data-state="closed"><a class="drillDown-asc drillDown_acc"></a></span></td>');
                }

                gridConfig.columns.forEach(function _createGridCells(col) {
                    var td = dominator({ type: 'td', classes: ['grid-content-cell'], data: [{ name: 'field', value: col.field }] }).appendTo(tr);
                    //var td = $('<td data-field="' + col.field + '" class="grid-content-cell"></td>').appendTo(tr);
                    if (col.attributes && col.attributes.cellClasses && col.attributes.cellClasses.constructor === Array) {
                        col.attributes.cellClasses.forEach(function _addColumnClasses(className) {
                            td.addClass(className);
                        });
                    }
                    if (col.type !== 'custom') {
                        text = getFormattedCellText(col, item[col.field]) || item[col.field];
                        text = text == null ? 'Null' : text;
                        //TODO: figure out how to make this work
                        td.text(text);
                    }
                    else {
                        td = col.html ? $(col.html).appendTo(td) : td;
                        if (col.class)
                            td.addClass(col.class);
                        if (col.text) {
                            var customText;
                            if (typeof col.text === general_util.jsTypes.function) {
                                col.text(gridConfig.originalData[gridConfig.dataMap[idx]]);
                            }
                            else customText = col.text;
                            td.text(customText);
                        }
                    }

                    if (typeof col.events === general_util.jsTypes.object) {
                        content_util.attachCustomCellHandler(col, td, id);
                    }
                    if (gridConfig.dataSource.aggregates && typeof gridConfig.dataSource.get !== general_util.jsTypes.function) {
                        if (gridConfig.pageRequest.eventType === 'filter' || gridConfig.pageRequest.eventType === undefined)
                            addValueToAggregations(id, col.field, item[col.field], gridConfig.gridAggregations);
                    }
                    //attach event handlers to save data
                    if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && (col.editable && col.editable !== 'drop-down')) {
                        content_util.makeCellEditable(id, td);
                        gridConfig.editable = true;
                    }
                    else if (typeof gridConfig.parentGridId !== general_util.jsTypes.number && (col.editable === 'drop-down')) {
                        content_util.makeCellSelectable(id, td);
                        gridConfig.editable = true;
                    }
                });
            });

            gridConfig.columns.forEach(col => colGroup.append({ type: 'col' }));
            gridConfig.groupedBy.forEach(group => colGroup.prepend({ type: 'col', classes: ['group_col'] }));
            ////gridConfig.columns.forEach(function appendCols() { colGroup.append('<col/>'); });
            //gridConfig.groupedBy.forEach(function _prependCols() { colGroup.prepend('<col class="group_col"/>'); });
            if (gridConfig.drillDown) colGroup.prepend({ type: 'col', classes: ['drill_down_col'] });
            //if (gridConfig.drillDown) colGroup.prepend('<col class="drill_down_col"/>');

            if (gridConfig.dataSource.aggregates && (gridConfig.pageRequest.eventType === 'filter' || gridConfig.pageRequest.eventType === undefined)) {
                dominator(gridConfig.grid).find('.grid-footer-div').remove();
                gridConfig.grid.find('.grid-footer-div').remove();
                viewGenerator.createAggregates(id);
            }

            content_util.createGroupTrEventHandlers(id);
            content_util.attachDrillDownAccordionHandler(id);
        }

        gridContent[0].addEventListener('scroll', function contentDivScrollHandler() {
            var headWrap = gridContent.parents('.grid-wrapper').first().find('.grid-header-wrapper'),
                footerWrap = gridContent.parents('.grid-wrapper').first().find('.grid-footer-wrapper');
            if (gridConfig.resizing) return;
            headWrap.scrollLeft(gridContent.scrollLeft());
            if (footerWrap.length)
                footerWrap.scrollLeft(gridContent.scrollLeft());
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var headDiv = $('#' + 'grid-header-' + gridContent.data('grid_content_id')),
            sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
        headDiv.css('paddingRight', sizeDiff);

        //Once the column widths have been set (i.e. the first time creating the grid), they shouldn't change size again....
        //any time the grid is paged, sorted, filtered, etc., the cell widths shouldn't change, the new data should just be dumped into
        //the grid.
        copyGridWidth(gridElem);

        gridState[id].dataSource.data = gridConfig.dataSource.data;
        gridContent.find('#loader-span_' + id).remove();
        gridConfig.updating = false;
    },
    createToolbar: function _createToolbar(gridData, gridElem, canEdit) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;   //if the toolbar has already been created, don't create it again.

        if (typeof gridData.parentGridId !== general_util.jsTypes.number && gridData.groupable) {
            var groupMenuBar = $('<div id="grid_' + id + '_group_div" class="group_div clearfix" data-grid_id="' + id + '">' + groupMenuText + '</div>').prependTo(gridElem);
            groupMenuBar.on('drop', function handleDropCallback(e) {
                //TODO: figure out why debugging this in the browser causes two server requests to be made;
                //TODO: 1 to get the grouped data that fails, and a second call when the page reloads for no apparent reason
                var droppedCol = $('#' + e.originalEvent.dataTransfer.getData('text'));
                droppedCol.data('dragging', false);
                var dropIndicator = $('#drop_indicator_id_' + id);
                dropIndicator.css('display', 'none');
                var groupId = $(e.currentTarget).data('grid_id'),
                    droppedId = droppedCol.parents('.grid-header-div').length ? droppedCol.parents('.grid-wrapper').data('grid_id') : null,
                    groupedItems = {};
                if (groupId == null || droppedId == null || groupId !== droppedId) return;
                if (gridState[id].updating) return;     //can't group columns if grid is updating
                if (!groupMenuBar.children().length) groupMenuBar.text('');
                var field = droppedCol.data('field'),
                    title = gridState[groupId].columns[gridState[groupId].columnIndices[field]].title || field,
                    foundDupe = false;

                groupMenuBar.find('.group_item').each(function iterateGroupItemsCallback(idx, val) {
                    var item = $(val);
                    groupedItems[item.data('field')] = item;
                    if (item.data('field') === field) {
                        foundDupe = true;
                        return false;
                    }
                });
                if (foundDupe) return;  //can't group on the same column twice

                droppedCol.data('grouped', true);
                var groupItem = $('<div class="group_item" data-grid_id="' + groupId + '" data-field="' + field + '"></div>'),//.appendTo(groupMenuBar),
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
                gridState[id].grid.find('.aggregate-row').prepend('<td class="group_spacer">&nbsp</td>');

                gridState[id].groupedBy = groupings;
                gridState[id].pageRequest.eventType = 'group';
                attachGroupItemEventHandlers(groupMenuBar, groupDirSpan, cancelButton);
                preparePageDataGetRequest(id, viewGenerator.createContent);
            });
            groupMenuBar.on('dragover', function handleHeaderDragOverCallback(e) {
                e.preventDefault();
                var gridId = groupMenuBar.data('grid_id');
                var dropIndicator = $('#drop_indicator_id_' + gridId);
                //TODO: I believe I can just reuse the existing group indicator, but I may need to change where it lives as a child of the grid
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
                        dropIndicator.data('field', '');
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

        var shouldBuildGridMenu = gridData.excelExport || gridData.columnToggle || gridData.advancedFiltering || gridData.selectable;

        if (canEdit || shouldBuildGridMenu) {
            var saveBar = $('<div id="grid_' + id + '_toolbar" class="toolbar clearfix" data-grid_id="' + id + '"></div>').prependTo(gridElem);
            if (shouldBuildGridMenu) {
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
    },
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
                if (isNumber(parseFloat(pageOptions[i]))) {
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
                gridState[id].pageRequest.pageSize = parseInt(pageSize);
                gridState[id].pageRequest.eventType = 'pageSize';
                gridState[id].pageRequest.pageNum = totalPages < gridState[id].pageNum ? totalPages : gridState[id].pageNum;
                preparePageDataGetRequest(id, viewGenerator.createContent);
                e.preventDefault();
            });
        }

        var rowStart = displayedRows ? (1 + (displayedRows * (pageNum - 1))) : 0;
        var rowEnd = gridData.dataSource.rowCount < gridData.pageSize * pageNum ? gridData.dataSource.rowCount : gridData.pageSize * pageNum;
        text = rowStart + ' - ' + rowEnd + ' of ' + count + ' rows';
        gridPager.append('<span class="pageinfo">' + text + '</span>');

        setPagerEventListeners(gridPager);
    },
    createAggregates: function _createAggregates(gridId) {
        var gridData = gridState[gridId];
        if (typeof gridState[gridId].dataSource.get !== general_util.jsTypes.function) {
            var dataToFilter = gridData.alteredData && gridData.alteredData.length ? gridData.alteredData : gridData.originalData;
            dataToFilter.filter(function getRemainingRows(val, idx) {
                return idx > gridData.pageNum * gridData.pageSize - 1 || idx < gridData.pageNum * gridData.pageSize - gridData.pageSize;
            }).forEach(function _iterateRemainingRows(row) {
                gridData.columns.forEach(function _addColumnValsToAggregates(col) {
                    addValueToAggregations(gridId, col.field, row[col.field], gridData.gridAggregations);
                });
            });
        }
        else constructAggregationsFromServer(gridId, gridData.gridAggregations);

        var gridPager = gridState[gridId].grid.find('.grid-pager-div'),
            gridFooterDiv = $('<div id="grid-footer-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-div"></div>').insertBefore(gridPager),
            gridFooterWrap = $('<div id="grid-footer-wrapper-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-wrapper"></div>').appendTo(gridFooterDiv),
            footer = $('<table class="grid-footer"></table>').appendTo(gridFooterWrap);

        var colgroup = $('<colgroup></colgroup>').appendTo(footer),
            footerTBody = $('<tbody></tbody>').appendTo(footer),
            footerRow = footerTBody.find('.aggregate-row');
        if (footerRow.length) footerRow.remove();
        footerRow = $('<tr class="aggregate-row"></tr>').appendTo(footerTBody);

        gridState[gridId].groupedBy.forEach(function _appendSpacerCells() {
            footerRow.append('<td class="group_spacer">&nbsp</td>');
        });
        if (gridState[gridId].drillDown) footerRow.append('<td class="group_spacer">&nbsp</td>');

        var aggregates = gridState[gridId].gridAggregations;
        gridState[gridId].columns.forEach(function _createAggregates(col) {
            var text = '';
            if (col.field in aggregates) {
                aggregates[col.field].forEach(function _createAggregateText(aggregate, idx) {
                    text += aggregate.text;
                    if (idx < aggregates[col.field].length - 1) text += ', ';
                });
            }
            footerRow.append('<td data-field="' + col.field + '" class=aggregate-cell">' + text + '</td>');
            colgroup.append('<col>');
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var gridContent = gridState[gridId].grid.find('.grid-content-div'),
            sizeDiff = gridFooterWrap[0].clientWidth - gridContent[0].clientWidth;
        gridFooterWrap.css('paddingRight', sizeDiff);
    }
};

export { viewGenerator };