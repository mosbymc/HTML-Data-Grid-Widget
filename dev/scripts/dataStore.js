var dataStore = (function _createDataStore() {
    var mutators = {
            getter: 0,
            setter: 1,
            getterSetter: 2
        },
        configConfigs = {
            groupAggregates: mutators.getterSetter,
            aggregates: mutators.getterSetter,
            dataSource: {
                data: mutators.getterSetter,
                rowCount: mutators.getterSetter
            },
            originalData: mutators.getterSetter,
            dataMap: mutators.getterSetter,
            events: {
                beforeCellEdit: mutators.getterSetter,
                cellEditChange: mutators.getterSetter,
                afterCellEdit: mutators.getterSetter,
                pageRequested: mutators.getterSetter,
                beforeDataBind: mutators.getterSetter,
                afterDataBind: mutators.getterSetter,
                columnReorder: mutators.getterSetter
            },
            pageNum: mutators.getterSetter,
            currentEdit: mutators.getterSetter,
            pageRequest: mutators.getterSetter,
            putRequest: mutators.getterSetter,
            resizing: mutators.getterSetter,
            sortedOn: mutators.getterSetter,
            basicFilters: mutators.getterSetter,
            advancedFilters: mutators.getterSetter,
            groupedBy: mutators.getterSetter,
            gridAggregations: mutators.getterSetter
        },
        generateId = (function uid(seed) {
            return function _generateId() {
                ++seed;
                return seed.toString();
            };
        })(-1);

    var store = {},
        _dataStore = {
            instanceId: -1,
            initializeInstance: function _addInstance() {
                var id = generateId();
                this.instanceId = id;
                store[id] = {
                    stateHistory: [],
                    state: {},
                    instance: {}
                };
                this.createInstanceMutators(id);
                this.createInstanceMethods(id, store[id].instance);
                return id;
            },
            //TODO: this function should be on the data store, not an instance...
            getGridInstance: function _getGridInstance(id) {
                //TODO: remove this call to destroy grid instance when complete.... need now for linter to stop being a bitch
                //this.destroyGridInstance(id);
                return store[id].instance;
            },
            //TODO: this function should be on the data store, not an instance...
            destroyGridInstance: function _destroyGridInstance(id) {
                store[id].state.grid.children().each(function _removeChildrenFromDOM(child) {
                    $(child).remove();
                });
                var gridElem = store[id].state.grid;
                delete store[id];
                return gridElem.removeClass('grid_elem');
            },
            getProperty: function _getProperty(nameSpace, property, id) {
                var loc = store[id].state.concat(nameSpace.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
                    if (typeof prev[curr] !== jsTypes.object && typeof prev[curr] !== jsTypes.function) return false;
                    return prev[curr];
                });

                if (loc) return loc[property];
                return false;
            },
            createInstanceMethods: function _createInstanceMethods(id, instance) {
                instance.select = function _select(fields) {
                    fields = fields.split(',');
                    return {
                        from: 2
                    }
                };

                function from(model) {
                    return {
                        where: 1,
                        join: 2
                    }
                }

                function where(predicate) {

                }

                function join() {

                }

                instance.update = function _update() {

                };

                instance.delete = function _delete() {

                };

                instance.where = function _where() {

                };

                instance.from = function _from() {

                };

                instance.join = function _join() {

                };

                instance.on = function _on() {

                };

                instance.getProperty = function _getProperty(property) {
                    var prop;
                    if (store[id].state[property] !== undefined) prop = isDomElement(store[id].state[property]) ? store[id].state[property] : cloneGridData(store[id].state[property]);
                    return prop;
                };

                instance.putProperty = function _setProperty(propertyNamespace, value) {
                    var propertyLocation = findDateLocation(propertyNamespace),
                        splitNameSpace = propertyNamespace.split('.');
                    updateInstanceState();
                    value = cloneGridData(value);
                    if (propertyLocation.property === undefined && (typeof propertyLocation.parent === jsTypes.object || typeof propertyLocation.parent === jsTypes.function)) {
                        propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = value;
                        return true;
                    }

                    if (propertyLocation.property === undefined && typeof propertyLocation.parent !== jsTypes.object && typeof propertyLocation.parent !== jsTypes.function) return false;

                    if (typeof propertyLocation.property !== jsTypes.object && typeof propertyLocation.property !== jsTypes.function) {
                        propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = value;
                        return true;
                    }

                    propertyLocation.property = value;
                    return true;
                };

                instance.postProperty = function _postProperty(propertyNamespace, value) {
                    var propertyLocation = findDateLocation(propertyNamespace),
                        splitNameSpace = propertyNamespace.split('.');
                    updateInstanceState();
                    value = cloneGridData(value);
                    if (propertyLocation.property === undefined && (typeof propertyLocation.parent === jsTypes.object || typeof propertyLocation.parent === jsTypes.function)) {
                        propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = value;
                        return true;
                    }
                    return false;
                };

                instance.patchProperty = function _patchProperty(propertyNamespace, value) {
                    var propertyLocation = findExistingProp(propertyNamespace),
                        splitNameSpace = propertyNamespace.split('.');
                    if (!propertyLocation) return false;
                    updateInstanceState();
                    value = cloneGridData(value);
                    if (typeof propertyLocation.property !== jsTypes.object && typeof propertyLocation.property !== jsTypes.function) {
                        propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = value;
                        return true;
                    }

                    propertyLocation.property = value;
                    return true;
                };

                instance.add = function _add(propertyNamespace, value) {
                    var propertyLocation = findExistingProp(propertyNamespace),
                        splitNameSpace = propertyNamespace.split('.');
                    if (!propertyLocation) return false;
                    updateInstanceState();
                    value = cloneGridData(value);

                    switch (typeof propertyLocation.property) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                            var curVal = propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]];
                            propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = curVal + value;
                            return;
                        case 'object':
                        case 'function':
                            if (!propertyLocation.property) return; //null check
                            propertyLocation.parent = propertyLocation.parent + value;
                            return;
                        case 'undefined':
                            return;
                        case 'symbol':
                            return;
                    }

                    if (typeof propertyLocation.property !== jsTypes.object && typeof propertyLocation.property !== jsTypes.function) {
                        propertyLocation.parent[splitNameSpace[splitNameSpace.length - 1]] = value;
                        return true;
                    }

                    propertyLocation.property = value;
                    return true;
                };

                instance.getPageData = function _getPageData(requestObj) {

                };

                instance.rollback = function _rollback(count) {
                    //TODO: should I retain the state before the rollback and just concat with the state at the index provided to add to the state history;
                    //TODO: or should I just 'delete' all history following the rollback index?
                    if (!isNumber(count) || count == null) count = 0;
                    if (count > store[id].stateHistory.length -1) count = store[id].stateHistory.length -1;
                    store[id].state = store[id].stateHistory[count];
                    store[id].stateHistory = store[id].stateHistory.slice(0, count);
                };

                function updateInstanceState() {
                    store[id].stateHistory = store[id].stateHistory.concat([store[id].state]);
                    store[id].state = cloneGridData(store[id].state);
                }

                function findExistingProp(propertyNamespace) {
                    var propertyLocation = findDateLocation(propertyNamespace);
                    if (propertyLocation.property === undefined) return false;
                    return propertyLocation;
                }

                function findDateLocation(propertyNamespace) {
                    var parent = null,
                        property = !~propertyNamespace.indexOf('.') ? store[id].state[propertyNamespace] :
                            [store[id].state].concat(propertyNamespace.split('.')).reduce(function findValidationRuleCallback(prev, curr) {
                                parent = prev;
                                if (typeof prev !== jsTypes.object && typeof prev !== jsTypes.function) {
                                    return undefined;
                                }
                                return prev[curr];
                            });
                    return { parent: parent, property: property };
                }

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
            },
            createInstanceMutators: function _createInstanceMutators(instanceId) {
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

                        if (loc !== undefined || (typeof loc !== jsTypes.object && typeof loc !== jsTypes.function))  parentObj = loc;
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

                Object.defineProperty(
                    instance,
                    'createNewProperty', {
                        writable: false,
                        configurable: false,
                        value: createNewProperty
                    }
                );

                return instance;
            }
        };

    function testNestedValues(standard, obj) {
        if (typeof obj !== jsTypes.object) return obj;
        return Object.keys(obj).every(function ensureTypeCorrectness(prop) {
            if (typeof standard[prop] === jsTypes.object && typeof obj[prop] === jsTypes.object)
                return testNestedValues(standard[prop], obj[prop]);
            else if (standard[prop] && typeof standard[prop] !== typeof obj[prop])
                return false;
            return true;
        });
    }

    return Object.create(_dataStore);
})();