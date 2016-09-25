import { gridDataHelpers } from './gridDataHelpers';
import { gridHelpers } from './gridHelpers';

export function createFilterTreeFromFilterObject(filterObject) {
    var ret = Object.create(booleanExpressionTree);
    ret.init();
    var operandStack = Object.create(stack);
    operandStack.init();
    var queue = [],
        topOfStack;

    iterateFilterGroup(filterObject, operandStack, queue, getNodeContext(ret));

    while (operandStack.length()) {
        topOfStack = operandStack.peek();
        if (topOfStack.operator !== '(')
            queue.push(operandStack.pop());
        else operandStack.pop();
    }

    ret.setTree(queue);
    ret.createTree();
    return ret;
}

var booleanExpressionTree = {
    init: function _init() {
        this.tree = null;
        this.context = null;
        this.rootNode = null;
        return this;
    }
};

booleanExpressionTree.setTree = function _setTree(tree) {
    this.queue = tree;
    this.rootNode = tree[this.queue.length - 1];
    return this;
};
booleanExpressionTree.createTree = function _createTree() {
    this.queue.pop();
    if (this.queue.length)
        this.rootNode.addChildren(this.queue);
};
booleanExpressionTree.filterCollection = function _filterCollection(collection) {
    return collection.filter(function collectionMap(curr) {
        this.context = curr;
        return this.rootNode.evaluate(curr);
    }, this);
};
booleanExpressionTree.internalGetContext = function _internalGetContext() {
    return this.context;
};
booleanExpressionTree.getContext = function _getContext() {
    return this.internalGetContext.bind(this);
};
booleanExpressionTree.isTrue = function _isTrue(item) {
    this.context = item;
    return this.rootNode.value;
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
    }
};

astNode.createTree = function _createTree(queue) {
    this.queue = queue.reverse();
    this.tree = this.queue;
    this.addChildren(this.queue);
};

astNode.addChildren = function _addChildren(tree) {
    if (this.children && this.children.length < this.numberOfOperands) {
        var child = tree.pop();
        child.addChildren(tree);
        this.children.push(child);
        child = tree.pop();
        child.addChildren(tree);
        this.children.push(child);
    }
    return this;
};

astNode.addChild = function _addChild(child) {
    if (this.children && this.children.length < this.numberOfOperands)
        this.children.push(child);
    return this;
};

astNode.evaluate = function _evaluate() {
    if (this.children && this.children.length) {
        switch (this.operator) {
            case 'or':
                return this.children[1].evaluate() || this.children[0].evaluate();
            case 'and':
                return this.children[1].evaluate() && this.children[0].evaluate();
            case 'xor':
                return !!(this.children[1].evaluate() ^ this.children[0].evaluate());
            case 'nor':
                return !(this.children[1].evaluate() || this.children[0].evaluate());
            case 'nand':
                return !(this.children[1].evaluate() && this.children[0].evaluate());
            case 'xnor':
                return !(this.children[1].evaluate() ^ this.children[0].evaluate());
        }
    }
    else {
        var baseVal,
            curVal,
            initialVal = this.getContext()[this.field];

        switch(this.dataType) {
            case 'time':
                curVal = gridHelpers.getNumbersFromTime(initialVal);
                baseVal = gridHelpers.getNumbersFromTime(this.standard);

                if (initialVal.indexOf('PM') > -1) curVal[0] += 12;
                if (this.standard.indexOf('PM') > -1) baseVal[0] += 12;

                curVal = gridHelpers.convertTimeArrayToSeconds(curVal);
                baseVal = gridHelpers.convertTimeArrayToSeconds(baseVal);
                break;
            case 'number':
                curVal = parseFloat(initialVal);
                baseVal = parseFloat(this.standard);
                break;
            case 'date':
                curVal = new Date(initialVal);
                baseVal = new Date(this.standard);
                break;
            case 'boolean':
                curVal = initialVal.toString();
                baseVal = this.standard.toString();
                break;
            default:
                curVal = initialVal;
                baseVal = this.standard;
                break;
        }

        this._value = gridDataHelpers.comparator(curVal, baseVal, this.operation);
        return this._value;
    }
};

astNode.getValue = function _getValue() {
    if (this._value == null)
        this._value = this.evaluate();
    return this._value;
};

Object.defineProperty(astNode, 'value', {
    get: function _getValue() {
        if (!this._value) {
            this._value = this.evaluate();
        }
        return this._value;
    }
});

function getNodeContext(bet) {
    return bet.internalGetContext.bind(bet);
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
            paren.createNode('(');
            stack.push(paren);
            iterateFilterGroup(filterObject.filterGroup[idx], stack, queue, contextGetter);
            while (stack.length()) {
                topOfStack = stack.peek();
                if (topOfStack.operator !== '(')
                    queue.push(stack.pop());
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
        if ((conjunction.associativity === associativity.LTR && conjunction.precedence <= topOfStack.precedence)
            || (conjunction.associativity === associativity.RTL && conjunction.precedence < topOfStack.precedence))
            queue.push(stack.pop());
        else
            break;
    }
    stack.push(conjunction);
}

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
};

function getNumberOfOperands(operator) {
    switch (operator) {
        case '!':
            return 1;
        case '(':
        case ')':
            return 0;
        default:
            return 2;
    }
}

var associativity = { RTL: 1, LTR: 2 };

function getOperatorPrecedence(operator) {
    switch (operator) {
        case '!':
            return {
                precedence: 1,
                associativity: associativity.LTR
            };
        case 'and':
            return {
                precedence: 2,
                associativity: associativity.RTL
            };
        case 'xor':
            return {
                precedence: 3,
                associativity: associativity.RTL
            };
        case 'or':
            return {
                precedence: 4,
                associativity: associativity.RTL
            };
        case '(':
        case ')':
            return {
                precedence: null,
                associativity: null
            };
        default:
            return null;
    }
}