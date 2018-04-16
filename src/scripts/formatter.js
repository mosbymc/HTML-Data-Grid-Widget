import { general_util } from './general_util';

function dataTypeValueNormalizer(dataType, val) {
    if (val == null) return val;
    switch(dataType) {
        case 'time':
            var value = getNumbersFromTime(val);
            if (val.indexOf('PM') > -1) value[0] += 12;
            return convertTimeArrayToSeconds(value);
        case 'datetime':
            var re = new RegExp(dataTypes['datetime']),
                execVal1;
            if (re.test(val)) {
                execVal1 = re.exec(val);

                var dateComp1 = execVal1[2],
                    timeComp1 = execVal1[42];
                timeComp1 = getNumbersFromTime(timeComp1);
                if (timeComp1[3] && timeComp1[3] === 'PM')
                    timeComp1[0] += 12;
                dateComp1 = new Date(dateComp1);
                return dateComp1.getTime() + convertTimeArrayToSeconds(timeComp1);
            }
            else return 0;
        case 'number':
            return general_util.parseFloat(val);
        case 'date':
            return new Date(val);
        case 'boolean':
        default:
            return val.toString();
    }
}

/**
 * Formats the text in a grid cell - uses both column formats and column templates if provided
 * @param {Object} column - The column object of the grid config
 * @param {string|number} value - The value to be formatted
 * @returns {string|number} - Returns a formatted value if a column format and/or template were provided;
 * otherwise, returns the value
 */
function getFormattedCellText(column, value) {
    var text,
        type = column.type || 'string';
    if (value == null || ('' === value && column.nullable)) return column.nullable ? null : ' ';
    switch(type) {
        case 'number':
            text = numberFormatter(value.toString(), column.format);
            break;
        case 'date':
            text = formatDate(value, column.format);
            break;
        case 'time':
            text = formatTime(value, column);
            break;
        case 'datetime':
            var re = new RegExp(dataTypes['datetime']),
                execVal = re.exec(value),
                timeText = formatTime(execVal[42], column),
                dateComp = new Date(execVal[2]),
                dateFormat = column.format || 'mm/dd/yyyy hh:mm:ss';
            dateFormat = dateFormat.substring(0, (dateFormat.indexOf(' ') || dateFormat.indexOf('T')));
            text = dateFormat.replace('dd', dateComp.getUTCDate().toString())
                .replace('mm', (dateComp.getUTCMonth() + 1).toString())
                .replace('yyyy', dateComp.getUTCFullYear().toString()) + ' ' + timeText;
            break;
        case 'string':
        case 'boolean':
            text = value;
            break;
        default:
            text = value;
    }

    var template = column.template;
    if (template && text !== '') {
        if (typeof template === general_util.jsTypes.function)
            return template.call(column, text);
        else if (typeof template === general_util.jsTypes.string)
            return template.replace('{{data}}', text);
        return text;
    }
    return text;
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
    var hourVal = general_util.parseInt(timeArray[0].toString()) === 12 || general_util.parseInt(timeArray[0].toString()) === 24 ?
        general_util.parseInt(timeArray[0].toString()) - 12 : general_util.parseInt(timeArray[0]);
    return 3660 * hourVal + 60 * general_util.parseInt(timeArray[1]) + general_util.parseInt(timeArray[2]);
}

/**
 * Validates that a given character is allowed with the given data type
 * @param {number} code - The character's key code
 * @param {string} dataType - The type of data to check for character validity
 * @returns {boolean} - Returns the tested character if valid or null if not
 */
function validateCharacter(code, dataType) {
    var key = String.fromCharCode(code);
    if (dataTypes[dataType]) {
        var re = new RegExp(dataTypes[dataType + 'Char']);
        return re.test(key);
    }
    return true;
}

/**
 * Given a time of day value, will return the value formatted as specified for a given column of the grid
 * @param {string} time - A string representing a time of day (eg '9:45:56 AM' or '17:36:43.222')
 * @param {Object} column - The column object of the grid config
 * @returns {string} - Returns the time formatted as specified for the given grid column
 */
