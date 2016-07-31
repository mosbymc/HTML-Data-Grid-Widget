/**
 * Created by Mark.Mosby on 3/2/2016.
 */
var gridDataHelpers = {};

gridDataHelpers.groupColumns = function groupColumns(data, field) {
    var groupings = {};
    for (var i = 0; i < data.length; i++) {
        if (groupings[data[i][field]])
            groupings[data[i][field]].push(data[i]);
        else
            groupings[data[i][field]] = [data[i]];
    }

    var groupedData = [];
    for (var group in groupings) {
        groupedData = groupedData.concat(groupings[group]);
    }

    return { groupings: groupings, groupedData: groupedData };
};

gridDataHelpers.filterGridData = function filterGridData(filterType, value, field, dataType, gridData) {
    var filteredData = [], curVal, baseVal;

    for (var i = 0, length = gridData.length; i < length; i++) {
        if (dataType === 'time') {
            curVal = gridDataHelpers.getNumbersFromTime(gridData[i][field]);
            baseVal = gridDataHelpers.getNumbersFromTime(value);

            if (gridData[i][field].indexOf('PM') > -1)
                curVal[0] += 12;
            if (value.indexOf('PM') > -1)
                baseVal[0] += 12;

            curVal = convertTimeArrayToSeconds(curVal);
            baseVal = convertTimeArrayToSeconds(baseVal);
        }
        else if (dataType === 'number') {
            curVal = parseFloat(gridData[i][field]);
            baseVal = parseFloat(value);
        }
        else if (dataType === 'date') {
            curVal = new Date(gridData[i][field]);
            baseVal = new Date(value);
        }
        else {
            curVal = gridData[i][field];
            baseVal = value;
        }
        if (gridDataHelpers.comparator(curVal, baseVal, filterType))
            filteredData.push(gridData[i]);
    }
    return filteredData;
};

gridDataHelpers.comparator = function comparator(val, base, type) {
    switch (type) {
        case 'eq':
            return val === base;
        case 'neq':
            return val !== base;
        case 'gte':
            return val >= base;
        case 'gt':
            return val > base;
        case 'lte':
            return val <= base;
        case 'lt':
            return val < base;
        case 'ct':
            return ~val.toLowerCase().indexOf(base.toLowerCase());
        case 'nct':
            return !~val.toLowerCase().indexOf(base.toLowerCase());
    }
};

gridDataHelpers.sortGridData = function sortGridData (sortedItems, gridData, columns) {
    for (var i = 0; i < sortedItems.length; i++) {
        if (i === 0)
            gridData = gridDataHelpers.mergeSort(gridData, sortedItems[i], columns[sortedItems[i].field].type || 'string');
        else {
            var sortedGridData = [];
            var itemsToSort = [];
            for (var j = 0; j < gridData.length; j++) {
                if (!itemsToSort.length || compareValuesByType(itemsToSort[0][sortedItems[i - 1].field], gridData[j][sortedItems[i - 1].field], columns[sortedItems[i - 1].field].type))
                    itemsToSort.push(gridData[j]);
                else {
                    if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                    else sortedGridData = sortedGridData.concat(gridDataHelpers.mergeSort(itemsToSort, sortedItems[i], columns[sortedItems[i].field].type || 'string'));
                    itemsToSort.length = 0;
                    itemsToSort.push(gridData[j]);
                }
                if (j === gridData.length - 1)
                    sortedGridData = sortedGridData.concat(gridDataHelpers.mergeSort(itemsToSort, sortedItems[i], columns[sortedItems[i].field].type || 'string'));
            }
            gridData = sortedGridData;
        }
    }
    return gridData;
};

gridDataHelpers.mergeSort = function mergeSort(data, field, type) {
    if (data.length < 2) return data;
    var middle = parseInt(data.length / 2);
    var left   = data.slice(0, middle);
    var right  = data.slice(middle, data.length);
    return gridDataHelpers.merge(gridDataHelpers.mergeSort(left, field, type), gridDataHelpers.mergeSort(right, field, type), field, type);
};

