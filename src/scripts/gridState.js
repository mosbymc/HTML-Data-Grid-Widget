var gridState = [];

gridState.generateId = (function uid(seed) {
    return function _generateId() {
        seed++;
        return seed.toString();
    };
})(-1);

gridState.getInstance = function _getInstance(instanceId) {
    return gridState[instanceId];
};

gridState.createInstance = function _createInstance(config) {
    var id = gridState.generateId();
    gridState[id] = config;
    return id;
};

export { gridState };