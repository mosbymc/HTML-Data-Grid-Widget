import { gridState } from './gridState';
import { general_util } from './general_util';
import { preparePageDataGetRequest } from './pageRequests';
import { dominator } from './dominator';

function createFilterGroups(groupContainer, filterObject) {
    var groupConjunct = groupContainer.parents('.filter_modal').find('span[data-filter_group_num="' + groupContainer.data('filter_group_num') + '"]').children('select');
    filterObject.filterGroup = [];
    filterObject.conjunct = groupConjunct.val();
    findFilters(groupContainer, filterObject);
}

function findFilters(groupContainer, filterObject) {
    var gridId = groupContainer.parents('.filter_modal').data('grid_id');
    groupContainer.children('.filter_row_div').each(function iterateFilterDivsCallback() {
        createFilterObjects(dominator(this), filterObject.filterGroup, gridId);
    });

    groupContainer.children('.filter_group_container').each(function createNestedFilterGroupsCallback(idx, val) {
        var nestedGroup = {};
        filterObject.filterGroup.push(nestedGroup);
        createFilterGroups(dominator(val), nestedGroup);
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
        filterGroupArr.push({ field: field, value: value, operation: operation, dataType: (gridState.getInstance(gridId)
                .columns[gridState.getInstance(gridId).columnIndices[field]].type || 'string') });
    }
}

function addFilterButtonHandler(e) {
    var filterModal = dominator(e.currentTarget).parents('.filter_modal'),
        gridId = filterModal.data('grid_id'),
        numFiltersAllowed = gridState[gridId].columns.length,
        gridConfig = gridState.getInstance(gridId);
    if (typeof gridConfig.advancedFiltering === general_util.jsTypes.object &&
        typeof gridConfig.advancedFiltering.filtersCount === general_util.jsTypes.number)
        numFiltersAllowed = gridConfig.advancedFiltering.filtersCount;

    if (filterModal.find('.filter_row_div').length >= numFiltersAllowed) return;
    else if (filterModal.find('.filter_row_div').length === numFiltersAllowed - 1) filterModal.find('.add_filter_group').prop('disabled', true);

    addNewAdvancedFilter(dominator(e.currentTarget).closest('.filter_group_container'), false /* isFirstFilter */);
}

function addNewAdvancedFilter(advancedFiltersContainer, isFirstFilter) {
    var gridId = advancedFiltersContainer.parents('.filter_modal').data('grid_id'),
        filterRowIdx = getFilterRowIdx(advancedFiltersContainer.parents('.filter_modal')),
        filterRowDiv = dominator({ type: 'div', classes: ['filter_row_div'], data: [{ name: 'filter_idx', value: filterRowIdx }]});
        //filterRowDiv = $('<div class="filter_row_div" data-filter_idx="' + filterRowIdx + '"></div>');
    isFirstFilter ? advancedFiltersContainer.append(filterRowDiv) : advancedFiltersContainer.children('.filter_row_div').last().after(filterRowDiv);

    var columnSelector = dominator({ type: 'select', classes: ['input', 'filter_column_selector'] }).appendTo(filterRowDiv);
    //var columnSelector = $('<select class="input filter_column_selector"></select>').appendTo(filterRowDiv);
    columnSelector.addClass('select');
    columnSelector.append({ type: 'option', attributes: [{ name: 'value', value: '' }], text: 'Select a column' });
    //columnSelector.append('<option value="">Select a column</option>');
    gridState[gridId].columns.forEach(function _appendFilterableOption(col) {
        if (col.filterable) columnSelector.append({ type: 'option', attributes: [{ name: 'value', value: col.field }], text: col.title || col.field });
        //if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
    });

    var filterTypeSelector = $('<select class="input select filterType" disabled></select>').appendTo(filterRowDiv);
    var filterValue = $('<input type="text" class="advanced_filter_value" disabled />');
    filterValue.appendTo(filterRowDiv);
    filterValue.on('keypress', function validateFilterValueHandler(e) {
        var code = e.charCode? e.charCode : e.keyCode,
            type = $(this).data('type');
        if (!validateCharacter.call(this, code, type)) {
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
        var columnDataType = gridState[gridId].columns[gridState[gridId].columnIndices[columnSelector.val()]].type || 'string';
        filterTypeSelector.find('option').remove();
        filterTypeSelector.prop('disabled', false);
        filterRowDiv.find('.advanced_filter_value').val('');
        createFilterOptionsByDataType(filterTypeSelector, columnDataType);

        if (columnDataType !== 'boolean')
            filterValue.prop('disabled', false);
        else
            filterValue.prop('disabled', true);
        filterValue.data('type', columnDataType);
    });
}

function addFilterGroupHandler() {
    var numGroupsAllowed = 0,
        filterModal = $(this).parents('.filter_modal'),
        gridId = filterModal.data('grid_id'),
        filterGroups = filterModal.find('.filter_group_container'),
        parentGroup = $(this).parents('.filter_group_container').first(),
        filterGroupCount = filterGroups.length,
        numFiltersAllowed = gridState[gridId].columns.length,
        gridConfig = gridState.getInstance(gridId);
    if (typeof gridConfig.advancedFiltering === general_util.jsTypes.object && typeof gridConfig.advancedFiltering.groupsCount === general_util.jsTypes.number)
        numGroupsAllowed = gridConfig.advancedFiltering.groupsCount;
    else numGroupsAllowed = 3;

    if (filterGroupCount >= numGroupsAllowed) return;
    else if (filterGroupCount === numGroupsAllowed - 1)
        filterModal.find('.add_filter_group').prop('disabled', true);

    if (typeof gridConfig.advancedFiltering === general_util.jsTypes.object && typeof gridConfig.advancedFiltering.filtersCount === general_util.jsTypes.number)
        numFiltersAllowed = gridConfig.advancedFiltering.filtersCount;

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
    var target = $(e.currentTarget);
    var filterRowDiv = target.parents('.filter_row_div'),
        addNewFilterButton = filterRowDiv.find('.new_filter'),
        filterModal = target.parents('.filter_modal'),
        newFilterGroupButton = filterRowDiv.find('.add_filter_group');
    if (addNewFilterButton.length) {
        filterRowDiv.prev().append(addNewFilterButton.detach());
    }
    if (newFilterGroupButton.length) {
        filterRowDiv.prev().append(newFilterGroupButton.detach());
    }
    filterRowDiv.remove();

    var gridId = filterModal.data('grid_id'),
        numFilters = filterModal.find('.filter_row_div').length,
        allowedFilters = gridState[gridId].columns.length,
        gridConfig = gridState.getInstance(gridId);
    if (typeof gridConfig.advancedFiltering === general_util.jsTypes.object && typeof gridConfig.advancedFiltering.filtersCount === general_util.jsTypes.number)
        allowedFilters = gridState[gridId].advancedFiltering.filtersCount;
    if (allowedFilters > numFilters)
        filterModal.find('.add_filter_group').prop('disabled', false);
    e.stopPropagation();
}

function clearFirstFilterButtonHandler(e) {
    var filterRowDiv = $(e.currentTarget).parents('.filter_row_div'),
        columnSelector = filterRowDiv.find('.filter_column_selector'),
        gridId = filterRowDiv.parents('.filter_modal').data('grid_id');
    columnSelector.find('option').remove();
    columnSelector.append('<option value="">Select a column</option>');
    gridState.getInstance(gridId).columns.forEach(function _appendFilterableOption(col) {
        if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
    });
    filterRowDiv.find('.filterType').prop('disabled', true).find('option').remove();
    filterRowDiv.find('.advanced_filter_value').val('').prop('disabled', true);
}

function getFilterRowIdx(filterModal) {
    return filterModal.find('.filter_row_div').length ? filterModal.find('.filter_row_div').last().data('filter_idx') + 1 : 1;
}

function resetAllFilters(e) {
    var gridMenu = $(e.currentTarget).parents('.grid_menu'),
        gridId = gridMenu.data('grid_id'),
        gridConfig = gridState.getInstance(gridId);
    if (gridConfig.updating) return;     //can't filter if grid is updating
    $('.grid_menu').addClass('hiddenMenu');
    gridConfig.grid.find('filterInput').val('');

    var filterModal = gridConfig.grid.find('.filter_modal');
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
                    gridState[gridId].columns.forEach(function _addFilterableOption(col) {
                        if (col.filterable) columnSelector.append('<option value="' + col.field + '">' + (col.title || col.field) + '</option>');
                    });

                    filterRow.find('.filterType').prop('disabled', true).find('option').remove();
                    filterRow.find('.advanced_filter_value').prop('disabled', true).removeClass('invalid-grid-input').val('');
                }
            });
        }
    });

    filterModal.find('filter_error').remove();

    if (gridConfig.filters && Object.keys(gridConfig.filters.filterGroup).length) {
        gridConfig.filters = {};
        gridConfig.pageRequest.eventType = 'filter';
        preparePageDataGetRequest(gridId);
    }
}

function createFilterOptionsByDataType(select, type, isNullable) {
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
        case 'datetime':
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

    if (isNullable) {
        select.append('<option value="null">Is null:</option>');
        select.append('<option value="not_null">Is not null:</option>');
    }
}

export { addNewAdvancedFilter, createFilterGroups, resetAllFilters };