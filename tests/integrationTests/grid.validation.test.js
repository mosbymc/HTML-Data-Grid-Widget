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
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

QUnit.test('General grid API tests', function gridEventTests(assert) {
    assert.expect(6);
    var done = assert.async(6);
    var gridApi = $(qunitFixture)[0].grid;

    var costCol = $(qunitFixture).find(contentDiv).find('table').find('tr').first().find('[data-field="Cost"]');
    costCol[0].click();
    var costInput = costCol.children('input');
    costInput.val('');
    costInput.blur();

    setTimeout(function timeoutCallback() {
        assert.ok(costInput.hasClass('invalid'), 'The input is in an invalid state.');
        assert.ok($(document).find('.errorMessage').length === 1, 'There is one error message.');

        costInput.val('1800');
        costInput.blur();

        setTimeout(function nestedTimeoutCallback() {
            assert.ok(costInput.hasClass('invalid'), 'The input is in an invalid state.');
            assert.ok($(document).find('.errorMessage').length === 2, 'There is one error message.');

            costInput.val('10');
            costInput.blur();

            setTimeout(function secondNestedTimeoutCallback() {
                assert.ok(!costInput.hasClass('invalid'), 'The input is in a valid state.');
                assert.ok($(document).find('.errorMessage').length === 0, 'There are no error messages.');

                /*var tmp = $("#qunit-fixture")[0];
                if (tmp.grid)
                    tmp.grid.destroy();*/
                done();
            }, 0);
        }, 0);
    }, 0);
});