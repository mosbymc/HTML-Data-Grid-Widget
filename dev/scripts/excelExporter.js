var excelExporter = (function _excelExporter() {
    var xmlNode = {
        isRoot: false,
        children: [],
        createXmlNode: function _createXmlNode(props) {
            this.textValue = props.textValue || null;
            this.attributes = props.attributes || [];
            this.nodeType = props.nodeType;
            this.children = [];
            this.isRoot = props.isRoot || false;
            return this;
        },
        addAttributes: function _addAttributes(attrs) {
            this.attributes = this.attributes.concat(attrs);
            return this;
        },
        createChild: function _createChild(props) {
            this.addChild(this.createXmlNode(props));
            return this;
        },
        createChildReturnChild: function _createChildReturnChild(props) {
            var child = this.createXmlNode(props);
            this.children.push(child);
            return child;
        },
        addChild: function _addChild(childNode) {
            if (!xmlNode.isPrototypeOf(childNode)) return this;
            this.children.push(childNode);
            return this;
        },
        setValue: function _setTextValue(val) {
            this.textValue = val;
            return this;
        },
        toString: function _toString() {
            var string = '';
            if (this.isRoot)
                string = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
            string += "<" + this.name;
            for(var attr in this.attributes) {
                if(this.attributes.hasOwnProperty(attr)) {
                    string = string + " " + attr + "=\""+ escape(this.attributes[attr])+"\"";
                }
            }

            var childContent = "";
            for(var i = 0, l = this.children.length; i < l; i++) {
                childContent += this.children[i].toString();
            }

            if (childContent) string +=  ">" + childContent + "</" + this.name + ">";
            else string += "/>";

            return string;
        }
    };

    function createWorkBook() {
        return Object.create(workbook).init();
    }

    var workbook = Object.create(xmlNode, {
        init: function _init() {
            this.createXmlNode({
                nodeType: 'workbook',
                isRoot: true,
                attributes: [
                    {
                        'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                    },
                    {
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
                    },
                    {
                        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'
                    },
                    {
                        'mc:Ignorable': 'x15'
                    },
                    {
                        'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main'
                    }
                ]
            });

            this.createChild({
                nodeType: 'workbookPr',
                attributes: [
                    {
                        defaultThemeVersion: '153222'
                    }
                ]
            });
            return this;
        },
        createWorkSheet: function _createWorkSheet(data, columns, name) {
            if (!data || data.constructor !== Array) return this;
            var sheetId = generateId(),
                rId = generateId('rId'),
                workSheetName = name || 'worksheet' + sheetId;
            this.workSheets.push(Object.create(workSheet).init(data, columns, workSheetName, sheetId, rId));
            this.createChildReturnChild({
                nodeType: 'sheets'
            })
            .createChild({
                nodeType: 'sheet',
                attributes: [
                    {
                        name: 'sheet' + sheetId
                    },
                    {
                        sheetId: sheetId
                    },
                    {
                        rId: rId
                    }
                ]
            });
            return this;
        },
        createStyleSheet: function _createStyleSheet(styles) {
            this.styleSheets.push(Object.create(styleSheet).init(styles));
            return this;
        },
        createTable: function _createTable(table) {
            this.tables.push(Object.create(table).init());
            return this;
        },
        createRelation: function _createRelation(relation) {
            this.relations.push(Object.create(relation).init());
            return this;
        },
        workSheets: [],
        styleSheets: [],
        tables: [],
        relations: []
    });

    var workSheet = Object.create(xmlNode, {
        init: function _init(data, columns, wsName, sheetId, rId) {
            this.createXmlNode({
                nodeType: 'worksheet',
                isRoot: true,
                attributes: [
                    {
                        'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                    },
                    {
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
                    },
                    {
                        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'
                    },
                    {
                        'mc:Ignorable': 'x14ac'
                    },
                    {
                        'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac'
                    }
                ]
            });

            if (!columns) {
                columns = [];
                for (var item in data[0]) {
                    columns.push(item);
                }
            }
            this.data = data;
            this.columns = columns;
            var tableHeight = data.length + 1;

            var endPos = positionToLetterRef(tableHeight, columns.length);

            this.createChild({
                nodeType: 'dimension',
                attributes: [
                    {
                        'ref': 'A1:' + endPos
                    }
                ]
            })
            .createChildReturnChild({
                nodeType: 'sheetViews'
            }).createChild({
                nodeType: 'sheetView',
                attributes: [
                    {
                        'tabSelected': '1'
                    },
                    {
                        'workbookViewId': '0'
                    }
                ]
            });

            this.createChild({
                nodeType: 'sheetFormatPr',
                attributes: [
                    {
                        defaultRowHeight: '15'
                    }
                ]
            });

            var colContainer = this.createChildReturnChild({
                nodeType: 'cols'
            });

            for (var i = 0; i < columns.length; i++) {
                var attrs = [];
                if (columns[i].width)
                    attrs.push({ width: columns[i].width });

                colContainer.createChild({
                    nodeType: 'col',
                    attributes: attrs
                });
            }

            //TODO: appears JS doesn't like anything primitives being assigned to a delegated object - figure out what needs to be done
            //this.sheetName = wsName;
        },
        data: [],
        columns: [],
        relations: [],
        rowStyles: []
    });

    var styleSheet = Object.create(xmlNode, {
        //id: '',
        //width: 0,
        //height: 0,
        //TODO: see todo above - same problem
        font: {
            size: '',
            name: ''
        },
        border: {
            left: '',
            right: '',
            top: '',
            bottom: '',
            diagonal: ''
        }
    });

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

    function escape(string) {
        // Reset `lastIndex` because in IE < 9 `String#replace` does not.
        string = baseToString(string);
        //var reUnescapedHtml = /[&<>"'`]/g;
        var reHasUnescapedHtml = new RegExp('[&<>"\'`]');
        return (string && reHasUnescapedHtml.test(string))
            ? string.replace(/[&<>"'`]/g, escapeHtmlChar)
            : string;
    }

    function baseToString(value) {
        return value == null ? '' : (value + '');
    }

    function escapeHtmlChar(chr) {
        return htmlEscapes[chr];
    }

    var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
    };

    var LETTER_REFS = {};

    function positionToLetterRef(pos1, pos2) {
        var digit = 1, index, num = pos1, string = "", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if(LETTER_REFS[pos1]) {
            return LETTER_REFS[pos1].concat(pos2);
        }
        while (num > 0) {
            num -= Math.pow(26, digit -1);
            index = num % Math.pow(26, digit);
            num -= index;
            index = index / Math.pow(26, digit - 1);
            string = alphabet.charAt(index) + string;
            digit += 1;
        }
        LETTER_REFS[pos1] = string;
        return string.concat(pos2);
    }

    var generateId = (function guid(seed) {
        return function _generateId(value) {
            var prefix = value || '';
            return prefix + (seed++).toString();
        };
    })(1);

    return {
        createWorkBook: createWorkBook
    }
})();