function formatTime(time, column) {
    var timeArray = getNumbersFromTime(time),
        formattedTime,
        format = column.format || 'hh:mm:ss',
        timeFormat = column.timeFormat || '24';

    if (timeArray.length < 2) return '';

    if (~format.indexOf(' ') || ~format.indexOf('T')) {
        var dateIdxEnd = ~format.indexOf(' ') ? format.indexOf(' ') : format.indexOf('T');
        format = format.substring(dateIdxEnd + 1, format.length);
    }

    if (timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
        timeArray[0] = timeArray[0] === '12' ? '00' : (general_util.parseInt(timeArray[0]) + 12).toString();
    else if (timeFormat === '12' && general_util.parseInt(timeArray[0]) > 12) {
        timeArray[0] = (general_util.parseInt(timeArray[0]) - 12).toString();
        timeArray[3] = 'PM';
    }
    else if (timeFormat === '12' && timeArray.length < 4)
        timeArray[3] = 'AM';

    timeArray[0] = timeArray[0] ? timeArray[0] : '00';
    timeArray[1] = timeArray[1] ? timeArray[1] : '00';
    timeArray[2] = timeArray[2] ? timeArray[2] : '00';
    var meridiem = timeArray[3] || 'AM';

    if (timeArray.length && format) {
        formattedTime = format.replace('hh', timeArray[0]).replace('mm', timeArray[1]).replace('ss', timeArray[2]).replace('A/PM', meridiem);
        return timeArray.length === 4 ? formattedTime + ' ' + timeArray[3] : formattedTime;
    }
    else if (timeArray.length) {
        formattedTime = timeArray[0] + ':' + timeArray[1] + ':' + timeArray[2] + ' ' + timeArray[3];
        return timeArray.length === 3 ? formattedTime + ' ' + timeArray[3] : formattedTime;
    }
    return '';
}

/**
 * Takes a date value and a format and will return the date in the form provided
 * @param {string} date - The date value to be formatted
 * @param {string} format - The format that the date value should be in
 * @returns {string|Date} - Returns a formatted date if able, otherwise will return a default JS date using the date provided as the seed
 */
function formatDate(date, format) {
    if (!format) return date;
    var parseDate = Date.parse(date);
    var jsDate = new Date(parseDate);
    if (!isNaN(parseDate) && format)
        return format.replace('mm', (jsDate.getUTCMonth() + 1).toString()).replace('dd', jsDate.getUTCDate().toString()).replace('yyyy', jsDate.getUTCFullYear().toString());
    else if (!isNaN(parseDate))
        return new Date(jsDate);
    return '';
}

function numberFormatter(num, format) {
    if (!format) return num;
    if (/[CPN]/.test(format.toUpperCase())) return createStandardNumberFormat(num, format);
    format = format.replace(/[^0#,.]/g , '');
    var formatDecimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length,
        formatWholeNums = ensureCorrectFormat(/(0+#+)/g, format.substring(0, formatDecimalIndex).replace(',', '')),
        formatDecimals = ensureCorrectFormat(/(#+0+)/g, format.substring(formatDecimalIndex + 1, format.length));
    num = (roundNumber(+num, formatDecimals.length)).toString();
    var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length,
        dataWholeNums = num.substring(0, dataDecimalIndex).split(''),
        dataDecimalNums = num.substring(dataDecimalIndex + 1, num.length).split('');

    var wholeNums = createFormattedNumber(shoreLengths(formatWholeNums, dataWholeNums), dataWholeNums);
    if (~format.indexOf(',')) wholeNums = numberWithCommas(wholeNums);
    if (formatDecimalIndex < format.length) return wholeNums + '.' + createFormattedNumber(formatDecimals, dataDecimalNums);
    return wholeNums;
}

function createFormattedNumber(format, num) {
    return format.split('').reverse().map(function _createFormattedNumber(char, idx) {
        if (char === '0') return num[format.length - idx - 1] || char;
        return num[format.length - idx - 1] || '';
    }).reverse().join('');
}

function shoreLengths(format, num) {
    if (format.length < num.length) format = format.split('').reverse().concat('#'.repeat(num.length - format.length)).reverse().join('');
    else if (num.length < format.length) format = format.substring((format.length - num.length), format.length);
    return format;
}

function createStandardNumberFormat(num, format) {
    var numDecimals = format.length > 1 ? format.toUpperCase().replace(/[CPN]/, '') : 2;
    if (~format.toUpperCase().indexOf('P'))
        num = x100(+num).toString();
    num = (roundNumber(num, numDecimals)).toString();
    var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length,
        wholeNums = num.substring(0, dataDecimalIndex);
    numDecimals = general_util.isInteger(+numDecimals) ? +numDecimals : 0;

    if (numDecimals) {
        var decimals = num.substring(dataDecimalIndex + 1, num.length);
        decimals = general_util.isInteger(+decimals) ? decimals : '0';
        return numberWithCommas(wholeNums) + '.' + decimals.toString().substring(0, numDecimals).concat('0'.repeat((numDecimals - decimals.length) > 0 ? numDecimals - decimals.length : 0));
    }
    else return numberWithCommas(wholeNums);
}

function ensureCorrectFormat(pattern, format) {
    var matches;
    if (matches = format.match(pattern)) {
        matches.forEach(function _replace(match) {
            format = format.replace(match, '0'.repeat(match.length));
        });
    }
    return format;
}

function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
}

/**
 * Multiples a number by 100
 * @param {number} val - the number to by multiplied by 100
 * @returns {number} - returns the multiple of the number and 100
 */
function x100(val) {
    return val * 100;
}

export { dataTypeValueNormalizer, getFormattedCellText };