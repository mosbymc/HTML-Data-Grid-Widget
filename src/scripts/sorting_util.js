import { gridState } from './gridState';
import { general_util } from './general_util';
import { dataTypeValueNormalizer } from './formatter';


/**
 * Manages sorting grid data based on the field and data type
 * @param {Array} sortedItems - An array of objects describing which columns are to be sorted and in which directions
 * @param {Array} gridData - An array containing the grid data to be sorted
 * @param {number} gridId - The id of the grid instance
 * @returns {Array} - Returns an array of sorted grid data and a map for each item's original index
 */
function sortGridData(sortedItems, gridData, gridId) {
    var gridConfig = gridState.getInstance(gridId),
        dataMap = gridData.map(function _mapIndices(item, idx) {
        return [item, gridConfig.dataMap[idx]];
    });
    sortedItems.forEach(function _sortItems(cur, idx) {
        var columnIdx = gridConfig.columnIndices[cur.field];
        var column = gridConfig.columns[columnIdx];
        if (idx === 0)
            gridData = mergeSort(dataMap, cur, column.type || 'string');
        else {
            var sortedGridData = [];
            var itemsToSort = [];
            gridData.forEach(function _sortGridData(data, i) {
                var prevField = sortedItems[idx - 1].field,
                    prevVal = itemsToSort.length ? itemsToSort[0][0][prevField] : null,
                    prevColIdx = itemsToSort.length ? gridConfig.columnIndices[prevField] : null,
                    dataType = itemsToSort.length ? gridConfig.columns[prevColIdx].type : null;
                if (!itemsToSort.length || general_util.comparator(dataTypeValueNormalizer(dataType, prevVal), dataTypeValueNormalizer(dataType, gridData[i][0][prevField]), general_util.booleanOps.strictEqual))
                    itemsToSort.push(gridData[i]);
                else {
                    if (itemsToSort.length === 1) sortedGridData = sortedGridData.concat(itemsToSort);
                    else sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[idx], column.type || 'string'));
                    itemsToSort.length = 0;
                    itemsToSort.push(gridData[i]);
                }
                if (i === gridData.length - 1)
                    sortedGridData = sortedGridData.concat(mergeSort(itemsToSort, sortedItems[idx], column.type || 'string'));
            });
            gridData = sortedGridData;
        }
    });
    return gridData;
}

function mergeSort(data, sortObj, type) {
    if (data.length < 2) return data;
    var middle = parseInt(data.length / 2);
    return merge(mergeSort(data.slice(0, middle), sortObj, type), mergeSort(data.slice(middle, data.length), sortObj, type), sortObj, type);
}

function merge(left, right, sortObj, type) {
    if (!left.length) return right;
    if (!right.length) return left;

    var operator = sortObj.sortDirection === 'asc' ? general_util.booleanOps.lessThanOrEqual : general_util.booleanOps.greaterThanOrEqual;
    if (comparator(dataTypeValueNormalizer(type, left[0][0][sortObj.field]), dataTypeValueNormalizer(type, right[0][0][sortObj.field]), operator))
        return [[cloneGridData(left[0][0]), left[0][1]]].concat(merge(left.slice(1, left.length), right, sortObj, type));
    else  return [[cloneGridData(right[0][0]), right[0][1]]].concat(merge(left, right.slice(1, right.length), sortObj, type));
}

export { sortGridData };