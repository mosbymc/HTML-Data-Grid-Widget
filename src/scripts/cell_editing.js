/**
 * Makes a grid cell editable on a click event. Used for grid cells whose values can be changed and whose column configuration
 * has its editable property set to true
 * @param {number} id - The id of the grid widget instance
 * @param {object} td - The grid cell to attach the click listener to
 */
function makeCellEditable(id, td) {
    td.on('click', function editableCellClickHandler(e) {
        var gridContent = gridState[id].grid.find('.grid-content-div');
        var gridData = gridState[id];
        if (gridState[id].updating) return;
        if (e.target !== e.currentTarget) return;
        if (gridContent.find('.invalid').length) return;
        var cell = $(e.currentTarget);
        if (cell.children('span').hasClass('dirty'))
            cell.data('dirty', true);
        else cell.data('dirty', false);
        cell.text('');

        var row = cell.parents('tr').first(),
            index = gridData.grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = cell.data('field'),
            column = gridState[id].columns[gridState[id].columnIndices[field]],
            type = column.type || '',
            val = column.nullable || gridState[id].dataSource.data[index][field] ? gridState[id].dataSource.data[index][field] : '',
            dataAttributes = '',
            gridValidation = gridState[id].useValidator ? column.validation : null,
            dataType, input, inputVal;

        if (gridValidation) {
            dataAttributes = setupCellValidation(gridValidation, dataAttributes);
            var gridBodyId = 'grid-content-' + id.toString();
            dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
        }

        if (gridState[id].useFormatter && column.inputFormat)
            dataAttributes += ' data-inputformat="' + column.inputFormat + '"';

        switch (type) {
            case 'boolean':
                input = $('<input type="checkbox" class="input checkbox active-cell"' + dataAttributes + '/>').appendTo(cell);
                val = typeof gridState[id].dataSource.data[index][field] === jsTypes.string ? gridState[id].dataSource.data[index][field] === 'true' : !!val;
                input[0].checked = val;
                dataType = 'boolean';
                break;
            case 'number':
                if (typeof gridState[id].dataSource.data[index][field] === jsTypes.string)
                    val = isNumber(parseFloat(gridState[id].dataSource.data[index][field])) ? parseFloat(gridState[id].dataSource.data[index][field]) : 0;
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
                input = $('<input type="text" value="' + (val || '') + '" class="input textbox cell-edit-input active-cell"' + dataAttributes + '/>').appendTo(cell);
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

/**
 * Makes a grid cell selectable on a click event. Used for grid cells whose values can be changed to a limited set
 * or pre-specified values and whose column configuration provided the list of values and has its selectable property set to true
 * @param {number} id - The id of the grid widget instance
 * @param {object} td - The grid cell to attach the click listener to
 */
function makeCellSelectable(id, td) {
    td.on('click', function selectableCellClickHandler(e) {
        var gridContent = gridState[id].grid.find('.grid-content-div'),
            gridData = gridState[id];
        if (e.target !== e.currentTarget) return;
        if (gridContent.find('.invalid').length) return;
        var cell = $(e.currentTarget);
        if (cell.children('span').hasClass('dirty'))
            cell.data('dirty', true);
        else cell.data('dirty', false);
        cell.text('');
        var row = cell.parents('tr').first(),
            index = gridData.grid.find('tr').filter(function removeGroupAndChildRows() {
                var r =  $(this);
                return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
            }).index(row),
            field = cell.data('field');
        if (gridState[id].updating) return;     //can't edit a cell if the grid is updating

        var column = gridState[id].columns[gridState[id].columnIndices[field]],
            value = gridState[id].dataSource.data[index][field],
            gridValidation = gridState[id].useValidator ? column.validation : null,
            dataAttributes = '';

        if (gridValidation) {
            dataAttributes = setupCellValidation(gridValidation, dataAttributes);
            var gridBodyId = 'grid-content-' + id.toString();
            dataAttributes += ' data-validateon="blur" data-offsetHeight="-6" data-offsetWidth="8" data-modalid="' + gridBodyId + '"';
        }
        var select = $('<select class="input select active-cell"' + dataAttributes + '></select>').appendTo(cell),
            options = column.options.map(function _copyColumnOptions(val) { return val; });
        value = column.nullable || value != null ? value : '';
        var dataType = column.type || 'string',
            normalizedValue = dataTypeValueNormalizer(dataType, value);
        if (!options.some(function _compareCellValueForUniqueness(opt) {
            if (comparator(normalizedValue, dataTypeValueNormalizer(dataType, opt), booleanOps.strictEqual))
                return true;
        })) {
            options.reverse().push(value).reverse();
        }

        options.forEach(function _setSelectableColumnOptions(option) {
            select.append('<option value="' + option + '">' + option + '</option>');
        });
        if ('' !== value && (column.nullable || null !== value)) select.val(value);
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

/**
 * On blur or successful validation if using the validator, removes the input from the
 * grid cell, saves the data in the alteredData array and set a dirty flag on the grid dom
 * element if the value changed
 * @method saveCellEditData
 * @for grid
 * @private
 * @param {object} input - The input element that was edited
 */
function saveCellEditData(input) {
    var val;
    if (input[0].type == 'checkbox') val = input.is(':checked');
    else val = input.val();
    var gridContent = input.parents('.grid-wrapper').find('.grid-content-div'),
        cell = input.parents('td'),
        id = gridContent.data('grid_content_id'),
        row = cell.parents('tr').first(),
        index = gridState[id].grid.find('tr').filter(function removeGroupAndChildRows() {
            var r =  $(this);
            return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
        }).index(row),
        field = cell.data('field'),
        column = gridState[id].columns[gridState[id].columnIndices[field]],
        type = column.type || '',
        saveVal, re, setDirtyFlag = false,
        formattedVal = getFormattedCellText(column, val),
        displayVal = formattedVal == null ? 'Null' : formattedVal;

    input.remove();
    if (formattedVal !== null) {
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                if (typeof gridState[id].dataSource.data[index][field] === jsTypes.string) saveVal = val;
                else {
                    var tmpVal = parseFloat(val.replace(',', ''));
                    tmpVal === tmpVal ? saveVal = tmpVal : saveVal = 0;
                }
                //saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
            case 'time':
            case 'datetime':
                re = new RegExp(dataTypes[type]);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;
                break;
            case 'boolean':
                displayVal = val.toString();
                saveVal = val;
                break;
            default:
                saveVal = formattedVal == null ? null : val;
                break;
        }
    }
    else
        saveVal = val;

    cell.text(displayVal || '');
    gridState[id].currentEdit[field] = null;
    var previousVal = gridState[id].dataSource.data[index][field];
    if (previousVal !== saveVal) {
        gridState[id].dataSource.data[index][field] = saveVal;
        var idxOffset = 0;
        if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
            idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
        if (saveVal !== gridState[id].originalData[gridState[id].dataMap[index + idxOffset]][field]) {
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

/**
 * On blur or successful validation if using the validator, removes the input from the
 * grid cell, saves the data in the alteredData array and set a dirty flag on the grid dom
 * element if the value changed
 * @method saveCellSelectData
 * @for grid
 * @private
 * @param {object} select - The select dom element
 */
function saveCellSelectData(select) {
    var gridContent = select.parents('.grid-wrapper').find('.grid-content-div'),
        val = select.val(),
        parentCell = select.parents('td');
    select.remove();
    var id = gridContent.data('grid_content_id'),
        row = parentCell.parents('tr').first(),
        index = gridState[id].grid.find('tr').filter(function removeGroupAndChildRows() {
            var r =  $(this);
            return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
        }).index(row),
        field = parentCell.data('field'),
        column = gridState[id].columns[gridState[id].columnIndices[field]],
        type = column.type || '',
        formattedVal = getFormattedCellText(column, val),
        displayVal = formattedVal == null ? 'Null' : formattedVal,
        re, saveVal, setDirtyFlag = false;

    if (null !== formattedVal) {
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = typeof gridState[id].dataSource.data[index][field] === jsTypes.string ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
            case 'time':
            case 'datetime':
                re = new RegExp(dataTypes[type]);
                if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
                saveVal = displayVal;
                break;
            case 'boolean':
                displayVal = val.toString();
                saveVal = val;
                break;
            default:        //string
                saveVal = formattedVal == null ? null : val;
                break;
        }
    }
    else
        saveVal = val;

    parentCell.text(displayVal);
    var previousVal = gridState[id].dataSource.data[index][field];
    if (previousVal !== saveVal) {  //if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
        gridState[id].dataSource.data[index][field] = saveVal;
        var idxOffset = 0;
        if (typeof gridState[id].dataSource.get !== jsTypes.function && gridState[id].pageNum > 1)
            idxOffset = ((gridState[id].pageNum - 1) * gridState[id].pageSize) - 1;
        if (saveVal !== gridState[id].originalData[gridState[id].dataMap[index + idxOffset]][field]) {
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

/**
 * Attaches an event listener to a specific grid cell for the
 * 'validated' event. Overrides the normal 'blur' behavior for cell editing
 * @method attachValidationListener
 * @for grid
 * @private
 * @param {object} elem
 */
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

export { attachValidationListener, saveCellEditData, saveCellSelectData };