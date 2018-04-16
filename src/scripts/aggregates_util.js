import { gridState } from './gridState';
import { getFormattedCellText } from './formatter';
import { general_util } from './general_util';

/**
 * Used for calculating both client-side full-grid aggregates, as well as grouped aggregates
 * @param {number} gridId - The id of the grid widget instance
 * @param {string} field - The name of the field being aggregated
 * @param {*} value - The value of the current row's field (i.e. a single cell in the grid)
 * @param {Object} aggregationObj - The object used to cache the aggregates
 */
function addValueToAggregations(gridId, field, value, aggregationObj) {
    if (value == null) return;
    var text, total,
        gridConfig = gridState.getInstance(gridId),
        column = gridConfig.columns[gridConfig.columnIndices[field]];
    if (!aggregationObj[field]) aggregationObj[field] = [];
    var aggregateArr = [];
    gridConfig.dataSource.aggregates.filter(function _findMatchingAggregateColumn(item) {
        return item.field === field;
    }).forEach(function _calculateAggregate(col) {
        var aggregateObj = {},
            prevAgg = aggregationObj[field].filter(function _findMatchingAggregateObj(item) {
                return item.aggregate === col.aggregate.toLowerCase();
            });
        switch (col.aggregate.toLowerCase()) {
            case 'count':
                if (!prevAgg || !prevAgg.length) {
                    aggregateObj.value = gridConfig.dataSource.rowCount || gridConfig.dataSource.data.length;
                    aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + aggregateObj.value;
                    aggregateObj.aggregate = col.aggregate.toLowerCase();
                    aggregateArr.push(aggregateObj);
                }
                else aggregateArr = aggregateArr.concat(prevAgg);
                return;
            case 'average':
                var count = prevAgg.length ? prevAgg[0].count + 1 : 1;
                value = general_util.parseFloat(value.toString());
                value = general_util.isNumber(value) ? value : 0;
                total = prevAgg.length ? prevAgg[0].total + value : value;
                var avg = total/count;
                text = getFormattedCellText(column, avg.toFixed(2)) || avg.toFixed(2);
                aggregateObj.total = total;
                aggregateObj.count = count;
                aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                aggregateObj.value = avg;
                aggregateObj.aggregate = col.aggregate.toLowerCase();
                aggregateArr.push(aggregateObj);
                return;
            case 'max':
                if (!prevAgg || !prevAgg.length) {
                    text = getFormattedCellText(column, value) || value;
                    aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                    aggregateObj.value = value;
                    aggregateObj.aggregate = col.aggregate.toLowerCase();
                    aggregateArr.push(aggregateObj);
                }
                else aggregateArr = aggregateArr.concat(prevAgg);
                return;
            case 'min':
                if (!prevAgg || !prevAgg.length) {
                    text = getFormattedCellText(column, value) || value;
                    aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                    aggregateObj.value = text;
                    aggregateObj.aggregate = col.aggregate.toLowerCase();
                    aggregateArr.push(aggregateObj);
                }
                else aggregateArr = aggregateArr.concat(prevAgg);
                return;
            case 'total':
                total = (general_util.parseFloat(prevAgg[0].total) || 0) + general_util.parseFloat(value);
                text = getFormattedCellText(column, total) || total;
                aggregateObj.total = total;
                aggregateObj.text = aggregates[col.aggregate.toLowerCase()] + text;
                aggregateObj.value = text;
                aggregateObj.aggregate = col.aggregate.toLowerCase();
                aggregateArr.push(aggregateObj);
                return;
            default:
                aggregateObj.text = null;
                aggregateArr.push(aggregateObj);
        }
    });
    aggregationObj[field] = aggregateArr;
}

/**
 * Takes the server's aggregate calculations and formats them for grid consumption
 * @param {number} gridId - The id of the grid widget instance
 * @param {Object} aggregationObj - The object that hold the aggregates
 */
function constructAggregationsFromServer(gridId, aggregationObj) {
    gridState[gridId].columns.forEach(function _constructAggregationsFromServer(col) {
        var aggregateObj = {},
            aggregateArr = [];
        if (!aggregationObj[col.field]) aggregationObj[col.field] = [];

        gridState[gridId].dataSource.aggregates.filter(function _findAggregateColumn(val) {
            return val.field === col.field;
        }).forEach(function _getAggregateText(item) {
            if (item.aggregate && item.value) {
                var text = getFormattedCellText(col, item.value) || item.value;
                aggregateObj.text = aggregates[item.aggregate] + text ;
            }
            else aggregateObj.text = '';
            aggregateArr.push(aggregateObj);
        });
        aggregationObj[col.field] = aggregateArr;
    });
}

export { constructAggregationsFromServer, addValueToAggregations };