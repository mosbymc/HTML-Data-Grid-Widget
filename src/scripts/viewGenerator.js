import { addValueToAggregations, constructAggregationsFromServer } from './aggregates_util';
import { setPagerEventListeners } from './pager_util';
import { attachGroupItemEventHandlers } from './toolbar_util';
import { content_util } from './content_util';
import { header_util } from './header_util';

var viewGenerator = {
    createHeaders: function _createHeaders(gridData, gridElem) {
        var gridHeader = gridElem.find('.grid-header-div'),
            gridHeadWrap = gridHeader.find('.grid-header-wrapper'),
            headerTable = $('<table></table>').appendTo(gridHeadWrap);
        headerTable.css('width','auto');
        var colgroup = $('<colgroup></colgroup>').appendTo(headerTable),
            headerTHead = $('<thead></thead>').appendTo(headerTable),
            headerRow = $('<tr class=grid-headerRow></tr>').appendTo(headerTHead),
            id = gridHeader.data('grid_header_id');

        if (gridData.groupedBy) {
            gridData.groupedBy.forEach(function _createGroupingCols() {
                colgroup.prepend('<col class="group_col"/>');
                headerRow.prepend('<th class="group_spacer">&nbsp</th>');
            });
        }

        if (gridData.drillDown) {
            colgroup.prepend('<col class="drill_down_col"/>');
            headerRow.prepend('<th class="drill_down_spacer">&nbsp</th>');
        }

        gridData.columns.forEach(function _createColumnHeaders(col, idx) {
            if (typeof col !== 'object') return;
            $('<col/>').appendTo(colgroup);
            var th = $('<th id="' + col.field + '_grid_id_' + id + '" data-field="' + col.field + '" data-index="' + idx + '" class=grid-header-cell></th>').appendTo(headerRow);

            if (typeof col.attributes === 'object' && col.attributes.headerClasses && col.attributes.headerClasses.constructor ===  Array) {
                col.attributes.headerClasses.forEach(function _applyHeaderClasses(className) {
                    th.addClass(className);
                });
            }

            if (col.type !== 'custom') {
                //th.text(text);
                if (gridData.sortable === true && (typeof col.sortable === jsTypes.undefined || col.sortable === true)) {
                    header_util.setSortableClickListener(th);
                    gridData.sortable = true;
                }

                if (col.filterable === true) {
                    header_util.setFilterableClickListener(th, gridData, col.field);
                    gridData.filterable = true;
                    gridData.advancedFiltering = gridData.advancedFiltering != null ? gridData.advancedFiltering : false;
                }

                if ((col.editable || gridData.selectable || gridData.groupable || gridData.columnToggle || gridData.excelExport || gridData.advancedFiltering))
                    viewGenerator.createToolbar(gridData, gridElem, col.editable);

                $('<a class="header-anchor" href="#"></a>').appendTo(th).text(col.title || col.field);
            }
            else
                $('<span class="header-anchor"></span>').appendTo(th).text(col.title || col.field);

            if (gridData.resizable) {
                th.on('mouseleave', mouseLeaveHandlerCallback);
            }
            if (gridData.reorderable === true && (typeof col.reorderable === jsTypes.undefined || col.reorderable === true)) {
                th.prop('draggable', true);
                header_util.setDragAndDropListeners(th);
            }
        });
        headerTable.css('width','');
        header_util.setColWidth(gridData, gridElem);

        var gridContent = gridElem.find('.grid-content-div').css('height', gridData.height || 400),
            gcOffsets = gridContent.offset(),
            top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop(),
            left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
        $('<span id="loader-span_' + id + '" class="spinner"></span>').appendTo(gridContent).css('top', top).css('left', left);
    },
    createContent: function _createContent(gridData) {
        var gridElem = gridData.grid,
            gridContent = gridElem.find('.grid-content-div'),
            id = gridContent.data('grid_content_id'),
            contentTable = $('<table id="' + gridElem[0].id + '_content" style="height:auto;"></table>').appendTo(gridContent),
            colGroup = $('<colgroup></colgroup>').appendTo(contentTable),
            contentTBody = $('<tbody></tbody>').appendTo(contentTable),
            text;
        contentTBody.css('width', 'auto');
        if (typeof gridData.parentGridId !== jsTypes.number && gridData.selectable) content_util.attachTableSelectHandler(contentTBody);

        var rows = gridData.rows,
            currentGroupingValues = {};

        if (gridData.groupAggregates) gridData.groupAggregations = {};

        if (gridData.dataSource.data.length) {
            gridData.dataSource.data.forEach(function _createGridContentRows(item, idx) {
                if (gridData.groupedBy && gridData.groupedBy.length) content_util.createGroupedRows(id, idx, currentGroupingValues, contentTBody);

                var tr = $('<tr class="data-row"></tr>').appendTo(contentTBody);
                if (typeof gridData.parentGridId === jsTypes.number) tr.addClass('drill-down-row');
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

                if (gridData.groupedBy.length) {
                    gridData.groupedBy.forEach(function _appendGroupingCells() {
                        tr.append('<td class="grouped_cell">&nbsp</td>');
                    });
                }

                if (gridData.drillDown)
                    tr.append('<td class="drillDown_cell"><span class="drillDown_span" data-state="closed"><a class="drillDown-asc drillDown_acc"></a></span></td>');

                gridData.columns.forEach(function _createGridCells(col) {
                    var td = $('<td data-field="' + col.field + '" class="grid-content-cell"></td>').appendTo(tr);
                    if (col.attributes && col.attributes.cellClasses && col.attributes.cellClasses.constructor === Array) {
                        col.attributes.cellClasses.forEach(function _addColumnClasses(className) {
                            td.addClass(className);
                        });
                    }
                    if (col.type !== 'custom') {
                        text = getFormattedCellText(col, item[col.field]) || item[col.field];
                        text = text == null ? 'Null' : text;
                        td.text(text);
                    }
                    else {
                        td = col.html ? $(col.html).appendTo(td) : td;
                        if (col.class)
                            td.addClass(col.class);
                        if (col.text) {
                            var customText;
                            if (typeof col.text === jsTypes.function) {
                                col.text(gridData.originalData[gridData.dataMap[idx]]);
                            }
                            else customText = col.text;
                            td.text(customText);
                        }
                    }

                    if (typeof col.events === jsTypes.object) {
                        content_util.attachCustomCellHandler(col, td, id);
                    }
                    if (gridData.dataSource.aggregates && typeof gridData.dataSource.get !== jsTypes.function) {
                        if (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === undefined)
                            addValueToAggregations(id, col.field, item[col.field], gridData.gridAggregations);
                    }
                    //attach event handlers to save data
                    if (typeof gridData.parentGridId !== jsTypes.number && (col.editable && col.editable !== 'drop-down')) {
                        content_util.makeCellEditable(id, td);
                        gridState[id].editable = true;
                    }
                    else if (typeof gridData.parentGridId !== jsTypes.number && (col.editable === 'drop-down')) {
                        content_util.makeCellSelectable(id, td);
                        gridState[id].editable = true;
                    }
                });
            });

            gridData.columns.forEach(function appendCols() { colGroup.append('<col/>'); });
            gridData.groupedBy.forEach(function _prependCols() { colGroup.prepend('<col class="group_col"/>'); });
            if (gridData.drillDown) colGroup.prepend('<col class="drill_down_col"/>');

            if (gridData.dataSource.aggregates && (gridData.pageRequest.eventType === 'filter' || gridData.pageRequest.eventType === undefined)) {
                gridData.grid.find('.grid-footer-div').remove();
                viewGenerator.createAggregates(id);
            }

            content_util.createGroupTrEventHandlers(id);
            content_util.attachDrillDownAccordionHandler(id);
        }

        gridContent[0].addEventListener('scroll', function contentDivScrollHandler() {
            var headWrap = gridContent.parents('.grid-wrapper').first().find('.grid-header-wrapper'),
                footerWrap = gridContent.parents('.grid-wrapper').first().find('.grid-footer-wrapper');
            if (gridState[id].resizing) return;
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

        gridState[id].dataSource.data = gridData.dataSource.data;
        gridContent.find('#loader-span_' + id).remove();
        gridState[id].updating = false;
    },
    createToolbar: function _createToolbar(gridData, gridElem, canEdit) {
        var id = gridElem.find('.grid-wrapper').data('grid_id');
        if ($('#grid_' + id + '_toolbar').length) return;   //if the toolbar has already been created, don't create it again.

        if (typeof gridData.parentGridId !== jsTypes.number && gridData.groupable) {
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
        if (typeof gridState[gridId].dataSource.get !== jsTypes.function) {
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