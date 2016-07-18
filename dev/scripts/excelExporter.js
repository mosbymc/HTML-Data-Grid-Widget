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
        table: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table'
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
        fileName: '',
        /**
         * Denotes weather this node is the root node of the file or not
         */
        isRoot: false,
        /**
         * Contains a collection of child xmlNodes
         */
        children: [],
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
            return this;
        },
        /**
         * Adds additional attributes to an xmlNode after its creation. Will
         * overwrite any existing attributes if new attributes share the same name
         * @param {Array} attrs - A collection of attributes to add to the node
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
            this.addChild(Object.create(xmlNode).createXmlNode(props));
            return this;
        },
        /**
         * Creates a child node, but returns the child node instance rather than the instance that call this function.
         * Used for chaining to create children of the child
         * @param {Object} props - The list of properties for the child node
         * @returns {xmlNode}
         */
        createChildReturnChild: function _createChildReturnChild(props) {
            var child = Object.create(xmlNode).createXmlNode(props);
            this.children.push(child);
            return child;
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
            if (this.isRoot)
                string = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
            string += "<" + this.nodeType;
            for(var attr in this.attributes) {
                string = string + " " + attr + "=\""+ escape(this.attributes[attr])+"\"";
            }

            var childContent = "";
            for(var i = 0, l = this.children.length; i < l; i++) {
                childContent += this.children[i].toString();
            }

            if (this.textValue) string += '>' + this.textValue + '</' + this.name + '>';
            else if (childContent && !this.textValue) string +=  childContent + '</' + this.name + '>';
            else if (childContent) string +=  '>' + childContent + '</' + this.name + '>';
            else string += "/>";

            return string;
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
                files[path + file + '/'][directory.file.fileName] = directory[file].toXmlString();
            else if (directory[file].constructor === Array) {
                for (var i = 0; i < directory[file].length; i++) {
                    files[path + file + '/'][directory[file][i][directory.file.fileName]] = directory[file][i].toXmlString();
                }
            }
            else if (typeof directory[file] === 'object') buildFiles(path + file, directory, files);
        }
    }

    /**
     * This is the based excel object. All other excel objects are created though this object or its children.
     * @type {xmlNode} - Delegates to xmlNode for base properties and methods
     */
    var workbook = Object.create(xmlNode, {
        /**
         * Initializes a new instance of the workbook
         * @returns {workbook}
         */
        init: function _init() {
            this.createXmlNode({
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
                nodeType: 'workbookPr',
                attributes: {
                    defaultThemeVersion: '153222'
                }
            }).createCoreFileObject().createAppFileObject()
                .createRelation('root-rel', '.rels').createRelation('workbook-rel', 'workbook.xml.rels').createSharedStrings()
                .createAppFileObject().createContentType().path = '/xl';

            return this;
        },
        /**
         * Creates and adds a new worksheet for the workbook
         * @param {Array} data - The collection of data to be displayed in a table
         * @param {Array} columns - The list of columns to display in the table
         * @param {string} name - Ths name of the worksheet
         * @returns {workbook}
         */
        createWorkSheet: function _createWorkSheet(data, columns, name) {
            if (!data || data.constructor !== Array) return this;
            var sheetId = generateId(),
                rId = generateId('r:Id'),
                tableId = generateId(),
                workSheetName = name || 'worksheet' + sheetId;
            var ws = Object.create(workSheet).init(data, columns, workSheetName, tableId);
            this.insertObjectIntoDirectory(ws.worksheet, 'worksheet')
                .workSheets.push(ws.worksheet)
                .createRelation('worksheet-rel', 'sheet1.xml.rels');
            this.createChildReturnChild({
                    nodeType: 'sheets'
                })
                .createChild({
                    nodeType: 'sheet',
                    attributes: {
                        name: workSheetName,
                        sheetId: sheetId,
                        rId: rId
                    }
                })
                .directory.xl._rels.addRelation(rId, 'worksheet', workSheetName + '.xml.rels');
            this.directory.xl.sharedStrings.addEntries(ws.sharedStrings);
            this.directory['[Content-Types]'].addContentType('/xl/worksheets/' + workSheetName + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
            this.directory['[Content-Types]'].addContentType('/xl/tables/table' + tableId + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml');

            return this;
        },
        /**
         * Creates a new stylesheet for the workbook
         * @param {Object} styles - The styles to be applied to the stylesheet
         * @returns {workbook}
         */
        createStyleSheet: function _createStyleSheet(styles) {
            var relationId = generateId('rId');
            var style = Object.create(styleSheet).init(styles);
            this.insertObjectIntoDirectory(style, 'stylesheet');
            this.directory.xl._rels.addRelation(relationId, 'stylesheet', 'styles.xml');
            return this;
        },
        /**
         * Creates a new relation for the workbook
         * @param {string} relationType - Denotes what type of relation this is; root, worksheet, table, etc...
         * @param {string} fileName - The name of the file for this relation
         * @returns {workbook}
         */
        createRelation: function _createRelation(relationType, fileName) {
            var createRoot = false;
            if (relationType === 'root-rel') createRoot = true;
            var rel = Object.create(relation).init(createRoot, fileName);
            this.insertObjectIntoDirectory(rel, relationType).relations.push(rel);
            return this;
        },
        /**
         * Creates a new sharedStrings xmlNode instance and adds it to
         * the workbook directory
         * @returns {workbook}
         */
        createSharedStrings: function _createSharedStrings() {
            if (this.directory.xl.sharedStrings) return this;
            var ss = Object.create(sharedStrings).init();
            this.insertObjectIntoDirectory(ss, 'sharedStrings').sharedStrings = ss;
            return this;
        },
        /**
         * Create a new contentType xmlNode instance and adds it to
         * the workbook directory
         * @returns {workbook}
         */
        createContentType: function _createContentType() {
            if (this.directory['[Content-Types].xml']) return this;
            var ct = Object.create(contentType).init();
            this.insertObjectIntoDirectory(ct, '[Content-Types]').contentType = ct;
            return this;
        },
        /**
         * Creates an instance of the core file object and inserts into the directory
         * @returns {workbook}
         */
        createCoreFileObject: function _createCoreFileObject() {
            if (this.directory.docProps['core.xml']) return this;
            var coreFile = Object.create(core).init();
            this.insertObjectIntoDirectory(coreFile, 'core');
            return this;
        },
        /**
         * Creates an instance of the app file object and inserts it into the directory
         * @returns {workbook}
         */
        createAppFileObject: function _createAppFileObject() {
            if (this.directory.docProps['app.xml']) return this;
            var appFile = Object.create(app).init();
            this.insertObjectIntoDirectory(appFile, 'app');
            return this;
        },
        /**
         * Inserts a root xmlNode instance into the workbook directory
         * based on its file_DirectoryMap lookup value
         * @param {xmlNode} object - A root xmlNode instance that represents a future
         * file to be exported
         * @param {string} objectType - The type of the xmlNode instance
         * @returns {workbook}
         */
        insertObjectIntoDirectory: function _insertObjectIntoDirectory(object, objectType) {
            var loc = file_DirectoryMap[objectType],
                paths = loc.split('.'),
                insertionPoint = this.directory[paths[0]];

            for (var i = 1; i < paths.length; i++) {
                insertionPoint = insertionPoint[paths[i]];
            }
            if (insertionPoint && insertionPoint.constructor === Array)
                insertionPoint.push(object);
            else
                insertionPoint[object.fileName] = object;
            return this;
        },
        directory: {
            _rels: {},
            xl: {
                worksheets: {
                    _rels: {}
                },
                theme: {
                },
                _rels: {
                }
            },
            docProps: {
            }
        },
        sharedStrings: {},
        workSheets: [],
        styleSheets: [],
        tables: [],
        relations: [],
        contentType: {}
    });

    /**
     * This represents an excel worksheet
     * @type {xmlNode} - Delegates to xmlNode for base properties and methods
     */
    var workSheet = Object.create(xmlNode, {
        /**
         * Initializes a new worksheet by creating the base nodes
         * @param {Array} data - An array of data used to create a new table object
         * @param {Array} columns - An array of the columns to be displayed in the table
         * @param {string} workSheetName - The file name of the worksheet that was generated in the workbook
         * @param {string} tableId - The id of the table for the worksheet that was generated in the workbook
         * @returns {{worksheet: workSheet, sharedStrings: Array}}
         */
        init: function _init(data, columns, workSheetName, tableId) {
            var sharedStrings = [],
                sharedStringsMap = {},
                i, count = 0;
            this.createXmlNode({
                nodeType: 'worksheet',
                fileName: 'sheet1.xml',
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

            var endPos = positionToLetterRef(tableHeight, columns.length),
                ref = 'A1:' + endPos;

            this.createChild({
                nodeType: 'dimension',
                attributes: {
                    'ref': ref
                }
            })
            .createChildReturnChild({
                nodeType: 'sheetViews'
            }).createChild({
                nodeType: 'sheetView',
                attributes: {
                    'tabSelected': '1',
                    'workbookViewId': '0'
                }
            });

            this.createChild({
                nodeType: 'sheetFormatPr',
                attributes: {
                    defaultRowHeight: '15'
                }
            });

            var colContainer = this.createChildReturnChild({
                nodeType: 'cols'
            });

            for (i = 0; i < columns.length; i++) {
                var attrs = null;
                if (columns[i].width)
                    attrs = { width: columns[i].width };
                attrs.min = '1';
                attrs.max = '1';
                attrs.customWidth = '1';

                colContainer.createChild({
                    nodeType: 'col',
                    attributes: attrs
                });
            }

            var sheetdataNode = this.createChildReturnChild({
                nodeType: 'sheetData'
            });

            for (i = 0; i < data.length; i++) {
                var row = sheetdataNode.createChildReturnChild({
                    nodeType: 'row',
                    attributes: {
                        r: i.toString(),
                        spans: '1:' + columns.length + 1
                    }
                });

                for (var cell in data[i]) {
                    if (~columns.indexOf(cell)) {
                        var r = positionToLetterRef(i, j);
                        if (typeof data[i][cell] !== 'number') {
                            sharedStrings.push(cell);
                            sharedStringsMap[cell] = count;

                            row.createChildReturnChild({
                                nodeType: 'c',
                                attributes: {
                                    r: r,
                                    t: 's'
                                }
                            }).createChild({
                                nodeType: 'v',
                                textValue: count++
                            });
                        }
                        else {
                            row.createChildReturnChild({
                                nodeType: 'c',
                                attributes: {
                                    r: r
                                }
                            }).createChild({
                                nodeType: 'v',
                                textValue: data[i][cell]
                            });
                        }
                    }
                }
            }

            this.tables.push(Object.create(table).init(columns, ref, tableId));
            return { worksheet: this, sharedStrings: sharedStrings };
        },
        getNamesAndPaths: function _getNameAndPath() {
            var parts = [
                {
                    type: 'worksheet',
                    name: this.name,
                    path: this.path
                }
            ];
            for (var i = 0; i < this.tables.length; i++) {
                parts.push(this.tables[i].getNameAndPath())
            }
            return parts;
        },
        data: [],
        columns: [],
        tables: [],
        relations: [],
        rowStyles: []
    });

    /**
     * Object used for creating and modifying excel tables
     * @type {xmlNode}
     */
    var table = Object.create(xmlNode, {
        /**
         * This initializes the table object; creates initial nodes
         * @param {Array} columns - A collection of columns to be displayed in the table
         * @param {string} ref - A string detailing the top-left and bottom-right cells of the table
         * @param {string|number} tableId - The Id of the table
         * @returns {table}
         */
        init: function _init(columns, ref, tableId) {
            this.createXmlNode({
                nodeType: 'table',
                isRoot: true,
                fileName: 'table1.xml',
                attributes: {
                    'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    'id': id,
                    'name': tableId,
                    'displayName': tableId,
                    'ref': ref
                }
            }).createChild({
                nodeType: 'autoFilter',
                attributes: {
                    'ref': ref
                }
            }).createChild({
                nodeType: 'tableStyleInfo'
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
                        id: generateId(),
                        name: columnName
                    }
                });
            }
            this.columns.push(columns);
            this.name = tableId;
            this.path = '/tables';
            return this;
        },
        getNameAndPath: function _getNameAndPath() {
            return { part: 'table', name: this.name, path: this.path };
        },
        columns: []
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

    /**
     * Object used for creating excel relations
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var relation = Object.create(xmlNode, {
        /**
         * Initializes a new instance of the relation object, setting up the default nodes.
         * Called when a new workbook is initialized or when a table is added to a worksheet.
         * @param {boolean} createRootRelation - Indicates that the init function should create a root
         * relation rather than a table/stylesheet/worksheet/etc relation
         * @param {string|undefined} fileName - The name of the xml file for this relation
         * @returns {relation}
         */
        init: function _init(createRootRelation, fileName) {
            this.createXmlNode({
                nodeType: 'Relationships',
                isRoot: true,
                fileName: fileName,
                attributes: {
                    xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships'
                }
            });

            if (createRootRelation) {
                this.addRelation(generateId('rId'), 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties', 'docProps/app.xml')
                    .addRelation(generateId('rId'), 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties', 'docProps/core.xml')
                    .addRelation(generateId('rId'), 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument', 'xl/workbook.xml');
            }
            return this;
        },
        /**
         * Adds a new relation node to the existing relationship object
         * @param {string} rId - The relation id that the new relation refers to
         * @param {string} type - The type of the relation
         * @param {string} target - The location of the relation object
         * @returns {relation}
         */
        addRelation: function _addRelation(rId, type, target) {
            this.createChild({
                nodeType: 'Relationship',
                attributes: {
                    Id: rId,
                    type: relationTypes[type],
                    target: target
                }
            });
            return this;
        }
    });

    /**
     * Object used for creating sharedStrings
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var sharedStrings = Object.create(xmlNode, {
        /**
         * Initializes a new sharedStrings object. Called when a new
         * workbook is initialized
         * @returns {sharedStrings}
         */
        init: function _init() {
            this.createXmlNode({
                nodeType: 'sst',
                isRoot: true,
                fileName: 'sharedStrings.xml',
                attributes: {
                    'xmlns:x': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                }
            });
            return this;
        },
        /**
         * Function for adding new shared string nodes (xmlNode objects)
         * to this sharedString instance
         * @param {Array} values - An array of string to be added as children of
         * this xmlNode instance
         * @returns {sharedStrings}
         */
        addEntries: function _addEntries(values) {
            for (var i = 0; i < values.length; i++) {
                this.createChildReturnChild({
                    nodeType: 'x:si'
                }).createChild({
                    nodeType: 'x:t',
                    textValue: values[i]
                });
            }
            this.highestValuedNode = values.length - 1;
            return this;
        }
    });

    /**
     * Object used for creating the [Content-Types] file
     * @type {xmlNode} - Delegates to xmlNode object
     */
    var contentType = Object.create(xmlNode, {
        /**
         * Initializes the object with all required types. Called when a new
         * workbook is initialized
         * @returns {contentType}
         */
        init: function _init() {
            this.createXmlNode({
                nodeType: 'Types',
                isRoot: true,
                fileName: '[Content-Types].xml',
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
            }).createChild({
                nodeType: 'Override',
                attributes: {
                    PartName: 'application/vnd.openxmlformats-package.core-properties+xml',
                    ContentType: 'application/vnd.openxmlformats-officedocument.extended-properties+xml'
                }
            });
            return this;
        },
        /**
         * Adds a new content type as an xml node to the [Content-Types] file
         * @param {string} partName - The name of the part
         * @param {string} type - The type of content
         * @returns {contentType}
         */
        addContentType: function _addContentType(partName, type) {
            this.createChild({
                nodeType: 'Override',
                attributes: {
                    PartName: partName,
                    ContentType: type
                }
            });
            return this;
        }
    });

    var core = Object.create(xmlNode, {
        init: function _init() {
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
            }).createChild({
                nodeType: 'dc:creator',
                textValue: 'XcelXporter'
            }).createChild({
                nodeType: 'cp:lastModifiedBy',
                textValue: 'XcelXporter'
            }).createChild({
                nodeType: 'dcterms:created',
                textValue: curDate,
                attributes: {
                    'xsi:type': 'dcterms:W3CDTF'
                }
            }).createChild({
                nodeType: 'dcterms:modified',
                textValue: curDate,
                attributes: {
                    'xsi:type': 'dcterms:W3CDTF'
                }
            });
            return this;
        }
    });

    var app = Object.create(xmlNode, {
        init: function _init() {
            var vector = this.createXmlNode({
                nodeType: 'Properties',
                isRoot: true,
                fileName: 'app.xml',
                attributes: {
                    xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
                    'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes'
                }
            }).createChild({
                nodeType: 'Application',
                textValue: 'Microsoft Excel'
            }).createChild({
                nodeType: 'DocSecurity',
                textValue: '0'
            }).createChild({
                nodeType: 'ScaleCrop',
                textValue: '0'
            }).createChild({
                nodeType: 'HeadingPairs'
            }).createChildReturnChild({
                nodeType: 'vt:vector',
                attributes: {
                    size: '2',
                    baseType: 'variant'
                }
            });

            vector.createChildReturnChild({
                nodeType: 'vt:variant'
            }).createChild({
                nodeType: 'vt:lpstr',
                textValue: 'Worksheets'
            });

            vector.createChildReturnChild({
                nodeType: 'vt:variant'
            }).createChild({
                nodeType: 'vt:i4',
                textValue: '1'
            });

            this.createChildReturnChild({
                nodeType: 'TitlesOfParts'
            }).createChildReturnChild({
                nodeType: 'vt:vector',
                attributes: {
                    size: '1',
                    baseType: 'lpstr'
                }
            }).createChild({
                nodeType: 'vt:lpstr',
                textValue: 'TestSheet'
            });

            this.createChild({
                nodeType: 'LinksUpToDate',
                textValue: 'false'
            }).createChild({
                nodeType: 'SharedDoc',
                textValue: 'false'
            }).createChild({
                nodeType: 'HyperlinksChanged',
                textValue: 'false'
            }).createChild({
                nodeType: 'AppVersion',
                textValue: '15.0300'
            });
        }
    });

    //==================================================================================//
    //=======================          Helper Functions          =======================//
    //==================================================================================//

    function saveAsBlob(dataURI, fileName) {
        var blob = dataURI;
        if (typeof dataURI == 'string') {
            var parts = dataURI.split(';base64,');
            var contentType = parts[0];
            var base64 = atob(parts[1]);
            var array = new Uint8Array(base64.length);
            for (var idx = 0; idx < base64.length; idx++) {
                array[idx] = base64.charCodeAt(idx);
            }
            blob = new Blob([array.buffer], { type: contentType });
        }
        navigator.msSaveBlob(blob, fileName);
    }

    function saveAsDataURI(dataURI, fileName) {
        if (window.Blob && dataURI instanceof Blob) {
            dataURI = URL.createObjectURL(dataURI);
        }
        fileSaver.download = fileName;
        fileSaver.href = dataURI;
        var e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        fileSaver.dispatchEvent(e);
        URL.revokeObjectURL(dataURI);
    }

    function saveAs(options) {
        var save = postToProxy;
        if (!options.forceProxy) {
            if (downloadAttribute) {
                save = saveAsDataURI;
            } else if (navigator.msSaveBlob) {
                save = saveAsBlob;
            }
        }
        save(options.dataURI, options.fileName, options.proxyURL, options.proxyTarget);
    }

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
        createWorkBook: createWorkBook,
        exportWorkBook: exportWorkBook
    }
})();