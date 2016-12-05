

//https://jsfiddle.net/jmitchell/zwtn1tdu/

var dataStore = (function _createDataStore() {
    var store = {},
        _dataStore = {
            instanceId: -1,
            createDataStore: function _createDataStore(data) {
                var instanceId = generateId();
                store[instanceId] = {
                    state: cloneGridData(data),
                    stateHistory: [],
                    instance: {}
                };

                createInstanceMethods(instanceId);

                return store[instanceId].instance;
            },
            expression: {
                create: function _create(field, operator, value, dataType) {
                    return Object.create(exsp).createExpression(field, operator, value, dataType);
                }
            },
            from: function _from(data) {
                return createNewQueryableInstance(data, [identity]);
            }
        };

    var queryable = {
        //TODO: not sure that this should be kept in here as is - gives too much control over the internal state
        //TODO: of the object to the user
        forEach: function _forEach(callback, context) {
            return dataHandler.bind(Object.create(queryable)._init(this._data, this._funcs))(function _forEachThunk(data) { return data.forEach(callback, context); });
        },
        map: function _map(callback, context) {
            return dataHandler.bind(Object.create(queryable)._init(this._data, this._funcs))(function _mapThunk(data) { return data.map(callback, context); });
        },
        reduce: function _reduce(callback, initial) {
            return dataHandler.bind(Object.create(queryable)._init(this._data, this._funcs))(function _reduceThunk(data) { return data.reduce(callback, initial); });
        },
        reduceRight: function _reduceRight(callback, initial) {
            return dataHandler.bind(Object.create(queryable).init(this._data, this._funcs))(function _reduceRightThunk(data) { return data.reduceRight(callback, initial); });
        },
        filter: function _filter(callback, context) {
            return dataHandler.bind(Object.create(queryable)._init(this._data, this._funcs))(function _filterThunk(data) { return data.filter(callback, context); });
        },
        reverse: function _reverse() {
            return dataHandler.bind(Object.create(queryable)._init(this._data, this._funcs))(Array.prototype.reverse);
        },
        some: function _some(callback, context) {
            return this._data.some(callback, context);
        },
        every: function _every(callback, context) {
            return this._data.every(callback, context);
        },
        /*take: function *_take(amount = 1) {
         if (!amount) return;    //TODO: should this return empty array or undefined?
         var idx = 0;
         for (let i of this._data) {
         yield i;
         if (++i === amount) break;
         }

         function* takeIterator(xs, n) {
         if (n === 0) return;
         let i = 0;
         for (let x of xs) {
         yield x;
         if (++i === n) break;
         }
         }

         var iterator = function(a, n) {
         var current = 0,
         l = a.length;
         return function() {
         end = current + n;
         var part = a.slice(current,end);
         if(end > l) {
         end = end % l;
         part = part.concat(a.slice(0, end));
         }
         current = end;
         return part;
         };
         };
         },*/
        toArray: function _toArray() {
            return this._data.map(function _shallowCloner(item) { return item; });
        },
        toSet: function _toSet() {
            return new Set(this._data);
        },
        select: function _select(fields) {
            function _select_(data) {
                var retArr = [];
                if (typeof fields !== 'string') return data = ifElse(not(isArray), wrap, identity, data);
                fields = fields.split(',');
                if (data !== undefined && (typeof data === 'object' || typeof data === 'function')) {
                    if (fields.length === 1 && fields[0].trim() === '*')
                        retArr = data;
                    else {
                        ifElse(not(isArray), wrap, identity, data).forEach(function _selectFields(item) {
                            var retObj = {};
                            fields.forEach(function _getField(f) {
                                retObj[f.trim()] = item[f.trim()];
                            });
                            retArr.push(retObj);
                        });
                    }
                }
                else retArr = undefined;
                return retArr;
            }
            return createNewQueryableInstance(this.data, this._funcs.concat([_select_]));
        },
        insertInto: function _insertInto(namespace) {
            function _insertDataInto() {

            }
            var data = this._data;

            var val = [store[instanceId].state].concat(namespace.split('.')).reduce(function _findProperty(prev, curr) {
                if (typeof prev[curr] !== 'object' && typeof prev[curr] !== 'function') return false;
                return prev[curr];
            });

            return createNewQueryableInstance(this.data, this._funcs.concat([_insertDataInto]));
        },
        where: function _where(field, operator, value) {
            var filterExpression = exsp.isPrototypeOf(field) ? field : Object.create(exsp).createExpression(field, operator, value);

            function _data(data) {
                data = ifElse(not(isArray), wrap, identity, data);
                var expressionTree = expressionParser.createFilterTreeFromFilterObject(filterExpression._expression),
                    retData = [],
                    idx = 0;
                for (var item of this) {
                    retData = retData.concat(expressionTree.filterCollection(wrap(item), idx).filteredData);
                    ++idx;
                }
                return retData;
            }

            function filterAppend(conjunct) {
                return function _filterAppend(field, operator, value) {
                    filterExpression = filterExpression[conjunct](field, operator, value);

                    //here we don't want the last filter 'data func' in the list of data funcs since we're just appending expressions to
                    //an already existing filter tree; otherwise we'd run each filter func n - x - 1 times
                    //where n = total number of where filters, x = the index of the current where filter within collection
                    var retObj = createNewQueryableInstance(this.data, this._funcs.concat([_data]));
                    return Object.defineProperties(
                        retObj, {
                            'and': {
                                value: filterAppend('and'),
                                writable: false,
                                configurable: false
                            },
                            'or': {
                                value: filterAppend('or'),
                                writable: false,
                                configurable: false
                            },
                            'nand': {
                                value: filterAppend('nand'),
                                writable: false,
                                configurable: false
                            },
                            'nor': {
                                value: filterAppend('nor'),
                                writable: false,
                                configurable: false
                            },
                            'xand': {
                                value: filterAppend('xand'),
                                writable: false,
                                configurable: false
                            },
                            'xor': {
                                value: filterAppend('xor'),
                                writable: false,
                                configurable: false
                            }
                        }
                    );
                }
            }

            var retObj = createNewQueryableInstance(this.data, this._funcs.concat([_data]));
            return Object.defineProperties(
                retObj, {
                    'and': {
                        value: filterAppend('and'),
                        writable: false,
                        configurable: false
                    },
                    'or': {
                        value: filterAppend('or'),
                        writable: false,
                        configurable: false
                    },
                    'nand': {
                        value: filterAppend('nand'),
                        writable: false,
                        configurable: false
                    },
                    'nor': {
                        value: filterAppend('nor'),
                        writable: false,
                        configurable: false
                    },
                    'xand': {
                        value: filterAppend('xand'),
                        writable: false,
                        configurable: false
                    },
                    'xor': {
                        value: filterAppend('xor'),
                        writable: false,
                        configurable: false
                    }
                }
            );
        },
        groupBy: function _groupBy(fields) {
            function groupData(data) {
                fields = Array.isArray(fields) ? fields : fields.split(',').map(function _trimmer(field) { return field.trim(); });
                var sortedData = sortData(ifElse(not(isArray), wrap, identity, data), fields),
                    retData = [];

                sortedData.forEach(function _groupDataByField(item) {
                    var grpArr = retData;
                    fields.forEach(function _createGroupsByFields(field) {
                        var group = findGroup(grpArr, item[field.key]);
                        if (!grpArr.includes(group)) grpArr.push(group);
                        grpArr = group[item[field.key]];
                    });
                    grpArr.push(item);
                });

                return retData;

                function sortData(data, fields) {
                    var sortedData = data;
                    fields.forEach(function _sortItems(field, index) {
                        if (index === 0) sortedData = mergeSort(data, field.key, field.direction, field.dataType);
                        else {
                            var sortedSubData = [],
                                itemsToSort = [];
                            sortedData.forEach(function _sortData(item, idx) {
                                var prevField = fields[index - 1],
                                    prevVal = itemsToSort.length ? itemsToSort[0][prevField] : null;
                                if (!itemsToSort.length || comparator(dataTypeValueNormalizer(field.dataType, prevVal), dataTypeValueNormalizer(field.dataType, sortedData[idx][prevField]), 'eq'))
                                    itemsToSort.push(item);
                                else {
                                    if (itemsToSort.length === 1) sortedSubData = sortedSubData.concat(itemsToSort);
                                    else sortedSubData = sortedSubData.concat(mergeSort(itemsToSort, field.key, field.direction, field.dataType));
                                    sortedSubData.length = 0;
                                    sortedSubData.push(sortedData[idx]);
                                }
                                if (idx === sortedData.length - 1)
                                    sortedSubData = sortedSubData.concat(mergeSort(itemsToSort, sortedSubData[idx], field.dataType));
                            });
                            sortedData = sortedSubData;
                        }
                    });
                    return sortedData;
                }

                function mergeSort(data, field, direction, dataType) {
                    if (data.length < 2) return data;
                    var middle = parseInt(data.length / 2);
                    return merge(mergeSort(data.slice(0, middle), field, direction, dataType), mergeSort(data.slice(middle, data.length), field, direction, dataType), field, direction, dataType);
                }

                function merge(left, right, field, direction, dataType) {
                    if (!left.length) return right;
                    if (!right.length) return left;

                    var operator = direction === 'asc' ? 'lte' : 'gte';
                    if (comparator(dataTypeValueNormalizer(dataType || typeof left[0][field], left[0][field]), dataTypeValueNormalizer(dataType || typeof right[0][field], right[0][field]), operator))
                        return [cloneGridData(left[0])].concat(merge(left.slice(1, left.length), right, field, direction, dataType));
                    else  return [cloneGridData(right[0])].concat(merge(left, right.slice(1, right.length), field, direction, dataType));
                }

                function findGroup(arr, field) {
                    var grp;
                    if (arr.some(function _findGroup(group) {
                            if (group[field]) {
                                grp = group;
                                return true;
                            }
                        }))
                        return grp;
                    else {
                        grp = {};
                        grp[field] = [];
                        return grp;
                    }
                }
            }

            return createNewQueryableInstance(this.data, this._funcs.concat([groupData]));
        },
        distinct: function _distinct(fields) {
            var filterFunc;
            if (typeof fields === 'function') {
                filterFunc = fields;
            }
            else if (typeof fields === 'string') {
                filterFunc = function _filterFunc(data) {
                    data = ifElse(not(isArray), wrap, identity, data);
                    fields = fields.split(',');
                    var fieldStr = '',
                        objMap = {};

                    data.forEach(function _getKeys(item, idx) {
                        fields.forEach(function _getValues(field) {
                            fieldStr += item[field.trim()].toString();
                        });
                        if (!(fieldStr in objMap)) objMap[fieldStr] = idx;
                        fieldStr = '';
                    });

                    return Object.keys(objMap).map(function _returnMappedData(key) {
                        return data[objMap[key]];
                    });
                }
            }
            else {
                filterFunc = function _filterFunc(data) {
                    data = ifElse(not(isArray), wrap, identity, data);
                    return data.filter(function _findUniques(item, idx) {
                        return data.indexOf(item) === idx;
                    });
                }
            }

            return createNewQueryableInstance(this.data, this._funcs.concat([filterFunc]));
        },
        flatten: function _flatten() {
            return createNewQueryableInstance(this._data, this._funcs.concat([]));

            function flattenData(data) {
                data = ifElse(not(isArray), wrap, identity, data);
                return Array.prototype.concat.apply([], data);
            }
        },
        deepFlatten: function _deepFlatten() {
            return createNewQueryableInstance(this.data, this._funcs.concat([flattenData]));
            function turnObjectsIntoArrays(data) {
                if (Object.keys(data).every(function _isMadeOfArrays(key) {
                        return Array.isArray(data[key]);
                    }))
                {
                    return Object.keys(data).map(function _transmorgifier(key) {
                        return dataFlattener(data[key]);
                    });
                }
                return data;
            }

            function dataFlattener(data) {
                return data.map(function _dataFlattener(item) {
                    if (!Array.isArray(item) && typeof item === 'object')
                        return turnObjectsIntoArrays(item);
                    return item;
                });
            }

            function flattenData(data) {
                return [].concat.apply([], dataFlattener(data).map(function _flattenData(item) {
                    if (Array.isArray(item))
                        return flattenData(item);
                    return item;
                }));
            }
        },
        _getData: function _getData() {
            //Need to bind the function that's being passed to Array.prototype.reduce here
            //because otherwise the context inside each func will be the realm and no
            //the current context outside of the reducer.

            var reducerFunc = function _executePriorFuncs(allData, func) {
                this._data = func.call(this, allData);
                return this._data;
            };
            reducerFunc = reducerFunc.bind(this);
            var data = this._funcs.reduce(reducerFunc, this._data);
            this._dataComputed = true;
            this._funcs = [identity];
            return data;

        },
        take: function *_take() {
            let index = -1;
            for (let value of this._iterator) {
                if (++index >= count)
                    break;
                yield value;
            }
        },
        [Symbol.iterator]: function *_iterateCollection() {
            yield *this._iterator;
        }
        /*[Symbol.iterator]: function *iterateCollection() {
         var count = 0;
         while (count < this._data.length)
         yield this._data[count];
         },*/
    };

    function createNewQueryableInstance(data, funcs) {
        var obj = Object.create(queryable);
        obj._data = data;
        obj._dataComputed = false;
        obj._funcs = funcs;
        obj._iterator = it.bind(obj)();
        return addGetter(obj);
    }

    //Should a call to .data mutate the current obj's data, or only find the existing data and return it?
    //If it mutates the existing object's data, then I'd need to remove all existing 'funcs' from the array and
    //let it start fresh. The good thing about this approach is that once data is called, if a consumer later
    //appends more mutating functions to it, the functions that were run up to the point of getting the data
    //wouldn't need to be run again.

    //I also should add a flag that is checked whenever .data is called. If set, then data is set, otherwise,
    //I need to calculate it.
    function addGetter(obj) {
        return Object.defineProperty(
            obj,
            'data', {
                get: function _data() {
                    if (!this._dataComputed)
                        return this._getData();
                    return this._data;
                }
            }
        );
    }

    function *it() {
        for (let item of this._data) {
            yield item;
        }
    }

    function dataHandler(func) {
        func(this._data);
        return this;
    }

    var exsp = {
        createExpression: function _createExpression(field, operator, value, dataType) {
            this._expression = Object.create(booleanExpression).createNewExpression(field, value, operator, dataType);
            return this;
        },
        and: function _and(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'and');
        },
        or: function _or(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'or');
        },
        nor: function _nor(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'nor');
        },
        nand: function _nand(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'nand');
        },
        xor: function _xor(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'xor');
        },
        xand: function _xand(field, operator, value, dataType) {
            return this._addNewFilter(field, operator, value, dataType, 'xand');
        },
        _addNewFilter: function _addNewFilter(field, operator, value, dataType, conjunct) {
            if (exsp.isPrototypeOf(field)) return Object.create(exsp)._conjoinExpressions(field._expression, this._expression, conjunct);
            else return Object.create(exsp)._appendNewFilter(this._expression, field, operator, value, dataType, conjunct);
        },
        _appendNewFilter: function _appendNewFilter(expression, field, operator, value, dataType, conjunct) {
            this._expression = Object.create(booleanExpression).appendNewExpression(expression, field, value, operator, dataType, conjunct);
            return this;
        },
        _conjoinExpressions: function _conjoinExpressions(newExpression, extantExpression, conjunct) {
            this._expression = Object.create(booleanExpression).conjoinExpressions(extantExpression, newExpression, conjunct);
            return this;
        },
        _expression: null,
    };

    var booleanExpression = {
        createNewExpression: function _createNewExpression(field, value, operator, dataType) {
            var filterObject = Object.create(filterObj);
            this.conjunct = 'and';
            if (typeof field === 'function') this.filterGroup = Array.prototype.concat([filterObject.createFunctionExpression(field)]);
            else this.filterGroup = [].concat([filterObject.createTokenExpression(field, value, operator, dataType)]);
            return this;
        },
        conjoinExpressions: function _conjoinExpressions(filter1, filter2, conjunct) {
            this.conjunct = conjunct;
            this.filterGroup = [filter1, filter2];
            return this;
        },
        appendNewExpression: function _appendNewExpression(expression, field, value, operator, dataType, conjunct) {
            var filterObject = Object.create(filterObj),
                filter = typeof field === 'function' ? filterObject.createFunctionExpression(field) : filterObject.createTokenExpression(field, value, operator, dataType),
                lastFilter = findLastFilter(expression);
            if (expression.filterGroup.length < 2) {
                this.conjunct = conjunct;
                this.filterGroup = [].concat(expression.filterGroup).concat([filter]);
            }
            else {
                this.conjunct = expression.conjunct;
                this.filterGroup = expression.filterGroup.slice(0, expression.filterGroup.length - 1).concat({ conjunct: conjunct, filterGroup: [lastFilter, filter] });
            }
            return this;
        },
        conjunct: null,
        filterGroup: []
    };

    function findLastFilter(filters) {
        if (filters.filterGroup) {
            var i = filters.filterGroup.length - 1;
            while (i > -1) {
                if (filters.filterGroup[i].filterGroup)
                    return findLastFilter(filters.filterGroup[i]);
                --i;
            }
        }
        return filters[filters.length - 1];
    }

    var filterObj = {
        createTokenExpression: function _createTokenExpression(field, value, operation, dataType) {
            if (this.operation) return this;
            this.field = field;
            this.value = value;
            this.operation = operation;
            this.dataType = dataType || null;
            return this;
        },
        createFunctionExpression: function _createFunctionExpression(operator) {
            this.operation = operator;
            return this;
        },
        field: null,
        value: null,
        operation: null,
        dataType: null
    };

    function identity(item) { return item; }

    function ifElse(predicate, ifFunc, elseFunc, data) {
        if (predicate(data))
            return ifFunc(data);
        return elseFunc(data);
    }

    function wrap(data) {
        return [data];
    }

    function isArray(data) {
        return Array.isArray(data);
    }

    function not(fn) {
        return function _not(item) {
            return !fn(item);
        }
    }

    function createInstanceMethods(instanceId) {
        var instance = store[instanceId].instance;

        instance.from = function _from(namespace) {
            var val = [store[instanceId].state].concat(namespace.split('.')).reduce(function _findProperty(prev, curr) {
                if (typeof prev[curr] !== 'object' && typeof prev[curr] !== 'function') return false;
                return prev[curr];
            });

            return createNewQueryableInstance(val, [identity]);
        };

        instance.insert = function _insert(item) {
            return createNewQueryableInstance(item, [identity]);
        };
    }

    return Object.create(_dataStore);
})();

