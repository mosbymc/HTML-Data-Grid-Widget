import { gridState } from './gridState';
import { general_util } from './general_util';
import { getFormattedCellText } from './formatter';
import { dominator } from './dominator';

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
    if (input[0].type === 'checkbox') val = input.attributes('checked');
    //if (input[0].type === 'checkbox') val = input.is(':checked');
    else val = input.val();
    var gridContent = input.parents('.grid-wrapper').find('.grid-content-div'),
        cell = input.parents('td'),
        id = gridContent.data('grid_content_id'),
        row = cell.parents('tr').first(),
        gridConfig = gridState.getInstance(id),
        index = gridConfig.grid.find('tr').filter(function removeGroupAndChildRows() {
            let r =  dominator(this);
            return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
        }).index(row),
        field = cell.data('field'),
        column = gridConfig.columns[gridConfig.columnIndices[field]],
        type = column.type || '',
        saveVal, re, setDirtyFlag = false,
        formattedVal = getFormattedCellText(column, val),
        displayVal = formattedVal == null ? 'Null' : formattedVal;

    input.remove();
    if (formattedVal !== null) {
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridConfig.currentEdit[field] || gridConfig.dataSource.data[index][field];
                if (typeof gridConfig.dataSource.data[index][field] === general_util.jsTypes.string) saveVal = val;
                else {
                    var tmpVal = general_util.parseFloat(val.replace(',', ''));
                    tmpVal === tmpVal ? saveVal = tmpVal : saveVal = 0;
                }
                //saveVal = typeof gridState[id].dataSource.data[index][field] === 'string' ? val : parseFloat(val.replace(',', ''));
                break;
            case 'date':
            case 'time':
            case 'datetime':
                re = new RegExp(dataTypes[type]);
                if (!re.test(val)) val = gridConfig.currentEdit[field] || gridConfig.dataSource.data[index][field];
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
    gridConfig.currentEdit[field] = null;
    var previousVal = gridConfig.dataSource.data[index][field];
    if (previousVal !== saveVal) {
        gridConfig.dataSource.data[index][field] = saveVal;
        var idxOffset = 0;
        if (typeof gridConfig.dataSource.get !== general_util.jsTypes.function && gridConfig.pageNum > 1)
            idxOffset = ((gridConfig.pageNum - 1) * gridConfig.pageSize) - 1;
        if (saveVal !== gridConfig.originalData[gridConfig.dataMap[index + idxOffset]][field]) {
            setDirtyFlag = true;
            if ('' !== saveVal) cell.prepend({ type: 'span', classes: ['dirty'] });
            else if (null != previousVal) cell.prepend({ type: 'span', classes: ['dirty-blank'] });
            //if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
            //else if (previousVal != null) cell.prepend('<span class="dirty-blank"></span>');
        }
    }
    if (!setDirtyFlag && cell.data('dirty')) {
        if ('' !== saveVal) cell.prepend({ type: 'span', classes: ['dirty'] });
        else cell.prepend({ type: 'span', classes: ['dirty-blank'] });
        //if ('' !== saveVal) cell.prepend('<span class="dirty"></span>');
        //else cell.prepend('<span class="dirty-blank"></span>');
    }
    callGridEventHandlers(gridConfig.events.afterCellEdit, gridConfig.grid, null);
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
        gridConfig = gridState.getInstance(id),
        grid = dominator(gridConfig.grid),
        index = grid.find('tr').filter(function removeGroupAndChildRows() {
            var r =  $(this);
            return r.hasClass('data-row') && !r.parents('.drill-down-parent').length && !r.hasClass('drill-down-parent');
        }).index(row),
        field = parentCell.data('field'),
        column = gridConfig.columns[gridConfig.columnIndices[field]],
        type = column.type || '',
        formattedVal = getFormattedCellText(column, val),
        displayVal = formattedVal == null ? 'Null' : formattedVal,
        re, saveVal, setDirtyFlag = false;

    if (null !== formattedVal) {
        switch (type) {
            case 'number':
                re = new RegExp(dataTypes.number);
                if (!re.test(val)) val = gridConfig.currentEdit[field] || gridConfig.dataSource.data[index][field];
                saveVal = typeof gridConfig.dataSource.data[index][field] === general_util.jsTypes.string ? val : general_util.parseFloat(val.replace(',', ''));
                break;
            case 'date':
            case 'time':
            case 'datetime':
                re = new RegExp(dataTypes[type]);
                if (!re.test(val)) val = gridConfig.currentEdit[field] || gridConfig.dataSource.data[index][field];
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
    var previousVal = gridConfig.dataSource.data[index][field];
    if (previousVal !== saveVal) {  //if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
        gridConfig.dataSource.data[index][field] = saveVal;
        var idxOffset = 0;
        if (typeof gridConfig.dataSource.get !== general_util.jsTypes.function && gridConfig.pageNum > 1)
            idxOffset = ((gridConfig.pageNum - 1) * gridConfig.pageSize) - 1;
        if (saveVal !== gridConfig.originalData[gridConfig.dataMap[index + idxOffset]][field]) {
            parentCell.prepend({ type: 'span', classes: ['dirty'] });
            //parentCell.prepend('<span class="dirty"></span>');
            setDirtyFlag = true;
        }
        gridConfig.dataSource.data[index][field] = saveVal;
    }
    if (!setDirtyFlag && parentCell.data('dirty')) {
        if ('' !== saveVal) parentCell.prepend({ type: 'span', classes: ['dirty'] });
        else parentCell.prepend({ type: 'span', classes: ['dirty-blank'] });
        //if ('' !== saveVal) parentCell.prepend('<span class="dirty"></span>');
        //else parentCell.prepend('<span class="dirty-blank"></span>');
    }
    callGridEventHandlers(gridConfig.events.afterCellEdit, gridConfig.grid, null);
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
    dominator(document).one('validated', function validationHandlerCallback(e, eventData) {
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