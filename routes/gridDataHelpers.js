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

gridDataHelpers.expressionParser = (function _expressionParser() {
    var booleanExpressionTree = {
        init: function _init() {
            this.tree = null;
            this.context = null;
            this.rootNode = null;
            return this;
        }
    };

    booleanExpressionTree.setTree = function _setTree(tree) {
        this.queue = tree;
        this.rootNode = tree[this.queue.length - 1];
        return this;
    };
    booleanExpressionTree.createTree = function _createTree() {
        this.queue.pop();
        if (this.queue.length)
            this.rootNode.addChildren(this.queue);
    };
    booleanExpressionTree.filterCollection = function _filterCollection(collection) {
        return collection.filter(function collectionMap(curr) {
            this.context = curr;
            return this.rootNode.evaluate(curr);
        }, this);
    };
    booleanExpressionTree.internalGetContext = function _internalGetContext() {
        return this.context;
    };
    booleanExpressionTree.getContext = function _getContext() {
        return this.internalGetContext.bind(this);
    };
    booleanExpressionTree.isTrue = function _isTrue(item) {
        this.context = item;
        return this.rootNode.value;
    };

    var astNode = {
        createNode: function _createNode(node) {
            var operatorCharacteristics = getOperatorPrecedence(node);
            if (operatorCharacteristics) {
                this.operator = node;
                this.numberOfOperands = getNumberOfOperands(this.operator);
                this.precedence = operatorCharacteristics.precedence;
                this.associativity = operatorCharacteristics.associativity;
                this.children = [];
            }
            else {
                this.field = node.field;
                this.standard = node.value;
                this.operation = node.operation;
                this.dataType = node.dataType;
                this.context = null;
            }
            this._value = null;
            this.getContext = null;
            this.queue = null;
        }
    };

    astNode.createTree = function _createTree(queue) {
        this.queue = queue.reverse();
        this.tree = this.queue;
        this.addChildren(this.queue);
    };

    astNode.addChildren = function _addChildren(tree) {
        if (this.children && this.children.length < this.numberOfOperands) {
            var child = tree.pop();
            child.addChildren(tree);
            this.children.push(child);
            child = tree.pop();
            child.addChildren(tree);
            this.children.push(child);
        }
        return this;
    };

    astNode.addChild = function _addChild(child) {
        if (this.children && this.children.length < this.numberOfOperands)
            this.children.push(child);
        return this;
    };

    astNode.evaluate = function _evaluate() {
        if (this.children && this.children.length) {
            switch (this.operator) {
                case 'or':
                    return this.children[1].evaluate() || this.children[0].evaluate();
                case 'and':
                    return this.children[1].evaluate() && this.children[0].evaluate();
                case 'xor':
                    return !!(this.children[1].evaluate() ^ this.children[0].evaluate());
                case 'nor':
                    return !(this.children[1].evaluate() || this.children[0].evaluate());
                case 'nand':
                    return !(this.children[1].evaluate() && this.children[0].evaluate());
                case 'xnor':
                    return !(this.children[1].evaluate() ^ this.children[0].evaluate());
            }
        }
        else {
            var baseVal,
                curVal,
                initialVal = this.getContext()[this.field];

            switch(this.dataType) {
                case 'time':
                    curVal = getNumbersFromTime(initialVal);
                    baseVal = getNumbersFromTime(this.standard);

                    if (initialVal.indexOf('PM') > -1) curVal[0] += 12;
                    if (this.standard.indexOf('PM') > -1) baseVal[0] += 12;

                    curVal = convertTimeArrayToSeconds(curVal);
                    baseVal = convertTimeArrayToSeconds(baseVal);
                    break;
                case 'number':
                    curVal = parseFloat(initialVal);
                    baseVal = parseFloat(this.standard);
                    break;
                case 'date':
                    curVal = new Date(initialVal);
                    baseVal = new Date(this.standard);
                    break;
                case 'boolean':
                    curVal = initialVal.toString();
                    baseVal = this.standard.toString();
                    break;
                default:
                    curVal = initialVal;
                    baseVal = this.standard;
                    break;
            }

            this._value = comparator(curVal, baseVal, this.operation);
            return this._value;
        }
    };

    astNode.getValue = function _getValue() {
        if (this._value == null)
            this._value = this.evaluate();
        return this._value;
    };

    Object.defineProperty(astNode, 'value', {
        get: function _getValue() {
            if (!this._value) {
                this._value = this.evaluate();
            }
            return this._value;
        }
    });

    function getNodeContext(bet) {
        return bet.internalGetContext.bind(bet);
    }

    function createFilterTreeFromFilterObject(filterObject) {
        var ret = Object.create(booleanExpressionTree);
        ret.init();
        var operandStack = Object.create(stack);
        operandStack.init();
        var queue = [],
            topOfStack;

        iterateFilterGroup(filterObject, operandStack, queue, getNodeContext(ret));

        while (operandStack.length()) {
            topOfStack = operandStack.peek();
            if (topOfStack.operator !== '(')
                queue.push(operandStack.pop());
            else operandStack.pop();
        }

        ret.setTree(queue);
        ret.createTree();
        return ret;
    }

    function iterateFilterGroup(filterObject, stack, queue, contextGetter) {
        var conjunction = filterObject.conjunct,
            idx = 0,
            topOfStack;

        while (idx < filterObject.filterGroup.length) {
            if (idx > 0) {
                var conjunctObj = Object.create(astNode);
                conjunctObj.createNode(conjunction);
                pushConjunctionOntoStack(conjunctObj, stack, queue);
            }
            if (filterObject.filterGroup[idx].conjunct) {
                var paren = Object.create(astNode);
                paren.createNode('(');
                stack.push(paren);
                iterateFilterGroup(filterObject.filterGroup[idx], stack, queue, contextGetter);
                while (stack.length()) {
                    topOfStack = stack.peek();
                    if (topOfStack.operator !== '(')
                        queue.push(stack.pop());
                    else {
                        stack.pop();
                        break;
                    }
                }
            }
            else {
                var leafNode = Object.create(astNode);
                leafNode.createNode(filterObject.filterGroup[idx]);
                leafNode.getContext = contextGetter;
                queue.push(leafNode);
            }
            ++idx;
        }
    }

    function pushConjunctionOntoStack(conjunction, stack, queue) {
        while (stack.length()) {
            var topOfStack = stack.peek();
            if ((conjunction.associativity === associativity.LTR && conjunction.precedence <= topOfStack.precedence)
                || (conjunction.associativity === associativity.RTL && conjunction.precedence < topOfStack.precedence))
                queue.push(stack.pop());
            else
                break;
        }
        stack.push(conjunction);
    }

    var stack = {
        init: function _init() {
            this.data = [];
            this.top = 0;
        },
        push: function _push(item) {
            this.data[this.top++] = item;
        },
        pop: function _pop() {
            return this.data[--this.top];
        },
        peek: function _peek() {
            return this.data[this.top - 1];
        },
        clear: function _clear() {
            this.top = 0;
        },
        length: function _length() {
            return this.top;
        }
    };

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

    function getNumberOfOperands(operator) {
        switch (operator) {
            case '!':
                return 1;
            case '(':
            case ')':
                return 0;
            default:
                return 2;
        }
    }

    var associativity = { RTL: 1, LTR: 2 };

    function getOperatorPrecedence(operator) {
        switch (operator) {
            case '!':
                return {
                    precedence: 1,
                    associativity: associativity.LTR
                };
            case 'and':
                return {
                    precedence: 2,
                    associativity: associativity.RTL
                };
            case 'xor':
                return {
                    precedence: 3,
                    associativity: associativity.RTL
                };
            case 'or':
                return {
                    precedence: 4,
                    associativity: associativity.RTL
                };
            case '(':
            case ')':
                return {
                    precedence: null,
                    associativity: null
                };
            default:
                return null;
        }
    }

    function getNumbersFromTime(val) {
        var re = /^(0?[1-9]|1[012])(?:(?:(:|\.)([0-5]\d))(?:\2([0-5]\d))?)?(?:(\ [AP]M))$|^([01]?\d|2[0-3])(?:(?:(:|\.)([0-5]\d))(?:\7([0-5]\d))?)$/;
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

    function convertTimeArrayToSeconds(timeArray) {
        var hourVal = timeArray[0] === 12 || timeArray[0] === 24 ? timeArray[0] - 12 : timeArray[0];
        return 3660 * hourVal + 60*timeArray[1] + timeArray[2];
    }

    return {
        createFilterTreeFromFilterObject: createFilterTreeFromFilterObject
    };
})();


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