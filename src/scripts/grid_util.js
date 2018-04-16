function copyGridWidth(gridElem) {
    var headerCols = gridElem.find('.grid-header-div').find('col'),
        contentCols = gridElem.find('.grid-content-div').find('col'),
        footerCols = gridElem.find('.grid-footer-div').find('col'),
        headerTable = gridElem.find('.grid-header-div').find('table'),
        contentTable = gridElem.find('.grid-content-div').find('table'),
        footerTable = gridElem.find('.grid-footer-div').find('table');

    contentTable.css('width', headerTable[0].clientWidth);
    footerTable.css('width', headerTable[0].clientWidth);

    contentCols.each(function colIterationCallback(idx, val) {
        if ($(val).hasClass('group_col')) return;
        var width;
        if (width = $(headerCols[idx]).width()) $(val).css('width', width);
    });

    footerCols.each(function colIterationCallback(idx, val) {
        if ($(val).hasClass('group_col')) return;
        var width;
        if (width = $(headerCols[idx]).width()) $(val).css('width', width);
    });
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

export { cloneArray, cloneGridData, copyGridWidth };