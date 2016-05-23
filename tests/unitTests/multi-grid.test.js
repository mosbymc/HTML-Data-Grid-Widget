/*
 //
 //
 //Grid test for multiple grid on the page
 //
 //
 */

//Tests based around successful grid creation
QUnit.module('Grid API tests', {
    beforeEach: function() {
        var tmp1 = $("#grid1")[0];
        var tmp2 = $("#grid2")[0];
        if (tmp1.grid)
            tmp1.grid.destroy();
        if (tmp2.grid)
            tmp2.grid.destroy();
        grid.createGrid(gridData, tmp1);
        grid.createGrid(testGridData, tmp2);
    }
});

QUnit.test('Closure should prevent cross-contamination', function gridApiTestsCallbask(assert) {
    var evt = "cellEditChange",
        gridApi1 = $('#grid1')[0].grid,
        gridApi2 = $('#grid2')[0].grid;

    var eventHandler = function(){};
    gridApi1.bindEvents(evt, eventHandler);

    var eventListeners1 = gridApi1.getHandledEvents(),
        eventListeners2 = gridApi2.getHandledEvents();
    assert.ok(~eventListeners1.indexOf(evt), "An event handler for 'cellEditChange' was attached to grid1");
    assert.ok(!eventListeners2.length, "An event handler for 'cellEditChange' was  not attached to grid2");

    gridApi2.bindEvents(evt, eventHandler);
    gridApi1.unbindEvents(evt, eventHandler);

    eventListeners1 = gridApi1.getHandledEvents();
    eventListeners2 = gridApi2.getHandledEvents();
    assert.ok(!eventListeners1.length, "The 'cellEditChange' was successfully removed from grid1");
    assert.ok(~eventListeners2.indexOf(evt), "An event handler for 'cellEditChange' was attached to grid2 and not removed by grid1's API");

    gridApi1.bindEvents(evt, function(){});
    gridApi2.removeAllEventHandlers();

    eventListeners1 = gridApi1.getHandledEvents();
    eventListeners2 = gridApi2.getHandledEvents();
    assert.ok(~eventListeners1.indexOf(evt), "An event handler for 'cellEditChange was attached to grid1 and not removed by grid2's API");
    assert.ok(!eventListeners2.length, "The call to removeAllEventHandlers in grid2's API removed all attached events handlers");

    gridApi1.removeAllEventHandlers();
    gridApi2.removeAllEventHandlers();

    var currentGridData1 = gridApi1.getCurrentDataSourceData();
    var currentGridData2 = gridApi2.getCurrentDataSourceData();
    assert.ok(currentGridData1.length, 'Full grid data was returned from grid1\'s API');
    assert.ok(currentGridData2.length, 'Full grid data was returned from grid2\'s API');
    assert.notDeepEqual(currentGridData1, currentGridData2, 'grid1 and grid2 have different grid data');

    $('#grid1').find('.grid-content-div').find('table').find('tr').find('td').first()[0].click();
    var cellVal1 = gridApi1.activeCellData;
    var cell1 = $('#grid1').find('.grid-content-div').find('table').find('tr').find('td').first()[0];
    var colIndex1 = $(cell1).parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + $(cell1).data("field") + "']").data("index");

    assert.ok(gridApi2.activeCellData === null, 'null was returned from activeCellData call to grid2\'s API when grid1 is clicked');
    assert.ok(gridApi2.selectedRow === null, 'null was returned from selectedRow call to grid2\'s API when grid1 is clicked');
    assert.ok(gridApi2.selectedColumn === null, 'null was returned from selectedColumn call to grid2\'s API when grid1 is clicked');
    assert.ok(cellVal1 === 'New Brakes', 'New Brakes was returned when the first row\'s first column in grid1 when grid1 was clicked');
    assert.ok(gridApi1.selectedRow === 0, 'The selected cell\'s parent row index in grid1 was returned');
    assert.deepEqual(gridApi1.selectedColumn, { field: $(cell1).data("field"), columnIndex: colIndex1 }, 'The selected column data was returned when grid1 was clicked');

    $(document).trigger('click');
    $('#grid2').find('.grid-content-div').find('table').find('tr').find('td').first()[0].click();
    var cellVal2 = gridApi2.activeCellData;
    var cell2 = $('#grid2').find('.grid-content-div').find('table').find('tr').find('td').first()[0];
    var colIndex2 = $(cell2).parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + $(cell2).data("field") + "']").data("index");

    assert.ok(gridApi1.activeCellData === null, 'null was returned from activeCellData call to grid1\'s API when grid2 is clicked');
    assert.ok(gridApi1.selectedRow === null, 'null was returned from selectedRow call to grid1\'s API when grid2 is clicked');
    assert.ok(gridApi1.selectedColumn === null, 'null was returned from selectedColumn call to grid1\'s API when grid2 is clicked');
    assert.ok(cellVal2 === 'Old Brakes', 'Old Brakes was returned when the first row\'s first column in grid2 when grid2 was clicked');
    assert.ok(gridApi2.selectedRow === 0, 'The selected cell\'s parent row index in grid2 was returned');
    assert.deepEqual(gridApi2.selectedColumn, { field: $(cell2).data("field"), columnIndex: colIndex2 }, 'The selected column data was returned when grid2 was clicked');
});