function cloneGridData(gridData) { //Clones grid data so pass-by-reference doesn't mess up the values in other grids.
    if (gridData == null || typeof (gridData) !== 'object')
        return gridData;

    if (Object.prototype.toString.call(gridData) === '[object Array]')
        return cloneArray(gridData);

    var temp = {};
    Object.keys(gridData).forEach(function _cloneGridData(field) {
        temp[field] = cloneGridData(gridData[field]);
    });
    return temp;
}

function cloneArray(arr) {
    var length = arr.length,
        newArr = new arr.constructor(length),
        index = -1;
    while (++index < length) {
        newArr[index] = cloneGridData(arr[index]);
    }
    return newArr;
}

generateId = (function uid(seed) {
    return function _generateId() {
        ++seed;
        return seed.toString();
    };
})(-1);

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
            return !!~val.toString().toLowerCase().indexOf(base.toString().toLowerCase());
        case 'nct':
            return !~val.toString().toLowerCase().indexOf(base.toString().toLowerCase());
        case 'startsWith':
            return val.toString().substring(0, base.toString().length - 1) === base.toString();
        case 'endsWith':
            return val.toString().substring((val.length - base.toString().length), val.length - 1) === base.toString();
    }
}

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
            return parseFloat(val);
        case 'date':
            return new Date(val);
        case 'boolean':
        default:
            return val.toString();
    }
}

