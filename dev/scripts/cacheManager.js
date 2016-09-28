var gridCache = {
    _cache:  []
};

Object.defineProperties(
    gridCache, {
        'getCache': {
            value: function _getCache(id) {
                return this._cache[id];
            },
            writable: false,
            configurable: false
        },
        'deleteCache': {
            value: function _deleteCache(id) {
                delete this._cache[id];
            },
            writable: false,
            configurable: false
        }
    }
);

var cache = [];

var cacheManager = {
    cache: {},
    getNextCacheId: function _getNextCacheId() {
        return generateId();
    },
    createNewGridCache: function _createNewGridCache(gridCacheObj, cacheId) {
        var newId = generateId();
        cache[newId] = gridCacheObj;

        Object.defineProperty(
            cacheManager.cache,
            newId.toString(),
            {
                get: function _get() {
                    return cache[newId];
                }
            }
        );

        return newId;
    },
    deleteGridCache: function _deleteGridCache(cacheId) {
        delete cacheManager.cache[cacheId];
        delete cache[cacheId];
    },
    updateCacheWithPageData: function _updateCacheWithPageData(pageData, cacheId) {
        var currCache = cache[cacheId];
        currCache.dataSource.data = pageData.data;
        currCache.pageSize = pageData.pageSize;
        currCache.pageNum = pageData.pageNum;
        currCache.dataSource.rowCount = pageData.rowCount != null ? pageData.rowCount : pageData.data.length;
        currCache.groupedBy = pageData.groupedBy;
        currCache.sortedOn = pageData.sortedOn;
        currCache.filters = pageData.filters;
    }
};

function createCache(cacheObj) {
    var newId = generateId();
    cache[newId] = cacheObj;
    return newId;
}

function getCache(id) {
    return cache[id];
}

function deleteCache(id) {
    delete cache[id];
}

var generateId = (function guid(seed) {
    return function _generateId() {
        seed++;
        return seed.toString();
    };
})(-1);

export { cacheManager };