QUnit.module('Grid API Tests: updateCellData', {
    beforeEach: function() {
        var tmp1 = $("#grid1")[0];
        var tmp2 = $("#grid2")[0];
        if (tmp1.grid)
            tmp1.grid.destroy();
        if (tmp2.grid)
            tmp2.grid.destroy();
        grid.createGrid(gridData, tmp1);
        grid.createGrid(testGridData, tmp2);
    }
});

QUnit.test('Closure should prevent cell updates across grids', function cellUpdateTestCallback(assert) {
    var gridApi1 = $('#grid1')[0].grid,
        gridApi2 = $('#grid2')[0].grid;

    var dataCell1 = $('#grid1').find('.grid-content-div').find('table').find('tr').first().children('td')[0],
        dataCell2 = $('#grid2').find('.grid-content-div').find('table').find('tr').first().children('td')[0],
        initialGridValue1 = dataCell1.outerText,
        initialGridValue2 = dataCell2.outerText,
        initialDataValue1 = gridApi1.getCurrentDataSourceData(0)[0]["Service"],
        initialDataValue2 = gridApi2.getCurrentDataSourceData(0)[0]["Service"];

    gridApi1.updateCellData({index: 0, field: "Service", value: "Old Brakes"}, true /*setAsDirty*/);

    var currentGridValue1 = $('#grid1').find('.grid-content-div').find('table').find('tr').first().children('td')[0].outerText,
        currentGridValue2 = $('#grid2').find('.grid-content-div').find('table').find('tr').first().children('td')[0].outerText,
        currentDataValue1 = gridApi1.getCurrentDataSourceData(0)[0]["Service"],
        currentDataValue2 = gridApi2.getCurrentDataSourceData(0)[0]["Service"];

    assert.ok(initialGridValue1 !== currentGridValue1, 'Previous UI value: ' + initialGridValue1 + " does not equal the current UI value: " + currentGridValue1 + ' after call to gridApi1 updateCellData');
    assert.ok(initialGridValue2 === currentGridValue2, 'Previous UI value: ' + initialGridValue2 + 'equals the current UI value: ' + currentGridValue2 + ' after call to gridApi1 updateCellData');
    assert.ok(initialDataValue1 !== currentDataValue1, initialDataValue1 + " does not equal " + currentDataValue1);
    assert.ok(initialDataValue2 === currentDataValue2, initialDataValue2 + " equals " + currentDataValue2);
    assert.ok($(dataCell1).children('span').hasClass('dirty'), "Grid cell1 is dirty");
    assert.ok(!$(dataCell2).children('span').hasClass('dirty'), "Grid cell2 is not dirty");

    var dataCell1 = $('#grid1').find('.grid-content-div').find('table').find('tr').first().children('td')[0],
        initialGridValue1 = dataCell1.outerText,
        initialDataValue1 = gridApi1.getCurrentDataSourceData(0)[0]["Service"];

    gridApi2.updateCellData({index: 0, field: "Service", value: "Older Brakes"}, true /*setAsDirty*/);

    var currentGridValue1 = $('#grid1').find('.grid-content-div').find('table').find('tr').first().children('td')[0].outerText,
        currentGridValue2 = $('#grid2').find('.grid-content-div').find('table').find('tr').first().children('td')[0].outerText,
        currentDataValue1 = gridApi1.getCurrentDataSourceData(0)[0]["Service"],
        currentDataValue2 = gridApi2.getCurrentDataSourceData(0)[0]["Service"];

    assert.ok(initialGridValue1 === currentGridValue1, 'Previous UI value: ' + initialGridValue1 + " equals the current UI value: " + currentGridValue1 + ' after call to gridApi2 updateCellData');
    assert.ok(initialGridValue2 !== currentGridValue2, 'Previous UI value: ' + initialGridValue2 + ' does not equal the current UI value: ' + currentGridValue2 + ' after call to gridApi2 updateCellData');
    assert.ok(initialDataValue1 === currentDataValue1, initialDataValue1 + " equals " + currentDataValue1);
    assert.ok(initialDataValue2 !== currentDataValue2, initialDataValue2 + " does not equal " + currentDataValue2);
    assert.ok($(dataCell2).children('span').hasClass('dirty'), "Grid cell2 is not dirty");




    var row1 = $('#grid1').find('.grid-content-div').find('table').find('tr')[4],
        row2 = $('#grid2').find('.grid-content-div').find('table').find('tr')[4],
        dataCell1 = $(row1).children('td')[4],
        dataCell1_1 = $(row1).children('td')[5],
        dataCell2 = $(row2).children('td')[4],
        dataCell2_2 = $(row2).children('td')[5];

    var initialGridValue1 = dataCell1.outerText,
        initialDataValue1 = gridApi1.getCurrentDataSourceData(4)[0]["Billed"],
        initialGridValue1_1 = dataCell2.outerText,
        initialDataValue1_1 = gridApi1.getCurrentDataSourceData(4)[0]["Markup"],
        initialGridValue2 = dataCell1.outerText,
        initialDataValue2 = gridApi2.getCurrentDataSourceData(4)[0]["Billed"],
        initialGridValue2_2 = dataCell2.outerText,
        initialDataValue2_2 = gridApi2.getCurrentDataSourceData(4)[0]["Markup"];

    gridApi1.updateCellData([
            {index: 4, field: "Billed", value: (parseInt(initialDataValue1) + 5)},
            {index: 4, field: "Markup", value: 533.86}],
        false /*setAsDirty*/);

    var currentGridValue1 = $(row1).children('td')[4].outerText,
        currentDataValue1 = gridApi1.getCurrentDataSourceData(4)[0]["Billed"],
        currentGridValue1_1 = $(row1).children('td')[5].outerText;
    currentDataValue1_1 = gridApi1.getCurrentDataSourceData(4)[0]["Markup"],
        currentGridValue2 = $(row2).children('td')[4].outerText,
        currentDataValue2 = gridApi2.getCurrentDataSourceData(4)[0]["Billed"],
        currentGridValue2_2 = $(row2).children('td')[5].outerText;
    currentDataValue2_2 = gridApi2.getCurrentDataSourceData(4)[0]["Markup"];

    assert.notEqual(initialGridValue1, currentGridValue1, initialGridValue1 + " does not equal " + currentGridValue1);
    assert.notEqual(initialDataValue1, currentDataValue1, initialDataValue1 + " does not equal " + currentDataValue1);
    assert.notOk($(dataCell1).children('span').hasClass('dirty'), "The first grid cell is not dirty");

    assert.equal(initialGridValue2, currentGridValue2, initialGridValue2 + " equals " + currentGridValue2);
    assert.equal(initialDataValue2, currentDataValue2, initialDataValue2 + " equals " + currentDataValue2);
    assert.notOk($(dataCell2).children('span').hasClass('dirty'), "The second grid cell is not dirty");
});

