var stack = {
    init: function _init() {
        this.data = [];
        this.top = 0;
    },
    push: function _push(item) {
        this.data[this.top++] = item;
    },
    pop: function _pop() {
        return this.data[--this.top];
    },
    peek: function _peek() {
        return this.data[this.top - 1];
    },
    clear: function _clear() {
        this.top = 0;
    },
    length: function _length() {
        return this.top;
    }
},
    associativity = { RTL: 1, LTR: 2 },
    operators = {
        Not: '!',
        And: 'and',
        Or: 'or',
        Xor: 'xor',
        Nor: 'not',
        Nand: 'nand',
        Xnor: 'xnor',
        RightParens: ')',
        LeftParens: '('
    },
    booleanExpressionTree = {
    init: function _init() {
        this.tree = null;
        this.context = null;
        this.rootNode = null;
        return this;
    },
    setTree: function _setTree(tree) {
        this.queue = tree;
        this.rootNode = tree[this.queue.length - 1];
        return this;
    },
    createTree: function _createTree() {
        this.queue.pop();
        if (this.queue.length)
            this.rootNode.addChildren(this.queue);
    },
    filterCollection: function _filterCollection(collection) {
        var dataMap = [];
        return {
            filteredData: collection.filter(function collectionFilter(curr, idx) {
                this.context = curr;
                var isTrue = this.rootNode.evaluate();
                if (isTrue) dataMap.push(idx);
                return this.rootNode.value;
            }, this),
            filteredDataMap: dataMap
        };
    },
    internalGetContext: function _internalGetContext() {
        return this.context;
    },
    getContext: function _getContext() {
        return this.internalGetContext.bind(this);
    },
    isTrue: function _isTrue(item) {
        this.context = item;
        return this.rootNode.value;
    }
};

var astNode = {
    createNode: function _createNode(node) {
        var operatorCharacteristics = getOperatorPrecedence(node);
        if (operatorCharacteristics) {
            this.operator = node;
            this.numberOfOperands = getNumberOfOperands(this.operator);
            this.precedence = operatorCharacteristics.precedence;
            this.associativity = operatorCharacteristics.associativity;
            this.children = [];
        }
        else {
            this.field = node.field;
            this.standard = node.value;
            this.operation = node.operation;
            this.dataType = node.dataType;
            this.context = null;
        }
        this._value = null;
        this.getContext = null;
        this.queue = null;
    },
    createTree: function _createTree(queue) {
        this.queue = queue.reverse();
        this.tree = this.queue;
        this.addChildren(this.queue);
    },
    addChildren: function _addChildren(tree) {
        if (this.children && this.children.length < this.numberOfOperands) {
            var child = tree.pop();
            child.addChildren(tree);
            this.children.push(child);
            child = tree.pop();
            child.addChildren(tree);
            this.children.push(child);
        }
        return this;
    },
    addChild: function _addChild(child) {
        if (this.children && this.children.length < this.numberOfOperands)
            this.children.push(child);
        return this;
    },
    evaluate: function _evaluate() {
        if (this.children && this.children.length) {
            switch (this.operator) {
                case operators.Or: return this.children[1].evaluate() || this.children[0].evaluate();
                case operators.And: return this.children[1].evaluate() && this.children[0].evaluate();
                case operators.Xor: return !!(this.children[1].evaluate() ^ this.children[0].evaluate());
                case operators.Nor: return !(this.children[1].evaluate() || this.children[0].evaluate());
                case operators.Nand: return !(this.children[1].evaluate() && this.children[0].evaluate());
                case operators.Xnor: return !(this.children[1].evaluate() ^ this.children[0].evaluate());
            }
        }
        else {
            this._value = comparator(dataTypeValueNormalizer(this.dataType, this.getContext()[this.field]), dataTypeValueNormalizer(this.dataType, this.standard), this.operation);
            return this._value;
        }
    },
    getValue: function _getValue() {
        if (this._value == null) this._value = this.evaluate();
        return this._value;
    }
};

Object.defineProperty(astNode, 'value', {
    get: function _getValue() {
        if (this._value == null) this._value = this.evaluate();
        return this._value;
    }
});

function getNodeContext(bet) {
    return bet.internalGetContext.bind(bet);
}

function createFilterTreeFromFilterObject(filterObject) {
    var ret = Object.create(booleanExpressionTree);
    ret.init();
    var operandStack = Object.create(stack);
    operandStack.init();
    var queue = [],
        topOfStack;

    iterateFilterGroup(filterObject, operandStack, queue, getNodeContext(ret));

    while (operandStack.length()) {
        topOfStack = operandStack.peek();
        if (topOfStack.operator !== operators.LeftParens) queue.push(operandStack.pop());
        else operandStack.pop();
    }

    ret.setTree(queue);
    ret.createTree();
    return ret;
}

function iterateFilterGroup(filterObject, stack, queue, contextGetter) {
    var conjunction = filterObject.conjunct,
        idx = 0,
        topOfStack;

    while (idx < filterObject.filterGroup.length) {
        if (idx > 0) {
            var conjunctObj = Object.create(astNode);
            conjunctObj.createNode(conjunction);
            pushConjunctionOntoStack(conjunctObj, stack, queue);
        }
        if (filterObject.filterGroup[idx].conjunct) {
            var paren = Object.create(astNode);
            paren.createNode(operators.LeftParens);
            stack.push(paren);
            iterateFilterGroup(filterObject.filterGroup[idx], stack, queue, contextGetter);
            while (stack.length()) {
                topOfStack = stack.peek();
                if (topOfStack.operator !== operators.LeftParens) queue.push(stack.pop());
                else {
                    stack.pop();
                    break;
                }
            }
        }
        else {
            var leafNode = Object.create(astNode);
            leafNode.createNode(filterObject.filterGroup[idx]);
            leafNode.getContext = contextGetter;
            queue.push(leafNode);
        }
        ++idx;
    }
}

function pushConjunctionOntoStack(conjunction, stack, queue) {
    while (stack.length()) {
        var topOfStack = stack.peek();
        if ((conjunction.associativity === associativity.LTR && conjunction.precedence <= topOfStack.precedence) ||
            (conjunction.associativity === associativity.RTL && conjunction.precedence < topOfStack.precedence))
            queue.push(stack.pop());
        else
            break;
    }
    stack.push(conjunction);
}

function getNumberOfOperands(operator) {
    switch (operator) {
        case operators.Not:
            return 1;
        case operators.LeftParens:
        case operators.RightParens:
            return 0;
        default:
            return 2;
    }
}

function getOperatorPrecedence(operator) {
    switch (operator) {
        case operators.Not:
            return { precedence: 1, associativity: associativity.LTR };
        case operators.And:
            return { precedence: 2, associativity: associativity.RTL };
        case operators.Xor:
            return { precedence: 3, associativity: associativity.RTL };
        case operators.Or:
            return { precedence: 4, associativity: associativity.RTL };
        case operators.LeftParens:
        case operators.RightParens:
            return { precedence: null, associativity: null };
        default:
            return null;
    }
}

export { createFilterTreeFromFilterObject };