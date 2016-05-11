/*
 //
 //	QUnit tests for grid widget
 //
 */

//List of available events to bind a handler to
var events = ["cellEditChange", "beforeCellEdit", "afterCellEdit", "pageRequested", "beforeDataBind", "afterDataBind", "columnReorder"],
    qunitFixture = '#qunit-fixture',
    contentDiv = '.grid-content-div';

//Tests based around successful grid creation
QUnit.module('Successful grid creation tests', {
    beforeEach: function destroyAndRecreateGrid() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

//Is there at least one table element inside the div that was used for the grid?
QUnit.test('Grid creation should succeed', function gridCreationTests(assert) {
    var gridElem = $(qunitFixture);
    var gridApi = gridElem[0].grid;
    var keys = Object.getOwnPropertyNames(gridElem[0].grid);

    assert.ok(gridElem.find('table').length, "Grid was created!");
    assert.ok(typeof gridElem[0].grid === 'object', 'Grid API object created');

    for (var i = 0; i < keys.length; i++) {
        var tmp = typeof gridElem[0].grid[keys[i]];
        assert.ok(tmp === 'object' || tmp === 'function', 'Grid API - ' + keys[i] + ' object created');
    }

    assert.ok(typeof grid.createGrid === 'function', "grid.create is a function");

    assert.ok(typeof gridApi.bindEvent == 'function', "gridApi.bindEvent is a function");
    assert.ok(typeof gridApi.destroy === 'function', "gridApi.destroy is a function");
    assert.ok(gridApi.selectedColumn === null, "gridApi.selectedColumn exists and is null when nothing is selected");
    assert.ok(gridApi.selectedRow === null, "gridApi.selectedRow exists and is null when nothing is selected");
    assert.ok(typeof gridApi.updateCellData == 'function', "gridApi.updateCellData is a function");
    assert.ok(typeof gridApi.updatePageData == 'function', "gridApi.updatePageData is a function");
    assert.ok(typeof gridApi.updateRowData == 'function', "gridApi.updateRowData is a function");
    assert.ok(typeof gridApi.getHandledEvents === 'function', "gridApi.getHandledEvents is a function");
    assert.ok(typeof gridApi.getAvailableEvents === 'function', "gridApi.getAvailableEvents is a function");
    assert.ok(typeof gridApi.getAggregates === 'function', "gridApi.getAggregates is a function");
    assert.ok(typeof gridApi.getCurrentPageData === 'function', "gridApi.getCurrentPageData is a function");
    assert.ok(typeof gridApi.getCurrentDataSourceData === 'function', "gridApi.getCurrentDataSourceData is a function");

    var dupeApi = gridApi;
    var refHolder = {};
    var props = Object.getOwnPropertyNames(gridApi);

    for (var i = 0; i < props.length; i++) {
        if (props[i] === 'activeCellData' || props[i] === 'selectedRow' || props[i] === 'selectedColumn')
            continue;
        refHolder[props[i]] = gridApi[props[i]];
        gridApi[props[i]] = undefined;
        gridApi[props[i]].test = 'This is a test';
    }

    for (var ref in refHolder) {
        assert.equal(refHolder[ref], gridApi[ref], 'API method ' + ref + ' was not overridden');
        assert.deepEqual(refHolder[ref], gridApi[ref], 'API method ' + ref + ' was not overridden');
    }

    assert.deepEqual(dupeApi, gridApi, 'The grid API remained the same');
});

QUnit.module('Grid API Tests', {
    beforeEach: function() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

//Is the handler for the 'cellEditChange' event successfully bound?
QUnit.test('General grid API tests', function gridEventTests(assert) {
    var evt = "cellEditChange";
    var noop = function(){};
    var gridApi = $(qunitFixture)[0].grid;
    gridApi.bindEvent(evt, noop);
    var eventListeners = gridApi.getHandledEvents();
    assert.ok(~eventListeners[0].indexOf(evt), "An event handler for 'cellEditChange' was attached to the grid");

    gridApi.unbindEvent(evt, noop);
    evt = "asdasda";
    gridApi.bindEvent(evt, noop);
    eventListeners = gridApi.getHandledEvents();
    assert.notOk(eventListeners.length && ~eventListeners[0].indexOf(evt), "No event handler for 'asdasda' was attached to the grid");

    gridApi.bindEvent('cellEditChange', noop);
    var gridEvents = gridApi.getHandledEvents();
    assert.ok(~gridEvents.indexOf('cellEditChange'), 'cellEditChange is handled');

    gridApi.unbindEvent('cellEditChange', noop);
    gridApi.bindEvent('cellEditChange', noop);
    gridApi.unbindEvent('cellEditChange', noop);
    gridEvents = gridApi.getHandledEvents();
    assert.ok(!~gridEvents.indexOf('cellEditChange'), 'cellEditChange event handler was removed');

    gridApi.bindEvent('cellEditChange', noop);
    gridApi.unbindEvent('sdsdfg', noop);
    gridEvents = gridApi.getHandledEvents();
    assert.ok(~gridEvents.indexOf('cellEditChange'), 'cellEditChange event handler is still attached');

    gridApi.unbindEvent('cellEditChange', noop);
    gridApi.bindEvent(evt);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass 'undefined' for function parameter");

    gridApi.bindEvent(evt, null);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass 'null' for function parameter");

    gridApi.bindEvent(evt, {});
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass an object for function parameter");

    gridApi.bindEvent(evt, " ");
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass a string for function parameter");

    gridApi.bindEvent(evt, 1);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass a number for function parameter");

    gridApi.bindEvent(evt, true);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass a boolean for function parameter");

    gridApi.bindEvent(evt, NaN);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass 'NaN' for function parameter");

    gridApi.bindEvent(evt, Infinity);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass 'Infinity' for function parameter");

    gridApi.bindEvent(evt, []);
    assert.notOk(gridApi.getHandledEvents()[0] === evt, "Cannot pass an array for function parameter");

    var evts = gridApi.getAvailableEvents();
    assert.deepEqual(evts, events, "Available events are returned correctly");

    for (var i = 0; i < events.length; i++) {
        gridApi.bindEvent(events[i], function(){});
    }

    var handledEvents = gridApi.getHandledEvents();

    for (var i = 0; i < handledEvents.length; i++) {
        assert.ok(handledEvents[i] === events[i], 'Event listener for \'' + events[i] + '\' found');
    }

    gridApi.removeAllEventHandlers();
    handledEvents = gridApi.getHandledEvents();

    assert.notOk(handledEvents.length, 'No event handlers returned after call to remove all');

    for (var i = 0; i < events.length; i++) {
        assert.ok(!~handledEvents.indexOf(events[i]), 'Event listener for \'' + events[i] + '\' found');
    }

    var aggregates = gridApi.getAggregates();
    assert.ok(aggregates, "Data was returned");

    for (var col in aggregates) {
        if (typeof aggregates[col] === 'object')
            assert.ok(aggregates[col].type === gridData.summaryRow[col].type, "Aggregate type for column '" + col + "' equals the gridData.summaryRow type");
        else
            assert.ok(aggregates[col] === gridData.summaryRow[col], "Position location is the same");
    }

    var currentGridData = gridApi.getCurrentDataSourceData();
    assert.ok(currentGridData.length === 54, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentDataSourceData(-1);
    assert.ok(currentGridData.length === 54, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentDataSourceData({});
    assert.ok(currentGridData.length === 54, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentDataSourceData(2);
    assert.ok(currentGridData.length === 1, 'One grid data model was returned');

    currentGridData = gridApi.getCurrentPageData();
    assert.ok(currentGridData.length === 25, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentPageData(-1);
    assert.ok(currentGridData.length === 25, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentPageData({});
    assert.ok(currentGridData.length === 25, 'Full grid data was returned');

    currentGridData = gridApi.getCurrentPageData(2);
    assert.ok(currentGridData.length === 1, 'One grid data model was returned');

    assert.ok(gridApi.activeCellData === null, 'null was returned when no active cell');
    assert.ok(gridApi.selectedRow === null, 'null was returned when no active cell');
    assert.ok(gridApi.selectedColumn === null, 'null was returned when no active cell');

    $(qunitFixture).find(contentDiv).find('table').find('tr').find('td').first()[0].click();
    var cellVal = gridApi.activeCellData;
    assert.ok(gridApi.activeCellData === 'New Brakes', 'New Brakes was returned when the first rows first column was clicked');
    assert.ok(gridApi.selectedRow === 0, 'The selected cell\'s parent row index was returned');
    var cell = $(qunitFixture).find(contentDiv).find('table').find('tr').find('td').first()[0];
    var colIndex = $(cell).parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + $(cell).data("field") + "']").data("index");
    assert.deepEqual(gridApi.selectedColumn, { field: $(cell).data("field"), columnIndex: colIndex }, 'null was returned when no active cell');
});

QUnit.module('Grid API Tests: updateCellData', {
    beforeEach: function() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

//Does the 'UpdateCellData' API call result in a new UI value, the same grid model value, and a dirty flag?
QUnit.test('UpdateCellData grid API tests', function gridUpdateCellDataTests(assert) {
    var dataCell = $(qunitFixture).find(contentDiv).find('table').find('tr').first().children('td')[0];
    var initialGridValue = dataCell.outerText;
    var initialDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(0)[0]["Service"];

    $(qunitFixture)[0].grid.updateCellData({index: 0, field: "Service", value: "Old Brakes"}, true /*setAsDirty*/);

    var currentGridValue = $(qunitFixture).find(contentDiv).find('table').find('tr').first().children('td')[0].outerText;
    var currentDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(0)[0]["Service"];

    assert.ok(initialGridValue !== currentGridValue, 'Previous UI value: ' + initialGridValue + " does not equal the current UI value: " + currentGridValue);
    assert.ok(initialDataValue !== currentDataValue, initialDataValue + " equals " + currentDataValue);
    assert.ok($(dataCell).children('span').hasClass('dirty'), "Grid cell is dirty");

    var row = $(qunitFixture).find(contentDiv).find('table').find('tr')[4];
    var dataCell1 = $(row).children('td')[4];
    var dataCell2 = $(row).children('td')[5];

    var initialGridValue1 = dataCell1.outerText;
    var initialDataValue1 = $(qunitFixture)[0].grid.getCurrentDataSourceData(4)[0]["Billed"];

    var initialGridValue2 = dataCell2.outerText;
    var initialDataValue2 = $(qunitFixture)[0].grid.getCurrentDataSourceData(4)[0]["Markup"];

    $(qunitFixture)[0].grid.updateCellData([
            {index: 4, field: "Billed", value: (parseInt(initialDataValue1) + 5)},
            {index: 4, field: "Markup", value: 533.86}],
        false /*setAsDirty*/);

    var currentGridValue1 = $(row).children('td')[4].outerText;
    var currentDataValue1 = $(qunitFixture)[0].grid.getCurrentDataSourceData(4)[0]["Billed"];

    var currentGridValue2 = $(row).children('td')[5].outerText;
    var currentDataValue2 = $(qunitFixture)[0].grid.getCurrentDataSourceData(4)[0]["Markup"];

    assert.notEqual(initialGridValue1, currentGridValue1, initialGridValue1 + " does not equal " + currentGridValue1);
    assert.ok(initialDataValue1 !== currentDataValue1, initialDataValue1 + " equals " + currentDataValue1);
    assert.notOk($(dataCell1).children('span').hasClass('dirty'), "The first grid cell is not dirty");

    assert.notEqual(initialGridValue2, currentGridValue2, initialGridValue2 + " does not equal " + currentGridValue2);
    assert.ok(initialDataValue2 !== currentDataValue2, initialDataValue2 + " equals " + currentDataValue2);
    assert.notOk($(dataCell2).children('span').hasClass('dirty'), "The second grid cell is not dirty");

    row = $(qunitFixture).find(contentDiv).find('table').find('tr')[1];
    dataCell = $(row).children('td')[1];
    initialGridValue = dataCell.outerText;
    initialDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(1)[0]["Labor"];

    $(qunitFixture)[0].grid.updateCellData({field: "Labor", value: (parseInt(initialDataValue) + 5)}, true /*setAsDirty*/);

    currentGridValue = $(row).children('td')[1].outerText;
    currentDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(1)[0]["Labor"];

    assert.equal(initialGridValue, currentGridValue, 'Previous UI value: ' + initialGridValue + " equals the current UI value: " + currentGridValue);
    assert.ok(initialDataValue === currentDataValue, initialDataValue + " equals " + currentDataValue);
    assert.ok(!$(dataCell).children('span').hasClass('dirty'), "Grid cell is not dirty");

    row = $(qunitFixture).find(contentDiv).find('table').find('tr')[2];
    dataCell = $(row).children('td')[2];
    initialGridValue = dataCell.outerText;
    initialDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(2)[0]["Labor"];

    $(qunitFixture)[0].grid.updateCellData({field: "Labor", value: (parseInt(initialDataValue) + 5)}, true /*setAsDirty*/);

    currentGridValue = $(row).children('td')[2].outerText;
    currentDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(2)[0]["Labor"];

    assert.equal(initialGridValue, currentGridValue, 'Previous UI value: ' + initialGridValue + " does not equal the current UI value: " + currentGridValue);
    assert.ok(initialDataValue === currentDataValue, initialDataValue + " equals " + currentDataValue);
    assert.ok(!$(dataCell).children('span').hasClass('dirty'), "Grid cell is not dirty");

    row = $(qunitFixture).find(contentDiv).find('table').find('tr')[3];
    dataCell = $(row).children('td')[3];
    initialGridValue = dataCell.outerText;
    initialDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(3)[0]["Labor"];

    $(qunitFixture)[0].grid.updateCellData(undefined, true /*setAsDirty*/);

    currentGridValue = $(row).children('td')[3].outerText;
    currentDataValue = $(qunitFixture)[0].grid.getCurrentDataSourceData(3)[0]["Labor"];

    assert.equal(initialGridValue, currentGridValue, 'Previous UI value: ' + initialGridValue + " does not equal the current UI value: " + currentGridValue);
    assert.ok(initialDataValue === currentDataValue, initialDataValue + " equals " + currentDataValue);
    assert.ok(!$(dataCell).children('span').hasClass('dirty'), "Grid cell is not dirty");
});

QUnit.module('Grid API Tests: updateRowData', {
    beforeEach: function() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

QUnit.test('updateRowData grid API tests', function gridUpdateRowDataTests1(assert) {
    var gridApi = $(qunitFixture)[0].grid;
    var dataSourceModel = gridApi.getCurrentDataSourceData(5);
    var rowModel = gridApi.getCurrentPageData(5);

    gridApi.updateRowData(undefined);

    var updatedDataSourceModel = gridApi.getCurrentDataSourceData(5);
    var updatedRowModel = gridApi.getCurrentPageData(5);

    assert.deepEqual(dataSourceModel, updatedDataSourceModel, 'Pre/post dataSource models are equal');
    assert.deepEqual(rowModel, updatedRowModel, 'Pre/post row models are equal');

    var dataSourceModel1 = gridApi.getCurrentDataSourceData(5);
    var rowModel1 = gridApi.getCurrentPageData(5);

    gridApi.updateRowData({
        index: 5,
        data: {
            Service: "New Transmission",
            Date: "5/06/2013",
            Labor: "12",
            Cost: "800.00",
            Paid: true,
            Customer: "Yancey Fry",
            Billed: "280.00",
            Markup: 56,
            Time :"1:15:08 PM"
        }
    });

    var updatedDataSourceModel1 = gridApi.getCurrentDataSourceData(5);
    var updatedRowModel1 = gridApi.getCurrentPageData(5);

    assert.notDeepEqual(dataSourceModel1, updatedDataSourceModel1, 'Pre/post dataSource models are equal');
    assert.notDeepEqual(rowModel1, updatedRowModel1, 'Pre/post row models are equal');

    var dataSourceModel2 = gridApi.getCurrentDataSourceData(7);
    var dataSourceModel3 = gridApi.getCurrentDataSourceData(8);
    var rowModel2 = gridApi.getCurrentPageData(7);
    var rowModel3 = gridApi.getCurrentPageData(8);

    gridApi.updateRowData([
        {
            index: 7,
            data: {
                Service: "Tire Rotation",
                Date: "6/23/2010",
                Labor: "1",
                Cost: "40.00",
                Paid: true,
                Customer: "Mayor Poopinmayer",
                Billed: "290.00",
                Markup: 45,
                Time: "10:33:15 AM"
            }
        },
        {
            index: 8,
            data: {
                Service: "Oil Change",
                Date: "Let's see how this looks",
                Labor: "0.5",
                Cost: "55.00",
                Paid: true,
                Customer: "Hermes Conrad",
                Billed: "275.00",
                Markup: 245,
                Time: "4:00:13 PM"
            }
        }
    ]);

    var updatedDataSourceModel2 = gridApi.getCurrentDataSourceData(7);
    var updatedDataSourceModel3 = gridApi.getCurrentDataSourceData(8);
    var updatedRowModel2 = gridApi.getCurrentPageData(7);
    var updatedRowModel3 = gridApi.getCurrentPageData(8);

    assert.notDeepEqual(dataSourceModel2, updatedDataSourceModel2, 'First pre/post dataSource models are equal');
    assert.notDeepEqual(rowModel2, updatedRowModel2, 'First pre/post row models are equal');
    assert.notDeepEqual(dataSourceModel3, updatedDataSourceModel3, 'Second pre/post dataSource models are equal');
    assert.notDeepEqual(rowModel3, updatedRowModel3, 'Second pre/post row models are equal');
});

QUnit.module('Grid API Tests: updatePageData', {
    beforeEach: function() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

QUnit.test('updatePageData grid API tests', function gridUpdatePageDataTests(assert) {
    var gridApi = $(qunitFixture)[0].grid;
    var dataSource = gridApi.getCurrentDataSourceData();
    var pageData = gridApi.getCurrentPageData();

    gridApi.updatePageData();
    gridApi.updatePageData({});
    gridApi.updatePageData(function() {});
    gridApi.updatePageData(null);
    gridApi.updatePageData(1);
    gridApi.updatePageData(" ");

    assert.deepEqual(dataSource, gridApi.getCurrentDataSourceData(), 'Grid dataSource remained unchanged');
    assert.deepEqual(pageData, gridApi.getCurrentPageData(), 'Grid page data remained unchanged');

    gridApi.updatePageData([
            {
                Service: "Oil Change",
                Date: "3/16/2014",
                Labor: "1.15",
                Cost: "99.00",
                Paid: true,
                Customer: "Phillip J. Fry",
                Billed: "282.00",
                Markup: 222,
                Time: "10:18:43 AM"
            },
            {
                Service: "New Tires",
                Date: "11/25/2015",
                Labor: "1.45",
                Cost: "450.00",
                Paid: false,
                Customer: "Professor Huebert Farnsworth",
                Billed: "1300.00",
                Markup: 111,
                Time: "8:18:47 AM"
            },
            {
                Service: "Emission Check",
                Date: "6/6/2016",
                Labor: ".1",
                Cost: "5.00",
                Paid: true,
                Customer: "Cuebert Farnsworth",
                Billed: "25.00",
                Markup: 123,
                Time: "10:04:15 AM"
            },
            {
                Service: "New Spark Plugs",
                Date: "1/1/2012",
                Labor: "1",
                Cost: "50.00",
                Paid: true,
                Customer: "Robot Devil",
                Billed: "1300.00",
                Markup: 456,
                Time: "12:47:32 PM"
            },
            {
                Service: "Replacement Engine",
                Date: "7/18/2015",
                Labor: "6.67",
                Cost: "1250.00",
                Paid: false,
                Customer: "Billionaire Bot",
                Billed: "2280.00",
                Markup: 623,
                Time: "2:56:01 PM"
            },
            {
                Service: "Fluid Check",
                Date: "2/8/2011",
                Labor: "0.89",
                Cost: "52.54",
                Paid: true,
                Customer: "9",
                Billed: "400.00",
                Markup: 133,
                Time: "5:13:50 PM"
            },
            {
                Service: "New Brakes",
                Date: "3/12/2013",
                Labor: "3.13",
                Cost: "250.00",
                Paid: true,
                Customer: "Hanukkah Zombie",
                Billed: "385.00",
                Markup: 12,
                Time: "9:38:56 AM"
            }
        ]
    );

    assert.notDeepEqual(dataSource, gridApi.getCurrentDataSourceData(), 'Grid dataSource changed');
    assert.notDeepEqual(pageData, gridApi.getCurrentPageData(), 'Grid page data changed');

    gridApi.updatePageData(pageData);
});