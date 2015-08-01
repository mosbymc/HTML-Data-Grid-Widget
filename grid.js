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
var grid = (function grid() {
	function create(gridData, gridDiv) {
		if (gridData && gridDiv) {
			var id = storage.count();
			var wrapperDiv = document.createElement("div");
			wrapperDiv.id = "m-grid-wrapper-" + id;
			wrapperDiv.dataset["m_grid_id"] = id;
			wrapperDiv.className = "m-grid-wrapper";

			var headerDiv = document.createElement("div");
			headerDiv.id = "m-grid-header-" + id;
			headerDiv.dataset["m_grid_header_id"] = id;
			headerDiv.className = "m-grid-header-div";
			var contentDiv = document.createElement("div");
			contentDiv.id = "m-grid-content-" + id;
			contentDiv.dataset["m_grid_content_id"] = id;
			contentDiv.className = "m-grid-content-div";
			var footerDiv = document.createElement("div");
			footerDiv.id = "m-grid-footer-" + id;
			footerDiv.dataset["m_grid_footer_id"] = id;
			footerDiv.className = "m-grid-footer-div";

			wrapperDiv.appendChild(headerDiv);
			wrapperDiv.appendChild(contentDiv);
			wrapperDiv.appendChild(footerDiv);
			gridDiv.appendChild(wrapperDiv);

			if (gridData.constructor === Array) {
				createGridColumnsFromArray(gridData, gridDiv);
			}
			else {
				createGridHeaders(gridData, gridDiv);
			}
		}
	}

	function addNewColumns(newData, gridDiv) {
		var oldGrid = dominator.findChildren(gridDiv, ["m_grid_id"]);
		var id = oldGrid.dataset["m_grid_id"];
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
		var gridHeader = dominator.findChildren(gridDiv, ["m-grid-header-div"]);
		var headerTable = document.createElement("table");
		var headerTHead = document.createElement("thead");
		var headerRow = document.createElement("tr");
		var headerCol = {};
		var index = 0;
		var cells = [];
		for (var col in gridData.columns) {
			var th = document.createElement("th");
			th.id = gridData.columns[col].field + "_grid_id_" +gridHeader.dataset["m_grid_header_id"];
			th.dataset["field"] = gridData.columns[col].field;
			th.dataset["index"] = gridData.columns[col].index;
			th.className = "m-grid-header-cell";
			th.innerText = gridData.columns[col].title;

			if (gridData.columns[col].reorderable) {
				th.setAttribute('draggable', true);
				setDragAndDropListeners(th);
			}
			cells[gridData.columns[col].index] = th;
		}

		if (cells.length) {
			for (var i = 0; i < cells.length; i++) {
				if (cells[i]) {
					headerRow.appendChild(cells[i]);
				}
				else {
					headerRow.appendChild(document.createElement("th"));
				}
			}
		}

		headerTHead.appendChild(headerRow);
		headerTable.appendChild(headerTHead);
		gridHeader.appendChild(headerTable);

		createGridContent(gridData, gridDiv);
	}

	function createGridContent(gridData, gridDiv) {
		var gridContent = dominator.findChildren(gridDiv, ["m-grid-content-div"]);
		var gridFooter = dominator.findChildren(gridDiv, ["m-grid-footer-div"]);
		gridContent.style.height = "250px";
		var contentTable = document.createElement("table");
		contentTable.style.height = "auto";
		var contentTBody = document.createElement("tbody");
		var cells = [];
		var columns = [];
		dominator.findChildren(gridDiv, ["th"]).each(function(idx, val) {
			columns.push(val.dataset["field"]);
		});

		for (var i = 0; i < gridData.data.length; i++) {
			var tr = document.createElement("tr");
			for (value in gridData.data[i]) {
				var td = document.createElement("td");
				td.dataset["field"] = value;
				td.dataset["index"] = gridData.columns[value].index;
				td.className = "m-grid-content-cell";
				if (gridData.columns[value].editable) {
					var input = document.createElement("input");
					input.setAttribute("value", gridData.data[i][value]);
					td.appendChild(input);
				}
				else if (gridData.columns[value].selectable) {
					var select = document.createElement("select");
					var options = [];
					options.push("Select");
					options.push(gridData.data[i][value]);
					options.concat(gridData.columns[value].options);
					for (var j = 0; j < options.length; j++) {
						var opt = document.createElement("option");
						opt.setAttribute("value", options[j]);
						opt.innerText = options[j];
						select.appendChild(opt);
					}
					select.value = gridData.data[i][value];
					td.appendChild(select);
				}
				else {
					td.innerText = gridData.data[i][value];
				}

				cells[gridData.columns[value].index] = td;
			}
			
			if (cells.length) {
				for (var j = 0; j < columns.length; j++) {
					if (cells[j]) {
						tr.appendChild(cells[j]);
					}
					else {
						tr.appendChild(document.createElement("td"));
					}
				}
				contentTBody.appendChild(tr);
			}
			cells = [];
		}
		contentTable.appendChild(contentTBody);
		gridContent.appendChild(contentTable);

		gridFooter.innerText = "Page 1";

		var tableCells = dominator.findChildren(gridDiv, ["field"]);

		var columnNames = {};
		for (var name in gridData.columns) {
			columnNames[name] = 0;
		}

		for (var i = 0, length = tableCells.length; i < length; i++) {
			var column = tableCells[i].dataset["field"];
			if (tableCells[i].clientWidth > columnNames[column]) {
				columnNames[column] = tableCells[i].clientWidth;
			}
		}

		var totalWidth = 0;
		for (var name in columnNames) {
			totalWidth += columnNames[name];
		}

		if (totalWidth < gridDiv.clientWidth) {
			var avgWidth = gridDiv.clientWidth/Object.keys(columnNames).length;
			for (var col in columnNames) {
				if (avgWidth < columnNames[col]) {

				}
			}
			for (var i = 0, length = tableCells.length; i < length; i++) {
				tableCells[i].style.width = avgWidth;
			}
		}

		storage.grids[gridContent.dataset["m_grid_content_id"]] = {
			grid: gridDiv,
			data: gridData
		};
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
					headerCol[col].index = index;
					//headerCol[col].editable = true;
					//headerCol[col].selectable = true;
					headerCol[col].reorderable = true;
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
		elem.addEventListener('dragstart', function handleDragStartCallback(e) {
			e.dataTransfer.setData("text", e.srcElement.id);
		});
		elem.addEventListener('drop', function handleHeaderDropCallback(e) {
			var droppedCol = document.getElementById(e.dataTransfer.getData("text"));
			var targetCol = e.srcElement;
			var parentRow = droppedCol.parentElement;
			var parentDiv = dominator.getParentByClassName(targetCol, "m-grid-header-div");
			parentDivId = parentDiv.dataset["m_grid_header_id"];

			var droppedClone = droppedCol.cloneNode(true);
			setDragAndDropListeners(droppedClone);
			var targetClone = targetCol.cloneNode(true);
			setDragAndDropListeners(targetClone);

			var tempIndex = droppedClone.dataset["index"];
			droppedClone.dataset["index"] = targetClone.dataset["index"];
			targetClone.dataset["index"] = tempIndex;

			parentRow.insertBefore(targetClone, droppedCol);
			parentRow.insertBefore(droppedClone, targetCol);
			parentRow.removeChild(droppedCol);
			parentRow.removeChild(targetCol);

			swapContentCells(parentDivId, tempIndex, droppedClone.dataset["index"]);
			e.preventDefault();
		});
		elem.addEventListener('dragover', function handleHeaderDragOverCallback(e) {
			e.preventDefault();
		});
	}

	function swapContentCells(gridId, droppedIndex, targetIndex) {
		var contentDiv = document.getElementById("m-grid-content-" + gridId);
		dominator.findChildren(contentDiv, ["tr"]).each(function (idx, val) {
			var droppedCell = val.children[droppedIndex];
			var targetCell = val.children[targetIndex];
			var droppedClone = droppedCell.cloneNode(true);
			var targetClone = targetCell.cloneNode(true);

			var tempIndex = droppedClone.dataset["index"];
			droppedClone.dataset["index"] = targetClone.dataset["index"];
			targetClone.dataset["index"] = tempIndex;

			val.insertBefore(targetClone, droppedCell);
			val.insertBefore(droppedClone, targetCell);
			val.removeChild(droppedCell);
			val.removeChild(targetCell);
		});
	}

	var storage = {
		count: function count() {
			return storage.gridCount++;
		},
		gridCount: 0,
		grids: {}
	};

	return {
		create: create,
		addNewColumns: addNewColumns
	};
})();
