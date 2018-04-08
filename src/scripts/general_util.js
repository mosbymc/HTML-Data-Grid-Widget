var groupMenuText = 'Drag and drop a column header here to group by that column',
    booleanOps = {
        strictEqual: 'eq',
        looseEqual: '==',
        strictNotEqual: 'neq',
        looseNotEqual: '!=',
        greaterThanOrEqual: 'gte',
        greaterThan: 'gt',
        lessThanOrEqual: 'lte',
        lessThan: 'lt',
        not: '!',
        contains: 'ct',
        notContains: 'nct'
    },
    jsTypes = {
        'function': 'function',
        'object': 'object',
        'boolean': 'boolean',
        'number': 'number',
        'symbol': 'symbol',
        'string': 'string',
        'undefined': 'undefined'
};

/**
 * Checks that a given variable is a DOM element
 * @param {object} node - The variable being checked
 * @returns {boolean} - Returns true if the variable is a DOM element, false if not
 */
function isDomElement(node) {
    return node && node instanceof Element && node instanceof Node && typeof node.ownerDocument === jsTypes.object;
}

/**
 * Checks that a given variable is a number and not NaN
 * @param {number} value - The number that is being checked
 * @returns {boolean} Returns true if the value is a number, false if not
 */
function isNumber(value) {
    return typeof value === jsTypes.number && value === value;
}

function isInteger(value) {
    return isNumber(value) && value % 1 === 0;
}

/**
 * Clones an object and returns a new object instance with the same values as the original
 * @param {object|*} gridData - The object to be cloned
 * @returns {*} - Returns a new instance of whatever type was given to the function
 */
function cloneGridData(gridData) { //Clones grid data so pass-by-reference doesn't mess up the values in other grids.
    if (gridData == null || typeof (gridData) !== jsTypes.object)
        return gridData;

    if (Object.prototype.toString.call(gridData) === '[object Array]')
        return cloneArray(gridData);

    var temp = {};
    Object.keys(gridData).forEach(function _cloneGridData(field) {
        temp[field] = cloneGridData(gridData[field]);
    });
    return temp;
}

/**
 * Copies the contents of an array into a new array instance
 * @param {Array} arr - The array to be copied
 * @returns {Array} - Returns a new array instance containing the values in the original
 */
function cloneArray(arr) {
    var length = arr.length,
        newArr = new arr.constructor(length),
        index = -1;
    while (++index < length) {
        newArr[index] = cloneGridData(arr[index]);
    }
    return newArr;
}

var dataTypes = {
    number: '^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]+)?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]+)?|0(?:\\.[0-9]+)?|(?:\\.[0-9]+)?)$',
    numberChar: '[\\d,\\.-]',
    integer: '^\\-?\\d+$',
    time: '^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$',
    timeChar: '[\\d\\.:\\ AMP]',
    date: '^(?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\2|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\5))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\8)|(?:(29|30)(\\/|-|\\.)' +
    '(0?[1,3-9]|1[0-2])\\11)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\15)|(?:(29)(\\/|-|\\.)(0?2))\\18)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
    '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\22|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\25)((?:1[6-9]|[2-9]\\d)?\\d{2}))))' +
    '|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\29)(29))))|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)' +
    '(?:(?:(?:(0?[13578]|1[02])\\33(31))|(?:(0?[1,3-9]|1[0-2])\\33(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\33(0?[1-9]|1\\d|2[0-8]))))$',
    datetime: '^(((?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\4|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\7))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\10)|(?:(29|30)(\\/|-|\\.)' +
    '(0?[1,3-9]|1[0-2])\\13)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\17)|(?:(29)(\\/|-|\\.)(0?2))\\20)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
    '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\24|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\27)' +
    '((?:1[6-9]|[2-9]\\d)?\\d{2}))))|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\31)(29))))' +
    '|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)(?:(?:(?:(0?[13578]|1[02])\\35(31))|(?:(0?[1,3-9]|1[0-2])\\35(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\35(0?[1-9]|1\\d|2[0-8])))))' +
    '(?: |T)((0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\44([0-5]\\d))?)?(?:(\\ [AP]M))$|([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\49([0-5]\\d))?)$))',
    dateChar: '\\d|\\-|\\/|\\.',
    dateTimeChar: '[\\d\\.:\\sAMP\\-\\/]'
};

