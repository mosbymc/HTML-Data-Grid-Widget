/*
The MIT License (MIT) 
Copyright © 2014
Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the “Software”), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, merge, 
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var grid = (function grid($) {
	"use strict";
	function create(gridData, gridDiv) {
		if (gridData && gridDiv) {
			var id = storage.count;
			gridDiv = $(gridDiv);
			var wrapperDiv = $("<div id='grid-wrapper-" + id + "' data-grid_id='" + id +"' class=grid-wrapper></div>").appendTo(gridDiv);
			var headerDiv = $("<div id='grid-header-" + id + "' data-grid_header_id='" + id + "' class=grid-header-div></div>").appendTo(wrapperDiv);
			headerDiv.append("<div class=grid-header-wrapper></div>");
			wrapperDiv.append("<div id='grid-content-" + id + "' data-grid_content_id='" + id + "' class=grid-content-div></div>");
			wrapperDiv.append("<div id='grid-footer-" + id + "' data-grid_footer_id='" + id + "' class=grid-footer-div></div>");

			storage.grids[id] = cloneGridData(gridData);
			storage.grids[id].pageNum = 1;
			storage.grids[id].pageSize = gridData.pageSize || 25;
			if (gridData.dataSource.data) storage.grids[id].originalData = cloneGridData(gridData.dataSource.data);
			storage.grids[id].grid = gridDiv;
			storage.grids[id].currentEdit = {};
			storage.grids[id].pageRequest = {};
			storage.grids[id].updating = true;
			gridDiv[0].grid = {};

			createGridGetters(gridDiv, id);

			if (!storage.grids[id].dataSource.rowCount) storage.grids[id].dataSource.rowCount = gridData.dataSource.data.length;
			gridDiv[0].addNewColumns = addNewColumns;
			if (gridData.useValidator && window.validator) validator.setAdditionalEvents(["blur", "change"]);

			if (gridData.constructor === Array) {
				createGridColumnsFromArray(gridData, gridDiv);
			}
			else {
				createGridHeaders(gridData, gridDiv, true);
				storage.grids[id].pageRequest.eventType = "newGrid";
				preparePageDataGetRequest(id);
			}
		}
	}

	function createGridGetters(gridDiv, gridId) {
		if (!gridDiv[0].grid.activeCellData) {		//returns the active cell's current editable value
			Object.defineProperty(
				gridDiv[0].grid,
				"activeCellData",
				{
					get: function() {
						var cell = gridDiv.find('.active-cell');
						if (!cell.length)
							return null;
						if (cell[0].type === "checkbox")
							return cell[0].checked;
						return cell.val();
					}
				}
			);
		}

		if (!gridDiv[0].grid.selectedRow) {		//returns the active cell's row index
			Object.defineProperty(
				gridDiv[0].grid,
				"selectedRow",
				{
					get: function() {
						var cell = gridDiv.find('.active-cell');
						if (!cell.length)
							return null;
						return cell.parents("tr").index();
					}
				}
			);
		}

		if (!gridDiv[0].grid.selectedColumn) {		//returns the active cell's field and column index
			Object.defineProperty(
				gridDiv[0].grid,
				"selectedColumn",
				{
					get: function() {
						var cell = gridDiv.find('.active-cell');
						if (!cell.length)
							return null;
						var field = cell.parents("td").data("field");
						var colIndex = cell.parents(".grid-wrapper").find(".grid-header-wrapper").find(".grid-headerRow").children("[data-field='" + field + "']").data("index");
						return { field: field, columnIndex: colIndex };
					}
				}
			);
		}
	}

	function addNewColumns(newData, gridDiv) {
		var oldGrid = $(gridDiv).find(".grid-wrapper");
		var id = oldGrid.data("grid_id");
		var oldData = storage.grids[id].data;

		for (var i = 0; i < newData.length; i++) {
			for (var col in newData[i]) {
				if (!oldData.data[i][col]) {
					oldData.data[i][col] = newData[i][col];
				}
				if (!oldData.columns[col]) {
					oldData.columns[col] = {
						field: col,
						title: col,
						index: Object.keys(oldData.columns).length
					}
				}
			}
		}

		gridDiv.removeChild(oldGrid);
		create(oldData, gridDiv);
	}

	function createGridHeaders(gridData, gridDiv) {
		var gridHeader = gridDiv.find(".grid-header-div");
		var gridHeadWrap = gridHeader.find(".grid-header-wrapper");
		var headerTable = $("<table></table>").appendTo(gridHeadWrap)
		headerTable.css("width","auto");
		var colgroup = $("<colgroup></colgroup>").appendTo(headerTable);;
		var headerTHead = $("<thead></thead>").appendTo(headerTable);
		var headerRow = $("<tr class=grid-headerRow></tr>").appendTo(headerTHead);
		var headerCol = {};
		var index = 0;
		var buildSummary = (gridData.summaryRow && gridData.summaryRow.positionAt === "top");

		if (gridData.groupedBy && gridData.groupedBy !== "none") {
			colgroup.append("<col class='group_col'></col>");
			headerRow.append("<th class='grid-header-cell grouped_cell'></th>");
		}

		for (var col in gridData.columns) {
			var column = $("<col></col>").appendTo(colgroup);
			var text = gridData.columns[col].title || col;
			var th = $("<th id='" + col + "_grid_id_" + gridHeader.data("grid_header_id") + "' data-field='" + col + "' data-index='" + index + "' class=grid-header-cell></th>").appendTo(headerRow);
			th.text(text);

			if (gridData.columns[col].attributes && gridData.columns[col].attributes.headerClasses && gridData.columns[col].attributes.headerClasses.constructor ===  Array) {
				for (var i = 0; i < gridData.columns[col].attributes.headerClasses.length; i++) {
					th.addClass(gridData.columns[col].attributes.headerClasses[i]);
				} 
			}

			if (gridData.reorderable || gridData.columns[col].reorderable) {
				th.prop('draggable', true);
				setDragAndDropListeners(th);
			}
			if (gridData.sortable || gridData.columns[col].sortable) {
				setSortableClickListener(th);
			}
			if (gridData.columns[col].filterable) {
				var type = gridData.columns[col].type || "string";
				var anchor = $("<a href='#'></a>").appendTo(th);
				anchor.append("<span class='filterSpan' data-type='" + type + "' data-field='" + th.data("field") + "'></span>");
				attachFilterListener(anchor);
				$(document).on('click', function hideFilterHandler(e) {
					if (!$(e.target).hasClass("filter-div")) {
						if ($(e.target).parents(".filter-div").length < 1) {
							$(document).find(".filter-div").each(function iterateFilterDivsCallback(idx, val) {
								$(val).addClass("hiddenFilter");
							});
						}
					}
				});
				$(document).on('scroll', function scrollFilterHandler(e) {
					$(document).find(".filter-div").each(function iterateFilterDivsCallback(idx, val) {
						var filter = $(val);
						if (!filter.hasClass("hiddenFilter")) {
							var gridWrapper = filter.parents(".grid-wrapper");
							var filterCell = gridWrapper.find("th").filter(function (idx, val) {
								return $(val).data("field") === filter.data("parentfield");
							});
							var filterCellOffset = filterCell.offset();
							filter.css("top", (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
							filter.css("left", (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
						}
					});
				});
			}
			index++;
		}

		if (buildSummary) {
			var sum = buildSummaryRow(gridData);
			var sumRow = $("<tr class=summary-row-header></tr>").appendTo(headerTHead);
			if (gridData.groupedBy && gridData.groupedBy !== "none") {
				sumRow.append("<th class='grid-header-cell grouped_cell'></th>");
			}
			for (var col in sum) {
				sumRow.append("<td data-field='" + col + "' class=summary-cell-header>" + sum[col] + "</td>");
			}
		}
		headerTable.css("width","");
		createGridFooter(gridDiv, gridData);
	}

	function buildHeaderAggregations(gridData, gridId) {
		var sum = buildSummaryRow(gridData);
		var headerTHead = $("#grid-header-" + gridId).find("thead");
		var sumRow = headerTHead.find(".summary-row-header");
		if (sumRow.length)
			sumRow.remove();
		sumRow = $("<tr class=summary-row-header></tr>").appendTo(headerTHead);
		if (gridData.groupedBy && gridData.groupedBy !== "none") {
			sumRow.append("<th class='grid-header-cell grouped_cell'></th>");
		}
		for (var col in sum) {
			sumRow.append("<td data-field='" + col + "' class=summary-cell-header>" + sum[col] + "</td>");
		}
	}

	function buildSummaryRow(gridData) {
		var sRow = {};
		var data = gridData.alteredData ? gridData.alteredData :  gridData.dataSource.data;
		for (var col in gridData.columns) {
			var type = gridData.columns[col].type || "";
			var text;
			switch (gridData.summaryRow[col].type) {
				case "count":
					if (gridData.summaryRow[col].value)
						sRow[col] = "Count:" + gridData.summaryRow[col].value;
					else {
						 text = gridData.summaryRow[col].template ? gridData.summaryRow[col].template.replace("{{data}}", gridData.dataSource.rowCount) : gridData.dataSource.rowCount;
						 sRow[col] = "Count: " + text;
					}
					break;
				case "average":
					if (gridData.summaryRow[col].value)
						sRow[col] = "Avg:" + gridData.summaryRow[col].value;
					else {
						var total = 0;
						for (var i = 0; i < gridData.dataSource.rowCount; i++) {
							total += parseFloat(data[i][col]);
						}
						var avg = parseFloat(total/parseFloat(gridData.dataSource.rowCount)).toFixed(2);
						text = gridData.summaryRow[col].template ? gridData.summaryRow[col].template.replace("{{data}}", avg) : avg;
						sRow[col] = "Avg: " + text;
					}
					break;
				case "total":
					if (gridData.summaryRow[col].value)
						sRow[col] = "Total:" + gridData.summaryRow[col].value;
					else {
						var total = 0;
						for (var i = 0; i < gridData.dataSource.rowCount; i++) {
							total += parseFloat(data[i][col]);
						}
						if (type === "currency") total = total.toFixed(2);
						text = gridData.summaryRow[col].template ? gridData.summaryRow[col].template.replace("{{data}}", total) : total;
						sRow[col] = "Total: " + text;
					}
					break;
				case "min":
					if (gridData.summaryRow[col].value)
						sRow[col] = "Minimum:" + gridData.summaryRow[col].value;
					else {
						var min;
						for (var i = 0; i < gridData.dataSource.rowCount; i++) {
							if (!min || parseFloat(data[i][col]) < min) min = parseFloat(data[i][col]);
						}
						text = gridData.summaryRow[col].template ? gridData.summaryRow[col].template.replace("{{data}}", min) : min;
						sRow[col] = "Minimum: " + text;
					}
					break;
				case "max":
					if (gridData.summaryRow[col].value)
						sRow[col] = "Maximum:" + gridData.summaryRow[col].value;
					else {
						var max;
						for (var i = 0; i < gridData.dataSource.rowCount; i++) {
							if (!max || parseFloat(data[i][col]) > max) max = parseFloat(data[i][col]);
						}
						text = gridData.summaryRow[col].template ? gridData.summaryRow[col].template.replace("{{data}}", max) : max;
						sRow[col] = "Maximum: " + text;
					}
					break;
				case "":
					sRow[col] = "";
					break;
			}
		}
		return sRow;
	}

	function createGridContent(gridData, gridDiv, isNewGrid) {
		var gridContent = gridDiv.find(".grid-content-div");
		gridContent.css("height", "250px");
		var loader = $("<span id='loader-span' class='fa fa-spinner fa-pulse fa-2x'></span>").appendTo(gridContent);
		var gcOffsets = gridContent.offset();
		var top = gcOffsets.top + (gridContent.height()/2) + $(window).scrollTop();
		var left = gcOffsets.left + (gridContent.width()/2) + $(window).scrollLeft();
		loader.css("top", top).css("left", left);
		var contentTable = $("<table id='" + gridDiv[0].id + "_content' style='height:auto;'></table>").appendTo(gridContent);
		var colGroup = $("<colgroup></colgroup>").appendTo(contentTable);
		var contentTBody = $("<tbody></tbody>").appendTo(contentTable);
		var columns = [];
		var pageNum = storage.grids[gridContent.data("grid_content_id")].pageNum;
		gridDiv.find("th").each(function(idx, val) {
			if (!$(val).hasClass("group_spacer"))
				columns.push($(val).data("field"));
		});

		var pageSize = storage.grids[gridContent.data("grid_content_id")].pageSize;
		var rowStart = 0;
		var rowEnd = gridData.dataSource.data.length;
		var curRow;
		var rows = gridData.rows;

		for (var i = (rowStart); i < rowEnd; i++) {
			if (gridData.groupedBy && gridData.groupedBy !== "none") {
				if (!curRow || gridData.dataSource.data[i][gridData.groupedBy] !== curRow) {
					curRow = gridData.dataSource.data[i][gridData.groupedBy];
					var groupedText = gridData.columns[gridData.groupedBy].template ? gridData.columns[gridData.groupedBy].template.replace("{{data}}", curRow) : curRow;
					var groupTr = $("<tr class='grouped_row_header'></tr>").appendTo(contentTBody);
					groupTr.append("<td colspan='" + (columns.length + 1) + "'><p class='grouped'><a class='sort-desc sortSpan group_acc_link'></a>" + gridData.groupedBy + ": " + groupedText + "</p></td>");
				}
			}
			var tr = $("<tr></tr>").appendTo(contentTBody);
			if (i % 2) {
				tr.addClass('alt-row');
				if (rows && rows.alternateRows && rows.alternateRows.constructor === Array)
					for (var x = 0; x < rows.alternateRows.length; x++) {
						tr.addClass(rows.alternateRows[x]);
					}
			}

			if (rows && rows.all && rows.all.constructor === Array) {
				for (var x = 0; x < rows.all.length; x++) {
					tr.addClass(rows.all[x]);
				}
			}

			if (gridData.groupedBy && gridData.groupedBy !== "none")
				tr.append("<td class='grouped_cell'>&nbsp</td>");

			for (var j = 0; j < columns.length; j++) {
				var td = $("<td data-field='" + columns[j] + "' class='grid-content-cell'></td>").appendTo(tr);
				if (gridData.columns[columns[j]].attributes && gridData.columns[columns[j]].attributes.cellClasses && gridData.columns[columns[j]].attributes.cellClasses.constructor === Array) {
					for (var z = 0; z < gridData.columns[columns[j]].attributes.cellClasses.length; z++) {
						td.addClass(gridData.columns[columns[j]].attributes.cellClasses[z]);
					}
				}
				var type = gridData.columns[columns[j]].type || "";
				var tes = gridData.dataSource.data[i][columns[j]];
				if ((type === "number" || type === "currency" || type === "percent") && typeof gridData.dataSource.data[i][columns[j]] === "number") {
					var decimalPlaces = typeof gridData.columns[columns[j]].decimals === 'number' ?  gridData.columns[columns[j]].decimals : 2;
					gridData.dataSource.data[i][columns[j]] = gridData.dataSource.data[i][columns[j]].toFixed(decimalPlaces);
				}
				var text = gridData.columns[columns[j]].template ? gridData.columns[columns[j]].template.replace("{{data}}", gridData.dataSource.data[i][columns[j]]) : gridData.dataSource.data[i][columns[j]];
				
				if (gridData.dataSource.data[i][columns[j]] !== undefined) {
					td.text(text);
				}

				if (gridData.columns[columns[j]].editable) {
					createCellEditSaveDiv(gridDiv);
					td.on('click', function editableCellClickHandler(e) {
						if (e.target !== e.currentTarget) return;
						if (gridContent.find(".invalid").length)
							return;
						var cell = $(e.currentTarget);
						cell.text("");

						var id = gridContent.data("grid_content_id");
						if (storage.grids[id].updating) return;
						var index = cell.parents("tr").index();
						var field = cell.data("field");
						var pageNum = storage.grids[id].pageNum;
						var rowNum = storage.grids[id].pageSize;
						var type = storage.grids[id].columns[field].type || "";
						var input;
						var val = storage.grids[id].dataSource.data[index][field];
						var dataType;
						var gridValidation;
						var dataAttributes = "";

						var gridValidation = storage.grids[id].columns[field].validation;

						if (gridValidation && storage.grids[id].useValidator && window.validator) {
							if (!window.grid.validation) {
								Object.defineProperty(
									window.grid,
									"validation",
									{
										value: {},
										writable: false
									}
								);
							}
							if (gridValidation.required)
								dataAttributes += "data-required";
							if (gridValidation.customRules) {
								dataAttributes += " data-customrules='";
								for (var rule in gridValidation.customRules) {
									dataAttributes += "grid.validation." + rule + ",";
									if (!window.grid.validation[rule]) {
										Object.defineProperty(
											window.grid.validation,
											rule,
											{
												value: gridValidation.customRules[rule],
												writable: false,
												configurable: false
											}
										)
									}
								}
								dataAttributes += "'";
							}
							var gridBodyId = "grid-content-" + id.toString();
							dataAttributes += " data-validateon='blur' data-offsetHeight='-6' data-offsetWidth='8' data-modalid='" + gridBodyId + "'";
						}

						switch (type) {
							case "bool":
								input = $("<input type='checkbox' class='input checkbox active-cell'" + dataAttributes + "/>").appendTo(cell);
								if (val || val === "true") {
									input[0].checked = true;
								}
								else input[0].checked = false;
								break;
							case "number":
							case "currency":
								var decimalPlaces = typeof gridData.columns[field].decimals === 'number' ?  gridData.columns[field].decimals : 2;
								var inputval = parseFloat(val).toFixed(decimalPlaces);
								input = $("<input type='text' value='" + inputval + "' class='input textbox cell-edit-input active-cell'" + dataAttributes + "/>").appendTo(cell);
								dataType = 'numeric';
								break;
							case "time":
								input = $("<input type='text' value='" + val + "' class='input textbox cell-edit-input active-cell'" + dataAttributes + "/>").appendTo(cell);
								dataType = "time";
								break;
							case "date":
								var dateVal = val === undefined ? new Date(Date.now()) : new Date(Date.parse(val));
								var inputVal = dateVal.toISOString().split('T')[0];
								input = $("<input type='date' value='" + inputVal + "' class='input textbox active-cell'" + dataAttributes + "/>").appendTo(cell);
								dataType = "date";
								break;
							default:
								input = $("<input type='text' value='" + val + "' class='input textbox cell-edit-input active-cell'" + dataAttributes + "/>").appendTo(cell);
								dataType = null;
								break;
						}

						if (gridValidation) input.addClass("inputValidate");

						input[0].focus();

						if (dataType && dataType !== "date" && dataType !== "time") {
							input.on("keypress", function restrictCharsHandler(e) {
			                    var code = event.charCode? event.charCode : event.keyCode,
					        	key = String.fromCharCode(code);
					        	var newVal = insertKey($(this), key);
					        	var re = new RegExp(dataTypes[dataType]);
					        	var temp = re.test(newVal);
					        	if (!re.test(newVal)) {
					        		e.preventDefault();
					        		return false;
					        	}
					        	var id = $(this).parents(".grid-wrapper").data("grid_id");
			                    storage.grids[id].currentEdit[field] = newVal;
							});
						}

						if (gridValidation && dataAttributes !== "") {
							attachValidationListener(input[0]);
						}
						else {
							input.on('blur', function cellEditBlurHandler(e) {
								saveCellEditData(input);
							});
						}
						var detail = {
							index: index,
							value: val,
							column: field,
							dataType: type
						};
						document.dispatchEvent(new CustomEvent("beforeEdit", { 'detail': detail}));
						var test1 = gridDiv[0].grid.activeCellData;
						var test2 = gridDiv[0].grid.selectedRow;
						var test3 = gridDiv[0].grid.selectedColumn;
					});
				}
				else if (gridData.columns[columns[j]].selectable) {	//attach event handlers to save data
					createCellEditSaveDiv(gridDiv);
					td.on('click', function selectableCellClickHandler(e) {
						if (e.target !== e.currentTarget) return;
						if (gridContent.find(".invalid").length)
							return;
						var cell = $(e.currentTarget);
						cell.text("");
						var id = gridContent.data("grid_content_id");
						var index = cell.parents("tr").index();
						var field = cell.data("field");
						if (storage.grids[id].updating) return;		//can't edit a cell if the grid is updating

						var gridValidation;
						var dataAttributes = "";

						if (gridValidation = storage.grids[id].columns[field].validation) {
							if (!window.grid.validation) {
								Object.defineProperty(
									window.grid,
									"validation",
									{
										value: {},
										writable: false
									}
								);
							}
							if (gridValidation.required)
								dataAttributes += "data-required";
							if (gridValidation.customRules) {
								dataAttributes += " data-customrules='";
								for (var rule in gridValidation.customRules) {
									dataAttributes += "grid.validation." + rule + ",";
									if (!window.grid.validation[rule]) {
										Object.defineProperty(
											window.grid.validation,
											rule,
											{
												value: gridValidation.customRules[rule],
												writable: false,
												configurable: false
											}
										)
									}
								}
								dataAttributes += "'";
							}
							var gridBodyId = "grid-content-" + id.toString();
							dataAttributes += " data-validateon='blur' data-offsetWidth='8' data-modalid='" + gridBodyId + "'";
						}

						var select = $("<select class='input select active-cell'" + dataAttributes + "></select>").appendTo(cell);
						var options = [];
						var pageNum = storage.grids[id].pageNum;
						var rowNum = storage.grids[id].pageSize;
						var val = storage.grids[id].dataSource.data[index][field];
						var setVal = gridData.dataSource.data[index][field];
						options.push(setVal);
						var test = gridData.columns[field].options;
						for (var z = 0, length = gridData.columns[field].options.length; z < length; z++) {
							if (setVal !== gridData.columns[field].options[z]) {
								options.push(gridData.columns[field].options[z]);
							}
						}
						for (var k = 0; k < options.length; k++) {
							var opt = $("<option value='" + options[k] + "'>" + options[k] + "</option>");
							select.append(opt);
						}
						select.val(setVal);
						select[0].focus();

						if (gridValidation) select.addClass("inputValidate");

						if (gridValidation && dataAttributes !== "") {
							attachValidationListener(select[0]);
						}
						else {
							input.on('blur', function cellEditBlurHandler(e) {
								saveCellSelectData(select);
							});
						}
						var detail = {
							index: index,
							value: val,
							column: field,
							dataType: storage.grids[id].columns[field].type || ""
						};
						document.dispatchEvent(new CustomEvent("beforeSelect", { 'detail': detail}));
					});
				}
			}
		}

		$(".group_acc_link").each(function iterateAccordionsCallback(idx, val) {
			$(val).data("state", "open");
		});

		$(".group_acc_link").on("click", function groupedAccordionsClickListenerCallback(e) {
			var accRow = $(e.currentTarget).parents("tr");
			if ($(e.currentTarget).data("state") === "open") {
				$(e.currentTarget).data("state", "closed").removeClass("sort-desc").addClass("sort-asc");
				accRow.nextUntil(".grouped_row_header").css("display", "none");
			}
			else {
				$(e.currentTarget).data("state", "open").removeClass("sort-asc").addClass("sort-desc");;
				accRow.nextUntil(".grouped_row_header").css("display", "table-row");
			}
		});

		for (var k = 0; k < columns.length; k++) {
			colGroup.append("<col></col>");
		}
		if (gridData.groupedBy && gridData.groupedBy !== "none")
			colGroup.prepend("<col class='group_col'></col>");

		if (gridData.summaryRow && gridData.summaryRow.positionAt === "bottom") {
			var sum = buildSummaryRow(gridData);
			var sumRow = $("<tr class='summary-row-footer'></tr>").appendTo(headerTHead);
			for (var col in sum) {
				sumRow.append("<td data-field='" + col + "' class='summary-cell-footer'>" + sum[col] + "</td>");
			}
		}

		gridContent.on('scroll', function contentDivScrollCallback(e) {
			if (resizing) return;
			var cDiv = $(e.currentTarget);
			var headWrap = cDiv.parents(".grid-wrapper").find(".grid-header-wrapper");
			headWrap.scrollLeft(cDiv.scrollLeft());
		});

		/*
			This is set to make up for the vertical scroll bar that the gridContent div has.
			It helps keep the header columns aligned with the content columns, and makes
			the scroll handler for the content grid work correctly.
		*/
		var headerId = "grid-header-" + gridContent.data("grid_content_id");
		var headDiv = $("#" + headerId);
		var sizeDiff = headDiv[0].clientWidth - gridContent[0].clientWidth;
		headDiv.css("paddingRight", sizeDiff);

		//Once the column widths have been set (i.e. the first time creating the grid), they should change size again....
		//any time the grid is paged, sorted, filtered, etc., the cell widths shouldn't change, the new data should just be dumped into
		//the grid.
		if (isNewGrid) setColWidths(gridData, gridDiv);
		else copyGridWidth(gridData, gridDiv);

		var id = gridContent.data("grid_content_id");
		storage.grids[id].dataSource.data = gridData.dataSource.data;
		loader.remove();
		storage.grids[id].updating = false;
	}

	function setColWidths(gridData, gridDiv) {
		var tableCells = gridDiv.find("th, td");
		var tables = gridDiv.find("table");
		var columnNames = {};
		var gridContent = gridDiv.find(".grid-content-div")
		for (var name in gridData.columns) {
			columnNames[name] = gridData.columns[name].width || 0;
		}

		tableCells.each(function iterateTableCellsCallback(idx, val) {
			var column = $(val).data("field");
			var g = $(val).width();
			if (val.clientWidth > columnNames[column]) {
				columnNames[column] = val.clientWidth;
			}
		});

		var totalWidth = 0;
		var columnList = [];
		for (var name in columnNames) {
			totalWidth += columnNames[name];
			columnList.push(name);
		}

		var colGroups = gridDiv.find("col");

		//If there's more room available to display the grid than is currently needed
		if (totalWidth <= gridContent[0].clientWidth) {
			var avgWidth = gridContent[0].clientWidth/Object.keys(columnNames).length;
			var remainder = gridContent[0].clientWidth%Object.keys(columnNames).length;
			var curWidth = 0;
			var headerSizes = [];
			colGroups.each(function iterateColGroupsCallback(idx, val) {
				var i = idx%(colGroups.length/2);
				var corrector = 0;
				if (gridData.groupedBy && gridData.groupedBy !== "none") {
					i = (idx%(colGroups.length/2)) - 1;
					corrector = -1;
				}
				if (gridData.groupedBy && gridData.groupedBy !== "none" && (idx === 0 || idx === colGroups.length/2)) {
					$(val).css("width", 27);
				}
				else {
					if (idx > ((colGroups.length/2)-1)) {
						$(val).css("width", headerSizes[idx + corrector]);
					}
					else {
						var widthToAdd = columnNames[columnList[i]];
						var len = colGroups.length/2;
						if (idx === len) {
							curWidth = widthToAdd;
						}
						else if (idx === len-1 || idx === colGroups.length-1) {

						}
						else {
							curWidth += widthToAdd;
						}

						if (idx === (colGroups.length-1) || idx === ((colGroups.length/2)-1)) {
							var remainingWidth = gridContent[0].clientWidth - curWidth;
							$(val).css("width", remainingWidth);
							widthToAdd = remainingWidth;
						}
						else $(val).css("width", widthToAdd);
						headerSizes[(i + (colGroups.length/2))] = widthToAdd;
					}
				}
			});
		}
		else {	//There's less room than what's available
			tables.each(function (idx, val) {
				$(val).css("width", totalWidth);
			});
			colGroups.each(function iterateColGroupsCallback(idx, val) {
				var i = idx%(colGroups.length/2);
				if (gridData.groupedBy && gridData.groupedBy !== "none")
					i = (idx%(colGroups.length/2)) - 1;
				if (gridData.groupedBy && gridData.groupedBy !== "none" && (idx === 0 || idx === colGroups.length/2)) {
					$(val).css("width", 27);
				}
				else {
					if (gridData.groupedBy && gridData.groupedBy !== "none" && i == 0)
						return;
					if (idx === (colGroups.length-1) || idx === ((colGroups.length/2)-1)) $(val).css("width", (columnNames[columnList[i]]));
					else $(val).css("width", columnNames[columnList[i]]);
				}
			});
		}
	}

	function copyGridWidth(gridData, gridDiv) {
		var headerCols = gridDiv.find(".grid-header-div").find("col");
		var contentCols = gridDiv.find(".grid-content-div").find("col");
		var headerTable = gridDiv.find(".grid-header-div").find("table");
		var contentTable = gridDiv.find(".grid-content-div").find("table");

		contentTable.css("width", headerTable[0].clientWidth);

		contentCols.each(function (idx, val) {
			if ($(val).hasClass("group_col"))
					return;
			var width = $(headerCols[idx]).width();
			$(val).css("width", width);
		});
	}

	function attachValidationListener(elem) {
		$(document).one("validated", function(e, eventData) {
			if (eventData.element === elem) {
				if (eventData.succeeded && elem.type !== "select" && elem.type !== "select-one")
					saveCellEditData($(elem));
				else if (eventData.succeeded)
					saveCellSelectData($(elem));
				else {
					elem.focus();
					attachValidationListener(elem);
				}
			}
			else {
				attachValidationListener(elem);
			}
		});
	}

	function saveCellEditData(input) {
		if (input[0].type == "checkbox") {
			var val = input.is(":checked");
		}
		else var val = input.val();
		var gridContent = input.parents(".grid-wrapper").find(".grid-content-div");
		var cell = input.parents("td");
		var id = gridContent.data("grid_content_id");
		var index = cell.parents("tr").index();
		var field = cell.data("field");
		var type = storage.grids[id].columns[field].type || "";
		var saveVal;
		var decimalPlaces = 2;

		input.remove();

		switch (type) {
			case "number":
			case "currency":
				var re = new RegExp(dataTypes["numeric"]);
				if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
				decimalPlaces = typeof gridData.columns[field].decimals === 'number' ?  gridData.columns[field].decimals : 2;
				var cellVal = parseFloat(val).toFixed(decimalPlaces);
				saveVal = typeof storage.grids[id].dataSource.data[index][field] === "string" ? parseFloat(val.replace(",", "")).toFixed(decimalPlaces) : parseFloat(parseFloat(val.replace(",", "")).toFixed(decimalPlaces));
				var text = gridData.columns[field].template ? gridData.columns[field].template.replace("{{data}}", numberWithCommas(cellVal)) : numberWithCommas(cellVal);
				cell.text(text);
				break;
			case "date":
				var parseDate = Date.parse(val);
				if (!isNaN(parseDate) && storage.grids[id].columns[field].format) {
					var tempDate = new Date(parseDate);
					var dd = tempDate.getUTCDate();
					var mm = tempDate.getUTCMonth() + 1;
					var yy = tempDate.getUTCFullYear();
					saveVal = storage.grids[id].columns[field].format.replace("mm", mm).replace("dd", dd).replace("yyyy", yy);
				}
				else if (!isNaN(parseDate)) {
					saveVal = new Date(Date.parse(val));
				}
				else
					saveVal = "";
				cell.text(saveVal);
				break;
			case "time":
				var tod = "AM",
					delimiter = storage.grids[id].columns[field].delimiter || ":",
					timeFormat = storage.grids[id].columns[field].timeFormat,
					re = new RegExp(dataTypes["time"]);
				if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index][field];
				var timeArray = getNumbersFromTime(val, storage.grids[id].columns[field].timeFormat);
				if (timeFormat === "24" && val.indexOf('PM') > -1) {
					timeArray[0] = timeArray[0] === 12 ? 0 : (timeArray[0] + 12);
				}
				else if (timeFormat === "12" && timeArray[0] > 12) {
					timeArray[0] = (timeArray[0] - 12);
					tod = "PM";
				}
				saveVal = timeArray[0] + delimiter + timeArray[1] + delimiter;
				saveVal += timeArray[2] ? timeArray[2] : "00";
				if (storage.grids[id].columns[field].timeFormat === "12") {
					tod = val.indexOf('PM') > -1 ? 'PM' : tod;
					saveVal += " " + tod;
				}
				cell.text(saveVal);
				break;
			default: 		//string, boolean
				saveVal = val;
				cell.text(val);
				break;
		}
		
		storage.grids[id].currentEdit[field] = null;
		var previousVal = storage.grids[id].dataSource.data[index][field];
		if (previousVal !== saveVal && !("" === saveVal && undefined === previousVal)) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
			storage.grids[id].dataSource.data[index][field] = saveVal;
			cell.prepend("<span class='dirty'></span>");
		}
		else {
			storage.grids[id].dataSource.data[index][field] = previousVal;
		}
		var detail = {
			index: index,
			value: val,
			column: field,
			dataType: storage.grids[id].columns[field].type || ""
		};
		document.dispatchEvent(new CustomEvent("afterEdit", { 'detail': detail}));
	}

	function saveCellSelectData(select) {
		var gridContent = select.parents(".grid-wrapper").find(".grid-content-div");
		var val = select.val();
		var parentCell = select.parents("td");
		select.remove();
		var id = gridContent.data("grid_content_id");
		var index = parentCell.parents("tr").index();
		var field = parentCell.data("field");
		var text = gridData.columns[field].template ? gridData.columns[field].template.replace("{{data}}", val) : val;
		parentCell.text(text);
		var previousVal = storage.grids[id].dataSource.data[index][field];
		if (previousVal !== val) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
			parentCell.prepend("<span class='dirty'></span>");
			storage.grids[id].dataSource.data[index][field] = val;
		}
		var detail = {
			index: index,
			value: val,
			column: field,
			dataType: storage.grids[id].columns[field].type || ""
		};
		document.dispatchEvent(new CustomEvent("afterSelect", { 'detail': detail}));
	}

	function createCellEditSaveDiv(gridDiv) {
		var id = gridDiv.find(".grid-wrapper").data("grid_id");
		if ($("#grid_" + id + "_toolbar").length)	//if the toolbar has already been created, don't create it again.
			return;

		var saveBar = $("<div id='grid_" + id + "_toolbar' class='toolbar clearfix'></div>").prependTo(gridDiv);
		var saveAnchor = $("<a href='#' class='toolbarAnchor saveToolbar'></a>").appendTo(saveBar);
		saveAnchor.append("<span class='toolbarSpan saveToolbarSpan'></span>Save Changes");

		var deleteAnchor = $("<a href='#' class='toolbarAnchor deleteToolbar'></a>").appendTo(saveBar);
		deleteAnchor.append("<span class='toolbarSpan deleteToolbarSpan'>Delete Changes</span>");

		saveAnchor.on('click', function saveChangesHandler(e) {
			if (storage.grids[id].updating) return;
			var dirtyCells = [];
			var dirty = gridDiv.find(".dirty").each(function iterateDirtySpansCallback(idx, val) {
				dirtyCells.push($(val).parents("td"));
			});

			if (typeof storage.grids[id].dataSource.update !== "fuction") {
				for (var i = 0; i < dirtyCells.length; i++) {
					var index = dirtyCells[i].parents("tr").index();
					var field = dirtyCells[i].data("field");
					var pageNum = storage.grids[id].pageNum;
					var rowNum = storage.grids[id].pageSize;
					var addend = (pageNum-1)*rowNum;
					storage.grids[id].originalData[index + addend][field] = storage.grids[id].dataSource.data[index][field];
					dirtyCells[i].find(".dirty").remove();
				}
			}
			else {
				storage.grids[id].pageRequest.eventType = "save";
				storage.grids[id].pageRequest.pageNum = pageNum;
				storage.grids[id].pageRequest.model = storage.grids[id].dataSource.data[index];
				preparePageDataGetRequest(id);
			}
		});

		deleteAnchor.on('click', function deleteChangeHandler(e) {
			if (storage.grids[id].updating) return;
			var dirtyCells = [];
			var dirty = gridDiv.find(".dirty").each(function iterateDirtySpansCallback(idx, val) {
				dirtyCells.push($(val).parents("td"));
			});

			if (dirtyCells.length) {
				var id = dirty.parents(".grid-wrapper").data("grid_id");
				var gridData = storage.grids[id];
				for (var i = 0; i < dirtyCells.length; i++) {
					var field = dirtyCells[i].data("field");
					var type = gridData.columns[field].type || "";
					var index = dirtyCells[i].parents("tr").index();
					var pageNum = storage.grids[id].pageNum;
					var rowNum = storage.grids[id].pageSize;
					var addend = (pageNum-1)*rowNum;
					var cellVal = storage.grids[id].originalData[index][field] !== undefined ? storage.grids[id].originalData[index][field] : "";
					var text = gridData.columns[field].template ? gridData.columns[field].template.replace("{{data}}", cellVal) : cellVal;
					dirtyCells[i].text(text);
					dirtyCells[i].find(".dirty").remove();
					storage.grids[id].dataSource.data[index][field] = storage.grids[id].originalData[index + addend][field];
				}
			}
		});

		if (storage.grids[id].groupable) {
			var groupSpan = $("<span class='toolbarSpan group_span' style='float:right;'><span class='groupTextSpan'>Group By: </span></span>").appendTo(saveBar);
			var columnsList = $("<select class='input select group_select' style='float:right; display: inline; width: auto;'></select>").appendTo(groupSpan);
			columnsList.append("<option value='none'>None</option>");
			for (var col in storage.grids[id].columns) {
				if (storage.grids[id].columns[col].groupable !== false) {
					var colTitle = storage.grids[id].columns[col].title || col;
					columnsList.append("<option value='" + col + "'>" + colTitle + "</option>");
				}
			}
			columnsList.on('change', function groupBySelectCallback(e) {
				if (storage.grids[id].updating) return;
				if (Object.keys(storage.grids[id].columns).length === storage.grids[id].grid.find("colgroup").first().find("col").length && this.value !== "none") {
					var colGroups = storage.grids[id].grid.find("colgroup");
					colGroups.each(function iterateColGroupsForInsertCallback(idx, val) {
						$(val).prepend("<col class='group_col'></col>");
					});
					storage.grids[id].grid.find(".grid-headerRow").prepend("<th class='group_spacer'>&nbsp</th>");
					storage.grids[id].grid.find(".summary-row-header").prepend("<td class='group_spacer'>&nbsp</td>");
				}
				else if (this.value === "none") {
					storage.grids[id].grid.find("colgroup").find(".group_col").remove();
					storage.grids[id].grid.find(".group_spacer").remove();
					storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
				}
				storage.grids[id].pageRequest.groupedBy = this.value;
				storage.grids[id].pageRequest.eventType = "group";
				preparePageDataGetRequest(id);
			});
		}
	}

	function createGridFooter(gridDiv, gridData) {
		var gridFooter = gridDiv.find(".grid-footer-div");
		var id = gridFooter.data("grid_footer_id");
		var count = storage.grids[id].dataSource.rowCount;
		var displayedRows = (count - storage.grids[id].pageSize) > 0 ? storage.grids[id].pageSize : count;
		var remainingPages = (count - displayedRows) > 0 ? Math.ceil((count - displayedRows)/displayedRows) : 0;
		var pageNum = storage.grids[parseInt(gridFooter.data("grid_footer_id"))].pageNum;

		gridFooter.append("<a href='#' class='grid-page-link link-disabled' data-link='first' title='First Page'><span class='grid-page-span span-first'>First Page</span></a>");
		gridFooter.append("<a href='#' class='grid-page-link link-disabled' data-link='prev' title='Previous Page'><span class='grid-page-span span-prev'>Prev Page</span></a>");
		var text = "Page " + storage.grids[parseInt(gridFooter.data("grid_footer_id"))].pageNum + "/" + (remainingPages + 1);
		gridFooter.append("<span class='grid-pagenum-span page-counter'>" + text + "</span>");
		var next = $("<a href='#' class='grid-page-link' data-link='next' title='Next Page'><span class='grid-page-span span-next'>Next Page</span></a>").appendTo(gridFooter);
		var last = $("<a href='#' class='grid-page-link' data-link='last' title='Last Page'><span class='grid-page-span span-last'>Last Page</span></a>").appendTo(gridFooter);

		if (!remainingPages) {
			next.addClass("link-disabled");
			last.addClass("link-disabled");
		}

		var pageOptions = gridData.pagingOptions;
		if (pageOptions && pageOptions.constructor === Array) {
			var sizeSelectotSpan = $("<span class='page-size-span'></span>").appendTo(gridFooter);
			var sizeSelect = $("<select class='size-selector input'></select>").appendTo(sizeSelectotSpan);
			for (var i = 0; i < pageOptions.length; i++) {
				sizeSelect.append("<option value='" + pageOptions[i] + "'>" + pageOptions[i] + "</option>");
			}
			sizeSelect.val(storage.grids[id].pageSize);
			sizeSelectotSpan.append("Rows per page");

			sizeSelect.on('change', function pageSizeSelectorClickHandler(e) {
				var pageSize = $(this).val();
				var grid = storage.grids[id].grid;
				storage.grids[id].pageRequest.pageSize = parseInt(pageSize);
				storage.grids[id].pageRequest.eventType = "pageSize";
				preparePageDataGetRequest(id);
			});
		}

		var rowStart = 1 + (displayedRows*(pageNum-1));
		var rowEnd = displayedRows*pageNum;
		text = rowStart + " - " + rowEnd + " of " + count + " rows";
		gridFooter.append("<span class='pageinfo'>" + text + "</span>");

		setPagerEventListeners(gridFooter);
	}

	function setPagerEventListeners(gridFooter) {
		gridFooter.find("a").each(function (idx, val) {
			$(val).on('click', function(e) {
				e.preventDefault();
				var link = e.currentTarget.tagName === "A" ? $(e.currentTarget) : $(e.srcElement).parents(".grid-page-link");
				if (link.hasClass("link-disabled")) {	//If the pager link that was clicked on is disabled, return.
					return;
				}
				var gridFooter = link.parents(".grid-footer-div");
				var allPagers = gridFooter.find("a");
				var id = parseInt(link.parents(".grid-wrapper")[0].dataset["grid_id"]);
				if (storage.grids[id].updating) return;		//can't page if grid is updating
				var gridData = storage.grids[id];
				var pageSize = storage.grids[id].pageSize;
				var pagerInfo = gridFooter.find(".pageinfo");
				var pagerSpan = gridFooter.find(".grid-pagenum-span");
				var totalPages = (gridData.dataSource.rowCount - pageSize) > 0 ? Math.ceil((gridData.dataSource.rowCount - pageSize)/pageSize) + 1 : 1;

				switch (link.data("link")) {
					case "first":
						storage.grids[id].pageNum = 1;
						var pageNum = storage.grids[id].pageNum;
						var rowStart = 1 + (pageSize*(pageNum-1));
						var rowEnd = pageSize*pageNum;
						link.addClass("link-disabled");
						$(allPagers[1]).addClass("link-disabled");
						$(allPagers[2]).removeClass("link-disabled");
						$(allPagers[3]).removeClass("link-disabled");
						break;
					case "prev":
						storage.grids[id].pageNum--;
						var pageNum = storage.grids[id].pageNum;
						var rowStart = 1 + (pageSize*(pageNum-1));
						var rowEnd = pageSize*pageNum;
						if (pageNum === 1) {
							link.addClass("link-disabled");
							$(allPagers[0]).addClass("link-disabled");
						}
						$(allPagers[2]).removeClass("link-disabled");
						$(allPagers[3]).removeClass("link-disabled");
						break;
					case "next":
						storage.grids[id].pageNum++;
						var pageNum = storage.grids[id].pageNum;
						var rowStart = 1 + (pageSize*(pageNum-1));
						var rowEnd = gridData.dataSource.rowCount < pageSize*pageNum ? gridData.dataSource.rowCount : pageSize*pageNum;
						if (pageNum === totalPages) {
							link.addClass("link-disabled");
							$(allPagers[3]).addClass("link-disabled");
						}
						$(allPagers[0]).removeClass("link-disabled");
						$(allPagers[1]).removeClass("link-disabled");
						break;
					case "last":
						storage.grids[id].pageNum = (gridData.dataSource.rowCount - pageSize) > 0 ? Math.ceil((gridData.dataSource.rowCount - pageSize)/pageSize) + 1 : 1;
						var pageNum = storage.grids[id].pageNum;
						var rowStart = 1 + (pageSize*(pageNum-1));
						var rowEnd = gridData.dataSource.rowCount < pageSize*pageNum ? gridData.dataSource.rowCount : pageSize*pageNum;
						link.addClass("link-disabled");
						$(allPagers[2]).addClass("link-disabled");
						$(allPagers[0]).removeClass("link-disabled");
						$(allPagers[1]).removeClass("link-disabled");
						break;
				}
				pagerSpan.text("Page " + pageNum + "/" + totalPages);
				pagerInfo.text(rowStart + " - " + rowEnd + " of " + gridData.dataSource.rowCount + " rows");
				storage.grids[id].grid.find(".grid-content-div").empty();
				storage.grids[id].pageRequest.eventType = "page";
				storage.grids[id].pageRequest.pageNum = pageNum;
				preparePageDataGetRequest(id);
			});
		});
	}

	function attachFilterListener(filterElem) {
		filterElem.on('click', function filterClickCallback(e) {
			e.stopPropagation();	//stop event bubbling so that the column won't also get sorted when the filter icon is clicked.
			e.preventDefault();
			var filterAnchor = $(e.target);
			var filterCell = filterAnchor.parents("th");
			var type = filterAnchor.data("type");
			var grid = filterElem.parents(".grid-wrapper");
			var id = grid.data("grid_id");
			if (storage.grids[id].updating) return;		//can't filter when the grid is updating
			var filters = grid.find(".filter-div");
			var currFilter = null;
			var field = filterAnchor.data("field");
			var title = storage.grids[id].columns[field].title || null;

			if (filters.length) {
				filters.each(function iterateFiltersCallback(idx, val) {
					var filter = $(val);
					if (filter.data("parentfield") === filterAnchor.data("field")) {
						filter.removeClass("hiddenFilter");
						currFilter = $(val);
					}
					else {
						filter.addClass("hiddenFilter");
					}
				});
			}

			if (!currFilter) {
				createFilterDiv(type, field, grid, title);
				currFilter = grid.find('.filter-div');
			}
			var filterCellOffset = filterCell.offset();
			currFilter.css("top", (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
			currFilter.css("left", (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
		});
	}

	function createFilterDiv(type, field, grid, title) {
		var filterDiv = $("<div class='filter-div' data-parentfield='" + field + "' data-type='" + type + "'></div>").appendTo(grid);
		var filterInput;
		var domName = title ? title : type;
		switch (type) {
			case "number":
			case "currency":
			case "percent":
				var span = $("<span class='filterTextSpan'>Filter rows where " + domName + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='gte'>Greater than or equal to:</option>")
				select.append("<option value='ct'>Contains:</option>");
				select.append("<option value='gt'>Greater than:</option>");
				select.append("<option value='lte'>Less than or equal to:</option>");
				select.append("<option value='lt'>Less than:</option>");

				filterInput = $("<input type='text' class='filterInput input' id='filterInput" + type + field + "'></input>").appendTo(filterDiv);
				var resetButton = $("<input type='button' value='Reset' class='button resetButton' data-field='" + field + "'></input>").appendTo(filterDiv);
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);

				resetButton.on('click', resetButtonClickHandler);
				button.on('click', filterButtonClickHandler);
				break;
			case "date":
			case "datetime":
				var span = $("<span class='filterTextSpan'>Filter rows where " + domName + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='gte'>Equal to or later than:</option>");
				select.append("<option value='gt'>Later than:</option>");
				select.append("<option value='lte'>Equal to or before:</option>");
				select.append("<option value='lt'>Before:</option>");

				filterInput = $("<input type='date' class='filterInput input' id='filterInput" + type + field + "'></input>").appendTo(filterDiv);
				var resetButton = $("<input type='button' value='Reset' class='button resetButton' data-field='" + field + "'></input>").appendTo(filterDiv);
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);
				resetButton.on('click', resetButtonClickHandler);
				button.on('click', filterButtonClickHandler);
				break;
			case "time":
				var span = $("<span class='filterTextSpan'>Filter rows where " + domName + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='gte'>Equal to or later than:</option>");
				select.append("<option value='gt'>Later than:</option>");
				select.append("<option value='lte'>Equal to or before:</option>");
				select.append("<option value='lt'>Before:</option>");

				filterInput = $("<input type='text' class='filterInput input' id='filterInput" + type + field + "'></input>").appendTo(filterDiv);
				var resetButton = $("<input type='button' value='Reset' class='button resetButton' data-field='" + field + "'></input>").appendTo(filterDiv);
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);
				resetButton.on('click', resetButtonClickHandler);
				button.on('click', filterButtonClickHandler);
				break;
			case "boolean":
				var span = $("<span class='filterTextSpan'>Filter rows where " + domName + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");

				var optSelect = $("<select class='filterSelect'></select>").appendTo(span);
				optSelect.append("<option value='true'>True</option>");
				optSelect.append("<option value='false'>False</option>");
				var resetButton = $("<input type='button' value='Reset' class='button resetButton' data-field='" + field + "'></input>").appendTo(filterDiv);
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);
				resetButton.on('click', resetButtonClickHandler);
				button.on('click', filterButtonClickHandler);
				break;
			case "string":
				var span = $("<span class='filterTextSpan'>Filter rows where " + domName + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='ct'>Contains:</option>");
				select.append("<option value='nct'>Does not contain:</option>");
				filterInput = $("<input class='filterInput input' type='text' id='filterInput" + type + field + "'></input>").appendTo(filterDiv);
				var resetButton = $("<input type='button' value='Reset' class='button resetButton' data-field='" + field + "'></input>").appendTo(filterDiv);
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);
				resetButton.on('click', resetButtonClickHandler);
				button.on('click', filterButtonClickHandler);
				break;
		}
		if (filterInput && type !=="time" && type !== "date")
			filterInputValidation(filterInput);
		return;
	}

	function filterInputValidation(input) {
		input.on("keypress", function restrictCharsHandler(e) {
	        var code = event.charCode? event.charCode : event.keyCode,
	    	key = String.fromCharCode(code);
	    	var type = $(this).parents(".filter-div").data("type");
	    	var newVal = insertKey($(this), key);
	    	var re = new RegExp(dataTypes[type]);
	    	var temp = re.test(newVal);
	    	if (!re.test(newVal)) {
	    		e.preventDefault();
	    		return false;
	    	}
	    });
	}

	function resetButtonClickHandler(e) {
		var filterDiv = $(e.currentTarget).parents(".filter-div");
		var selected = filterDiv.find(".filterSelect").val();
		var value = filterDiv.find(".filterInput").val();
		var gridId = filterDiv.parents(".grid-wrapper").data("grid_id");
		if (storage.grids[gridId].updating) return;		//can't filter if grid is updating
		var gridData = storage.grids[gridId];

		if (value === "" && gridData.filterVal === "") return;

		filterDiv.addClass("hiddenFilter");

		gridData.pageRequest.filteredOn = null;
		gridData.pageRequest.filterVal = null;
		gridData.pageRequest.filterType = null;
		gridData.filteredOn = null;
		gridData.filterVal = null;
		gridData.filterType = null;
		gridData.pageRequest.eventType = "filter";
		storage.grids[gridId].alteredData = cloneGridData(storage.grids[gridId].originalData);
		preparePageDataGetRequest(gridId);
	}

	function filterButtonClickHandler(e) {
		var filterDiv = $(e.currentTarget).parents(".filter-div");
		var selected = filterDiv.find(".filterSelect").val();
		var value = filterDiv.find(".filterInput").val();
		var gridId = filterDiv.parents(".grid-wrapper").data("grid_id");
		if (storage.grids[gridId].updating) return;		//can't filter if grid is updating
		var gridData = storage.grids[gridId];
		var type = filterDiv.data('type');
		var errors = filterDiv.find(".filter-div-error");

		if (dataTypes[type]) {
			var re = new RegExp(dataTypes[filterDiv.data('type')]);
			if (!re.test(value)) {
				if (!errors.length)
					$("<span class='filter-div-error'>Invalid " + type + "</span>").appendTo(filterDiv);
				return;
			}
		}
		else if (type === "date") {
			var parseDate = Date.parse(value);
			if (!isNaN(parseDate)) {
				var tempDate = new Date(parseDate);
				var dd = tempDate.getUTCDate();
				var mm = tempDate.getUTCMonth() + 1;
				var yy = tempDate.getUTCFullYear();
				var template = "mm/dd/yyyy";
				var dateVal = template.replace("mm", mm).replace("dd", dd).replace("yyyy", yy);
			}
			var re = new RegExp(dataTypes["USDate"]);
			if (!re.test(dateVal)) {
				re = new RegExp(dataTypes["EUDate"]);
				if (!re.test(dateVal)) {
					if (!errors.length)
						$("<span class='filter-div-error'>Invalid " + type + "</span>").appendTo(filterDiv);
					return;
				}
			}
		}

		if (errors.length)
			errors.remove();


		if (value === "" && gridData.filterVal === "") return;

		filterDiv.addClass("hiddenFilter");

		gridData.pageRequest.filteredOn = $(this).data("field");
		gridData.pageRequest.filterVal = value;
		gridData.pageRequest.filterType = selected;
		gridData.pageRequest.eventType = "filter";
		preparePageDataGetRequest(gridId);
	}

	function createGridColumnsFromArray(gridData, gridDiv) {
		var headerCol = {};
		var index = 0;
		for (var i = 0; i < gridData.length; i++) {
			for (var col in gridData[i]) {
				if (!headerCol[col]) {
					headerCol[col] = {};
					headerCol[col].field = col;
					headerCol[col].title = col;
					headerCol[col].reorderable = true;
					headerCol[col].sortable = true;
					index++;
				}
			}
		}
		var newGridData = {
			columns: headerCol,
			data: gridData
		};
		createGridHeaders(newGridData, gridDiv);
	}

	function setDragAndDropListeners(elem) {
		elem.on('dragstart', function handleDragStartCallback(e) {
			e.originalEvent.dataTransfer.setData("text", e.currentTarget.id);
		});
		elem.on('drop', function handleDragStartCallback(e) {
			var droppedCol = $("#" + e.originalEvent.dataTransfer.getData("text"));
			var targetCol = $(e.currentTarget);
			var id = targetCol.parents(".grid-wrapper").data("grid_id");
			if (storage.grids[id].updating) return;		//can't resort columns if grid is updating
			if (droppedCol[0].cellIndex === targetCol[0].cellIndex) 
				return;
			if (droppedCol[0].id === "sliderDiv")
				return;

			var parentDiv = targetCol.parents(".grid-header-div");
			var parentDivId = parentDiv.data("grid_header_id");
			var gridWrapper = parentDiv.parent(".grid-wrapper");
			var colGroups = gridWrapper.find("colgroup");

			var tempIndex = droppedCol[0].dataset["index"];
			var droppedIndex = droppedCol[0].dataset["index"];
			var targetIndex = targetCol[0].dataset["index"];

			var droppedClone = droppedCol.clone(false, true);
			var targetClone = targetCol.clone(false, true);

			var droppedEvents = $._data(elem[0], 'events');
			var targetEvents = $._data(targetCol[0], 'events');
			if (droppedEvents.click)
				setSortableClickListener(droppedClone);
			setDragAndDropListeners(droppedClone);
			if (targetEvents.click)
				setSortableClickListener(targetClone);
			setDragAndDropListeners(targetClone);

			if (droppedClone.find('a').length)
				attachFilterListener(droppedClone.find('a'));
			if (targetClone.find('a').length)
				attachFilterListener(targetClone.find('a'));

			droppedCol.replaceWith(targetClone);
			targetCol.replaceWith(droppedClone);

			droppedClone[0].dataset["index"] = targetIndex;
			targetClone[0].dataset["index"] = droppedIndex;

			swapContentCells(parentDivId, tempIndex, targetIndex);

			var targetWidth = $(colGroups[0].children[droppedIndex]).width();
			var droppedWidth = $(colGroups[0].children[targetIndex]).width();

			$(colGroups[0].children[droppedIndex]).width(droppedWidth);
			$(colGroups[0].children[targetIndex]).width(targetWidth);
			$(colGroups[1].children[droppedIndex]).width(droppedWidth);
			$(colGroups[1].children[targetIndex]).width(targetWidth);

			var sumRow = parentDiv.find(".summary-row-header");
			if (sumRow.length) {
				var droppedColSum, targetColSum;
				sumRow.children().each(function iterateSumRowCellsCallback(idx, val) {
					if ($(val).data("field") === droppedCol.data("field")) {
						droppedColSum = $(val);
					}
					else if ($(val).data("field") === targetCol.data("field")) {
						targetColSum = $(val);
					}
				});
				var droppedColSumClone = droppedColSum.clone(true, true);
				var targetColSumClone = targetColSum.clone(true, true);
				droppedColSum.replaceWith(targetColSumClone);
				targetColSum.replaceWith(droppedColSumClone);
			}
			e.preventDefault();
		});
		elem.on('dragover', function handleHeaderDragOverCallback(e) {
			e.preventDefault();
		});
		elem.on('mouseleave', function (e) {
			var target = $(e.currentTarget);
			var targetOffset = target.offset();
			var targetWidth = target.innerWidth();
			var mousePos = { x: e.originalEvent.pageX, y: e.originalEvent.pageY };
			var sliderDiv = $("#sliderDiv");

	        if (Math.abs(mousePos.x - (targetOffset.left + targetWidth)) < 10) {
				var sliderDiv = $("#sliderDiv");
				if (!sliderDiv.length) {
					var parentRow = target.parent();
					sliderDiv = $("<div id=sliderDiv style='width:10px; height:" + target.innerHeight() + "px; cursor: col-resize;' draggable=true><div></div></div>").appendTo(parentRow);
					sliderDiv.on('dragstart', function handleDragStartCallback(e) {
						e.originalEvent.dataTransfer.setData("text", e.currentTarget.id);
						resizing = true;
					});
					sliderDiv.on('dragend', function handleDragStartCallback(e) {
						resizing = false;
					});
					sliderDiv.on('dragover', function handleHeaderDragOverCallback(e) {
						e.preventDefault();
					});
					sliderDiv.on('drop', function handleHeaderDropCallback(e) {
						e.preventDefault();
					});
					sliderDiv.on('drag', function handleHeaderDropCallback(e) {
						e.preventDefault();
						var sliderDiv = $(e.currentTarget);
						var id = sliderDiv.parents("grid-wrapper").data("grid_id");
						if (storage.grids[id].updating) return;		//can't resize columns if grid is updating
						var targetCell = document.getElementById(sliderDiv.data("targetindex"));
						var targetBox = targetCell.getBoundingClientRect();
						var endPos = e.originalEvent.pageX;
						var startPos = targetBox.left;
						var width = endPos - startPos;
						var space = endPos - targetBox.right;

						if (width > 11) {
							var index = targetCell.dataset["index"];
							var gridWrapper = $(targetCell).parents(".grid-wrapper");
							var id = parseInt(gridWrapper.data("grid_id"));
							var colGroups = gridWrapper.find("colgroup");
							var tables = gridWrapper.find("table");
							if (storage.grids[id].groupedBy && storage.grids[id].groupedBy !== "none")
								index++;

							var contentDiv = gridWrapper.find(".grid-content-div");
							var scrollLeft = contentDiv.scrollLeft();
							var clientWidth = contentDiv[0].clientWidth;
							var scrollWidth = contentDiv[0].scrollWidth;
							var add = scrollLeft + clientWidth;
							var isTrue = add === scrollWidth;

							if (space < 0 && scrollWidth > clientWidth && isTrue) {
								space -= -3;
								width -= -3;
							}

							scrollLeft = contentDiv.scrollLeft();

							for (var i = 0; i < colGroups.length; i++) {
								var currWidth = $(tables[i]).width();
								$(colGroups[i].children[index]).width(width);
								$(tables[i]).width(currWidth + space);

							}
							sliderDiv.css("left", e.originalEvent.pageX + "px");
						}
					});
				}
				sliderDiv.data("targetindex", target[0].id);
				sliderDiv.css("top", targetOffset.top + "px");
				sliderDiv.css("left", (targetOffset.left + targetWidth -4) + "px");
				sliderDiv.css("position", "absolute");
			}
		});
	}

	function setSortableClickListener(elem) {
		elem.on('click', function handleHeaderClickCallback(e) {
			var headerDiv = elem.parents(".grid-header-div");
			var id = parseInt(headerDiv.data("grid_header_id"));
			if (storage.grids[id].updating) return;		//can't sort if grid is updating
			var previousSorted = headerDiv.find("[data-order]");
			var order;
			if (elem[0].dataset["order"] === undefined || elem[0].dataset["order"] == "default") 
				order = "desc";
			else if (elem[0].dataset["order"] === "desc") 
				order = "asc";
			else
				order = "default";

			elem[0].dataset["order"] = order;
			var sameCol = false;
			if (previousSorted.length) {
				if (previousSorted.data("field") !== elem.data("field")) {
					$(".sortSpan").remove();	
					previousSorted[0].removeAttribute("data-order");
					var className;
					if (order === "desc")
						className = "sort-desc sortSpan";
					else if (order === "asc")
						className = "sort-asc sortSpan";
					else {
						className = "";
						storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
					}
					elem.append("<span class='" + className + "'>Sort</span>");
				}
				else {
					sameCol = true;
					var span = elem.find(".sortSpan");
					var className;
					if (order === "desc")
						span.addClass("sort-desc").removeClass("sort-asc");
					else if (order === "asc")
						span.removeClass("sort-desc").addClass("sort-asc");
					else {
						span.removeClass("sort-desc").removeClass("sort-asc");
						storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
					}
				}
			}
			else {
				var className;
				if (order === "desc")
					className = "sort-desc sortSpan";
				else if (order === "asc")
					className = "sort-asc sortSpan";
				else {
					className = "";
					storage.grids[id].alteredData = cloneGridData(storage.grids[id].originalData);
				}
				elem.append("<span class='" + className + "'>Sort</span>");
			}
			storage.grids[id].pageRequest.sortedOn = elem.data("field");
			storage.grids[id].pageRequest.sortedBy = order;
			storage.grids[id].pageRequest.eventType = "sort";
			preparePageDataGetRequest(id);
		});
	}

	function swapContentCells(gridId, droppedIndex, targetIndex) {
		var gridData = storage.grids[gridId];
		$("#grid-content-" + gridId).find("tr").each(function iterateContentRowsCallback(idx, val) {
			if ($(val).hasClass("grouped_row_header"))
				return true;
			var droppedIdx = 1 + parseInt(droppedIndex);
			var targetIdx = 1 + parseInt(targetIndex);
			if (gridData.groupedBy && gridData.groupedBy !== "none") {
				droppedIdx++;
				targetIdx++;
			}
			var droppedCell = $(val).children("td:nth-child(" + droppedIdx + ")");
			var targetCell = $(val).children("td:nth-child(" + targetIdx + ")");

			var droppedClone = droppedCell.clone(true, true);
			var targetClone = targetCell.clone(true, true);
			targetCell.replaceWith(droppedClone);
			droppedCell.replaceWith(targetClone);

			droppedClone[0].dataset["index"] = targetIndex;
			targetClone[0].dataset["index"] = droppedIndex;
		});
	}

	//All page request-related functions call here. This sets up the request object and then calls either
	//the internal or the supplied GET function to get a new page of grid data.
	function preparePageDataGetRequest(id) {
		storage.grids[id].updating = true;
		var gridData = storage.grids[id];
		var pageNum = gridData.pageRequest.pageNum || gridData.pageNum;
		var pageSize = gridData.pageRequest.pageSize || gridData.pageSize;
		var sortedOn = gridData.pageRequest.sortedOn || gridData.sortedOn || null;
		var sortedBy = gridData.pageRequest.sortedBy || gridData.sortedBy || null;
		var filteredOn = gridData.pageRequest.filteredOn || gridData.filteredOn || null;
		var filterVal = gridData.pageRequest.filterVal || gridData.filterVal || null;
		var filterType = gridData.pageRequest.filterType || gridData.filterType || null;
		var groupedBy = gridData.pageRequest.groupedBy || gridData.groupedBy || null;

		var requestObj = {};
		if (gridData.sortable) {
			requestObj.sortedOn = sortedOn;
			requestObj.sortedBy = sortedBy;
		}

		if (gridData.filterable) {
			requestObj.filteredOn = filteredOn;
			requestObj.filterVal = filterVal;
			requestObj.filterType = filterType;
		}

		if (gridData.groupable) {
			requestObj.groupedBy = groupedBy;
		}

		requestObj.pageSize = pageSize;
		requestObj.pageNum = pageNum;

		gridData.grid.find(".grid-content-div").empty();

		if (gridData.dataSource.get && typeof gridData.dataSource.get === "function")
			gridData.dataSource.get(requestObj, getPageDataRequestCallback);
		else {
			if (!gridData.alteredData)
				gridData.alteredData = cloneGridData(gridData.originalData);
			getPageData(requestObj, id, getPageDataRequestCallback);
		}

		function getPageDataRequestCallback(response) {
			gridData.dataSource.data = response.data;
			gridData.pageSize = requestObj.pageSize;
			gridData.pageNum = requestObj.pageNum;
			gridData.dataSource.rowCount = response.rowCount != undefined ? response.rowCount : response.length;
			gridData.groupedBy = requestObj.groupedBy;
			gridData.sortedOn = requestObj.sortedOn;
			gridData.sortedBy = requestObj.sortedBy;
			gridData.filteredOn = requestObj.filteredOn;
			gridData.filterVal = requestObj.filterVal;
			gridData.filterType = requestObj.filterType;

			gridData.grid[0].grid.originalData = gridData.dataSource.get && typeof gridData.dataSource.get === "function" ? cloneGridData(response.data) : cloneGridData(gridData.originalData);
			gridData.grid[0].grid.columns = Object.keys(gridData.columns);

			createGridContent(gridData, storage.grids[id].grid, ((gridData.pageRequest.eventType === "newGrid") || (gridData.groupedBy && gridData.groupedBy !== "none")));
			if (gridData.pageRequest.eventType === "filter" || gridData.pageRequest.eventType === "pageSize") {
				gridData.grid.find(".grid-footer-div").empty();
				createGridFooter(gridData.grid, gridData);
			}
			if (gridData.pageRequest.eventType === "filter" && gridData.summaryRow && gridData.summaryRow.positionAt === "top") {
				buildHeaderAggregations(gridData, id);
			}
			gridData.pageRequest = {};
		}
	}

	//Default update function - used for client-side updates to grid data
	function prepareGridDataUpdateRequest() {

	}

	function getPageData(requestObj, id, callback) {
		var eventType = storage.grids[id].pageRequest.eventType;
		var fullGridData = cloneGridData(storage.grids[id].alteredData);

		if (eventType === "page" || eventType === "pageSize" || eventType === "newGrid") {
			limitPageData(requestObj, fullGridData, callback);
			return;
		}

		if (requestObj.filteredOn) {
			if (requestObj.filterVal !== "") {
				var dataType = storage.grids[id].columns[requestObj.filteredOn].type || "string";
				fullGridData = filterGridData(requestObj.filterType, requestObj.filterVal, requestObj.filteredOn, dataType, cloneGridData(storage.grids[id].originalData));
			}
			else fullGridData = cloneGridData(storage.grids[id].originalData);
			requestObj.pageNum = 1;		//reset the page to the first page when a filter is applied or removed.
			storage.grids[id].alteredData = fullGridData;
		}

		if (requestObj.groupedBy) {
			var groupedData = groupColumns(fullGridData, requestObj.groupedBy);
			if (requestObj.sortedOn && requestObj.sortedBy !== "default") {
				var sortedGroup = [];
				for (var group in groupedData.groupings) {
					sortedGroup = sortedGroup.concat(mergeSort(groupedData.groupings[group], requestObj.sortedOn, storage.grids[id].columns[requestObj.sortedOn].type || "string"));
				}
				if (requestObj.sortedBy === "asc") sortedGroup.reverse();
				storage.grids[id].alteredData = fullGridData;
				limitPageData(requestObj, sortedGroup, callback);
				return;
			}
			storage.grids[id].alteredData = fullGridData;
			limitPageData(requestObj, groupedData.groupedData, callback);
			return;
		}

		if (requestObj.sortedOn && !requestObj.groupedBy) {
			if (requestObj.sortedBy !== "default") {
				fullGridData = mergeSort(fullGridData, requestObj.sortedOn, storage.grids[id].columns[requestObj.sortedOn].type || "string");
				if (requestObj.sortedBy === "asc") fullGridData.reverse();
			}
			else if (!fullGridData.length) {
				fullGridData = storage.grids[id].originalData;
			}
		}
		storage.grids[id].alteredData = fullGridData;
		limitPageData(requestObj, fullGridData, callback);
	}

	//==========================================================================================================================//
	//																															//
	//													HELPER FUNCTIONS														//
	//==========================================================================================================================//

	function limitPageData(requestObj, fullGridData, callback) {
		var returnData;
		if (requestObj.pageSize >= fullGridData.length)
	        returnData = fullGridData;
	    else {
	        returnData = [];
	        var startRow = (requestObj.pageNum-1) * (requestObj.pageSize);
			var endRow = fullGridData.length >= (startRow + parseInt(requestObj.pageSize)) ? (startRow + parseInt(requestObj.pageSize)) : fullGridData.length;

	        for (var i = startRow; i < endRow; i++){
	            returnData.push(fullGridData[i]);
	        }
	    }

		callback({ rowCount: fullGridData.length, data: returnData });
	}

	function filterGridData(filterType, value, field, dataType, gridData) {
		var filteredData = [];

		for (var i = 0, length = gridData.length; i < length; i++) {
			switch (filterType) {
				case "eq": 	//Equal
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) === parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (dataTime[0] === valTime[0] && dataTime[1] === valTime[1] && dataTime[2] === valTime[2])
							filteredData.push(gridData[i]);
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] === new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field].toLowerCase() === value.toLowerCase())
						filteredData.push(gridData[i]);
					break;
				case "neq": 	//not equal
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) !== parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (dataTime[0] !== valTime[0] || dataTime[1] !== valTime[1] || dataTime[2] !== valTime[2])
							filteredData.push(gridData[i]);
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] !== new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field].toLowerCase() !== value.toLowerCase())
						filteredData.push(gridData[i])
					break;
				case "gte": 	//greater than or equal to
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) >= parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (dataTime[0] > valTime[0])
							filteredData.push(gridData[i]);
						else if (dataTime[0] === valTime[0]) {
							if (dataTime[1] > valTime[1])
								filteredData.push(gridData[i]);
							else if (dataTime[1] === valTime[1] && dataTime[2] > valTime[2])
								filteredData.push(gridDate[i]);
						}
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] >= new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] >= value)
						filteredData.push(gridData[i]);
					break;
				case "gt": 	//greater than
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) > parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (dataTime[0] > valTime[0])
							filteredData.push(gridData[i]);
						else if (dataTime[0] === valTime[0]) {
							if (dataTime[1] > valTime[1])
								filteredData.push(gridData[i]);
							else if (dataTime[1] === valTime[1] && dataTime[2] > valTime[2])
								filteredData.push(gridDate[i]);
						}
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] > new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] > value)
						filteredData.push(gridData[i]);
					break;
				case "lte": 	//less than or equal to
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) <= parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (valTime[0] === dataTime[0] && valTime[1] === dataTime[1] && valTime[2] === dataTime[2])
							filteredData.push(gridData[i]);
						else if (valTime[0] > dataTime[0])
							filteredData.push(gridData[i]);
						else if (valTime[0] === dataTime[0]) {
							if (valTime[1] > dataTime[1])
								filteredData.push(gridData[i]);
							else if (valTime[1] === dataTime[1] && valTime[2] > dataTime[2])
								filteredData.push(gridDate[i]);
						}
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] <= new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] <= value)
						filteredData.push(gridData[i]);
						break;
				case "lt": 	//less than
					if (dataType === "number" || dataType === "percent" || dataType === "currency") {
						if (parseFloat(gridData[i][field]) < parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (dataType === "time") {
						var dataTime = getNumbersFromTime(gridData[i][field]);
						var valTime = getNumbersFromTime(value);

						if (gridData[i][field].indexOf('PM') > -1)
							dataTime[0] += 12;
						if (value.indexOf('PM') > -1)
							valTime[0] += 12;
						if (dataTime[0] < valTime[0])
							filteredData.push(gridData[i]);
						else if (valTime[0] === dataTime[0]) {
							if (valTime[1] > dataTime[1])
								filteredData.push(gridData[i]);
							else if (valTime[1] === dataTime[1] && valTime[2] > dataTime[2])
								filteredData.push(gridDate[i]);
						}
					}
					else if (dataType === "date") {
						if (new Date(gridData[i][field] < new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] < value)
						filteredData.push(gridData[i]);
						break;
				case "ct": 	//contains
					if (gridData[i][field].toLowerCase().indexOf(value.toLowerCase()) !== -1) {
						filteredData.push(gridData[i]);
					}
				case "nct": //does not contain
					if (gridData[i][field].toLowerCase().indexOf(value.toLowerCase()) === -1) {
						filteredData.push(gridData[i]);
					}
			}
		}
		return filteredData;
	}

	function groupColumns(data, field) {
		var groupings = {};
		for (var i = 0; i < data.length; i++) {
			if (groupings[data[i][field]])
				groupings[data[i][field]].push(data[i]);
			else
				groupings[data[i][field]] = [data[i]];
		}

		var groupedData = [];
		for (var group in groupings) {
			groupedData = groupedData.concat(groupings[group]);
		}

		return { groupings: groupings, groupedData: groupedData };
	}

	function mergeSort(data, field, type) {
	    if (data.length < 2) return data;
	    var middle = parseInt(data.length / 2);
	    var left   = data.slice(0, middle);
	    var right  = data.slice(middle, data.length);
	    return merge(mergeSort(left, field, type), mergeSort(right, field, type), field, type);
	}

	function merge(left, right, field, type) {
	    var result = [];
	    while (left.length && right.length) {
	    	if (type === "number" || type === "currency") {
	    		if (parseFloat(left[0][field]) <= parseFloat(right[0][field])) {
		            result.push(left.shift());
		        } 
		        else {
		        	result.push(right.shift());
		        }
	    	}
	    	else if (type === "time") {
	    		var leftTime = getNumbersFromTime(left[0][field]);
				var rightTime = getNumbersFromTime(right[0][field]);

				if (left[0][field].indexOf("PM"))
					leftTime[0] += 12;
				if (right[0][field].indexOf('PM'))
					rightTime[0] += 12;

				if (rightTime[0] === leftTime[0] && rightTime[1] === leftTime[1] && rightTime[2] === leftTime[2])
					result.push(left.shift());
				else if (rightTime[0] > leftTime[0])
					result.push(left.shift());
				else if (rightTime[0] === leftTime[0]) {
					if (rightTime[1] > leftTime[1])
						result.push(left.shift());
					else if (rightTime[1] === leftTime[1] && rightTime[2] > leftTime[2])
						result.push(left.shift());
					else
						result.push(right.shift());
				}
				else
					result.push(right.shift());
	    	}
	    	else if (type === 'date') {
	    		if (Date.parse(left[0][field]) <= Date.parse(right[0][field])) {
		            result.push(left.shift());
		        } 
		        else {
		        	result.push(right.shift());
		        }
	    	}
	    	else if (type === 'dateTime') {

	    	}
	    	else {
	    		if (left[0][field] <= right[0][field]) {
		            result.push(left.shift());
		        } 
		        else {
		        	result.push(right.shift());
		        }
	    	}
	    }

	    while (left.length)
	        result.push(left.shift());

	    while (right.length)
	        result.push(right.shift());

	    return result;
	}

	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
	}

	function getNumbersFromTime(val) {
		var re = new RegExp(dataTypes["time"]);
		if (!re.test(val))
			return [];
		var timeGroups = re.exec(val);
		var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
		var minutes, seconds, meridiem, retVal = [];
		if (timeGroups[2]) {
			minutes = +timeGroups[3] || 0;
			seconds = +timeGroups[4]  || 0;
			meridiem = +timeGroups[5] || null;
		}
		else if (timeGroups[6]) {
			minutes = +timeGroups[8] || 0;
			seconds = +timeGroups[9] || 0;
		}
		else{
			minutes = 0;
			seconds = 0;
		}
		retVal.push(hours);
		retVal.push(minutes);
		retVal.push(seconds);
		if (meridiem)
			retVal.push(meridiem);
		return retVal;
	}

	var inputTypes = {
        inputTypeTester: function inputTypeTester(charArray, e) {
            var unicode = e.charCode? e.charCode : e.keyCode;
            for (var i = 0, length = charArray.length; i < length; i++) {
                if ($.isArray(charArray[i])) {
                    if (unicode > charArray[i][0] && unicode < charArray[i][1]) return true;
                }
                else if (unicode === charArray[i]) return true;
            }
            return false;
        },
        numeric: function numeric(e) {
        	var code = event.charCode? event.charCode : event.keyCode,
        	key = String.fromCharCode(code);
        	var newVal = insertKey($(this), key);
        	var re = new RegExp("^\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$");
        	if (!re.test(newVal)) return false;
        	return newVal;
        },
        integer: function integer(e) {
            return inputTypes.inputTypeTester([8, 45, [47, 58]], e);
        }
    };

    var dataTypes = {
    	string: "\.*",
    	number: "^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",
    	boolean: "^true|false$",
    	numeric: "^\\-?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",
    	numericTemp: "^-?(?:[1-9]{1}[0-9]{0,2}(?:,[0-9]{3})*(?:\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(?:\\.[0-9]{0,2})?|0(?:\\.[0-9]{0,2})?|(?:\\.[0-9]{1,2})?)$",
    	integer: "^\\-?\\d+$",
    	integerTemp: "^\\-?\\d+$",
    	time: "^(0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\2([0-5]\\d))?)?(?:(\\ [AP]M))$|^([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\7([0-5]\\d))?)$",
    	USDate: "^(?=\\d)(?:(?:(?:(?:(?:0?[13578]|1[02])(\\/|-|\\.)31)\\1|(?:(?:0?[1,3-9]|1[0-2])(\\/|-|\\.)(?:29|30)\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})|(?:0?2(\\/|-|\\.)29\\3(?:(?:(?:1[6-9]|[2-9]\\d)" +
    			"?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(?:0?[1-9]|1\\d|2[0-8])\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2}))($|\\ (?=\\d)))?$",
		EUDate: "^((((31\\/(0?[13578]|1[02]))|((29|30)\\/(0?[1,3-9]|1[0-2])))\\/(1[6-9]|[2-9]\\d)?\\d{2})|(29\\/0?2\\/(((1[6-9]|[2-9]\\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))" +
				"|(0?[1-9]|1\\d|2[0-8])\\/((0?[1-9])|(1[0-2]))\\/((1[6-9]|[2-9]\\d)?\\d{2}))$",
		dateTime: "^((?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\3|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\6))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\9)|(?:(29|30)(\\/|-|\\.)(0?[1,3-9]|1[0-2])\\12)))))" +
				"((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)29\\16)|(?:(29)(\\/|-|\\.)(0?2))\\18)(?:(?:(1[6-9]|[2-9]\\d)?(0[48]|[2468][048]|[13579][26])|((?:16|[2468][048]|[3579][26])00))))" +
				"|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\24|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\27)((?:1[6-9]|[2-9]\\d)?\\d{2})))\\ ((0?[1-9]|1[012])" +
				"(?:(?:(:|\\.)([0-5]\\d))(?:\\32([0-5]\\d))?)?(?:(\\ [AP]M))$|([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\37([0-5]\\d))?)$)$"
    };

    var insertKey = function(input, key) {		//Inserts the new character to it's position in the string based on cursor position
		var loc = getInputSelection(input[0]);
		return input.val().substring(0, loc.start) + key + input.val().substring(loc.end, input.val().length);
	};

    var getInputSelection = function(el) {		//Finds the cursor position in the input string - includes highlighted ranges.
	    var start = 0, end = 0, normalizedValue, range,
	        textInputRange, len, endRange;

	    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
	        start = el.selectionStart;
	        end = el.selectionEnd;
	    } else {
	        range = document.selection.createRange();

	        if (range && range.parentElement() == el) {
	            len = el.value.length;
	            normalizedValue = el.value.replace(/\r\n/g, "\n");

	            // Create a working TextRange that lives only in the input
	            textInputRange = el.createTextRange();
	            textInputRange.moveToBookmark(range.getBookmark());

	            // Check if the start and end of the selection are at the very end
	            // of the input, since moveStart/moveEnd doesn't return what we want
	            // in those cases
	            endRange = el.createTextRange();
	            endRange.collapse(false);

	            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
	                start = end = len;
	            } else {
	                start = -textInputRange.moveStart("character", -len);
	                start += normalizedValue.slice(0, start).split("\n").length - 1;

	                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
	                    end = len;
	                } else {
	                    end = -textInputRange.moveEnd("character", -len);
	                    end += normalizedValue.slice(0, end).split("\n").length - 1;
	                }
	            }
	        }
	    }

	    return {
	        start: start,
	        end: end
	    };
	}

	function cloneGridData(gridData) { //Clones grid data so pass-by-reference doesn't mess up the values in other grids.
	    if (gridData == null || typeof (gridData) != 'object')
	        return gridData;

	    var temp = new gridData.constructor();
	    for (var key in gridData)
	        temp[key] = cloneGridData(gridData[key]);

	    return temp;
	}

	var storage = {
		gridCount: 0,
		grids: {},
		get count() {
			return this.gridCount++;
		}
	};

	var resizing = false;

	return {
		get create() {
			return create;
		},
		get addNewColumns() {
			return addNewColumns;
		},
		selectedValue: {},
		selectedRow: {},
		selectedColumn: {}
	};
})(jQuery);