import { dataTypes } from './gridEnumsAndConfigs';

/**
 * Multiples a number by 100
 * @param {number} val - the number to by multiplied by 100
 * @returns {number} - returns the multiple of the number and 100
 */
function x100(val) {
    return val * 100;
}

/**
 * Rounds a number to a given decimal place
 * @param {number} val - the number to be rounded
 * @param {number} dec - the number of decimals to retain after rounding
 * @returns {number} - Returns the value rounded to the nth decimal place
 */
function roundNumber(val, dec) {
    var pow = Math.pow(10, dec || 0);
    return Math.round((val*pow))/pow;
}

/**
 * Clones an object and returns a new object instance with the same values as the original
 * @param {object|*} gridData - The object to be cloned
 * @returns {*} - Returns a new instance of whatever type was given to the function
 */
function cloneGridData(gridData) { //Clones grid data so pass-by-reference doesn't mess up the values in other grids.
    if (gridData == null || typeof (gridData) !== 'object')
        return gridData;

    if (Object.prototype.toString.call(gridData) === '[object Array]')
        return cloneArray(gridData);

    var temp = {};
    for (var key in gridData)
        temp[key] = cloneGridData(gridData[key]);

    return temp;
}

/**
 * Copies the contents of an array into a new array instance
 * @param {Array} arr - The array to be copied
 * @returns {Array} - Returns a new array instance containing the values in the original
 */
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

/**
 * Checks that a given variable is a DOM element
 * @param {object} node - The variable being checked
 * @returns {boolean} - Returns true if the variable is a DOM element, false if not
 */
function isDomElement(node) {
    return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === 'object';
}

/**
 * Checks that a given variable is a number and not NaN
 * @param {number} value - The number that is being checked
 * @returns {boolean} Returns true if the value is a number, false if not
 */
function isNumber(value) {
    return typeof value === 'number' && value === value;
}

/**
 * Returns an array of columns in the grid
 * @param {Object} columns - The 'columns' property of the grid configuration data
 * @returns {Array} - A collection of the column names in the grid configuration
 */
function getGridColumns(columns) {
    var cols = [];
    for (var col in columns) {
        cols.push(col);
    }
    return cols;
}

/**
 * Given a string, this function will ensure it is in a valid time format and has a legitimate
 * time value. This returns a standard format as a response.
 * @param {string} val - The value being tested for time legitimacy
 * @returns {Array} - An array containing hours, minutes, seconds of the day (if 12 hour time format, also contains meridiem)
 */
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

/**
 * Given the array the 'getNumbersFromTime' function produces, this function will turn the values
 * into seconds for comparisons when filtering and sorting grid data.
 * @param {Array} timeArray - An array of the type produced by the 'getNumbersFromTime' function
 * @returns {number} - Returns a value in seconds for the time of day
 */
function convertTimeArrayToSeconds(timeArray) {
    var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
    return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
}

export { x100, roundNumber, cloneGridData, cloneArray, isDomElement, isNumber, getGridColumns, getNumbersFromTime, convertTimeArrayToSeconds };