/**
 * Attaches the click handlers for the save and delete buttons on the toolbar for saving/deleting changes made to the grid data
 * @param {number} id - the identifier of the grid instance
 * @param {object} gridElem - the grid DOM element
 * @param {object} saveAnchor - the save button DOM element
 * @param {object} deleteAnchor - the delete button DOM element
 */
function attachSaveAndDeleteHandlers(id, gridElem, saveAnchor, deleteAnchor) {
    saveAnchor.on('click', function saveChangesHandler(e) {
        e.preventDefault();
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
            if (typeof gridState[id].dataSource.put !== jsTypes.function) {
                for (i = 0; i < dirtyCells.length; i++) {
                    var index = dirtyCells[i].parents('tr').index();
                    var field = dirtyCells[i].data('field');
                    var idxOffset = 0;
                    if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
                        idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
                    var origIndex = gridState[id].dataMap[index + idxOffset];
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
                    var dataIndex = dirtyCells[i].parents('tr').index();
                    var exists = putRequestModels.some(function _upsertPutRequest(cur) {
                        if (cur.dataIdx = dataIndex) {
                            cur.dirtyFields.push(dirtyCells[i].data('field'));
                            return true;
                        }
                    });
                    if (!exists) {
                        putRequestModels.push({
                            cleanData: gridState[id].originalData[dirtyCells[i].parents('tr').index()],
                            dirtyData: cloneGridData(gridState[id].dataSource.data[dataIndex]),
                            dirtyFields: [dirtyCells[i].data('field')],
                            dataIdx: dataIndex
                        });
                    }
                }

                prepareGridDataUpdateRequest(id);
            }
        }
    });

    deleteAnchor.on('click', function deleteChangeHandler(e) {
        e.preventDefault();
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
                var field = dirtyCells[i].data('field'),
                    index = dirtyCells[i].parents('tr').index(),
                    pageNum = gridState[id].pageNum,
                    rowNum = gridState[id].pageSize,
                    addend = (pageNum-1)*rowNum,
                    column = gridState[id].columns[gridState[id].columnIndices[field]],
                    cellVal = gridState[id].originalData[index][field] !== undefined ? gridState[id].originalData[index][field] : '',
                    text = getFormattedCellText(column, cellVal) || cellVal;
                dirtyCells[i].text(text);
                dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                gridState[id].dataSource.data[index][field] = gridState[id].originalData[index + addend][field];
            }
        }
    });
}

/**
 * Creates the menu for the grid's toolbar
 * @param {object} menuAnchor - A DOM anchor element to attach the click handler to
 * @param {number} gridId - The id of the current grid widget instance
 */