var expressionParser = (function _expressionParser() {
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
        },
        associativity = { RTL: 1, LTR: 2 },
        booleanExpressionTree = {
            init: function _init() {
                this.tree = null;
                this.context = null;
                this.rootNode = null;
                this.collection = null;
                this.collectionIndex = null;
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
        return this;
    };
    booleanExpressionTree.filterCollection = function _filterCollection(collection, startingIdx) {
        this.rootNode._value = null;
        var dataMap = [];
        this.collection = collection;
        startingIdx = startingIdx || 0;
        return {
            filteredData: collection.filter(function collectionFilter(curr) {
                this.context = curr;
                this.collectionIndex = startingIdx;
                var isTrue = this.rootNode.evaluate();
                if (isTrue) dataMap.push(startingIdx);
                ++startingIdx;
                return this.rootNode.value;
            }, this),
            filteredDataMap: dataMap
        };
    };
    booleanExpressionTree.internalGetContext = function _internalGetContext() {
        return this.context;
    };
    booleanExpressionTree.getContext = function _getContext() {
        return this.internalGetContext.bind(this);
    };
    booleanExpressionTree.getCollectionContext = function _getCollectionContext() {
        return {
            collection: this.collection,
            index: this.collectionIndex
        };
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
                if (typeof node === 'function') {
                    this.operation = node;
                    this.context = null;
                }
                else {
                    this.field = node.field;
                    this.standard = node.value;
                    this.operation = node.operation;
                    this.dataType = node.dataType;
                    this.context = null;
                }
            }
            this._value = null;
            this.getContext = null;
            this.getCollectionContext = null;
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
                case 'or': return this.children[1].evaluate() || this.children[0].evaluate();
                case 'and': return this.children[1].evaluate() && this.children[0].evaluate();
                case 'xor': return !!(this.children[1].evaluate() ^ this.children[0].evaluate());
                case 'nor': return !(this.children[1].evaluate() || this.children[0].evaluate());
                case 'nand': return !(this.children[1].evaluate() && this.children[0].evaluate());
                case 'xnor': return !(this.children[1].evaluate() ^ this.children[0].evaluate());
            }
        }
        else {
            if (typeof this.operation === 'function') {
                var collectionContext = this.collectionContext();
                this._value = this.operation(this.getContext(), collectionContext.index, collectionContext.collection);
            }
            else {
                this._value = comparator(dataTypeValueNormalizer(this.dataType == null ? typeof this.getContext()[this.field] : this.dataType, this.getContext()[this.field]),
                    dataTypeValueNormalizer(this.dataType == null ? typeof this.getContext()[this.field] : this.dataType, this.standard), this.operation);
            }
            return this._value;
        }
    };

    astNode.getValue = function _getValue() {
        if (this._value == null) this._value = this.evaluate();
        return this._value;
    };

    Object.defineProperty(astNode, 'value', {
        get: function _getValue() {
            if (this._value == null) this._value = this.evaluate();
            return this._value;
        }
    });

    function getNodeContext(bet) {
        return bet.internalGetContext.bind(bet);
    }

    function getCollectionContext(bet) {
        return bet.getCollectionContext.bind(bet);
    }

    function createFilterTreeFromFilterObject(filterObject) {
        var ret = Object.create(booleanExpressionTree);
        ret.init();
        var operandStack = Object.create(stack);
        operandStack.init();
        var queue = [],
            topOfStack;

        iterateFilterGroup(filterObject, operandStack, queue, getNodeContext(ret), getCollectionContext(ret));

        while (operandStack.length()) {
            topOfStack = operandStack.peek();
            if (topOfStack.operator !== '(') queue.push(operandStack.pop());
            else operandStack.pop();
        }

        return ret.setTree(queue).createTree();
    }

    function iterateFilterGroup(filterObject, stack, queue, contextGetter, collectionContext) {
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
                iterateFilterGroup(filterObject.filterGroup[idx], stack, queue, contextGetter, collectionContext);
                while (stack.length()) {
                    topOfStack = stack.peek();
                    if (topOfStack.operator !== '(') queue.push(stack.pop());
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
                leafNode.collectionContext = collectionContext;
                queue.push(leafNode);
            }
            ++idx;
        }
    }

    function pushConjunctionOntoStack(conjunction, stack, queue) {
        while (stack.length()) {
            var topOfStack = stack.peek();
            if ((conjunction.associativity === associativity.LTR && conjunction.precedence <= topOfStack.precedence) ||
                (conjunction.associativity === associativity.RTL && conjunction.precedence < topOfStack.precedence))
                queue.push(stack.pop());
            else
                break;
        }
        stack.push(conjunction);
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

    function getOperatorPrecedence(operator) {
        switch (operator) {
            case '!':
                return { precedence: 1, associativity: associativity.LTR };
            case 'and':
                return { precedence: 2, associativity: associativity.RTL };
            case 'xor':
                return { precedence: 3, associativity: associativity.RTL };
            case 'or':
                return { precedence: 4, associativity: associativity.RTL };
            case '(':
            case ')':
                return { precedence: null, associativity: null };
            default:
                return null;
        }
    }

    return {
        createFilterTreeFromFilterObject: createFilterTreeFromFilterObject
    };
})();

function getNumbersFromTime(val) {
    var re = new RegExp("^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$");
    if (!re.test(val)) return [12, '00', '00','AM'];
    var timeGroups = re.exec(val),
        hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6],
        minutes, seconds, meridiem, retVal = [];
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
    var hourVal = parseInt(timeArray[0].toString()) === 12 || parseInt(timeArray[0].toString()) === 24 ? parseInt(timeArray[0].toString()) - 12 : parseInt(timeArray[0]);
    return 3660 * hourVal + 60 * parseInt(timeArray[1]) + parseInt(timeArray[2]);
}

var operatorPrecedence = {
    'or': 1,
    'nor': 1,
    'xor': 2,
    'and': 3,
    'nand': 3,
    'xand': 4
};