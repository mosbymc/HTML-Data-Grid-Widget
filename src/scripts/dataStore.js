import {gridState} from "./gridState";

var store = {};

function DataStore(config, gridElem) {
    var id = DataStore.generateId();
    store[id] = {
        state: {},
        instance: {}
    };

    store[id].state.height = config.height || 400;
    store[id].state.useValidator = config.useValidator === true && window.validator && typeof window.validator.setAdditionalEvents === jsTypes.function;
    if (store[id].state.useValidator) validator.setAdditionalEvents(['blur', 'change']);
    store[id].state.userFormatter = config.useFormatter === true && window.formatter && typeof formatter.getFormattedInput === jsTypes.function;
    store[id].state.sortable = config.sortable || false;
    store[id].state.reorderable = config.reorderable || false;
    store[id].state.resizable = config.resizable || false;
    store[id].state.groupable = config.groupable || false;
    store[id].state.selectable = config.selectable || false;
    store[id].state.groupAggregates = config.groupAggregates || false;
    store[id].state.excelExport = config.excelExport || false;
    store[id].state.columnToggle = config.columnToggle || false;
    store[id].state.rows = config.rows || {};
    store[id].state.advancedFiltering = config.filterable ? config.advancedFiltering : false;
    store[id].state.pagingOptions = config.pagingOptions || null;
    store[id].state.drillDown = config.drillDown || undefined;
    store[id].state.aggregate = config.aggregates || {};
    store[id].state.pageNum = 1;
    store[id].state.pageSize = config.pageSize || 25;
    store[id].state.grid = gridElem;
    store[id].state.grid[0].grid = {};
    store[id].state.currentEdit = {};
    store[id].state.pageRequest = {};
    store[id].state.putRequest = {};
    store[id].state.resizing = false;
    store[id].state.sortedOn = [];
    store[id].state.basicFilters = {conjunct: 'and', filterGroup: null};
    store[id].state.advancedFilters = {};
    store[id].state.filters = {};
    store[id].state.groupedBy = [];
    store[id].state.gridAggregations = {};
    store[id].state.parentGridId = config.parentGridId != null ? config.parentGridId : null;

    if (typeof store[id].state.advancedFiltering === jsTypes.object) {
        store[id].state.advancedFiltering.groupsCount = isInteger(store[id].state.advancedFiltering.groupsCount) ? store[id].state.advancedFiltering.groupsCount : 5;
        store[id].state.advancedFiltering.filtersCount = isInteger(store[id].state.advancedFiltering.filtersCount) ? store[id].state.advancedFiltering.filtersCount : 10;
    }

    //TODO: should update this to accept a single function as well and wrap them in an array
    store[id].state.events = {
        beforeCellEdit: typeof config.beforeCellEdit === jsTypes.object && config.beforeCellEdit.constructor === Array ? config.beforeCellEdit : [],
        cellEditChange: typeof config.cellEditChange === jsTypes.object && config.cellEditChange.constructor === Array ? config.cellEditChange : [],
        afterCellEdit: typeof config.afterCellEdit === jsTypes.object && config.afterCellEdit.constructor === Array ? config.afterCellEdit : [],
        pageRequested: typeof config.pageRequested === jsTypes.object && config.pageRequested.constructor === Array ? config.pageRequested : [],
        beforeDataBind: typeof config.beforeDataBind === jsTypes.object && config.beforeDataBind.constructor === Array ? config.beforeDataBind : [],
        afterDataBind: typeof config.afterDataBind === jsTypes.object && config.afterDataBind.constructor === Array ? config.afterDataBind : [],
        columnReorder: typeof config.columnReorder === jsTypes.object && config.columnReorder.constructor === Array ? config.columnReorder : []
    };

    Object.keys(store[id].state.events).forEach(function setEvtHandlers(evt) {
        store[id].state.events[evt] = store[id].state.events[evt].filter(function mapEventsCallback(fn) {
            if (typeof fn === 'function') return fn;
        });
    });

    store[id].state.columns = cloneGridData(config.columns);
    store[id].state.columnIndices = {};
    store[id].state.columns = store[id].state.columns.forEach(function _createColumnIndices(col, idx) {
        config.columnIndices[col.field] = idx;
    });
    store[id].state.dataSource = {
        rowCount: config.dataSource.rowCount || 25
    };
    store[id].state.originalData = {};
    DataStore.createInstanceMutators(id);
    DataStore.createInstanceMethods(id, store[id].instance);
}