function attachMenuClickHandler(menuAnchor, gridId) {
    menuAnchor.on('click', function menuAnchorClickHandler(e) {
        e.stopPropagation();    //stop event bubbling so that the click won't bubble to document click handler
        e.preventDefault();
        var menu = gridState[gridId].grid.find('#menu_model_grid_id_' + gridId),
            newMenu;

        if (!menu.length) {
            newMenu = $('<div id="menu_model_grid_id_' + gridId + '" class="grid_menu" data-grid_id="' + gridId + '"></div>');
            if (gridState[gridId].editable) {
                newMenu.append($('<ul class="menu-list"></ul>').append(createSaveDeleteMenuItems(gridId)));
            }
            if (gridState[gridId].columnToggle) {
                if (newMenu.children().length)
                    newMenu.append($('<hr/>'));
                newMenu.append(createColumnToggleMenuOptions(newMenu, gridId));
            }
            if (gridState[gridId].sortable || gridState[gridId].filterable || gridState[gridId].selectable || gridState[gridId].groupable) {
                if (newMenu.children().length)
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
                if (newMenu.children().length)
                    newMenu.append($('<hr/>'));
                newMenu.append(createExcelExportMenuItems(newMenu, gridId));
            }
            gridState[gridId].grid.append(newMenu);
            $(document).on('click', function hideMenuHandler(e) {
                var elem = $(e.target);
                if (!elem.hasClass('grid_menu') && !elem.hasClass('menu_item_options')) {
                    if (!elem.parents('.grid_menu').length && !elem.parents('.menu_item_options').length) {
                        gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
                        gridState[gridId].grid.find('.menu_item_options').css('display', 'none');
                    }
                }
            });

            $(document).on('scroll', function adjustMenuHandler() {
                var scrollMenuAnchorOffset = menuAnchor.offset();
                newMenu.css('top', (scrollMenuAnchorOffset.top - $(window).scrollTop()));
                newMenu.css('left', (scrollMenuAnchorOffset.left - $(window).scrollLeft()));
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
            if (gridState[gridId].dataSource.rowCount <= gridState[gridId].pageSize)
                exportList.append('<li data-value="page" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Current Page Data</span></a></li>');
            exportList.append('<li data-value="all" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">All Page Data</span></a></li>');
            if (gridState[gridId].selectable && gridState[gridId].grid.find('.selected').length) {
                exportList.append('<li data-value="select" class="menu_item"><a href="#" class="menu_option"><span class="excel_span">Selected Grid Data</span></a></li>');
            }
            var options = exportList.find('li');
            options.on('click', function excelExportItemClickHandler() {
                exportDataAsExcelFile(gridId, this.dataset.value);
                gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
                toggle(exportOptions, {duration: 20, callback: function checkForMouseOver() {

                    }});
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
 * Creates the menu option for de-selecting the grid; The .selectable property must be
 * active for this menu option.
 * @param {number} gridId - The id of the grid widget instance
 * @returns {Object} - Returns the DOM element for the menu item
 */
function createDeselectMenuOption(gridId) {
    var deSelectMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove Grid Selection</a>'));
    deSelectMenuItem.on('click', function deselectGridClickHandler(e) {
        gridState[gridId].grid.find('.selected').removeClass('selected');
        $(e.currentTarget).parents('.grid_menu').addClass('hiddenMenu');
    });
    return deSelectMenuItem;
}

/**
 * Creates the save/delete menu items. In-cell editing must be turned on
 * for at least one column for this menu option.
 * @param {number} gridId - The id of the grid widget instance
 * @returns {Array} - Returns an array of the two DOM menu items
 */
function createSaveDeleteMenuItems(gridId) {
    var saveMenuItem = $('<li class="menu_item"></li>'),
        saveMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Save Grid Changes</a>'),
        deleteMenuItem = $('<li class="menu_item"></li>'),
        deleteMenuAnchor = $('<a href="#" class="menu_option"><span class="excel_span">Delete Grid Changes</a>');

    attachSaveAndDeleteHandlers(gridId, gridState[gridId].grid, saveMenuItem, deleteMenuItem);

    saveMenuItem.append(saveMenuAnchor);
    deleteMenuItem.append(deleteMenuAnchor);
    return [saveMenuItem, deleteMenuItem];
}

function createSortMenuItem() {
    var sortMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Column Sorts</a>'));
    sortMenuItem.on('click', removeAllColumnSorts);
    return sortMenuItem;
}

function createFilterMenuItems() {
    var filterMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Remove All Grid Filters</a>'));
    filterMenuItem.on('click', resetAllFilters);
    return filterMenuItem;
}

//TODO: break this out into smaller, separate functions
function createFilterModalMenuItem(gridId) {
    var filterModalMenuItem = $('<li class="menu_item"></li>').append($('<a href="#" class="menu_option"><span class="excel_span">Advanced Filters</a>'));
    filterModalMenuItem.on('click', function openAdvancedFilterModal(e) {
        e.stopPropagation();
        var advancedFiltersModal = gridState[gridId].grid.find('.filter_modal');
        if (!advancedFiltersModal.length) {
            var toolbarHeight = gridState[gridId].grid.find('.toolbar').height(),
                groupHeight = gridState[gridId].grid.find('.group_div').height(),
                wrapperHeight = gridState[gridId].grid.find('.grid-wrapper').length ? gridState[gridId].grid.find('.grid-wrapper').height() : 0;

            advancedFiltersModal = $('<div class="filter_modal" data-grid_id="' + gridId + '">').css('max-height', wrapperHeight + toolbarHeight + groupHeight - 3);
            var groupSelector = '<select class="input group_conjunction"><option value="and">All</option><option value="or">Any</option></select> of the following:</span>';
            advancedFiltersModal.append('<span class="group-select" data-filter_group_num="1">Match' + groupSelector);
            var advancedFiltersContainer = $('<div class="filter_group_container" data-filter_group_num="1"></div>').appendTo(advancedFiltersModal);
            addNewAdvancedFilter(advancedFiltersContainer, true /* isFirstFilter */);

            $(document).on('click', function hideFilterModalHandler(e) {
                var ct = $(e.target);
                if (!ct.hasClass('filter_modal') && !ct.parents('.filter_modal').length) {
                    var filterModal = gridState[gridId].grid.find('.filter_modal');
                    filterModal.find('.advanced_filter_value')
                        .filter(':disabled').add('.invalid-grid-input').each(function removeEmptyFilters(idx, val) {
                        var filterVal = $(val);
                        var filterRow = filterVal.parent('.filter_row_div');
                        if (filterVal.data('type') === 'boolean' && filterRow.children('.filterType').val() !== null)
                            return true;
                        else if (filterRow.data('filter_idx') === 1) {
                            if (filterVal.hasClass('invalid-grid-input')) {
                                filterVal.removeClass('invalid-grid-input');
                                filterModal.find('span[data-filter_idx="' + filterModal.data('filter_idx') + '"]').remove();
                                filterVal.val('');
                                var columnSelector = filterRow.children('.filter_column_selector');
                                columnSelector.find('option').remove();
                                columnSelector.append('<option value="">Select a column</option>');
                                gridState[gridId].columns.forEach(function _addFilterableOptions(col) {
                                    if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
                                });
                                filterVal.prop('disabled', true);
                                filterRow.children('.filterType').prop('disabled', true).find('option').remove();
                            }
                            return true;
                        }
                        else
                            filterRow.remove();
                    });

                    filterModal.find('.filter_group_container').each(function removeEmptyFilterGroups(idx, val) {
                        var filterGrp = $(val);
                        if (!filterGrp.children('.filter_row_div').length) {
                            var filterGrpNum = filterGrp.data('filter_group_num');
                            filterModal.find('span[data-filter_group_num="' + filterGrpNum + '"]').remove();
                            filterGrp.remove();
                        }
                    });

                    filterModal.css('display', 'none');
                }
                else e.stopPropagation();
            });

            var applyFiltersButton = $('<input type="button" value="Apply Filter(s)" class="advanced_filters_button"/>').appendTo(advancedFiltersModal);
            applyFiltersButton.on('click', function applyAdvancedFiltersHandler() {
                if (gridState[gridId].updating) return;     //can't filter if grid is updating
                gridState[gridId].grid.find('filterInput').val('');

                advancedFiltersModal.find('.advanced_filter_value').each(function checkFilterValuesForValidContent(idx, val) {
                    var currValue = $(val),
                        dataType = currValue.data('type');
                    if (dataType) {
                        var parentDiv = currValue.parent('.filter_row_div'),
                            parentIdx = parentDiv.data('filter_idx');
                        if (dataTypes[dataType]) {
                            var re = new RegExp(dataTypes[dataType]);
                            if (!re.test(currValue.val()) && !parentDiv.find('.filter_error_span').length) {
                                currValue.addClass('invalid-grid-input');
                                if (!parentDiv.find('span[data-filter_idx="' + parentIdx + '"]').length) {
                                    var errorSpan = $('<span class="filter_error_span hidden_error" data-filter_idx="' + parentIdx + '">Invalid ' + dataType + '</span>');
                                    parentDiv.append(errorSpan);
                                    errorSpan.css('top', parentDiv.offset().top / 2);
                                    errorSpan.css('left', parentDiv.width() - errorSpan.width());
                                }
                            }
                            else {
                                parentDiv.find('.filter_error_span').remove();
                                currValue.removeClass('invalid-grid-input');
                            }
                        }
                        if (currValue.val() === '' && currValue.data('type') !== 'boolean') {
                            parentDiv.remove();
                            var filterGrp = currValue.parents('.filter_group_container');
                            //If no child filters (regardless of how nested they may be) are found inside the group, remove the entire group
                            if (!filterGrp.find('.filter_row_div').length) {
                                advancedFiltersModal.find('span[data-filter_group_num="' + filterGrp.data('filter_group_num') + '"]').remove();
                                filterGrp.remove();
                            }
                        }
                    }
                });

                if (advancedFiltersModal.find('.filter_error_span').length) return;

                var advancedFilters = {};
                createFilterGroups(advancedFiltersContainer, advancedFilters);
                if (advancedFilters.filterGroup.length) {
                    gridState[gridId].filters = advancedFilters;
                    gridState[gridId].advancedFilters = advancedFilters;
                    gridState[gridId].basicFilters.filterGroup = [];

                    advancedFiltersModal.css('display', 'none');
                    gridState[gridId].pageRequest.eventType = 'filter';
                    preparePageDataGetRequest(gridId);
                }
            });
            gridState[gridId].grid.append(advancedFiltersModal);
        }
        else advancedFiltersModal.css('display', 'block');

        var gridOffset = gridState[gridId].grid.offset(),
            gridWidth = gridState[gridId].grid.width(),
            toolbarOffset = gridState[gridId].grid.find('.toolbar').offset();

        var leftLoc = gridOffset.left - (advancedFiltersModal.outerWidth() / 2) + (gridWidth / 2);
        advancedFiltersModal.css('top', toolbarOffset.top).css('left', leftLoc);
        gridState[gridId].grid.find('.grid_menu').addClass('hiddenMenu');
    });
    return filterModalMenuItem;
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
            gridState[gridId].columns.forEach(function _createToggableColumns(col) {
                var columnOption = $('<li data-value="' + col.field + '" class="menu_item">');
                var columnToggle = $('<span class="excel_span"><input type="checkbox" data-field="' + col.field + '"> ' + (col.title || col.field) + '</span>');
                columnToggle.appendTo(columnOption);
                columnList.append(columnOption);
            });
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