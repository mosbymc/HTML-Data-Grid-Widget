/**
 * Singleton module for creating and manipulating excel workbooks
 * represented as JSON. Contains two 'public' 'methods':
 * 1) createWorkBook - This method takes no arguments and will create
 * and return a new workbook instance, which allows the user to add
 * worksheets, styles, table, etc.
 * 2) exportWorkBook - This method takes a workbook object as an argument and will
 * export the entire workbook (styles, worksheets, tables, etc.) as a single
 * excel file.
 * @type {{createWorkBook, exportWorkBook}}
 */
var excelExporter = (function _excelExporter() {
    var relationTypes = {
        worksheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
        sharedStrings: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
        stylesheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
        table: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
        core: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
        workbook: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
        app: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties'
    };

    var file_DirectoryMap = {
        '[Content_Types]': '',
        workbook: 'xl',
        stylesheet: 'xl',
        sharedStrings: 'xl',
        worksheet: 'xl.worksheets',
        'worksheet-rel': 'xl.worksheets._rels',
        table: 'xl.tables',
        'workbook-rel': 'xl._rels',
        app: 'docProps',
        core: 'docProps',
        'root-rel': '_rels'
    };

    /**
     * This is the base object to which all other excel object delegate for
     * creating themselves, adding/creating child node, and toXmlString()-ing themselves
     * @type {Object}
     */
    var xmlNode = {
        /**
         * Create a new xmlNode, setting base attributes
         * @param {Object} props - A list of properties for the node
         * @returns {xmlNode}
         */
        createXmlNode: function _createXmlNode(props) {
            this.textValue = props.textValue || null;
            this.attributes = props.attributes || null;
            this.nodeType = props.nodeType;
            this.children = [];
            this.isRoot = props.isRoot || false;
            if (this.isRoot) this.fileName = props.fileName;
            this.parent = props.parent || null;
            return this;
        },
        /**
         * Adds additional attributes to an xmlNode after its creation. Will
         * overwrite any existing attributes if new attributes share the same name
         * @param {Object} attrs - A collection of attributes to add to the node
         * @returns {xmlNode}
         */
        addAttributes: function _addAttributes(attrs) {
            var newAttributes = this.attributes || {};
            for (var attr in attrs) {
                newAttributes[attr] = attrs[attr];
            }
            this.attributes = newAttributes;
            return this;
        },
        /**
         * Creates a child node of the current node and adds it to the list of children
         * @param {Object} props - The list of properties for the child node
         * @returns {xmlNode}
         */
        createChild: function _createChild(props) {
            props.parent = this;
            return this.addChild(Object.create(xmlNode).createXmlNode(props));
        },
        /**
         * Creates a child node, but returns the child node instance rather than the instance that call this function.
         * Used for chaining to create children of the child
         * @param {Object} props - The list of properties for the child node
         * @returns {xmlNode}
         */
        createChildReturnChild: function _createChildReturnChild(props) {
            props.parent = this;
            var child = Object.create(xmlNode).createXmlNode(props);
            this.addChild(child);
            return child;
        },
        createChildReturnRoot: function _createChildReturnRoot(props) {
            props.parent = this;
            this.addChild(Object.create(xmlNode).createXmlNode(props));
            var node = this;
            if (!node.isRoot && node.parent) {
                while (!node.isRoot && node.parent) {
                    node = node.parent;
                }
                return node;
            }
        },
        createChildReturnParent: function _createChildReturnParent(props) {
            props.parent = this;
            this.addChild(Object.create(xmlNode).createXmlNode(props));
            return this.parent;
        },
        /**
         * Adds an xmlNode to the list of children
         * @param {xmlNode} childNode - The node to be added as a child
         * @returns {xmlNode}
         */
        addChild: function _addChild(childNode) {
            if (!xmlNode.isPrototypeOf(childNode)) return this;
            this.children.push(childNode);
            return this;
        },
        /**
         * Sets the text value for the node
         * @param {string} val - The text
         * @returns {xmlNode}
         */
        setValue: function _setTextValue(val) {
            this.textValue = val;
            return this;
        },
        /**
         * Creates an xml string representation of the current node and all its children
         * @returns {string} - The product of the toString operation
         */
        toXmlString: function _toXmlString() {
            var string = '';
            string += '<' + this.nodeType;
            for(var attr in this.attributes) {
                string = string + ' ' + attr + '="' + escape(this.attributes[attr]) + '"';
            }

            var childContent = '';
            for(var i = 0; i < this.children.length; i++) {
                childContent += this.children[i].toXmlString();
            }

            if (this.textValue != null || childContent) string += '>' + (this.textValue || '') + childContent + '</' + this.nodeType + '>';
            else string += '/>';

            var content = string.replace(/xmlns=""/g, '');
            content = content.replace(/NS[\d]+:/g, '');
            content = content.replace(/xmlns:NS[\d]+=""/g, '');
            if (this.isRoot)
                content = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + content;

            return content;
        }
    };

    /**
     * Creates a new workbook instance. From this all other excel types/files may be added (worksheet, table, stylesheet, etc.)
     * @returns {workbook} - Returns an object that delegates to the workbook object which itself delegates to the xmlNode object.
     */
    function createWorkBook() {
        return Object.create(workbook).init();
    }

    /**
     * Takes a workbook object as its argument and exports the data as an xml file.
     * @param wb
     */
    function exportWorkBook(wb) {
        if (!workbook.isPrototypeOf(wb)) return;
        var files = {};
        buildFiles('', wb.directory, files);

        var zip = new JSZip();
        for (var file in files) {
            zip.file(file.substr(1), files[file], { base64: false });
        }

        zip.generateAsync({ compression: 'DEFLATE', type: 'base64', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            .then(function jsZipPromiseCallback(content) {
                var string = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + content;
                //saveAs(content, "hello.xlsx");
                location.href = string;
                //saveAs(content, 'excelFile.xlsx');
                /*var fileSaver = document.createElement('a');
                fileSaver.download = 'sample.xlsx';
                fileSaver.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                var e = new MouseEvent('click', 0);
                //e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                fileSaver.dispatchEvent(e);*/
                //URL.revokeObjectURL(dataURI);
                //var a = document.createElement("a");
                //a.href = URL.createObjectURL(content);
                //a.download = 'excelFile.xlsx';
                //a.click();

                //var dataURI = URL.createObjectURL(string);
                /*var blob = content;
                if (typeof content == 'string') {
                    var parts = content.split(';base64,');
                    var contentType = parts[0];
                    var base64 = atob(parts[1]);
                    var array = new Uint8Array(base64.length);
                    for (var idx = 0; idx < base64.length; idx++) {
                        array[idx] = base64.charCodeAt(idx);
                    }
                    blob = new Blob([array.buffer], { type: contentType });
                }
                saveAsBlob(blob, fileName);*/
            });
    }

    /**
     * Builds out the file object with xml string representation of the nodes
     * @param {string} path - The path of the .xml/.rels files inside the excel directory
     * @param {Object} directory - The directory built up by the workbook instance
     * @param {Object} files - The object holding each .xml/.rels file
     */
    function buildFiles(path, directory, files) {
        path = path + '/';
        for (var file in directory) {
            if (xmlNode.isPrototypeOf(directory[file]))
                files[path + directory[file].fileName] = directory[file].toXmlString();
            else if (directory[file].constructor === Array) {
                for (var i = 0; i < directory[file].length; i++) {
                    files[path + directory[file][i][directory[file].fileName]] = directory[file][i].toXmlString();
                }
            }
            else if (typeof directory[file] === 'object') buildFiles(path + file, directory[file], files);
        }
    }

    /**
     * This is the based excel object. All other excel objects are created though this object or its children.
     * @type {xmlNode} - Delegates to xmlNode for base properties and methods
     */
    var workbook = Object.create(xmlNode);
    /**
     * Initializes a new instance of the workbook
     * @returns {workbook}
     */
    workbook.init = function _init() {
        this.directory = {
            _rels: {},
            xl: {
                worksheets: {
                    _rels: {}
                },
                tables: {},
                _rels: {}
            },
            docProps: {}
        };

        return this.createXmlNode({
            nodeType: 'workbook',
            isRoot: true,
            fileName: 'workbook.xml',
            attributes: {
                'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
                'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                'mc:Ignorable': 'x15',
                'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main'
            }
        }).createChild({
            nodeType: 'fileVersion',
            attributes: {
                appName: 'xl',
                lastEdited: '6',
                lowestEdited: '6',
                rupBuild: '14420'
            }
        }).createChild({
            nodeType: 'workbookPr',
            attributes: {
                defaultThemeVersion: '153222'
            }
        }).createChildReturnChild({
            nodeType: 'mc:AlternateContent',
            attributes: {
                'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'
            }
        }).createChildReturnChild({
            nodeType: 'mc:Choice',
            attributes: {
                Requires: 'x15'
            }
        }).createChildReturnRoot({
            nodeType: 'x15ac:absPath',
            attributes: {
                url: 'C:\\',
                'xmlns:x15ac': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/ac'
            }
        }).createChildReturnChild({
            nodeType: 'bookViews'
        }).createChildReturnRoot({
            nodeType: 'workbookView',
            attributes: {
                xWindow: '0',
                yWindow: '0',
                windowWidth: '28800',
                windowHeight: '12435'
            }
        })._createCoreFileObject()._createAppFileObject()
            ._createRelation('root-rel', '.rels')._createRelation('workbook-rel', 'workbook.xml.rels')._createSharedStrings()
            ._createContentType()._insertObjectIntoDirectory(this, 'workbook');
    };

    /**
     * Creates and adds a new worksheet for the workbook
     * @param {Array} data - The collection of data to be displayed in a table
     * @param {Array} columns - The list of columns to display in the table
     * @param {string|undefined} name - Ths name of the worksheet
     * @returns {workbook}
     */
    workbook.createWorkSheet = function __createWorkSheet(data, columns, name) {
        if (!data || data.constructor !== Array) return this;
        var sheetId = generateId(),
            tableId = generateId(),
            workSheetName = name || 'sheet' + sheetId,
            relWorkSheet = workSheetName + '.xml.rels';
        var ws = Object.create(workSheet).init(data, columns, workSheetName, tableId);
        this._insertObjectIntoDirectory(ws.worksheet, 'worksheet')
            ._insertObjectIntoDirectory(ws.table, 'table')
            ._createRelation('worksheet-rel', relWorkSheet)
            .createChildReturnChild({
                nodeType: 'sheets'
            })
            .createChildReturnRoot({
                nodeType: 'sheet',
                attributes: {
                    name: workSheetName,
                    sheetId: sheetId,
                    'r:id': 'rId' + sheetId
                }
            }).createChild({
            nodeType: 'calcPr',
            attributes: {
                calcId: '152511'
            }
        }).createChildReturnChild({
            nodeType: 'extLst'
        }).createChildReturnChild({
            nodeType: 'ext',
            attributes: {
                uri: '{140A7094-0E35-4892-8432-C4D2E57EDEB5}',
                'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main'
            }
        }).createChildReturnRoot({
            nodeType: 'x15:workbookPr',
            attributes: {
                chartTrackingRefBase: '1'
            }
        }).directory.xl._rels['workbook.xml.rels'].addRelation('rId' + sheetId, 'worksheet', 'worksheets/' + workSheetName + '.xml');
        this.directory.xl._rels['workbook.xml.rels'].addRelation(generateId('rId'), 'sharedStrings', 'sharedStrings.xml');
        this.directory.xl.worksheets._rels[relWorkSheet].addRelation('rId' + tableId, 'table', '../tables/table' + tableId + '.xml');
        this.directory.xl['sharedStrings.xml'].addEntries(ws.sharedStrings, ws.total);
        this.directory['[Content_Types].xml'].addContentType('/xl/worksheets/' + workSheetName + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
        this.directory['[Content_Types].xml'].addContentType('/xl/tables/table' + tableId + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml');

        return this;
    };

    /**
     * Creates a new stylesheet for the workbook
     * @param {Object} styles - The styles to be applied to the stylesheet
     * @returns {workbook}
     */
    workbook._createStyleSheet = function __createStyleSheet(styles) {
        if (this.directory['styles.xml']) return this;
        var relationId = generateId('rId');
        var style = Object.create(styleSheet).init(styles);
        this._insertObjectIntoDirectory(style, 'stylesheet');
        this.directory.xl._rels.addRelation(relationId, 'stylesheet', 'styles.xml');
        return this;
    };

    /**
     * Creates a new relation for the workbook
     * @param {string} relationType - Denotes what type of relation this is; root, worksheet, table, etc...
     * @param {string} fileName - The name of the file for this relation
     * @returns {workbook}
     */
    workbook._createRelation = function __createRelation(relationType, fileName) {
        var createRoot = false;
        if (relationType === 'root-rel') createRoot = true;
        var rel = Object.create(relation).init(createRoot, fileName);
        return this._insertObjectIntoDirectory(rel, relationType);
    };

    /**
     * Creates a new sharedStrings xmlNode instance and adds it to
     * the workbook directory
     * @returns {workbook}
     */
    workbook._createSharedStrings = function __createSharedStrings() {
        if (this.directory.xl['sharedStrings.xml']) return this;
        var ss = Object.create(sharedStrings).init();
        return this._insertObjectIntoDirectory(ss, 'sharedStrings');
    };

    /**
     * Create a new contentType xmlNode instance and adds it to
     * the workbook directory
     * @returns {workbook}
     */
    workbook._createContentType = function __createContentType() {
        if (this.directory['[Content_Types].xml']) return this;
        var ct = Object.create(contentType).init();
        return this._insertObjectIntoDirectory(ct, '[Content_Types]');
    };

    /**
     * Creates an instance of the core file object and inserts into the directory
     * @returns {workbook}
     */
    workbook._createCoreFileObject = function __createCoreFileObject() {
        if (this.directory.docProps['core.xml']) return this;
        var coreFile = Object.create(core).init();
        return this._insertObjectIntoDirectory(coreFile, 'core');
    };

    /**
     * Creates an instance of the app file object and inserts it into the directory
     * @returns {workbook}
     */
    workbook._createAppFileObject = function __createAppFileObject() {
        if (this.directory.docProps['app.xml']) return this;
        var appFile = Object.create(app).init();
        return this._insertObjectIntoDirectory(appFile, 'app');
    };

    /**
     * Inserts a root xmlNode instance into the workbook directory
     * based on its file_DirectoryMap lookup value
     * @param {xmlNode} object - A root xmlNode instance that represents a future
     * file to be exported
     * @param {string} objectType - The type of the xmlNode instance
     * @returns {workbook}
     */
    workbook._insertObjectIntoDirectory = function __insertObjectIntoDirectory(object, objectType) {
        if (!xmlNode.isPrototypeOf(object)) return this;
        var loc = file_DirectoryMap[objectType];
        if (!loc) {
            this.directory[object.fileName] = object;
            return this;
        }
        else {
            var paths = loc.split('.'),
                insertionPoint = this.directory[paths[0]];

            for (var i = 1; i < paths.length; i++) {
                insertionPoint = insertionPoint[paths[i]];
            }
            if (insertionPoint && insertionPoint.constructor === Array) insertionPoint.push(object);
            else insertionPoint[object.fileName] = object;
            return this;
        }
    };

    /**
     * This represents an excel worksheet
     * @type {xmlNode} - Delegates to xmlNode for base properties and methods
     */
    var workSheet = Object.create(xmlNode);

    /**
     * Initializes a new worksheet by creating the base nodes
     * @param {Array} data - An array of data used to create a new table object
     * @param {Array} columns - An array of the columns to be displayed in the table
     * @param {string} workSheetName - The file name of the worksheet that was generated in the workbook
     * @param {string} tableId - The id of the table for the worksheet that was generated in the workbook
     * @returns {{worksheet: workSheet, sharedStrings: Array, table: table}}
     */
    workSheet.init = function _init(data, columns, workSheetName, tableId) {
        var sharedStrings = [],
            sharedStringsMap = {},
            i, count = 0, total = columns.length;
        this.createXmlNode({
            nodeType: 'worksheet',
            fileName: workSheetName + '.xml',
            isRoot: true,
            attributes: {
                'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
                'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                'mc:Ignorable': 'x14ac',
                'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac'
            }
        });
        this.path = '/worksheets';
        this.name = workSheetName;

        if (!columns) {
            columns = [];
            for (var item in data[0]) {
                columns.push(item);
            }
        }
        this.data = data;
        this.columns = columns;
        var tableHeight = data.length + 1;

        var endPos = positionToLetterRef(columns.length, tableHeight),
            ref = 'A1:' + endPos;

        this.createChild({
            nodeType: 'dimension',
            attributes: {
                'ref': ref
            }
        }).createChildReturnChild({
            nodeType: 'sheetViews'
        }).createChildReturnChild({
            nodeType: 'sheetView',
            attributes: {
                'tabSelected': '1',
                'workbookViewId': '0'
            }
        }).createChildReturnRoot({
            nodeType: 'selection',
            attributes: {
                activeCell: 'A1',
                sqref: 'A1'
            }
        }).createChild({
            nodeType: 'sheetFormatPr',
            attributes: {
                defaultRowHeight: '15',
                'x14ac:dyDescent': '0.25'
            }
        });

        var colContainer = this.createChildReturnChild({ nodeType: 'cols' });
        var sheetdataNode = this.createChildReturnChild({ nodeType: 'sheetData' });

        var headerRow = sheetdataNode.createChildReturnChild({
            nodeType: 'row',
            attributes: {
                r: 1,
                spans: '1:' + columns.length,
                'x14ac:dyDescent': '0.25'
            }
        });

        var headerRowPos;

        for (i = 0; i < columns.length; i++) {
            var attrs = {};
            if (columns[i].width) attrs = { width: columns[i].width };
            attrs.min = i + 1;
            attrs.max = i + 1;
            attrs.width = '10';
            attrs.bestFit = '1';

            colContainer.createChild({
                nodeType: 'col',
                attributes: attrs
            });
            //TODO: Need to update logic here to check first if header is a string or not
            sharedStrings.push(columns[i].toString());
            sharedStringsMap[columns[i].toString()] = count.toString();
            headerRowPos = positionToLetterRef((i + 1), 1);

            headerRow.createChildReturnChild({
                nodeType: 'c',
                attributes: {
                    r: headerRowPos,
                    t: 's'
                }
            }).createChild({
                nodeType: 'v',
                textValue: count.toString()
            });
            count++;
        }

        for (i = 0; i < data.length; i++) {
            var row = sheetdataNode.createChildReturnChild({
                nodeType: 'row',
                attributes: {
                    r: (i + 2).toString(),
                    spans: '1:' + columns.length,
                    'x14ac:dyDescent': '0.25'
                }
            });

            for (var j = 0; j < columns.length; j++) {
                var cellLoc = positionToLetterRef((j + 1), (i + 2));
                if (typeof data[i][columns[j]] !== 'number') {
                    total += 1;
                    var sharedString = (data[i][columns[j]] || '').toString();
                    if (!sharedStringsMap[sharedString]) {
                        sharedStrings.push(sharedString);
                        sharedStringsMap[sharedString] = count.toString();

                        row.createChildReturnChild({
                            nodeType: 'c',
                            attributes: {
                                r: cellLoc,
                                t: 's'
                            }
                        }).createChild({
                            nodeType: 'v',
                            textValue: count.toString()
                        });
                        count++;
                    }
                    else {
                        row.createChildReturnChild({
                            nodeType: 'c',
                            attributes: {
                                r: cellLoc,
                                t: 's'
                            }
                        }).createChild({
                            nodeType: 'v',
                            textValue: sharedStringsMap[sharedString]
                    });
                    }
                }
                else {
                    row.createChildReturnChild({
                        nodeType: 'c',
                        attributes: {
                            r: cellLoc,
                            t: 'n'
                        }
                    }).createChild({
                        nodeType: 'v',
                        textValue: data[i][columns[j]].toString()
                    });
                }
            }
        }

        this.createChild({
            nodeType: 'pageMargins',
            attributes: {
                left: '0.7',
                right: '0.7',
                top: '0.75',
                bottom: '0.75',
                header: '0.3',
                footer: '0.3'
            }
        }).createChildReturnChild({
            nodeType: 'tableParts',
            attributes: {
                count: '1'
            }
        }).createChild({
            nodeType: 'tablePart',
            attributes: {
                'r:id': 'rId' + tableId
            }
        });

        var t = Object.create(table).init(columns, ref, tableId);
        return { worksheet: this, sharedStrings: sharedStrings, table: t, total: total === -1 ? 0 : total };
    };

    /**
     * Object used for creating and modifying excel tables
     * @type {xmlNode}
     */
    var table = Object.create(xmlNode);

    /**
     * This initializes the table object; creates initial nodes
     * @param {Array} columns - A collection of columns to be displayed in the table
     * @param {string} ref - A string detailing the top-left and bottom-right cells of the table
     * @param {string|number} tableId - The Id of the table
     * @returns {table}
     */
    table.init = function _init(columns, ref, tableId) {
        var name = 'table' + tableId;
        this.createXmlNode({
            nodeType: 'table',
            isRoot: true,
            fileName: 'table' + tableId + '.xml',
            attributes: {
                'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                'id': tableId,
                'name': name,
                'displayName': name,
                'ref': ref,
                'totalsRowShown': '0'
            }
        }).createChild({
            nodeType: 'autoFilter',
            attributes: {
                'ref': ref
            }
        });

        var tableCols = this.createChildReturnChild({
                nodeType: 'tableColumns',
                attributes: {
                    'count': columns.length
                }
            });

        for (var i = 0; i < columns.length; i++) {
            var columnName = '';
            if (typeof columns[i] === 'object') columnName = columns[i].displayName || columns[i].name;
            else columnName = columns[i];

            tableCols.createChild({
                nodeType: 'tableColumn',
                attributes: {
                    id: (i+1),
                    name: columnName
                }
            });
        }

        this.createChild({
            nodeType: 'tableStyleInfo',
            attributes: {
                name: 'TableStyleMedium2',
                showFirstColumn: '0',
                showLastColumn: '0',
                showRowStripes: '1',
                showColumnStripes: '0'
            }
        });

        this.columns = [columns];
        this.name = tableId;
        this.path = '/tables';
        return this;
    };

    var styleSheet = Object.create(xmlNode);

    /**
     * Object used for creating excel relations
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var relation = Object.create(xmlNode);

    /**
     * Initializes a new instance of the relation object, setting up the default nodes.
     * Called when a new workbook is initialized or when a table is added to a worksheet.
     * @param {boolean} createRootRelation - Indicates that the init function should create a root
     * relation rather than a table/stylesheet/worksheet/etc relation
     * @param {string|undefined} fileName - The name of the xml file for this relation
     * @returns {relation}
     */
    relation.init = function _init(createRootRelation, fileName) {
        this.createXmlNode({
            nodeType: 'Relationships',
            isRoot: true,
            fileName: fileName,
            attributes: {
                xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships'
            }
        });

        if (createRootRelation) {
            this.addRelation(generateId('rId'), 'app', 'docProps/app.xml')
                .addRelation(generateId('rId'), 'core', 'docProps/core.xml')
                .addRelation(generateId('rId'), 'workbook', 'xl/workbook.xml');
        }
        return this;
    };

    /**
     * Adds a new relation node to the existing relationship object
     * @param {string} rId - The relation id that the new relation refers to
     * @param {string} type - The type of the relation
     * @param {string} target - The location of the relation object
     * @returns {relation}
     */
    relation.addRelation = function _addRelation(rId, type, target) {
        this.createChild({
            nodeType: 'Relationship',
            attributes: {
                Id: rId,
                Type: relationTypes[type],
                Target: target
            }
        });
        return this;
    };

    /**
     * Object used for creating sharedStrings
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var sharedStrings = Object.create(xmlNode);

    /**
     * Initializes a new sharedStrings object. Called when a new
     * workbook is initialized
     * @returns {sharedStrings}
     */
    sharedStrings.init = function _init() {
        this.createXmlNode({
            nodeType: 'sst',
            isRoot: true,
            fileName: 'sharedStrings.xml',
            attributes: {
                'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
            }
        });
        return this;
    };

    /**
     * Function for adding new shared string nodes (xmlNode objects)
     * to this sharedString instance
     * @param {Array} values - An array of string to be added as children of
     * this xmlNode instance
     * @param {number} count - The number of shared string references
     * @returns {sharedStrings}
     */
    sharedStrings.addEntries = function _addEntries(values, count) {
        for (var i = 0; i < values.length; i++) {
            this.createChildReturnChild({ nodeType: 'si' })
                .createChild({
                nodeType: 't',
                textValue: values[i]
            });
        }
        this.addAttributes({
            uniqueCount: values.length,
            count: count
        });
        return this;
    };

    /**
     * Object used for creating the [Content-Types] file
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var contentType = Object.create(xmlNode);

    /**
     * Initializes the object with all required types. Called when a new
     * workbook is initialized
     * @returns {contentType}
     */
    contentType.init = function _init() {
        this.createXmlNode({
            nodeType: 'Types',
            isRoot: true,
            fileName: '[Content_Types].xml',
            attributes: {
                xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types'
            }
        }).createChild({
            nodeType: 'Default',
            attributes: {
                'Extension': 'rels',
                'ContentType': 'application/vnd.openxmlformats-package.relationships+xml'
            }
        }).createChild({
            nodeType: 'Default',
            attributes: {
                'Extension': 'xml',
                'ContentType': 'application/xml'
            }
        }).createChild({
            nodeType: 'Override',
            attributes: {
                PartName: '/xl/workbook.xml',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
            }
        }).createChild({
            nodeType: 'Override',
            attributes: {
                PartName: '/xl/sharedStrings.xml',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml'
            }
        }).createChild({
            nodeType: 'Override',
            attributes: {
                PartName: '/docProps/core.xml',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml'
            }
        }).createChildReturnRoot({
            nodeType: 'Override',
            attributes: {
                PartName: '/docProps/app.xml',
                ContentType: 'application/vnd.openxmlformats-officedocument.extended-properties+xml'
            }
        });
        return this;
    };

    /**
    * Adds a new content type as an xml node to the [Content-Types] file
    * @param {string} partName - The name of the part
    * @param {string} type - The type of content
    * @returns {contentType}
    */
    contentType.addContentType = function _addContentType(partName, type) {
        this.createChildReturnRoot({
            nodeType: 'Override',
            attributes: {
                PartName: partName,
                ContentType: type
            }
        });
        return this;
    };

    var core = Object.create(xmlNode);

    core.init = function _init() {
        var curDate = new Date().toISOString();
        this.createXmlNode({
            nodeType: 'cp:coreProperties',
            isRoot: true,
            fileName: 'core.xml',
            attributes: {
                'xmlns:cp': 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
                'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                'xmlns:dcterms': 'http://purl.org/dc/terms/',
                'xmlns:dcmitype': 'http://purl.org/dc/dcmitype/',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
            }
        }).createChild({ nodeType: 'dc:creator', textValue: 'XcelXporter' })
            .createChild({ nodeType: 'cp:lastModifiedBy', textValue: 'XcelXporter' })
            .createChild({
            nodeType: 'dcterms:created',
            textValue: curDate,
            attributes: {
                'xsi:type': 'dcterms:W3CDTF'
            }
        }).createChildReturnRoot({
            nodeType: 'dcterms:modified',
            textValue: curDate,
            attributes: {
                'xsi:type': 'dcterms:W3CDTF'
            }
        });
        return this;
    };

    var app = Object.create(xmlNode);

    app.init = function _init() {
        var heading = this.createXmlNode({
            nodeType: 'Properties',
            isRoot: true,
            fileName: 'app.xml',
            attributes: {
                xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
                'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes'
            }
        }).createChild({ nodeType: 'Application', textValue: 'Microsoft Excel' })
            .createChild({ nodeType: 'DocSecurity', textValue: '0' })
            .createChild({ nodeType: 'ScaleCrop', textValue: 'false' })
            .createChildReturnChild({ nodeType: 'HeadingPairs' });

        var vector = heading.createChildReturnChild({
            nodeType: 'vt:vector',
            attributes: {
                size: '2',
                baseType: 'variant'
            }
        });

        vector.createChildReturnChild({ nodeType: 'vt:variant' })
            .createChildReturnParent({ nodeType: 'vt:lpstr', textValue: 'Worksheets' })
            .createChildReturnChild({ nodeType: 'vt:variant' })
            .createChildReturnRoot({ nodeType: 'vt:i4', textValue: '1' })
            .createChildReturnChild({ nodeType: 'TitlesOfParts' })
            .createChildReturnChild({
            nodeType: 'vt:vector',
            attributes: {
                size: '1',
                baseType: 'lpstr'
            }
        }).createChildReturnRoot({ nodeType: 'vt:lpstr', textValue: 'sheet1' })
            .createChild({ nodeType: 'Company', textValue: '' })
            .createChild({ nodeType: 'LinksUpToDate', textValue: 'false' })
            .createChild({ nodeType: 'SharedDoc', textValue: 'false' })
            .createChild({ nodeType: 'HyperlinksChanged', textValue: 'false' })
            .createChildReturnRoot({ nodeType: 'AppVersion', textValue: '15.0300' });
        return this;
    };

    //==================================================================================//
    //=======================          Helper Functions          =======================//
    //==================================================================================//

    function escape(string) {
        string = baseToString(string);
        var reHasUnescapedHtml = new RegExp('[&<>"\'`]');
        return (string && reHasUnescapedHtml.test(string)) ? string.replace(/[&<>"'`]/g, escapeHtmlChar) : string;
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
        createWorkBook: createWorkBook,
        exportWorkBook: exportWorkBook
    }
})();
