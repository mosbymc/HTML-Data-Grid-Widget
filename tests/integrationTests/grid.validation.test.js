/*
 //
 //	QUnit integration tests for grid widget and validator
 //
 */

var qunitFixture = '#qunit-fixture',
    contentDiv = '.grid-content-div',
    errorMessage = '.errorMessage';

//Tests based around successful grid creation
QUnit.module('Successful grid validation tests', {
    beforeEach: function destroyAndRecreateGrid() {
        var tmp = $(qunitFixture)[0];
        if (tmp.grid)
            tmp.grid.destroy();
        grid.createGrid(gridData, document.getElementById("qunit-fixture"));
    }
});

QUnit.test('Validator integration tests', function gridEventTests(assert) {
    assert.expect(9);
    var done = assert.async(9);

    var costCol = $(qunitFixture).find(contentDiv).find('table').find('tr').first().find('[data-field="Cost"]');
    costCol[0].click();
    var costInput = costCol.children('input');
    costInput.val('');
    costInput.blur();

    setTimeout(function timeoutCallback() {
        var error = $(document).find(errorMessage);

        assert.ok(costInput.hasClass('invalid'), 'The input is in an invalid state.');
        assert.ok(error.length === 1, 'There is one error message.');
        assert.equal(error.text(), 'Required field.');


        costInput.val('1800');
        costInput.blur();

        setTimeout(function nestedTimeoutCallback() {
            error = $(document).find(errorMessage);
            assert.ok(costInput.hasClass('invalid'), 'The input is in an invalid state.');
            assert.ok(error.length === 2, 'There is one error message.');
            assert.equal(error[0].innerText, 'Total cost cannot exceed $1500.00.');
            assert.equal(error[1].innerText, 'Total cost cannot be less than $1500.00.');

            costInput.val('10');
            costInput.blur();

            setTimeout(function secondNestedTimeoutCallback() {
                assert.ok(!costInput.hasClass('invalid'), 'The input is in a valid state.');
                assert.ok($(document).find(errorMessage).length === 0, 'There are no error messages.');

                var tmp = $("#qunit-fixture")[0];
                if (tmp.grid)
                    tmp.grid.destroy();
                done();
            }, 0);
        }, 0);
    }, 0);
});