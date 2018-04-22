import { gridState } from './gridState';
import { general_util } from './general_util';
import { getFormattedCellText } from './formatter';
import { dominator } from './dominator';

var aggregateGenerator = {
    createAggregates: function _createAggregates(gridId) {
        var gridConfig = gridState.getInstance(gridId);
        if (typeof gridConfig.dataSource.get !== general_util.jsTypes.function) {
            var dataToFilter = gridConfig.alteredData && gridConfig.alteredData.length ? gridConfig.alteredData : gridConfig.originalData;
            dataToFilter.filter(function getRemainingRows(val, idx) {
                return idx > gridConfig.pageNum * gridConfig.pageSize - 1 || idx < gridConfig.pageNum * gridConfig.pageSize - gridConfig.pageSize;
            }).forEach(function _iterateRemainingRows(row) {
                gridConfig.columns.forEach(function _addColumnValsToAggregates(col) {
                    aggregateGenerator.addValueToAggregations(gridId, col.field, row[col.field], gridConfig.gridAggregations);
                });
            });
        }
        else aggregateGenerator.constructAggregationsFromServer(gridId, gridConfig.gridAggregations);

        var gridPager = gridConfig.grid.find('.grid-pager-div'),
            gridFooterDiv = dominator({ type: 'div', id: 'grid-footer-' + gridId, classes: ['grid-footer-div'], data: [{ name: 'grid-footer-id', value: gridId }] }).insertBefore(gridPager),
            gridFooterWrap = dominator({ type: 'div', id: 'grid-footer-wrapper-' + gridId, data: [{ name: 'grid_footer_id', value: gridId }], classes: ['grid-footer-wrapper']}).appendTo(gridFooterDiv),
            footer = dominator({ type: 'table', classes: ['grid-footer'] });

        /*var gridPager = gridState[gridId].grid.find('.grid-pager-div'),
            gridFooterDiv = $('<div id="grid-footer-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-div"></div>').insertBefore(gridPager),
            gridFooterWrap = $('<div id="grid-footer-wrapper-' + gridId + '" data-grid_footer_id="' + gridId + '" class="grid-footer-wrapper"></div>').appendTo(gridFooterDiv),
            footer = $('<table class="grid-footer"></table>').appendTo(gridFooterWrap);
            */

        var colGroup = dominator({ type: 'colgroup' }).appendTo(footer),
            footerTBody = dominator({ type: 'tbody' }).appendTo(footer),
            footerRow = footerTBody.find('.aggregate-row');

        /*var colgroup = $('<colgroup></colgroup>').appendTo(footer),
            footerTBody = $('<tbody></tbody>').appendTo(footer),
            footerRow = footerTBody.find('.aggregate-row');*/

        //TODO: does this actually need to be here? And for that matter, do I even need to do a '.find' for the footerRow at all since
        //TODO: the footerTBody is literally created and inserted immediately before it? This seems useless...
        if (footerRow.length) footerRow.remove();
        footerRow = dominator({ type: 'tr', classes: ['aggregate-row'] }).appendTo(footerTBody);
        //footerRow = $('<tr class="aggregate-row"></tr>').appendTo(footerTBody);

        gridConfig.groupedBy.forEach(function _appendSpacerCells() {
            footerRow.append({ type: 'td', classes: ['group_spacer'], text: '&nbsp' });
            //footerRow.append('<td class="group_spacer">&nbsp</td>');
        });
        if (gridConfig.drillDown) footerRow.append({ type: 'td', classes: ['group_spacer'], text: '&nbsp' });
        //if (gridConfig.drillDown) footerRow.append('<td class="group_spacer">&nbsp</td>');

        var aggregates = gridConfig.gridAggregations;
        gridConfig.columns.forEach(function _createAggregates(col) {
            var text = '';
            if (col.field in aggregates) {
                aggregates[col.field].forEach(function _createAggregateText(aggregate, idx) {
                    text += aggregate.text;
                    if (idx < aggregates[col.field].length - 1) text += ', ';
                });
            }
            footerRow.append({ type: 'td', classes: ['aggregate-cell'], data: [{ name: 'field', value: col.field }], text: text });
            colGroup.append({ type: 'col' });
            //footerRow.append('<td data-field="' + col.field + '" class=aggregate-cell">' + text + '</td>');
            //colgroup.append('<col>');
        });

        /*
         This is set to make up for the vertical scroll bar that the gridContent div has.
         It helps keep the header columns aligned with the content columns, and makes
         the scroll handler for the content grid work correctly.
         */
        var gridContent = gridConfig.grid.find('.grid-content-div'),
            sizeDiff = gridFooterWrap[0].clientWidth - gridContent[0].clientWidth;
        gridFooterWrap.css('paddingRight', sizeDiff);
    },
    /**
     * Used for calculating both client-side full-grid aggregates, as well as grouped aggregates
     * @param {number} gridId - The id of the grid widget instance
     * @param {string} field - The name of the field being aggregated
     * @param {*} value - The value of the current row's field (i.e. a single cell in the grid)
     * @param {Object} aggregationObj - The object used to cache the aggregates
     */
    addValueToAggregations: function _addValueToAggregations(gridId, field, value, aggregationObj) {
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
    },

    /**
     * Takes the server's aggregate calculations and formats them for grid consumption
     * @param {number} gridId - The id of the grid widget instance
     * @param {Object} aggregationObj - The object that hold the aggregates
     */
    constructAggregationsFromServer: function _constructAggregationsFromServer(gridId, aggregationObj) {
        var gridConfig = gridState.getInstance(gridId);
        gridConfig.columns.forEach(function _constructAggregationsFromServer(col) {
            var aggregateObj = {},
                aggregateArr = [];
            if (!aggregationObj[col.field]) aggregationObj[col.field] = [];

            gridConfig.dataSource.aggregates.filter(function _findAggregateColumn(val) {
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
};

export { aggregateGenerator };