DataStore.generateId = (function uid(seed) {
    return function _generateId() {
        seed++;
        return seed.toString();
    };
})(-1);

DataStore.getGridInstance = function _getGridInstance(id) {
    //TODO: remove this call to destroy grid instance when complete.... need now for linter to stop being a bitch
    DataStore.destroyGridInstance(id);
    return store[id].instance;
};

DataStore.destroyGridInstance = function _destroyGridInstance(id) {
    store[id].state.grid.children().each(function _removeChildrenFromDOM(child) {
        $(child).remove();
    });
    var gridElem = store[id].state.grid;
    delete store[id];
    return gridElem;
};

DataStore.getProperty = function _getProperty(nameSpace, property, id) {
    var loc = store[id].state.concat(nameSpace.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
        if (typeof prev[curr] !== jsTypes.object && typeof prev[curr] !== jsTypes.function) return false;
        return prev[curr];
    });

    if (loc) return loc[property];
    return false;
};

DataStore.createInstanceMethods = function _createInstanceMethods(id, instance) {
    instance.getProperty = function _getProperty(property) {
        var prop;
        if (store[id].state[property] !== undefined) prop = cloneGridData(store[id].state[property]);
        return prop;
    };

    instance.setProperty = function _setProperty(property, value) {
        value = cloneGridData(value);
        if (!store[id].state[property]) store[id].state[property] = value;
        else if (checkTypes(store[id].state[property], value)) {
            store[id].state[property] = value;
            return true;
        }
        return false;
    };

    //TODO: not sure if this is something I want to run every time a property is updated on instance state...
    //TODO: could be times when property needs to be updated, but type should change; maybe allow a flag param
    function checkTypes(standard, value) {
        if (value == null || typeof value !== jsTypes.object || typeof value !== jsTypes.function)
            return typeof value === typeof standard;
        else if (typeof standard !== jsTypes.object && typeof standard !== jsTypes.function)
            return false;
        return Object.keys(value).every(function _verifyAllTypes(prop) {
            return checkTypes(standard[prop], value[prop]);
        });
    }
};

DataStore.createInstanceMutators = function _createInstanceMutators(instanceId) {
    var state = store[instanceId].state,
        instance = store[instanceId].instance;
    Object.keys(state).forEach(function _createMutators(prop) {
        Object.defineProperty(
            instance,
            prop, {
                configurable: prop in configConfigs,
                get: function _get() {
                    return instance[prop];
                }
            }
        );
        if (prop in configConfigs) {
            Object.defineProperty(
                instance,
                prop, {
                    set: function _set(val) {
                        if (!testNestedValues(instance[prop], val)) return false;
                        instance[prop] = val;
                    }
                }
            );
        }
    });

    function createNewProperty(prop, val) {
        var parentObj = null;

        function on(prop) {
            var loc = state.concat(prop.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
                if (typeof prev[curr] !== jsTypes.object && typeof prev[curr] !== jsTypes.function) return false;
                return prev[curr];
            });

            if (loc !== undefined || (typeof loc !== jsTypes.object && typeof loc !== jsTypes.function)) parentObj = loc;
            else parentObj = false;
            return {
                withInstanceMutators: withInstanceMutators
            };
        }

        function withInstanceMutators(accessors) {
            if (parentObj === false) return false;
            parentObj = parentObj || state;
            if (parentObj[prop] !== undefined) return false;
            parentObj[prop] = val;
            Object.defineProperty(
                instance,
                prop, {
                    configurable: !accessors || accessors === mutators.getterSetter,
                    get: function _get() {
                        return parentObj[prop];
                    }
                }
            );

            if (accessors === mutators.getterSetter) {
                Object.defineProperty(
                    instance,
                    prop, {
                        configurable: false,
                        set: function _set(val) {
                            parentObj[prop] = val;
                        }
                    }
                );
            }

            return true;
        }

        return {
            on: on,
            withInstanceMutators: withInstanceMutators
        };
    }
};

export { DataStore };