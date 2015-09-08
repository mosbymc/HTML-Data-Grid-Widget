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
	function create(gridData, gridDiv) {
		if (gridData && gridDiv) {
			var id = storage.count();
			gridDiv = $(gridDiv);
			var wrapperDiv = $("<div id='grid-wrapper-" + id + "' data-grid_id='" + id +"' class=grid-wrapper></div>").appendTo(gridDiv);
			var headerDiv = $("<div id='grid-header-" + id + "' data-grid_header_id='" + id + "' class=grid-header-div></div>").appendTo(wrapperDiv);
			headerDiv.append("<div class=grid-header-wrapper></div>");
			wrapperDiv.append("<div id='grid-content-" + id + "' data-grid_content_id='" + id + "' class=grid-content-div></div>");
			wrapperDiv.append("<div id='grid-footer-" + id + "' data-grid_footer_id='" + id + "' class=grid-footer-div></div>");

			storage.grids[id] = gridData;
			storage.grids[id].pageNum = 1;
			storage.grids[id].pageSize = gridData.pageSize || 25;
			storage.grids[id].originalData = cloneGridData(gridData.dataSource.data);
			storage.grids[id].grid = gridDiv;
			storage.grids[id].currentEdit = {};
			if (!storage.grids[id].dataSource.count) storage.grids[id].dataSource.count = gridData.dataSource.data.length;

			gridDiv[0].addNewColumns = addNewColumns;

			if (gridData.constructor === Array) {
				createGridColumnsFromArray(gridData, gridDiv);
			}
			else {
				createGridHeaders(gridData, gridDiv, true);
			}
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

	function createGridHeaders(gridData, gridDiv, isNewGrid) {
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

		for (var col in gridData.columns) {
			var column = $("<col></col>").appendTo(colgroup);
			var text = gridData.columns[col].title || col;
			var th = $("<th id='" + col + "_grid_id_" + gridHeader.data("grid_header_id") + "' data-field='" + col + "' data-index='" + index + "' class=grid-header-cell></th>").appendTo(headerRow);
			th.text(text);

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
			var sum = buildRummaryRow(gridData);
			var sumRow = $("<tr class=summary-row-header></tr>").appendTo(headerTHead);
			for (var col in sum) {
				sumRow.append("<td data-field='" + col + "' class=summary-cell-header>" + sum[col] + "</td>");
			}
		}
		headerTable.css("width","");
		createGridFooter(gridDiv, gridData);
		createGridContent(gridData, gridDiv, isNewGrid);
	}

	function buildRummaryRow(gridData) {
		var sRow = {};
		for (var col in gridData.columns) {
			var type = gridData.columns[col].type || "";
			var textVal = getCellFormatting(gridData, col, type, null, null);
			switch (gridData.summaryRow[col]) {
				case "count":
					sRow[col] = "Count: " + textVal.prefix + gridData.dataSource.count + textVal.postfix;
					break;
				case "average":
					var total = 0;
					for (var i = 0; i < gridData.dataSource.count; i++) {
						total += parseFloat(gridData.dataSource.data[i][col]);
					}
					sRow[col] = "Avg: " + textVal.prefix + parseFloat(total/parseFloat(gridData.dataSource.count)).toFixed(2) + textVal.postfix;
					break;
				case "total":
					var total = 0;
					for (var i = 0; i < gridData.dataSource.count; i++) {
						total += parseFloat(gridData.dataSource.data[i][col]);
					}
					if (type === "currency") total = total.toFixed(2);
					sRow[col] = "Total: " + textVal.prefix + total + textVal.postfix;
					break;
				case "min":
					var min;
					for (var i = 0; i < gridData.dataSource.count; i++) {
						if (!min || parseFloat(gridData.dataSource.data[i][col]) < min) min = parseFloat(gridData.dataSource.data[i][col]);
					}
					sRow[col] = "Minimum: " + textVal.prefix + min + textVal.postfix;
					break;
				case "max":
					var max;
					for (var i = 0; i < gridData.dataSource.count; i++) {
						if (!max || parseFloat(gridData.dataSource.data[i][col]) > max) max = parseFloat(gridData.dataSource.data[i][col]);
					}
					sRow[col] = "Maximum: " + textVal.prefix + max + textVal.postfix;
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
		/*setTimeout(function() {
		    	
		    	},2000);*/
		var contentTable = $("<table style='height:auto;'></table>").appendTo(gridContent);
		var colGroup = $("<colgroup></colgroup>").appendTo(contentTable);
		var contentTBody = $("<tbody></tbody>").appendTo(contentTable);
		var columns = [];
		var pageNum = storage.grids[gridContent.data("grid_content_id")].pageNum;
		gridDiv.find("th").each(function(idx, val) {
			columns.push($(val).data("field"));
		});

		var pageSize = storage.grids[gridContent.data("grid_content_id")].pageSize;
		var rowStart = 1 + (pageSize*(pageNum-1));
		var rowEnd = gridData.dataSource.count >= (pageSize + rowStart) ? (pageSize + rowStart) : gridData.dataSource.count;

		for (var i = (rowStart-1); i < rowEnd; i++) {
			var tr = $("<tr></tr>").appendTo(contentTBody);
			for (var j = 0; j < columns.length; j++) {
				var td = $("<td data-field='" + columns[j] + "' class='grid-content-cell'></td>").appendTo(tr);
				var type = gridData.columns[columns[j]].type || "";
				var textVal = getCellFormatting(gridData, columns[j], type, gridData.dataSource.data[i][columns[j]], i);
				if (gridData.dataSource.data[i][columns[j]] !== undefined) {
					td.text(textVal.prefix + textVal.text + textVal.postfix);
				}

				if (gridData.columns[columns[j]].editable) {
					createCellEditSaveDiv(gridDiv);
					td.on('click', function editableCellClickHandler(e) {
						if (e.target !== e.currentTarget) return;
						var cell = $(e.currentTarget);
						//var val = cell.text();
						cell.text("");

						var id = gridContent.data("grid_content_id");
						var index = cell.parents("tr").index();
						var field = cell.data("field");
						var pageNum = storage.grids[id].pageNum;
						var rowNum = storage.grids[id].pageSize;
						var addend = (pageNum-1)*rowNum;
						var type = storage.grids[id].columns[field].type || "";
						var input;
						var val = storage.grids[id].dataSource.data[index + addend][field];
						var dataType;

						switch (type) {
							case "bool":
								input = $("<input type='checkbox' class='input checkbox'/>").appendTo(cell);
								if (val == "true") {
									input[0].checked = true;
								}
								else input[0].checked = false;
								break;
							case "number":
							case "currency":
								var inputval = val;//numberWithCommas(val);
								input = $("<input type='text' value='" + inputval + "' class='input textbox cell-edit-input'/>").appendTo(cell);
								dataType = 'numeric';
								break;
							case "date":
								var dateVal = val === undefined ? new Date(Date.now()) : new Date(Date.parse(val));
								var inputVal = dateVal.toISOString().split('T')[0];
								input = $("<input type='date' value='" + inputVal + "' class='input textbox'/>").appendTo(cell);
								dataType = "date";
								break;
							default:
								input = $("<input type='text' value='" + val + "' class='input textbox cell-edit-input'/>").appendTo(cell);
								dataType = null;
								break;
						}

						input[0].focus();

						if (dataType && dataType !== "date") {
							input.on("keypress", function restrictCharsHandler(e) {
			                			 var code = event.charCode? event.charCode : event.keyCode,
						        	key = String.fromCharCode(code);
						        	var newVal = insertKey($(this), key);
						        	var re = new RegExp(dataTypes[dataType]);
						        	if (!re.test(newVal)) {
						        		e.preventDefault();
						        		return false;
						        	}
					        		var id = $(this).parents(".grid-wrapper").data("grid_id");
			                			 storage.grids[id].currentEdit[field] = newVal;
							});
						}

						input.on('blur', function cellEditBlurHandler(e) {
							var input = $(e.currentTarget);
							if (input[0].type == "checkbox") {
								var val = input.is(":checked");
							}
							else var val = input.val();
							var id = gridContent.data("grid_content_id");
							var index = cell.parents("tr").index();
							var field = cell.data("field");
							var pageNum = storage.grids[id].pageNum;
							var rowNum = storage.grids[id].pageSize;
							var addend = (pageNum-1)*rowNum;
							var type = storage.grids[id].columns[field].type || "";
							var saveVal;

							var parentCell = input.parents("td");
							input.remove();
							var prePostFix = getCellFormatting(storage.grids[id], field, type, val, (index + addend));

							switch (type) {
								case "number":
								case "currency":
									var re = new RegExp("^\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$");
		        					if (!re.test(val)) val = storage.grids[id].currentEdit[field] || storage.grids[id].dataSource.data[index + addend][field];
									var tempVal = parseFloat(val.replace(",", ""));
									saveVal = tempVal.toFixed(2);
									parentCell.text(prePostFix.prefix + numberWithCommas(val) + prePostFix.postfix);
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
									parentCell.text(prePostFix.prefix + saveVal + prePostFix.postfix);
									break;
								default:
									saveVal = val;
									parentCell.text(prePostFix.prefix + val + prePostFix.postfix);
									break;
							}
							

							
							storage.grids[id].currentEdit[field] = null;
							var previousVal = storage.grids[id].dataSource.data[index + addend][field];
							if (previousVal !== saveVal && !("" === saveVal && undefined === previousVal)) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
								storage.grids[id].dataSource.data[index][field] = saveVal;
								parentCell.prepend("<span class='dirty'></span>");
							}
						});
					});
				}
				else if (gridData.columns[columns[j]].selectable) {	//attach event handlers to save data
					createCellEditSaveDiv(gridDiv);
					td.on('click', function selectableCellClickHandler(e) {
						if (e.target !== e.currentTarget) return;
						var cell = $(e.currentTarget);
						cell.text("");
						var select = $("<select class='input select'></select>").appendTo(cell);
						var options = [];
						var id = gridContent.data("grid_content_id");
						var index = cell.parents("tr").index();
						var field = cell.data("field");
						var pageNum = storage.grids[id].pageNum;
						var rowNum = storage.grids[id].pageSize;
						var addend = (pageNum-1)*rowNum;
						var val = storage.grids[id].dataSource.data[index + addend][field];
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

						select.on('blur', function cellSelectBlurHandler(e) {
							var select = $(e.currentTarget);
							var val = select.val();

							
							var parentCell = select.parents("td");
							select.remove();
							var id = gridContent.data("grid_content_id");

							var index = parentCell.parents("tr").index();
							var field = parentCell.data("field");
							var type = gridData.columns[field].type || "";
							var inputVal = getCellFormatting(gridData, field, type, val, index);
							parentCell.text(inputVal.prefix + val + inputVal.postfix);
							var previousVal = storage.grids[id].dataSource.data[index + addend][field];
							if (previousVal !== val) {	//if the value didn't change, don't "save" the new val, and don't apply the "dirty" span
								parentCell.prepend("<span class='dirty'></span>");
								storage.grids[id].dataSource.data[index][field] = inputVal.prefix + val + inputVal.postfix;
							}
						});
					});
				}
			}
		}

		for (var k = 0; k < columns.length; k++) {
			colGroup.append("<col></col>");
		}

		if (gridData.summaryRow && gridData.summaryRow.positionAt === "bottom") {
			var sum = buildRummaryRow(gridData);
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

		storage.grids[gridContent.data("grid_content_id")].dataSource.data = gridData.dataSource.data;
		loader.remove();
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
		if (totalWidth < gridContent[0].clientWidth) {
			var avgWidth = gridContent[0].clientWidth/Object.keys(columnNames).length;
			var remainder = gridContent[0].clientWidth%Object.keys(columnNames).length;
			var curWidth = 0;
			colGroups.each(function iterateColGroupsCallback(idx, val) {
				var i = idx%(colGroups.length/2);
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
				}
				else $(val).css("width", widthToAdd);
			});
		}
		else {	//There's less room than what's available
			tables.each(function (idx, val) {
				$(val).css("width", totalWidth);
			});
			colGroups.each(function iterateColGroupsCallback(idx, val) {
				var i = idx%(colGroups.length/2);
				if (idx === (colGroups.length-1) || idx === ((colGroups.length/2)-1)) $(val).css("width", (columnNames[columnList[i]]));
				else $(val).css("width", columnNames[columnList[i]]);
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
			var width = $(headerCols[idx]).width();
			$(val).css("width", width);
		});
	}

	function createCellEditSaveDiv(gridDiv) {
		var id = gridDiv.find(".grid-wrapper").data("grid_id");
		if ($("#grid_" + id + "_toolbar").length)	//if the toolbar had already been created, don't create it again.
			return;

		var saveBar = $("<div id='grid_" + id + "_toolbar' class='toolbar'></div>").prependTo(gridDiv);
		var saveAnchor = $("<a href='#' class='toolbarAnchor saveToolbar'></a>").appendTo(saveBar);
		saveAnchor.append("<span class='toolbarSpan saveToolbarSpan'>Save Changes</span>");

		var deleteAnchor = $("<a href='#' class='toolbarAnchor deleteToolbar'></a>").appendTo(saveBar);
		deleteAnchor.append("<span class='toolbarSpan deleteToolbarSpan'>Delete Changes</span>");

		saveAnchor.on('click', function saveChangesHandler(e) {
			var dirtyCells = [];
			var dirty = gridDiv.find(".dirty").each(function iterateDirtySpansCallback(idx, val) {
				dirtyCells.push($(val).parents("td"));
			});

			for (var i = 0; i < dirtyCells.length; i++) {
				var index = dirtyCells[i].parents("tr").index();
				var field = dirtyCells[i].data("field");
				var pageNum = storage.grids[id].pageNum;
				var rowNum = storage.grids[id].pageSize;
				var addend = (pageNum-1)*rowNum;
				storage.grids[id].originalData[index + addend][field] = storage.grids[id].dataSource.data[index + addend][field];
				dirtyCells[i].find(".dirty").remove();
			}
		});

		deleteAnchor.on('click', function deleteChangeHandler(e) {
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
					var inputVal = getCellFormatting(gridData, field, type, dirtyCells[i].text(), index);
					var cellVal = storage.grids[id].originalData[index][field] || "";
					dirtyCells[i].text(inputVal.prefix + cellVal + inputVal.postfix);
					dirtyCells[i].find(".dirty").remove();
					storage.grids[id].dataSource.data[index + addend][field] = storage.grids[id].originalData[index + addend][field];
				}
			}
		});
	}

	function getCellFormatting(gridData, field, type, val, idx) {
		var text;
		var prefix = "",
			postfix = "";
		switch (type) {
			case "currency":
				prefix = gridData.columns[field].symbol;
				postfix = "";
				break;
			case "percent":
				prefix = "";
				postfix = " %";
				break;
			case "time":
				prefix = "";
				postfix = " " + gridData.columns[field].measurement;
				break;
		}

		switch(typeof val) {
			case "string":
			case "number":
				text = gridData.dataSource.data[idx][field];
				break;
			case "boolean":
				text = gridData.dataSource.data[idx][field] ? true : false;
				break;
			default:
				text = "";
		}

		return {prefix: prefix, postfix: postfix, text: text};
	}

	function createGridFooter(gridDiv, gridData) {
		var gridFooter = gridDiv.find(".grid-footer-div");
		var id = gridFooter.data("grid_footer_id");
		var count = storage.grids[id].dataSource.count;
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
				storage.grids[id].pageSize = pageSize;
				var grid = storage.grids[id].grid;
				grid.find(".grid-content-div").empty();
				grid.find(".grid-footer-div").empty();

				createGridFooter(grid, storage.grids[id]);
				createGridContent(storage.grids[id], grid, false);
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
				var gridData = storage.grids[id];
				var pageSize = storage.grids[id].pageSize;
				var pagerInfo = gridFooter.find(".pageinfo");
				var pagerSpan = gridFooter.find(".grid-pagenum-span");
				var totalPages = (gridData.dataSource.data.length - pageSize) > 0 ? Math.ceil((gridData.dataSource.data.length - pageSize)/pageSize) + 1 : 1;

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
						var rowEnd = gridData.dataSource.data.length < pageSize*pageNum ? gridData.dataSource.data.length : gridData.dataSource.data.length;
						if (pageNum === totalPages) {
							link.addClass("link-disabled");
							$(allPagers[3]).addClass("link-disabled");
						}
						$(allPagers[0]).removeClass("link-disabled");
						$(allPagers[1]).removeClass("link-disabled");
						break;
					case "last":
						storage.grids[id].pageNum = (gridData.dataSource.data.length - pageSize) > 0 ? Math.ceil((gridData.dataSource.data.length - pageSize)/pageSize) + 1 : 1;
						var pageNum = storage.grids[id].pageNum;
						var rowStart = 1 + (pageSize*(pageNum-1));
						var rowEnd = gridData.dataSource.data.length < pageSize*pageNum ? gridData.dataSource.data.length : gridData.dataSource.data.length;
						link.addClass("link-disabled");
						$(allPagers[2]).addClass("link-disabled");
						$(allPagers[0]).removeClass("link-disabled");
						$(allPagers[1]).removeClass("link-disabled");
						break;
				}
				pagerSpan.text("Page " + pageNum + "/" + totalPages);
				pagerInfo.text(rowStart + " - " + rowEnd + " of " + gridData.dataSource.data.length + " rows");
				storage.grids[id].grid.find(".grid-content-div").empty();
				createGridContent(gridData, storage.grids[id].grid, false);
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
			var filters = grid.find(".filter-div");
			var currFilter = null;

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
				createFilterDiv(type, filterAnchor.data("field"), grid);
				currFilter = grid.find('.filter-div');
			}
			var filterCellOffset = filterCell.offset();
			currFilter.css("top", (filterCellOffset.top + filterCell.height() - $(window).scrollTop()));
			currFilter.css("left", (filterCellOffset.left + filterCell.width() - $(window).scrollLeft()));
		});
	}

	function createFilterDiv(type, field, grid) {
		var filterDiv = $("<div class='filter-div' data-parentfield='" + field + "'></div>").appendTo(grid);
		switch (type) {
			case "number":
			case "currency":
			case "percent":
				var span = $("<span class='filterTextSpan'>Filter rows where " + field + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='gte'>Greater than or equal to:</option>")
				select.append("<option value='ct'>Contains:</option>");
				select.append("<option value='gt'>Greater than:</option>");
				select.append("<option value='lte'>Less than or equal to:</option>");
				select.append("<option value='lt'><Less than:</option>");

				filterDiv.append("<input type='text' class='filterInput input' id='filterInput" + type + field + "'></input>");
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);

				button.on('click', filterButtonClickHandler);
				break;
			case "time":
			case "date":
			case "datetime":
				var span = $("<span class='filterTextSpan'>Filter rows where " + field + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='gte'>Equal to or later than:</option>");
				select.append("<option value='gt'>Later than:</option>");
				select.append("<option value='lte'>Equal to or before:</option>");
				select.append("<option value='lt'><Before:</option>");

				filterDiv.append("<input type='date' class='filterInput input' id='filterInput" + type + field + "'></input>");
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);

				button.on('click', filterButtonClickHandler);
				break;
			case "boolean":
				var span = $("<span class='filterTextSpan'>Filter rows where " + field + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");

				var optSelect = $("<select class='filterSelect'></select>").appendTo(span);
				optSelect.append("<option value='true'>True</option>");
				optSelect.append("<option value='false'>False</option>");
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);
				button.on('click', filterButtonClickHandler);
				break;
			case "string":
				var span = $("<span class='filterTextSpan'>Filter rows where " + field + " is:</span>").appendTo(filterDiv);
				var select = $("<select class='filterSelect select'></select>").appendTo(filterDiv);
				select.append("<option value='eq'>Equal to:</option>");
				select.append("<option value='neq'>Not equal to:</option>");
				select.append("<option value='ct'>Contains:</option>");
				filterDiv.append("<input class='filterInput input' type='text' id='filterInput" + type + field + "'></input>");
				var button = $("<input type='button' value='Filter' class='filterButton button' data-field='" + field + "'></input>").appendTo(filterDiv);

				button.on('click', filterButtonClickHandler);
				break;
		}
		return;
	}

	function filterButtonClickHandler(e) {
		var filterDiv = $(e.currentTarget).parents(".filter-div");
		var selected = filterDiv.find(".filterSelect").val();
		var value = filterDiv.find(".filterInput").val();
		var gridId = filterDiv.parents(".grid-wrapper").data("grid_id");

		if (value && value !== "") {
			filterGrid(selected, value, $(this).data("field"), gridId);
		}
		if (value == "") {
			storage.grids[gridId].dataSource.data = cloneGridData(storage.grids[gridId].originalData);
			storage.grids[gridId].dataSource.count = storage.grids[gridId].dataSource.data.length;
			storage.grids[gridId].grid.find(".grid-footer-div").empty();
			storage.grids[gridId].grid.find(".grid-content-div").empty();
			if (!!storage.grids[gridId].dataSource.sorted) {
				var sortedFilter = mergeSort(storage.grids[gridId].dataSource.data, storage.grids[gridId].dataSource.sortOn, storage.grids[gridId].dataSource.sortBy);
				var headerTable = filterDiv.parents(".grid-wrapper").find(".grid-header-div").find("table");
				var sortedElem = headerTable.find("[data-field='" + storage.grids[gridId].dataSource.sortOn + "']");
				if (sortedElem[0].dataset["order"] === "asc") sortedFilter.reverse();
				storage.grids[gridId].dataSource.data = sortedFilter;
			}
			createGridFooter(storage.grids[gridId].grid, storage.grids[gridId]);
			createGridContent(storage.grids[gridId], storage.grids[gridId].grid, false);
		}
		filterDiv.addClass("hiddenFilter");
	}

	function filterGrid(filterType, value, field, gridId) {
		var gridData = storage.grids[gridId].originalData;
		// Types: date, number, string, boolean, percent, currency, time
		var type = storage.grids[gridId].columns[field].type || "string";
		var filteredData = [];

		for (var i = 0, length = gridData.length; i < length; i++) {
			switch (filterType) {
				case "eq": 	//Equal
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) === parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
						if (new Date(gridData[i][field] === new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field].toLowerCase() === value.toLowerCase())
						filteredData.push(gridData[i]);
					break;
				case "neq": 	//not equal
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) !== parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
						if (new Date(gridData[i][field] !== new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field].toLowerCase() !== value.toLowerCase())
						filteredData.push(gridData[i])
					break;
				case "gte": 	//greater than or equal to
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) >= parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
						if (new Date(gridData[i][field] >= new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] >= value)
						filteredData.push(gridData[i]);
					break;
				case "gt": 	//greater than
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) > parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
						if (new Date(gridData[i][field] > new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] > value)
						filteredData.push(gridData[i]);
					break;
				case "lte": 	//less than or equal to
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) <= parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
						if (new Date(gridData[i][field] <= new Date(value)))
							filteredData.push(gridData[i]);
					}
					else if (gridData[i][field] <= value)
						filteredData.push(gridData[i]);
						break;
				case "lt": 	//less than
					if (type === "number" || type === "percent" || type === "currency") {
						if (parseFloat(gridData[i][field]) < parseFloat(value))
							filteredData.push(gridData[i]);
					}
					else if (type === "date") {
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
			}
		}
		if (storage.grids[gridId].dataSource.sorted) {
			var sortedFilter = mergeSort(filteredData, storage.grids[gridId].dataSource.sortOn, storage.grids[gridId].dataSource.sortBy);
			var headerTable = storage.grids[gridId].grid.find(".grid-header-div").find("table");
			var sortedElem = headerTable.find("[data-field='" + storage.grids[gridId].dataSource.sortOn + "']");
			if (sortedElem[0].dataset["order"] === "asc") sortedFilter.reverse();
			filteredData = sortedFilter;
		}
		storage.grids[gridId].dataSource.data = filteredData;
		storage.grids[gridId].dataSource.count = filteredData.length;
		storage.grids[gridId].grid.find(".grid-footer-div").empty();
		storage.grids[gridId].grid.find(".grid-content-div").empty();
		createGridFooter(storage.grids[gridId].grid, storage.grids[gridId]);
		createGridContent(storage.grids[gridId], storage.grids[gridId].grid, false);
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

			var droppedClone = droppedCol.clone(true, true);
			var targetClone = targetCol.clone(true, true);
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
					sliderDiv = $("<div id=sliderDiv style='width:10px; height:" + target.innerHeight() + "; cursor: col-resize;' draggable=true><div></div></div>").appendTo(parentRow);
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
						var targetCell = document.getElementById(sliderDiv.data("targetindex"));
						var targetBox = targetCell.getBoundingClientRect();
						var endPos = e.originalEvent.pageX;
						var startPos = targetBox.left;
						var width = endPos - startPos;
						var space = endPos - targetBox.right;

						if (width > 11) {
							var index = targetCell.dataset["index"];
							var gridWrapper = $(targetCell).parents(".grid-wrapper");
							var colGroups = gridWrapper.find("colgroup");
							var tables = gridWrapper.find("table");

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
								colGroups[i].children[index].style.width = width;
								$(tables[i]).width(currWidth + space);

							}
							sliderDiv.css("left", e.originalEvent.pageX);
						}
					});
				}
				sliderDiv.data("targetindex", target[0].id);
				sliderDiv.css("top", targetOffset.top);
				sliderDiv.css("left", (targetOffset.left + targetWidth -4));
				sliderDiv.css("position", "absolute");
			}
		});
	}

	function setSortableClickListener(elem) {
		elem.on('click', function handleHeaderClickCallback(e) {
			var headerDiv = elem.parents(".grid-header-div");
			var id = parseInt(headerDiv.data("grid_header_id"));
			var previousSorted = headerDiv.find("[data-order]");
			var order = elem[0].dataset["order"] === undefined ? "desc" : elem[0].dataset["order"] === "desc" ? "asc" : "desc";
			elem[0].dataset["order"] = order;
			var sameCol = false;
			if (previousSorted.length) {
				if (previousSorted.data("field") !== elem.data("field")) {
					$(".sortSpan").remove();	//may need to target the "previousSorted" element before removing the sortSpan, but something isn't working correctly with that, so for now this'll do.
					previousSorted[0].removeAttribute("data-order");
					var className = elem[0].dataset["order"] === "desc" ? "sort-desc sortSpan" : "sort-asc sortSpan";
					elem.append("<span class='" + className + "'>Sort</span>");
				}
				else {
					sameCol = true;
					var span = elem.find(".sortSpan");
					var className = elem[0].dataset["order"] === "desc" ? span.addClass("sort-desc").removeClass("sort-asc") : span.removeClass("sort-desc").addClass("sort-asc");
				}
			}
			else {
				var className = elem.data("order") === "desc" ? "sort-desc sortSpan" : "sort-asc sortSpan";
				elem.append("<span class='" + className + "'>Sort</span>");
			}
			var gridData = storage.grids[id];
			var field = elem.data("field");
			var sortedData = mergeSort(gridData.dataSource.data, field, gridData.columns[field].type || "string");
			if (elem[0].dataset["order"] === "asc") sortedData.reverse();
			storage.grids[id].dataSource.data = sortedData;
			storage.grids[id].dataSource.sortBy = elem[0].dataset["order"];
			storage.grids[id].dataSource.sortOn = field;
			storage.grids[id].dataSource.sorted = true;
			$(storage.grids[id].grid).find(".grid-content-div").empty();
			createGridContent(gridData, storage.grids[id].grid, false);
		});
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
	    	if (type === "number" || type === "time" || type === "currency") {
	    		if (parseFloat(left[0][field]) <= parseFloat(right[0][field])) {
		            result.push(left.shift());
		        } 
		        else {
		        	result.push(right.shift());
		        }
	    	}
	    	else if (type === 'date') {
	    		if (Date.parse(left[0][field]) <= Date.parse(right[0][field])) {
		            result.push(left.shift());
		        } 
		        else {
		        	result.push(right.shift());
		        }
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

	function swapContentCells(gridId, droppedIndex, targetIndex) {
		$("#grid-content-" + gridId).find("tr").each(function iterateContentRowsCallback(idx, val) {
			var droppedIdx = 1 + parseInt(droppedIndex);
			var targetIdx = 1 + parseInt(targetIndex);
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

	//==========================================================================================================================//
	//																															//
	//													HELPER FUNCTIONS														//
	//==========================================================================================================================//

	function numberWithCommas(x) {
	    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
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
    	numeric: "^\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$",
    	integer: "^\-?\d+$"
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
		count: function count() {
			return storage.gridCount++;
		},
		gridCount: 0,
		grids: {}
	};

	var resizing = false;

	return {
		create: create,
		addNewColumns: addNewColumns
	};
})(jQuery);