var events = ['cellEditChange', 'beforeCellEdit', 'afterCellEdit', 'pageRequested', 'beforeDataBind', 'afterDataBind', 'columnReorder'];

var aggregates = { count: 'Count: ', average: 'Avg: ', max: 'Max: ', min: 'Min: ', total: 'Total: ' };

/**
 *
 * @param element
 * @param attributes
 * @param classes
 * @param styles
 * @return {HTMLElement}
 */
function createElement({ element = '', attributes = [], classes = [], styles = [] }) {
    var elem = document.createElement(element);
    attributes.forEach(attr => elem.setAttribute(attr.name, attr.value));
    classes.forEach(cl => elem.addClass(cl));
    styles.forEach(style => elem.style[style.name] = style.value);
    return elem;
}

/**
 * @description d
 * @param {HTMLElement} toInsert
 * @param {HTMLElement | string} before
 * @return {HTMLElement} Returns the element just inserted
 */
function insertBefore(toInsert, before) {
    if ('string' === typeof before) {
        if (before.indexOf('#') === 0) {
            document.body.insertBefore(toInsert, document.getElementById(before.substr(0)));
            return toInsert;
        }
        else if (before.indexOf('.') === 0) {
            var befores = document.querySelectorAll(before);
            befores.forEach(function _insertBefore(b) {
                document.body.insertBefore(toInsert, b);
            });
            return toInsert;
        }
    }
    else {
        return document.body.insertBefore(toInsert, before);
    }
}

/**
 * @description d
 * @param {HTMLElement} toInsert
 * @param {HTMLElement | string} after
 * @return {HTMLElement} Returns the inserted element
 */
function insertAfter(toInsert, after) {
    if ('string' === typeof after) {
        if (after.indexOf('#') === 0) {
            var afterElem = document.getElementById(after.substr(0));
            afterElem.parentNode.insertBefore(toInsert, afterElem.nextSibling);
            return toInsert;
        }
        else if (after.indexOf('.') === 0) {
            var afterElems = document.querySelectorAll(after);
            afterElems.forEach(function _insertAfter(el) {
                el.parentNode.insertBefore(toInsert, el.nextSibling);
            });
            return toInsert;
        }
    }
    else {
        return after.parentNode.insertBefore(toInsert, after.nextSibling);
    }
}

/**
 * @description d
 * @param {HTMLElement} toAppend
 * @param {HTMLElement | string} to
 * @return {HTMLElement} Returns the appended element
 */
function appendTo(toAppend, to) {
    if ('string' === typeof to) {
        if (to.indexOf('#') === 0) {
            var toElem = document.getElementById(to.substr(0));
            toElem.appendChild(toAppend);
            return toAppend;
        }
        else if (to.indexOf('.') === 0) {
            var toElems = document.querySelectorAll(to);
            toElems.forEach(function _insertAfter(el) {
                el.appendChild(toAppend);
            });
            return toAppend;
        }
    }
    else {
        return to.appendChild(toAppend);
    }
}

var general_util = {
    aggregates: aggregates,
    events: events,
    dataTypes: dataTypes,
    jsTypes: jsTypes,
    booleanOps: booleanOps,
    isDomElement: isDomElement,
    isNumber: isNumber,
    isInteger: isInteger,
    cloneGridData: cloneGridData,
    cloneArray: cloneArray,
    createElement: createElement,
    appendTo: appendTo,
    insertAfter: insertAfter,
    insertBefore: insertBefore
};

export { general_util };