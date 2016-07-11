/*var excelExporter = (function _excelExporter($) {
    var exporter = {
        init: function _init() {

        }
    };
})(jQuery);*/

var excelExporter = {
    init: function _init() {
        this.root = document.createElement('workbook');
        root.setAttribute('urn', 'schemas-microsoft-com:office:spreadsheet')
            .setAttribute('xmlns:o', 'urn:schemas-microsoft-com:office:office')
            .setAttribute('xmlns:x', 'urn:schemas-microsoft-com:office:excel')
            .setAttribute('xmlns:ss', 'urn:schemas-microsoft-com:office:spreadsheet')
            .setAttribute('xmlns:html', 'http://www.w3.org/TR/REC-html40');
    },
    createWorkSheet: function _createWorkSheet(wsName, columns, data) {
        var workSheet = document.createElement('worksheet');
        workSheet.setAttribute('ss:Name', wsName);
        var table = document.createElement('table'),
            col, headers = [], header,
            headerRow = document.createElement('row'),
            headerData;

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
    },
    workbookStyles: function _workbookStyles(styles) {
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
        this.root.appendChild(stylesNode);
    }
};