QUnit.module('Grid API Tests: updateRowData', {
    beforeEach: function() {
        var tmp1 = $("#grid1")[0];
        var tmp2 = $("#grid2")[0];
        if (tmp1.grid)
            tmp1.grid.destroy();
        if (tmp2.grid)
            tmp2.grid.destroy();
        grid.createGrid(gridData, tmp1);
        grid.createGrid(testGridData, tmp2);
    }
});

QUnit.test('Closure should prevent row updates across grids', function rowUpdateTestCallback(assert) {
    var gridApi1 = $('#grid1')[0].grid,
        gridApi2 = $('#grid2')[0].grid;

    var dataSourceModel1 = gridApi1.getCurrentDataSourceData(5),
        dataSourceModel2 = gridApi2.getCurrentDataSourceData(5),
        rowModel1 = gridApi1.getCurrentPageData(5),
        rowModel2 = gridApi2.getCurrentPageData(5);

    gridApi1.updateRowData({
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

    var updatedDataSourceModel1 = gridApi1.getCurrentDataSourceData(5),
        updatedDataSourceModel2 = gridApi2.getCurrentDataSourceData(5),
        updatedRowModel1 = gridApi1.getCurrentPageData(5),
        updatedRowModel2 = gridApi2.getCurrentPageData(5);

    assert.notDeepEqual(dataSourceModel1, updatedDataSourceModel1, 'Pre/post dataSource models for grid1 are not equal');
    assert.deepEqual(dataSourceModel2, updatedDataSourceModel2, 'Pre/post dataSource models for grid2 are equal; closure protected the grid data');
    assert.notDeepEqual(rowModel1, updatedRowModel1, 'Pre/post row models for grid1 are not equal');
    assert.deepEqual(rowModel2, updatedRowModel2, 'Pre/post row models for grid2 are equal; closure protected the grid data');
});

QUnit.module('Grid API Tests: updatePageData', {
    beforeEach: function() {
        var tmp1 = $("#grid1")[0];
        var tmp2 = $("#grid2")[0];
        if (tmp1.grid)
            tmp1.grid.destroy();
        if (tmp2.grid)
            tmp2.grid.destroy();
        grid.createGrid(gridData, tmp1);
        grid.createGrid(testGridData, tmp2);
    }
});

QUnit.test('Closure should prevent page updates across grids', function pageUpdateTestsCallback(assert) {
    var gridApi1 = $('#grid1')[0].grid,
        gridApi2 = $('#grid2')[0].grid;

    var dataSource1 = gridApi1.getCurrentDataSourceData(),
        dataSource2 = gridApi2.getCurrentDataSourceData(),
        pageData1 = gridApi1.getCurrentPageData(),
        pageData2 = gridApi2.getCurrentPageData();

    gridApi1.updatePageData();
    gridApi1.updatePageData({});
    gridApi1.updatePageData(function() {});
    gridApi1.updatePageData(null);
    gridApi1.updatePageData(1);
    gridApi1.updatePageData(" ");

    assert.deepEqual(dataSource1, gridApi1.getCurrentDataSourceData(), 'Grid1\'s dataSource remained unchanged');
    assert.deepEqual(pageData1, gridApi1.getCurrentPageData(), 'Grid1\'s page data remained unchanged');

    gridApi2.updatePageData();
    gridApi2.updatePageData({});
    gridApi2.updatePageData(function() {});
    gridApi2.updatePageData(null);
    gridApi2.updatePageData(1);
    gridApi2.updatePageData(" ");

    assert.deepEqual(dataSource2, gridApi2.getCurrentDataSourceData(), 'Grid2\'s dataSource remained unchanged');
    assert.deepEqual(pageData2, gridApi2.getCurrentPageData(), 'Grid2\'s page data remained unchanged');

    gridApi1.updatePageData([
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

    assert.notDeepEqual(dataSource1, gridApi1.getCurrentDataSourceData(), 'Grid1\'s dataSource changed');
    assert.notDeepEqual(pageData1, gridApi1.getCurrentPageData(), 'Grid1\'s page data changed');
    assert.deepEqual(dataSource2, gridApi2.getCurrentDataSourceData(), 'Closure prevented Grids\'s dataSource from changing');
    assert.deepEqual(pageData2, gridApi2.getCurrentPageData(), 'Closure prevented Grid2\'s page data from changing');
});