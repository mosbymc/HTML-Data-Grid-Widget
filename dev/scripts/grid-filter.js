import { validateCharacter } from './gridFormattersAndValidators';

/**
 * Add the filter icon to a filterable grid header and attaches an event listener when the icon is clicked
 * @param {object} elem - The grid header element whose column values are filterable
 * @param {object} gridData - The metadata describing the grid's behavior and attributes
 * @param {string} col - The name of the field associated with the filterable grid column
 */
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

/**
 * Creates the modal filter div and populates the filter types in the selector
 * @param {string} type - The type of data to be filtered (string, number, boolean, date, time)
 * @param {string} field - The column of data being filtered
 * @param {object} grid - The DOM element for the grid widget
 * @param {string} title - The title supplied in the metadata for the grid's column
 */
function createFilterDiv(type, field, grid, title) {
    var filterDiv = $('<div class="filter-div" data-parentfield="' + field + '" data-type="' + type + '"></div>').appendTo(grid);
    var domName = title ? title : type,
        filterInput, resetButton, button,
        modalText = 'Filter rows where ' + domName;
    modalText = type !== 'string' ? modalText + ' is:' : modalText + ':';
    $('<span class="filterTextSpan">' + modalText + '</span>').appendTo(filterDiv);
    var select = $('<select class="filterSelect select input"></select>').appendTo(filterDiv);

    createFilterOptionsByDataType(select, type);
    if (type !== 'boolean') {
        filterInput = $('<input type="text" class="filterInput input" id="filterInput' + type + field + '"/>').appendTo(filterDiv);
    }
    resetButton = $('<input type="button" value="Reset" class="button resetButton" data-field="' + field + '"/>').appendTo(filterDiv);
    button = $('<input type="button" value="Filter" class="filterButton button" data-field="' + field + '"/>').appendTo(filterDiv);
    resetButton.on('click', resetButtonClickHandler);
    button.on('click', filterButtonClickHandler);
    //TODO: why I am not validating date and time types here? Is it because the regular expressions were ready at the time?
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

/**
 * Attaches a keypress handler on the inputs in a filter modal
 * @param {object} input - The DOM input element
 */
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

//TODO: make sure this removes advanced filters as well
function resetAllFilters(e) {
    var gridMenu = $(e.currentTarget).parents('.grid_menu'),
        gridId = gridMenu.data('grid_id');
    $('.grid_menu').addClass('hiddenMenu');
    gridState[gridId].grid.find('filterInput').val('');

    var filterModal = gridState[gridId].grid.find('.filter_modal');
    filterModal.find('.filter_group_container').each(function removeFilterGroups() {
        var grpContainer = $(this);
        if (grpContainer.data('filter_group_num') !== 1) grpContainer.remove();
        else {
            grpContainer.find('.filter_row_div').each(function removeFilterRows() {
                var filterRow = $(this);
                if (filterRow.data('filter_idx') !== 1) filterRow.remove();
                else {
                    var columnSelector = filterRow.find('.filter_column_selector');
                    columnSelector.find('option').remove();
                    columnSelector.append('<option value="">Select a column</option>');
                    for (var column in gridState[gridId].columns) {
                        var curCol = gridState[gridId].columns[column];
                        if (curCol.filterable) {
                            columnSelector.append('<option value="' + column + '">' + (curCol.title || column) + '</option>');
                        }
                    }

                    filterRow.find('.filterType').prop('disabled', true).find('option').remove();
                    filterRow.find('.advanced_filter_value').prop('disabled', true).removeClass('invalid-grid-input').val('');
                }
            });
        }
    });

    filterModal.find('filter_error').remove();

    if (gridState[gridId].updating) return;		//can't filter if grid is updating
    gridState[gridId].filters = {};
    gridState[gridId].pageRequest.eventType = 'filter-rem';
    preparePageDataGetRequest(gridId);
}

function resetButtonClickHandler(e) {
    var filterDiv = $(e.currentTarget).parents('.filter-div'),
        value = filterDiv.find('.filterInput').val(),
        field = $(this).data('field'),
        remainingFilters = [],
        gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
    if (gridState[gridId].updating) return;		//can't filter if grid is updating
    var gridData = gridState[gridId];

    if (value === '' && !gridData.filters.filterGroup.length) return;
    filterDiv.find('.filterInput').val('');
    filterDiv.addClass('hiddenFilter');

    for (var i = 0; i < gridState[gridId].filters.groupFilters; i++) {
        if (gridState[gridId].filters.groupFilters[i].field !== field) {
            remainingFilters.push(gridState[gridId].filters.groupFilters[i]);
        }
    }

    gridData.filters.groupFilters = remainingFilters;
    gridData.pageRequest.eventType = 'filter-rem';
    preparePageDataGetRequest(gridId);
}

function filterButtonClickHandler(e) {
    var filterDiv = $(e.currentTarget).parents('.filter-div'),
        selected = filterDiv.find('.filterSelect').val(),
        value = filterDiv.find('.filterInput').val(),
        gridId = filterDiv.parents('.grid-wrapper').data('grid_id');
    if (gridState[gridId].updating) return;		//can't filter if grid is updating
    var gridData = gridState[gridId],
        type = filterDiv.data('type'),
        errors = filterDiv.find('.filter-div-error'),
        field = $(this).data('field'),
        tmpFilters = [],
        foundColumn = false,
        re, updatedFilter;

    if (dataTypes[type]) {
        re = new RegExp(dataTypes[type]);
        if (!re.test(value) && !errors.length) {
            $('<span class="filter-div-error">Invalid ' + type + '</span>').appendTo(filterDiv);
            return;
        }
    }

    var dataType = gridState[gridId].columns[field].type || 'string',
        extantFilters = gridState[gridId].basicFilters.filterGroup || [];

    if (errors.length) errors.remove();
    if (value === '' && !gridData.basicFilters.length) return;
    if (dataType === 'boolean') {
        value = selected;
        selected = 'eq';
    }

    for (var i = 0; i < extantFilters.length; i++) {
        if (extantFilters[i].field !== field) tmpFilters.push(extantFilters[i]);
        else {
            updatedFilter = extantFilters[i];
            updatedFilter.operation = selected;
            updatedFilter.value = value;
            foundColumn = true;
        }
    }

    tmpFilters.push(foundColumn ? updatedFilter : { field: field, value: value, operation: selected, dataType: dataType });
    gridState[gridId].filters = { conjunct: 'and', filterGroup: tmpFilters };
    gridState[gridId].basicFilters.filterGroup = tmpFilters;
    gridState[gridId].advancedFilters = {};

    filterDiv.addClass('hiddenFilter');
    gridData.pageRequest.eventType = 'filter-add';
    preparePageDataGetRequest(gridId);
}

/**
 * Attaches a click handler to each filter element in the grid's header
 * @param {object} filterElem - The DOM element that has the click handler attached to it
 */
function attachFilterListener(filterElem) {
    filterElem.on('click', function filterClickCallback(e) {
        e.stopPropagation();	//stop event bubbling so that the column won't also get sorted when the filter icon is clicked.
        e.preventDefault();
        var filterAnchor = $(e.target);
        var filterCell = filterAnchor.parents('th');
        var type = filterAnchor.data('type');
        var grid = filterElem.parents('.grid-wrapper');
        var id = grid.data('grid_id');
        if (gridState[id].updating) return;		//can't filter when the grid is updating
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
                                for (var column in gridState[gridId].columns) {
                                    var curCol = gridState[gridId].columns[column];
                                    if (curCol.filterable) {
                                        columnSelector.append('<option value="' + column + '">' + (curCol.title || column) + '</option>');
                                    }
                                }
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
                if (gridState[gridId].updating) return;		//can't filter if grid is updating
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
                    gridState[gridId].pageRequest.eventType = 'filter-add';
                    preparePageDataGetRequest(gridId);
                }

                function createFilterGroups(groupContainer, filterObject) {
                    var groupConjunct = groupContainer.parents('.filter_modal').find('span[data-filter_group_num="' + groupContainer.data('filter_group_num') + '"]').children('select');
                    filterObject.filterGroup = [];
                    filterObject.conjunct = groupConjunct.val();
                    findFilters(groupContainer, filterObject);
                }

                function findFilters(groupContainer, filterObject) {
                    var gridId = groupContainer.parents('.filter_modal').data('grid_id');
                    groupContainer.children('.filter_row_div').each(function iterateFilterDivsCallback() {
                        createFilterObjects($(this), filterObject.filterGroup, gridId);
                    });

                    groupContainer.children('.filter_group_container').each(function createNestedFilterGroupsCallback(idx, val) {
                        var nestedGroup = {};
                        filterObject.filterGroup.push(nestedGroup);
                        createFilterGroups($(val), nestedGroup);
                    });
                }

                function createFilterObjects(filterDiv, filterGroupArr, gridId) {
                    var field = filterDiv.find('.filter_column_selector').val(),
                        operation, value,
                        filterType = filterDiv.find('.filterType').val();
                    if (filterType !== 'false' && filterType !== 'true') {
                        operation = filterType;
                        value = filterDiv.find('.advanced_filter_value').val();
                    }
                    else {
                        operation = 'eq';
                        value = filterType;
                    }

                    if (value) {
                        filterGroupArr.push({ field: field, value: value, operation: operation, dataType: (gridState[gridId].columns[field].type || 'string') });
                    }
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

function addFilterButtonHandler(e) {
    var filterModal = $(e.currentTarget).parents('.filter_modal'),
        gridId = filterModal.data('grid_id'),
        numFiltersAllowed = gridState[gridId].numColumns;
    if (typeof gridState[gridId].advancedFiltering === 'object' && typeof gridState[gridId].advancedFiltering.filtersCount === 'number')
        numFiltersAllowed = gridState[gridId].advancedFiltering.filtersCount;

    if (filterModal.find('.filter_row_div').length >= numFiltersAllowed) return;
    else if (filterModal.find('.filter_row_div').length === numFiltersAllowed - 1) filterModal.find('.add_filter_group').prop('disabled', true);

    addNewAdvancedFilter($(e.currentTarget).closest('.filter_group_container'), false /* isFirstFilter */);
}

function addNewAdvancedFilter(advancedFiltersContainer, isFirstFilter) {
    var gridId = advancedFiltersContainer.parents('.filter_modal').data('grid_id'),
        filterRowIdx = getFilterRowIdx(advancedFiltersContainer.parents('.filter_modal')),
        filterRowDiv = $('<div class="filter_row_div" data-filter_idx="' + filterRowIdx + '"></div>');
    isFirstFilter ? advancedFiltersContainer.append(filterRowDiv) : advancedFiltersContainer.children('.filter_row_div').last().after(filterRowDiv);

    var columnSelector = $('<select class="input filter_column_selector"></select>').appendTo(filterRowDiv);
    columnSelector.addClass('select');
    columnSelector.append('<option value="">Select a column</option>');
    for (var column in gridState[gridId].columns) {
        var curCol = gridState[gridId].columns[column];
        if (curCol.filterable) {
            columnSelector.append('<option value="' + column + '">' + (curCol.title || column) + '</option>');
        }
    }

    var filterTypeSelector = $('<select class="input select filterType" disabled></select>').appendTo(filterRowDiv);
    var filterValue = $('<input type="text" class="advanced_filter_value" disabled />');
    filterValue.appendTo(filterRowDiv);
    filterValue.on('keypress', function validateFilterValueHandler(e) {
        var code = e.charCode? e.charCode : e.keyCode,
            type = $(this).data('type');
        if (!gridFormatters.validateCharacter.call(this, code, type)) {
            e.preventDefault();
            return false;
        }
    })
        .on('mouseover', function displayErrorMessageHandler() {
            filterRowDiv.find('span[data-filter_idx="' + filterRowDiv.data('filter_idx') + '"]').removeClass('hidden_error');
        })
        .on('mouseout', function hideErrorMessageHandler() {
            filterRowDiv.find('span[data-filter_idx="' + filterRowDiv.data('filter_idx') + '"]').addClass('hidden_error');
        });

    var deleteHandler = isFirstFilter ? clearFirstFilterButtonHandler : deleteFilterButtonHandler;

    $('<input type="button" value="X" class="filter_row_button"/>').appendTo(filterRowDiv).on('click', deleteHandler);

    if (!isFirstFilter) {
        var addNewFilterButton = filterRowDiv.prev().find('.new_filter'),
            addFilterGroup = filterRowDiv.prev().find('.add_filter_group');
        addNewFilterButton.detach();
        addFilterGroup.detach();
        filterRowDiv.append(addNewFilterButton).append(addFilterGroup);
    }
    else {
        $('<input type="button" value="+" class="filter_row_button new_filter"/>')
            .appendTo(filterRowDiv)
            .on('click', addFilterButtonHandler);

        $('<input type="button" value="+ Group" class="advanced_filters_button add_filter_group"/>')
            .appendTo(filterRowDiv)
            .on('click', addFilterGroupHandler);
    }

    columnSelector.on('change', function columnSelectorCallback() {
        filterTypeSelector.find('option').remove();
        filterTypeSelector.prop('disabled', false);
        filterRowDiv.find('.advanced_filter_value').val('');
        createFilterOptionsByDataType(filterTypeSelector, gridState[gridId].columns[columnSelector.val()].type || 'string');

        if (gridState[gridId].columns[columnSelector.val()].type !== 'boolean')
            filterValue.prop('disabled', false);
        else
            filterValue.prop('disabled', true);
        filterValue.data('type', (gridState[gridId].columns[columnSelector.val()].type || 'string'));
    });
}

function addFilterGroupHandler() {
    var numGroupsAllowed = 0,
        filterModal = $(this).parents('.filter_modal'),
        gridId = filterModal.data('grid_id'),
        filterGroups = filterModal.find('.filter_group_container'),
        parentGroup = $(this).parents('.filter_group_container').first(),
        filterGroupCount = filterGroups.length,
        numFiltersAllowed = gridState[gridId].numColumns;
    if (typeof gridState[gridId].advancedFiltering === 'object' && typeof gridState[gridId].advancedFiltering.groupsCount === 'number')
        numGroupsAllowed = gridState[gridId].advancedFiltering.groupsCount;
    else numGroupsAllowed = 3;

    if (filterGroupCount >= numGroupsAllowed) return;
    else if (filterGroupCount === numGroupsAllowed - 1)
        filterModal.find('.add_filter_group').prop('disabled', true);

    if (typeof gridState[gridId].advancedFiltering === 'object' && typeof gridState[gridId].advancedFiltering.filtersCount === 'number')
        numFiltersAllowed = gridState[gridId].advancedFiltering.filtersCount;

    if (filterModal.find('.filter_row_div').length >= numFiltersAllowed) return;
    else if (filterModal.find('.filter_row_div').length === numFiltersAllowed - 1) filterModal.find('.add_filter_group').prop('disabled', true);

    var previousGroupNum = parseInt(filterGroups.last().data('filter_group_num'));

    var groupSelector = '<select class="input group_conjunction"><option value="and">All</option><option value="or">Any</option></select> of the following:</span>';
    parentGroup.append('<span class="group-select" data-filter_group_num="' + (previousGroupNum + 1) + '">Match' + groupSelector);

    var filterGroupContainer = $('<div class="filter_group_container" data-filter_group_num="' + (previousGroupNum + 1) + '"></div>');
    parentGroup.append(filterGroupContainer);
    var removeGroup = $('<span class="remove_filter_group"></span>')
        .on('click', function closeFilterGroupHandler(e) {
            var filterContainerGroup = $(e.currentTarget).closest('.filter_group_container');
            filterContainerGroup.prev('.group-select').remove();
            filterContainerGroup.remove();

            if (filterModal.find('.group_conjunction').length < numGroupsAllowed)
                filterModal.find('.add_filter_group').prop('disabled', false);
            e.stopPropagation();
        })
        .data('filter_group_num', filterGroupCount + 1)
        .css('left', (filterGroupContainer.outerWidth()));
    filterGroupContainer.append(removeGroup).append('</br>');
    addNewAdvancedFilter(filterGroupContainer, true /* isFirstFilter */);
}

function deleteFilterButtonHandler(e) {
    var filterRowDiv = $(e.currentTarget).parents('.filter_row_div'),
        addNewFilterButton = filterRowDiv.find('.new_filter'),
        filterModal = $(e.currentTarget).parents('.filter_modal');
    if (addNewFilterButton.length) {
        filterRowDiv.prev().append(addNewFilterButton.detach());
    }
    filterRowDiv.remove();

    var gridId = filterModal.data('grid_id'),
        numFilters = filterModal.find('.filter_row_div').length,
        allowedFilters = gridState[gridId].numColumns;
    if (typeof gridState[gridId].advancedFiltering === 'object'&& typeof gridState[gridId].advancedFiltering.filtersCount === 'number')
        allowedFilters = gridState[gridId].advancedFiltering.filtersCount;
    if (allowedFilters > numFilters)
        filterModal.find('.add_filter_group').prop('disabled', false);
}

function clearFirstFilterButtonHandler(e) {
    var filterRowDiv = $(e.currentTarget).parents('.filter_row_div'),
        columnSelector = filterRowDiv.find('.filter_column_selector'),
        gridId = filterRowDiv.parents('.filter_modal').data('grid_id');
    columnSelector.find('option').remove();
    columnSelector.append('<option value="">Select a column</option>');
    for (var column in gridState[gridId].columns) {
        var curCol = gridState[gridId].columns[column];
        if (curCol.filterable) {
            columnSelector.append('<option value="' + column + '">' + (curCol.title || column) + '</option>');
        }
    }
    filterRowDiv.find('.filterType').prop('disabled', true).find('option').remove();
    filterRowDiv.find('.advanced_filter_value').val('').prop('disabled', true);
}

function getFilterRowIdx(filterModal) {
    return filterModal.find('.filter_row_div').length ? filterModal.find('.filter_row_div').last().data('filter_idx') + 1 : 1;
}

var gridState = {},
    isFilterInitialized = false;

function filter_init(gridIObj) {
    gridState = gridIObj;
    isFilterInitialized = true;
}

export { setFilterableClickListener, createFilterDiv, createFilterOptionsByDataType, filterInputValidation, resetAllFilters, resetButtonClickHandler, filterButtonClickHandler,
        attachFilterListener, createFilterMenuItems, createFilterModalMenuItem, addFilterButtonHandler, addNewAdvancedFilter, addFilterGroupHandler, deleteFilterButtonHandler,
        clearFirstFilterButtonHandler, getFilterRowIdx, filter_init, isFilterInitialized };