/**
 * A module used for creating an excel xml-based file. Returns the primary creation object
 * after calling the 'createExcelRoot' function. Also exposes some static methods that
 * any instance of the creation object.
 * @type {{createExcelRoot}}
 */
var excelExporter = (function _excelExporter() {
    /**
     * Creates, initializes, and returns an instance of the 'exporter' object
     * @returns {exporter} - Returns an instance of the xml table creation object
     */
    function createExcelRoot() {
        return Object.create(exporter).init();
    }
    var exporter = {
        /**
         * Initializes the xml file by creating the root node.
         * @returns {exporter} - Returns 'this' for chaining
         */
        init: function _init() {
            if (this === excelExporter || this.root) return null;

            this.root = document.createElement('workbook');
            this.root.setAttribute('urn', 'schemas-microsoft-com:office:spreadsheet');
            this.root.setAttribute('xmlns:o', 'urn:schemas-microsoft-com:office:office');
            this.root.setAttribute('xmlns:x', 'urn:schemas-microsoft-com:office:excel');
            this.root.setAttribute('xmlns:ss', 'urn:schemas-microsoft-com:office:spreadsheet');
            this.root.setAttribute('xmlns:html', 'http://www.w3.org/TR/REC-html40');
            return this;
        },
        /**
         * Creates the actual xml table structure based on the columns and data passed in. May be call
         * before or after the workbookStyles function.
         * @param {string} wsName - The name for the excel worksheet
         * @param {object} columns - A javascript object containing metadata about the columns of the worksheet
         * @param {Array} data - An array of JSON data to be displayed in each cell of the excel worksheet
         * @returns {exporter} - Returns 'this' for chaining
         */
        createWorkSheet: function _createWorkSheet(wsName, columns, data) {
            if ((typeof wsName !== 'string' && !!wsName) || !columns || typeof columns !== 'object' || !data || !data.length || !this.root) return this;

            var workSheetName = wsName || 'sheet1',
                workSheet = document.createElement('worksheet');
            workSheet.setAttribute('ss:Name', workSheetName);
            var table = document.createElement('table'),
                headerRow = document.createElement('row'),
                col, header, headerData, tableRow, rowCell, rowData;

            for (var column in columns) {
                col = document.createElement('column');
                col.setAttribute('ss:Width', columns[column]);
                table.appendChild(col);

                header = document.createElement('cell');
                headerData = document.createElement('data');
                headerData.setAttribute('ss:Type', 'string');
                headerData.text(column);
                header.appendChild(headerData);
                headerRow.appendChild(header);
            }
            table.appendChild(headerRow);

            for (var row in data) {
                tableRow = document.createElement('row');
                rowCell = document.createElement('cell');
                for (var item in data[row]) {
                    rowData = document.createElement('data');
                    rowData.setAttribute('ss:Type', getCellType(data[row][item]));
                    rowData.text(data[row][item]);
                    rowCell.appendChild(rowData);
                    tableRow.append(rowCell);
                }
                table.appendChild(tableRow);
            }

            this.xml = table;
            return this;
        },
        /**
         * Creates the styles for an Excel xml file based on the styles passed in.
         * @param {object} styles - A collection of style definitions in object form to be applied to the Excel worksheet
         * @returns {exporter} - Returns 'this' for chaining
         */
        addWorksheetStyles: function _addWorksheetStyles(styles) {
            if (!styles || !styles.length || !this.root) return this;
            var stylesNode = document.createElement('styles'),
                styleNode;
            for (var style in styles) {
                styleNode = document.createElement('style');
                for (var item in style) {
                    var tmp = document.createElement(item);
                    for (var attribute in item) {
                        tmp.setAttribute(attribute, item[attribute]);
                    }
                    styleNode.appendChild(tmp);
                }
            }
            stylesNode.appendChild(styleNode);
            var xml = this.root;
            xml.appendChild(stylesNode);
            this.xml = xml;
            return this;
        }
    };

    //==================================================================================//
    //=======================          Helper Functions          =======================//
    //==================================================================================//

    /**
     * Determines what the xml table cell data type should be based on the javascript typeof
     * @param {string} item - The 'typeof' a javascript object property
     * @returns {string} - Returns a data type for xml table cells
     */
    function getCellType(item) {
        var type = typeof item;
        switch (type) {
            case 'string':
            case 'number':
            case 'boolean':
                return type;
            case 'object':
                return 'string';
            case 'undefined':
                return 'string';
            case 'symbol':
                return 'string';
        }
    }

    return {
        createExcelRoot: createExcelRoot
    }
})();