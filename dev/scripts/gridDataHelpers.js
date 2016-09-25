import { getNumbersFromTime, convertTimeArrayToSeconds } from './gridHelpers';

/**
 * Using various equality operators, checks for truth based on the type of the operator(s)
 * @param {string|number|boolean} val - The value that is being checked against a base value
 * @param {*} base - The based value against which values are compared
 * @param {string} type - The type of equality operator(s) to be used in the comparison
 * @returns {boolean} - Returns a boolean indicating that whether the comparison was true of false
 */
function comparator(val, base, type) {
    switch (type) {
        case 'eq':
        case '===':
            return val === base;
        case '==':
            return val == base;
        case 'neq':
        case '!==':
            return val !== base;
        case '!=':
            return val != base;
        case 'gte':
        case '>=':
            return val >= base;
        case 'gt':
        case '>':
            return val > base;
        case 'lte':
        case '<=':
            return val <= base;
        case 'lt':
        case '<':
            return val < base;
        case 'not':
        case '!':
        case 'falsey':
            return !val;
        case 'truthy':
            return !!val;
        case 'ct':
            return !!~val.toLowerCase().indexOf(base.toLowerCase());
        case 'nct':
            return !~val.toLowerCase().indexOf(base.toLowerCase());
    }
}

/**
 * Manages sorting grid data based on the field and data type
 * @param {Array} sortedItems - An array of objects describing which columns are to be sorted and in which directions
 * @param {Object} gridData - The cached data for the current grid instance\
 * @returns {Array} - Returns an array of sorted grid data
 */
export function sortGridData (sortedItems, gridData) {
    for (var i = 0; i < sortedItems.length; i++) {
        if (i === 0)
            gridData.dataSource.data = mergeSort(gridData.dataSource.data, sortedItems[i], gridData.columns[sortedItems[i].field].type || 'string');
        else {
            var sortedGridData = [];
            var itemsToSort = [];
            for (var j = 0; j < gridData.dataSource.data.length; j++) {
                if (!itemsToSort.length || compareValuesByType(itemsToSort[0][sortedItems[i - 1].field], gridData[j][sortedItems[i - 1].field], gridData.columns[sortedItems[i - 1].field].type))
                    itemsToSort.push(gridData.dataSource.data[j]);
                else {
                    if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                    else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridData.columns[sortedItems[i].field].type || 'string'));
                    itemsToSort.length = 0;
                    itemsToSort.push(gridData.dataSource.data[j]);
                }
                if (j === gridData.dataSource.data.length - 1)
                    sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[i], gridData.columns[sortedItems[i].field].type || 'string'));
            }
            gridData.dataSource.data = sortedGridData;
        }
    }
    return gridData.dataSource.data;
}

/**
 * @method Merge-Sort algorithm for grid data client-side sorting
 * @param {object} data - the grid's data
 * @param {object} sortObj - object that contains the field that the grid data is being sorted on and the direction of the sort
 * @param {string} type - the type of the data (string, number, time, date, boolean)
 * @returns {*}
 */
export function mergeSort(data, sortObj, type) {
    if (data.length < 2) return data;
    var middle = parseInt(data.length / 2);
    var left   = data.slice(0, middle);
    var right  = data.slice(middle, data.length);
    return merge(mergeSort(left, sortObj, type), mergeSort(right, sortObj, type), sortObj, type);
}

/**
 * Compares fields from two objects, by their data type, and returns an array of sorted data
 * @param {Object} left - The first of the two objects
 * @param {Object} right - The second of the two objects
 * @param {Object} sortObj - The object containing the specifications of the sort
 * @param {string} type - The type of data being compared
 * @returns {Array} - Returns a sorted array of the objects that were compared
 */
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

/**
 * Compares two values for equality after coercing both to the provided type
 * @param {string|number} val1 - The first value to check for equality
 * @param {string|number} val2 - The second value to check for equality
 * @param {string} dataType - The type of data contained in the two values
 * @returns {boolean} - Indicated equality or lack thereof
 */
function compareValuesByType (val1, val2, dataType) {
    switch (dataType) {
        case 'string':
            return val1.toString() === val2.toString();
        case 'number':
            return parseFloat(val1.toString()) === parseFloat(val2.toString());
        case 'boolean':
            /*jshint -W018*/    //have to turn off jshint check for !! operation because there's not built-in way to turn it off in the config file and
            //like most js devs, those of jshint aren't the most savvy JSers
            return !!val1 === !!val2;
        case 'date':
            var date1 = new Date(val1),
                date2 = new Date(val2);
            //invalid date values - creating a date from both values resulted in either NaN or 'Invalid Date', neither of which are equal to themselves.
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

export { comparator, sortGridData, mergeSort, compareValuesByType };