gridDataHelpers.merge = function merge(left, right, sortObj, type) {
    var result = [], leftVal, rightVal;
    while (left.length && right.length) {
        if (type === 'time') {
            leftVal = gridDataHelpers.getNumbersFromTime(left[0][sortObj.field]);
            rightVal = gridDataHelpers.getNumbersFromTime(right[0][sortObj.field]);

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
        gridDataHelpers.comparator(leftVal, rightVal, operator) ? result.push(left.shift()) : result.push(right.shift());
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
};

gridDataHelpers.getNumbersFromTime = function getNumbersFromTime(val) {
    var re = new RegExp(dataTypes["time"]);
    if (!re.test(val))
        return [];
    var timeGroups = re.exec(val);
    var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
    var minutes, seconds, meridiem, retVal = [];
    if (timeGroups[2]) {
        minutes = +timeGroups[3] || 0;
        seconds = +timeGroups[4]  || 0;
        meridiem = timeGroups[5] || null;
    }
    else if (timeGroups[6]) {
        minutes = +timeGroups[8] || 0;
        seconds = +timeGroups[9] || 0;
    }
    else{
        minutes = 0;
        seconds = 0;
    }
    retVal.push(hours);
    retVal.push(minutes);
    retVal.push(seconds);
    if (meridiem)
        retVal.push(meridiem);
    return retVal;
};

function convertTimeArrayToSeconds(timeArray) {
    var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
    return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
}

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
            if (typeof date1 === 'object' && typeof date2 === 'object' && date1 !== date1 && date2 !== date2)
                return true;    //invalid date values - creating a date from both values resulted in either NaN or 'Invalid Date', neither of which are equal to themselves.
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

var dataTypes = {
    string: "\.*",
    number: "^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",
    boolean: "^true|false$",
    numeric: "^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",
    numericTemp: "^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]{0,2})?|0(?:\\.[0-9]{0,2})?|(?:\\.[0-9]{1,2})?)$",
    integer: "^\\-?\\d+$",
    integerTemp: "^\\-?\\d+$",
    time: "^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$",
    USDate: "^(?=\\d)(?:(?:(?:(?:(?:0?[13578]|1[02])(\\/|-|\\.)31)\\1|(?:(?:0?[1,3-9]|1[0-2])(\\/|-|\\.)(?:29|30)\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})|(?:0?2(\\/|-|\\.)29\\3(?:(?:(?:1[6-9]|[2-9]\\d)" +
    "?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(?:0?[1-9]|1\\d|2[0-8])\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2}))($|\\ (?=\\d)))?$",
    EUDate: "^((((31\\/(0?[13578]|1[02]))|((29|30)\\/(0?[1,3-9]|1[0-2])))\\/(1[6-9]|[2-9]\\d)?\\d{2})|(29\\/0?2\\/(((1[6-9]|[2-9]\\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))" +
    "|(0?[1-9]|1\\d|2[0-8])\\/((0?[1-9])|(1[0-2]))\\/((1[6-9]|[2-9]\\d)?\\d{2}))$",
    dateTime: "^((?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\3|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\6))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\9)|(?:(29|30)(\\/|-|\\.)(0?[1,3-9]|1[0-2])\\12)))))" +
    "((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)29\\16)|(?:(29)(\\/|-|\\.)(0?2))\\18)(?:(?:(1[6-9]|[2-9]\\d)?(0[48]|[2468][048]|[13579][26])|((?:16|[2468][048]|[3579][26])00))))" +
    "|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\24|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\27)((?:1[6-9]|[2-9]\\d)?\\d{2})))\\ ((0?[1-9]|1[012])" +
    "(?:(?:(:|\\.)([0-5]\\d))(?:\\32([0-5]\\d))?)?(?:(\\ [AP]M))$|([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\37([0-5]\\d))?)$)$"
};

module.exports = gridDataHelpers;