import { gridHelpers } from './gridHelpers';


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
 * @param {string} column - The column of the grid that provided the format
 * @param {string|number} gridId - The id value of the grid this operation is being performed on
 * @returns {string} - Returns the time formatted as specified for the given grid column
 */
function formatTimeCellData(time, column, gridId) {
    var timeArray = gridHelpers.getNumbersFromTime(time),
        formattedTime,
        format = gridState[gridId].columns[column].format || '24',
        timeFormat = gridState[gridId].columns[column].timeFormat;

    if (timeArray.length < 2) return '';

    if (timeFormat == '24' && timeArray.length === 4 && timeArray[3] === 'PM')
        timeArray[0] = timeArray[0] === '12' ? '00' : (parseInt(timeArray[0]) + 12).toString();
    else if (timeFormat === '12' && parseInt(timeArray[0]) > 12) {
        timeArray[0] = (parseInt(timeArray[0]) - 12).toString();
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
function formatDateCellData(date, format) {
    if (!format) return date;
    var parseDate = Date.parse(date);
    var jsDate = new Date(parseDate);
    if (!isNaN(parseDate) && format)
        return format.replace('mm', (jsDate.getUTCMonth() + 1).toString()).replace('dd', jsDate.getUTCDate().toString()).replace('yyyy', jsDate.getUTCFullYear().toString());
    else if (!isNaN(parseDate))
        return new Date(jsDate);
    return '';
}

/**
 * Takes a number and a format string and will format the number according to the formatting rules
 * @param {string|number} num - The number to be formatted before it is displayed in the grid
 * @param {string} format - The format string that specifies how to format the number
 * @returns {string|number} - Returns either the number it received if unable to properly format, or a string value of the formatted number
 */
function formatNumericCellData(num, format) {
    if (!format) return num;
    var formatSections = [];
    var dataSections = [];
    format = format.toUpperCase();
    var formatObject = (~format.indexOf('P') || ~format.indexOf('C') || ~format.indexOf('N')) ? createCurrencyNumberOrPercentFormat(format) : verifyFormat(format);
    format = formatObject.value;

    var formatDecimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
    formatSections[0] = format.substring(0, formatDecimalIndex).split('').reverse().join('');
    if (formatDecimalIndex < format.length)
        formatSections[1] = format.substring(formatDecimalIndex + 1, format.length);

    var decimals = formatSections[1] ? formatSections[1].length : 0;

    if (formatObject.alterer)
        num = formatObject.alterer(+num);
    num = gridHelpers.roundNumber(+num, decimals);
    var sign = 0 > +num ? -1 : 1;
    num = num.toString();
    num = num.replace(new RegExp(',', 'g'), '').replace('-', '');   //remove all commas: either the format didn't specify commas, or we will replace them later
    var dataDecimalIndex = ~num.indexOf('.') ? num.indexOf('.') : num.length;
    dataSections[0] = num.substring(0, dataDecimalIndex).split('').reverse().join('');
    if (dataDecimalIndex < format.length)
        dataSections[1] = num.substring(dataDecimalIndex + 1, num.length);
    else if (formatDecimalIndex < format.length)
        dataSections[1] = '';

    var wholeNums = [];
    var charsSinceComma = 0;
    if (formatSections[0].length) {
        var finalCharIndex, i;
        if (formatSections[0].length) {
            finalCharIndex = formatSections[0].length > dataSections[0].length ? formatSections[0].length : dataSections[0].length;
            for (i = 0; i < finalCharIndex; i++) {
                if (formatObject.shouldInsertSeparators && charsSinceComma === 3 && (dataSections[0].charAt(i) || formatSections[0].charAt(i) === '0')) {
                    wholeNums.push(',');
                    charsSinceComma = 0;
                }
                if (dataSections[0].charAt(i)) {
                    wholeNums.push(dataSections[0].charAt(i));
                    charsSinceComma++;
                }
                else if (formatSections[0].charAt(i) === '0') {
                    wholeNums.push('0');
                    charsSinceComma++;
                }
                else break;
            }
        }
        wholeNums = wholeNums.reverse().join('');

        var fractionNums = [];
        if (formatSections.length > 1) {
            finalCharIndex = formatSections[1].length > dataSections[1].length ? formatSections[1].length : dataSections[1].length;
            for (i = 0; i < finalCharIndex; i++) {
                if (formatSections[1].charAt(i) && dataSections[1].charAt(i))
                    fractionNums.push(dataSections[1].charAt(i));
                else if (formatSections[1].charAt(i) === '0')
                    fractionNums.push('0');
                else break;
            }
        }
        fractionNums = fractionNums.join('');

        var value = fractionNums.length ? wholeNums + '.' + fractionNums : wholeNums;
        return sign === -1 ? formatObject.prependedSymbol + '-' + value + formatObject.appendedSymbol : formatObject.prependedSymbol + value + formatObject.appendedSymbol;
    }
    return num;
}

/**
 * Given a format, this function will ensure it is valid and strip it of all invalid characters
 * @param {string} format - A string denoting the format a value displayed in the grid should have.
 * @returns {object} - Returns an object with the validated format string and metadata about how the value to be formatted should be treated
 */
function verifyFormat(format) {
    var formatSections = [];
    format = format.replace(/[^0#,.]/g , '');

    var decimalIndex = ~format.indexOf('.') ? format.indexOf('.') : format.length;
    var leadingChars = format.substring(0, decimalIndex);
    var shouldInsertSeparators = leadingChars.indexOf(',') > -1;
    leadingChars = leadingChars.replace(new RegExp(',', 'g'), '');

    formatSections[0] = leadingChars;
    if (decimalIndex < format.length)
        formatSections[1] = format.substring(decimalIndex + 1, format.length).split('').reverse().join('');

    for (var i = 0; i < formatSections.length; i++) {
        var zeroFound = false;
        for (var j = 0; j < formatSections[i].length; j++) {
            if (zeroFound && formatSections[i].charAt(j) !== '0')
                formatSections[i] = formatSections[i].substring(0, j) + '0' + formatSections[i].substring(j + 1, formatSections[i].length);
            else if (!zeroFound && formatSections[i].charAt(j) === '0')
                zeroFound = true;
        }
    }

    return {
        value: formatSections.length < 2 ? formatSections[0] : formatSections[0] + '.' + formatSections[1].split('').reverse().join(''),
        shouldInsertSeparators: shouldInsertSeparators,
        alterer: null,
        prependedSymbol: '',
        appendedSymbol: ''
    };
}

/**
 * Given a format string for either currency or percent, will normalize it as a decimal format
 * @param {string} format - A string denoting the currency or percent a value in a field should take.
 * @returns {object} - Returns an object containing the normalized format string, as well as metadata on how to treat the value to be formatted.
 */
function createCurrencyNumberOrPercentFormat(format) {
    var charStripper = '\\d{0,2}]',
        cPOrN = ~format.indexOf('P') ? 'P' : ~format.indexOf('N') ? 'N' : 'C';
    format = format.split(cPOrN);
    var wholeNums = verifyFormat(format[0]),
        re = new RegExp('[^' + cPOrN + charStripper, 'g');
    format = format[1].replace(re, '');
    var numDecimals = 2, newFormat;
    if (format.length)
        numDecimals = parseInt(format.substring(0,2));

    if (wholeNums.value)
        newFormat = numDecimals ? wholeNums.value + '.' : wholeNums.value;
    else if (numDecimals && cPOrN === 'C')
        newFormat = '0.';
    else if (numDecimals && cPOrN === 'P')
        newFormat = '00.';
    else if (numDecimals && cPOrN === 'N')
        newFormat = '0.';
    else newFormat = cPOrN === 'C' || cPOrN === 'N' ? '0' : '00';

    for (var i = 0; i < numDecimals; i++) {
        newFormat += '0';
    }
    return { value: newFormat,
        shouldInsertSeparators: wholeNums.shouldInsertSeparators,
        alterer: cPOrN === 'C' || cPOrN === 'N' ? null : x100,
        prependedSymbol: cPOrN === 'C' ? '$' : '',
        appendedSymbol: cPOrN === 'P' ? '%' : ''
    };
}

var gridFormatters = {
    validateCharacter,
    formatTimeCellData,
    formatDateCellData,
    formatNumericCellData,
    verifyFormat,
    createCurrencyNumberOrPercentFormat
};

export { gridFormatters };