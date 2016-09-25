import { gridFormatters } from './gridFormattersAndValidators';
import { gridHelpers } from './gridHelpers';
import { gridDataHelpers } from './gridDataHelpers';

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
                    val = gridHelpers.sNumber(parseFloat(gridState[id].dataSource.data[index][field])) ? gridHelpers.isNumber(parseFloat(gridState[id].dataSource.data[index][field])) : 0;
                else
                    val = gridHelpers.isNumber(gridState[id].dataSource.data[index][field]) ? gridState[id].dataSource.data[index][field] : 0;
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
                if (!gridFormatters.validateCharacter.call(this, code, dataType)) {
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
        if (gridState[id].updating) return;		//can't edit a cell if the grid is updating

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
            if (!gridDataHelpers.compareValuesByType(setVal, gridData.columns[field].options[z], (gridData.columns[field].type || 'string'))) {
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
                    var firstTime = gridHelpers.getNumbersFromTime(first);
                    var secondTime = gridHelpers.getNumbersFromTime(second);

                    if (~first.indexOf('PM'))
                        firstTime[0] += 12;
                    if (~second.indexOf('PM'))
                        secondTime[0] += 12;

                    firstTime = gridHelpers.convertTimeArrayToSeconds(firstTime);
                    secondTime = gridHelpers.convertTimeArrayToSeconds(secondTime);
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

/**
 * If the validator is being used and a column has validation functions to run when editing values, this will determine
 * the appropriate classes and data-attributes that should be applied to the cell's input in order for validation to run
 * as well as set up a namespace for the validation functions to be execute in
 * @param {object} columnValidation - The validation rules provided in the column's configuration
 * @param {string} dataAttributes - The data-attributes for the cell's input
 * @returns {string} - The final form of the data-attribute after the namespace has been created and all validation functions determined
 */
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
        index = cell.parents('tr').index('#' + gridContent[0].id + ' .data-row'),
        field = cell.data('field'),
        type = gridState[id].columns[field].type || '',
        saveVal, re, setDirtyFlag = false,
        formattedVal = gridFormatters.getFormattedCellText(id, field, val),
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
            //saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
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
        index = parentCell.parents('tr').index('#' + gridContent[0].id + ' .data-row'),
        field = parentCell.data('field'),
        type = gridState[id].columns[field].type || '',
        displayVal = gridFormatters.getFormattedCellText(id, field, val) || gridState[id].dataSource.data[index][field],
        re, saveVal, setDirtyFlag = false;

    switch (type) {
        case 'number':
            re = new RegExp(dataTypes.number);
            if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
            saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
            break;
        case 'date':
            saveVal = displayVal;   //this and time are the only types that have the same displayVal and saveVel
            break;
        case 'time':
            re = new RegExp(dataTypes.time);
            if (!re.test(val)) val = gridState[id].currentEdit[field] || gridState[id].dataSource.data[index][field];
            saveVal = displayVal;   //this and date are the only types that have the same displayVal and saveVal
            break;
        default: 		//string, boolean
            saveVal = val;
            break;
    }

    parentCell.text(displayVal);
    var previousVal = gridState[id].dataSource.data[index][field];
    if (previousVal !== saveVal) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
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

/**
 * Attaches the click handlers for the save and delete buttons on the toolbar for saving/deleting changes made to the grid data
 * @param {number} id - the identifier of the grid instance
 * @param {object} gridElem - the grid DOM element
 * @param {object} saveAnchor - the save button DOM element
 * @param {object} deleteAnchor - the delete button DOM element
 */
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
                    var tmpModel = gridHelpers.cloneGridData(gridState[id].dataSource.data[dirtyCells[i].parents('tr').index()]);
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
                var text = gridFormatters.getFormattedCellText(id, field, cellVal) || cellVal;
                dirtyCells[i].text(text);
                dirtyCells[i].find('.dirty').add('.dirty-blank').remove();
                gridState[id].dataSource.data[index][field] = gridState[id].originalData[index + addend][field];
            }
        }
    });
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

export { makeCellEditable, makeCellSelectable, setupCellValidation, attachValidationListener, saveCellEditData, saveCellSelectData,
        attachSaveAndDeleteHandlers, createSaveDeleteMenuItems };