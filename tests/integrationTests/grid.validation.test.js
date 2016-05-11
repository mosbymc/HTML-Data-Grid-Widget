/*
 //
 //	QUnit integration tests for grid widget and validator
 //
 */

var qunitFixture = '#qunit-fixture',
    contentDiv = '.grid-content-div';

//Tests based around successful grid creation
QUnit.module('Successful grid validation tests', {
    beforeEach: function destroyAndRecreateGrid() {
        var tmp = $("#qunit-fixture")[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

QUnit.test('General grid API tests', function gridEventTests(assert) {
    var done = assert.async();
    var gridApi = $(qunitFixture)[0].grid;

    var costCol = $(qunitFixture).find(contentDiv).find('table').find('tr').first().find('[data-field="Cost"]');
    costCol[0].click();
    var costInput = costCol.children('input');
    costInput.val('');
    costInput.blur();

    setTimeout(function timeoutCallback() {
        var costCol = $(qunitFixture).find(contentDiv).find('table').find('tr').first().find('[data-field="Cost"]');
        var costInput = costCol.children('input');
        var t = $(qunitFixture).find(contentDiv).find('table').find('tr').find('td :nth-child(4)')[0].click();
        var cellVal = gridApi.activeCellData;
        assert.ok(gridApi.activeCellData === 'New Brakes', 'New Brakes was returned when the first rows first column was clicked');
        assert.ok(gridApi.selectedRow === 0, 'The selected cell\'s parent row index was returned');
        var cell = $(qunitFixture).find(contentDiv).find('table').find('tr').find('td').first()[0];
        var colIndex = $(cell).parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + $(cell).data("field") + "']").data("index");
        assert.deepEqual(gridApi.selectedColumn, { field: $(cell).data("field"), columnIndex: colIndex }, 'null was returned when no active cell');
        done();
    }, 0);
    /*
    var colIndex = cell.parents('.grid-wrapper').find('.grid-header-wrapper').find('.grid-headerRow').children('[data-field="' + field + '"]').data('index');

    var t = $(qunitFixture).find(contentDiv).find('table').find('tr').find('td :nth-child(4)')[0].click();
    var cellVal = gridApi.activeCellData;
    assert.ok(gridApi.activeCellData === 'New Brakes', 'New Brakes was returned when the first rows first column was clicked');
    assert.ok(gridApi.selectedRow === 0, 'The selected cell\'s parent row index was returned');
    var cell = $(qunitFixture).find(contentDiv).find('table').find('tr').find('td').first()[0];
    var colIndex = $(cell).parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + $(cell).data("field") + "']").data("index");
    assert.deepEqual(gridApi.selectedColumn, { field: $(cell).data("field"), columnIndex: colIndex }, 'null was returned when no active cell');
    */
});