/*
 Boolean Operator Precedence

 - ! = 1 R-T-L
 - AND = 2 L-T-R
 - XOR = 3 L-T-R
 - OR = 3 L-T-R

 - (AND|OR|NOT|XOR|\\|\\||^|&&|!)
 - (AND|OR|NOT|XOR)

 AND                    NAND
 ∧ | 0 | 1             !∧ | 0 | 1
 ------------          ------------
 0 | 0 | 0              0 | 1 | 1
 ------------          ------------
 1 | 0 | 1              1 | 1 | 0


 OR                      NOR
 ∨ | 0 | 1             !∨ | 0 | 1
 ------------          ------------
 0 | 0 | 1              0 | 1 | 0
 ------------          ------------
 1 | 1 | 1              1 | 0 | 0

 XOR                    XNOR
 ⊕ | 0 | 1             !⊕ | 0 | 1
 ------------          -------------
 0 | 0 | 1               0 | 1 | 0
 ------------          -------------
 1 | 1 | 0               1 | 0 | 1


 AND: p && q = If p, then p AND q is q, otherwise p AND q is p
 OR: p || q = If p, then p OR q is p, otherwise p OR q is q
 NAND = !(p AND q) = !p OR !q
 NOR = !(p OR q) = !p AND !q


 Post Evaluation
 c1.field1 >= someVal AND c1.field1 != c1.field2 OR c2.field1 <= c1.field1

 Inline Evaluation
 12 >= 15 AND 12 != 8 OR 6 <= 12



 c1.field1 > x && c1.field1 < y && c1.field2 !== c2.field1 || (c1.field4 === z ^ a > b) && true



 - Parse expression string on boolean operators to get each token
 - If this is a pre-eval
    - If the token is an operand
        - Parse and evaluate the result(s)
        - Evaluate each statement of truth
            - If the statement just has inlined values, can evaluate immediately
            - If the statement has variables or object properties, ensure access and gather values to inline
            - If the statement has a function, start at global level and work down until function is found and executed; inline result
        - Push result of evaluation onto queue
    - If the token is an operator
        - Use shunting-yard algorithm to determine where it belongs
    - If the token is a paren
        - Use shunting-yard algorithm
    - If this is a post-eval
        - If the token is an operand
            - Parse the token and create a new boolean expression object; set appropriate values
            - Then push the boolean expression object into the queue
        - If the token is an operator
            - Use shunting-yard algorithm to determine where it belongs
        - If the token is a paren
            - Use shunting-yard algorithm


JavaScript Operators:
TODO: Don't know that I want to support increment operators
- Post-increment: x++
- Pre-increment: ++x
- Post-decrement: x--
- Pre-decrement: --x

- Addition: +                       'add'
- Subtraction/Negation: -           'subtract'
- Multiplication: *                 'multiply'
- Division: /                       'divide'
- Bitwise not: ~                    'bitwise negate'
- Logical not: !                    'not'
- Modulus: %                        'mod'
- Exponentiation: **                'exponent'
- In: in                            'in'
- Instance of: instanceOf           'instanceOf'
- Less than: <                      'lt'
- Less than or equal to: <=         'lte'
- Greater than: >                   'gt'
- Greater than or equal to: >=      'gte'
- Loose equality: ==                'looseEqual'
- Strict equality: ===              'strictEqual'
- Loose inequality: !=              'loose-inequal'
- Strict inequality: !==            'strict-inequal'
- Bitwise XOR: ^                    'xor'
- Logical AND: &&                   'and'
- Logical OR: ||                    'or'
- Ternary: ?
- In-place multiplication: *=       'in-place-multiply'
- In-place division: /=             'in-place-divide'
- In-place addition: +=             'in-place-add'
- In-place subtraction: -=          'in-place-subtract'
- In-place modulus: %=              'in-place-mod'

 */

/*
var operator = {
    createNewOperator: function _createNewOperator(token) {
        switch (token) {
            case '!':
            case 'NOT':
                this.precedence = 1;
                this.associativity = 'LTR';
                this.value = '!';
                this.type = 'operator';
                this.operands = 1;
                break;
            case 'AND':
            case '&&':
                this.precedence = 2;
                this.associativity = 'RTL';
                this.value = '&&';
                this.type = 'operator';
                this.operands = 2;
                break;
            case 'XOR':
            case '^':
                this.precedence = 3;
                this.associativity = 'RTL';
                this.value = '^';
                this.type = 'operator';
                this.operands = 2;
                break;
            case 'OR':
            case '||':
                this.precedence = 4;
                this.associativity = 'RTL';
                this.value = '||';
                this.type = 'operator';
                this.operands = 2;
                break;
            case ')':
                this.precedence = null;
                this.associativity = null;
                this.value = ')';
                this.type = 'grouper';
                this.operands = null;
                break;
            case '(':
                this.precedence = null;
                this.associativity = null;
                this.value = '(';
                this.type = 'grouper';
                this.operands = null;
                break;
        }
    }
};

var parser = {
    init: function _init(expression) {
        this.expression = expression;
        this.stack = Object.create(stack).init();
        this.queue = [];
    },
    parse: function _parse() {
        var head = 0,
            tail = 0,
            token = '';

        while (tail < this.expression.length) {
            head = this.expression.indexOf(' ', tail);
            token = this.expression.substring(tail, head);

            if (token.indexOf('(') === 0 ) {
                this.stack.push(Object.create(operator).createNewOperator('('));
                if (token.length > 1) {
                    token = token.substring(1, token.length - 1);
                }
                else {

                }
            }
            else if (token.indexOf(')') === token.length - 1) {
                if (token.length > 1) {
                    token = token.substring(0, token.length - 2);
                }
            }

            switch (this.expression[head]) {
                case 'NOT':
                case 'AND':
                case 'XOR':
                case 'OR':
                    this.stack.push(Object.create(operator).createNewOperator(token));
                    break;
            }
        }
    }
};

var rootNode = {
    createRootNode: function _createRootNode(config) {
        this.operator = config.operator || null;

        //Here the root node will always be an operator, but due to the child nodes
        //delegating to this object, we want to check if the current node is an operator
        //or an operand before specifying the number of children it may have and
        //initializing its children array.
        if (this.operator) {
            this.numberOfChildren = getNumberOfOperands(this.operator);
            this.children = [];
        }
    },
    addChild: function _addChild(child) {
        if (this.children && this.children.length < this.numberOfChildren)
            this.children.push(child);
    },
    evaluate: function _evaluate() {
        if (this.children && this.children.length) {
            var childEval = [],
                idx = 0;

            while (idx < this.children.length) {
                childEval.push(this.children[idx].evaluate);
                return comparator(childEval[0], childEval[1], this.operator);
            }
        }
        else {
            //TODO: need to update this; cannot count on node being a leaf; also need to pass
            //TODO: any context or 'hard' values rather than just blindly passing field1, field2
            return comparator(this.field1, this.field2);
        }
    },
    get context1() {
        return this._context1;
    },
    set context1(val) {
        this._context1 = val;
    },
    get context2() {
        return this._context2;
    },
    set context2(val) {
        this._context2 = val;
    }
};

var childNode = Object.create(rootNode, {
    createChildNode: function _createChildNode(config) {
        this.createRootNode(config);

        if (!config.operator) {
            this.field1 = config.field1 || null;
            this.field2 = config.field2 || null;
            this.value1 = config.value1 || null;
            this.value2 = config.value2 || null;
            this.requiresContext = this.field1 || this.field2 ? true : false;
        }
    }
});

Object.defineProperties(rootNode, {
    'evaluate': {
        value: function _evaluate() {

        },
        writable: false,
        configurable: false
    },
    'val': {

    },
    'base': {

    },
    'operator': {

    }
});

var expression = {
    init: function _init(config) {
        this.field1 = config.field1 || null;
        this.field2 = config.field2 || null;
        this.value1 = config.value1 || null;
        this.value2 = config.value2 || null;
        this.operation = config.operation;
    }
};

Object.defineProperties(expression, {
    'evaluate': {
        value: function _evaluate() {

        },
        writable: false,
        configurable: false
    },
    'val': {

    },
    'base': {

    },
    'operator': {

    }
});

var preEvalNode = {
    init: function _init(nodeType, value) {
        this.type = nodeType;
        this.value = value;

        if (this.type === 'operator') {
            this.children = [];
            this.numOperands = getNumberOfOperands(value);
        }

        return this;
    },
    addChild: function _addChild(childNode) {
        if (preEvalNode.isPrototypeOf(childNode) && this.numOperands < this.children.length)
            this.children.push(childNode);
        return this;
    },
    evaluate: function _evaluate() {
        if (this.type === 'operand')
            return this.value;
        else {
            return comparator(this.children[0], this.children[1], this.value);
        }
    }
};

var expressionParser = {
    init: function _init(expression, evalType) {
        this.expression = expression;
        this.stack = Object.create(stack).init();
        this.evalType = evalType;
        this.queue = [];
    },
    parse: function _parse() {
        var re = /(AND|OR|NOT|XOR|\)|\()/,  ///(&&|\|\||!|^|\)|\(|<|>|<=|>=|==|===|!=|!==)/;
            nodes = this.expression.split(re),
            operators = ['AND', 'OR', 'NOT', 'XOR'],
            groupings = ['(', ')'],
            opIdx = 0, grpIdx = 0,
            curOp, teIdx;

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] === '' || nodes[i] === ' ')
                continue;
            var token = nodes[i].trim();
            if (opIdx = operators.indexOf(token) > -1) {
                //TODO: compare operators precedence and associativity to top of stack
                curOp = Object.create(operator).createNewOperator(operators[opIdx]);
                while (this.stack.length()) {
                    var stacktop = this.stack.peek();
                    if ((stacktop.type === 'operator' && curOp.associtivity === 'R-T-L' && curOp.precedence <= stacktop.precedence)
                        || (curOp.associtivity === 'L-T-R' && curOp.precedence < stacktop.precedence))
                        this.queue.push(this.stack.pop());
                    else
                        break;
                }
                this.stack.push(curOp);
            }
            else if (grpIdx = groupings.indexOf(token) > -1) {
                if (grpIdx === 0)
                    this.stack.push(Object.create(operator).createNewOperator('('));
                else {
                    while (this.stack.peek().value !== '(') {
                        this.queue.push(this.stack.pop());
                    }
                    this.stack.pop();   //pop off the actual '(' item but don't push it into the queue
                }
            }
            else {  //if the token is not an operator and it's not a grouper, then it is an expression
                if (this.evalType === 'post-evaluation') {

                }
                else {
                    this.queue.push(evaluateExpression(token));
                }
            }

        }

        while (this.stack.length()) {
            this.queue.push(this.stack.pop());
        }
    }
};

var expressionParser2 = {
    init: function _init(expression, evalType) {
        this.expression = expression;
        this.stack = Object.create(stack).init();
        this.evalType = evalType;
        this.queue = [];
    },
    parse: function _parse() {
        var re = /(&&|\|\||^|\)|\()/,
            re2 = /(<|>|<=|>=|==|===|!=|!==)/,
            nodes = this.expression.split(re),
            operators = ['&&', '||', '!', '^'],
            groupings = ['(', ')'],
            opIdx = 0, grpIdx = 0,
            curOp, teIdx;

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] === '' || nodes[i] === ' ')
                continue;
            var token = nodes[i].trim();
            if (opIdx = operators.indexOf(token) > -1) {
                //TODO: compare operators precedence and associativity to top of stack
                curOp = Object.create(operator).createNewOperator(operators[opIdx]);
                while (this.stack.length()) {
                    var stacktop = this.stack.peek();
                    if ((stacktop.type === 'operator' && curOp.associtivity === 'R-T-L' && curOp.precedence <= stacktop.precedence)
                        || (curOp.associtivity === 'L-T-R' && curOp.precedence < stacktop.precedence))
                        this.queue.push(this.stack.pop());
                    else
                        break;
                }
                this.stack.push(curOp);
            }
            else if (grpIdx = groupings.indexOf(token) > -1) {
                if (grpIdx === 0)
                    this.stack.push(Object.create(operator).createNewOperator('('));
                else {
                    while (this.stack.peek().value !== '(') {
                        this.queue.push(this.stack.pop());
                    }
                    this.stack.pop();   //pop off the actual '(' item but don't push it into the queue
                }
            }
            else {  //if the token is not an operator and it's not a grouper, then it is an expression
                if (this.evalType === 'post-evaluation') {

                }
                else {
                    this.queue.push(evaluateExpression(token));
                }
            }

        }

        while (this.stack.length()) {
            this.queue.push(this.stack.pop());
        }
    }
};

function buildTreeNode(expression) {
    var re = /(<(?!=)|>(?!=)|<=|>=|==(?!=)|===|!=(?!=)|!==|!(?!==))/,
        tokens = expression.split(re),
        binaryOperators = ['<', '>', '<=', '>=', '==', '===', '!=', '!=='],
        unaryOperators = ['!'],
        token, val,
        operator, isFirstOperandSet = false,
        expressionObj = {
            operator: null,
            leftOperand: null,
            rightOperand: null,
            isLeftNegated: false,
            isRightNegated: false
        };

    for (var i = 0; i < tokens.length; i++) {
        token = tokens[i].trim();
        if (token === '')
            continue;

        if (~binaryOperators.indexOf(token)) {
            expressionObj.operator = token;
        }
        else if (~unaryOperators.indexOf(token)) {
            if (!isFirstOperandSet)
                expressionObj.isLeftNegated = true;
            else
                expressionObj.isRightNegated = true;
        }
        else {
            val = [window].concat(token.split('.')).reduce(function findValueFromGlobal(prev, curr) {
                return typeof prev === 'function' ? prev()[curr] : prev[curr];
            });

            if (typeof val !== 'function')
                val = val();
            else
                val = val;

            if (!isFirstOperandSet) {
                expressionObj.leftOperand = val;
                isFirstOperandSet = true;
            }
            else
                expressionObj.rightOperand = val;
        }
    }
}

function evaluateExpression(expression) {
    var re = /(<(?!=)|>(?!=)|<=|>=|==(?!=)|===|!=(?!=)|!==|!(?!==))/,
        tokens = expression.split(re),
        binaryOperators = ['<', '>', '<=', '>=', '==', '===', '!=', '!=='],
        unaryOperators = ['!'],
        token, val,
        operator, isFirstOperandSet = false,
        expressionObj = {
            operator: null,
            leftOperand: null,
            rightOperand: null,
            isLeftNegated: false,
            isRightNegated: false
        };

    for (var i = 0; i < tokens.length; i++) {
        token = tokens[i].trim();
        if (token === '')
            continue;

        if (~binaryOperators.indexOf(token)) {
            expressionObj.operator = token;
        }
        else if (~unaryOperators.indexOf(token)) {
            if (!isFirstOperandSet)
                expressionObj.isLeftNegated = true;
            else
                expressionObj.isRightNegated = true;
        }
        else {
            val = [window].concat(token.split('.')).reduce(function findValueFromGlobal(prev, curr) {
                return typeof prev === 'function' ? prev()[curr] : prev[curr];
            });

            if (typeof val !== 'function')
                val = val();
            else
                val = val;

            if (!isFirstOperandSet) {
                expressionObj.leftOperand = val;
                isFirstOperandSet = true;
            }
            else
                expressionObj.rightOperand = val;
        }
    }

    return comparator(tokens[0], tokens[1], (tokens[2] || ''));
}

var expressionEvaluator = {
    parseExpression: function _parseExpression(expression, evalType) {
        this.expression = expression;
        this.evalType = evalType || 'post-evaluation';
        this.expressionParser = Object.create(expressionParser).init(expression, evalType);
    }
};

var operatorStack = Object.create(stack).init();

var queue = [];
*/


var expressionParser = (function _expressionParser() {
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
        this.rootNode.addChildren(this.queue);
    };
    booleanExpressionTree.filterCollection = function _filterCollection(collection) {
        return collection.filter(function collectionMap(curr) {
            this.context = curr;
            console.log(this.rootNode.evaluate);
            return this.rootNode.evaluate(curr);
        });
    };
    booleanExpressionTree.internalGetContext = function _internalGetContext() {
        return this.context;
    };
    booleanExpressionTree.getContext = function _getContext() {
        return this.internalGetContext.bind(this);
    };

    var conjunct = {
        createConjunct: function _createConjunct(conjunction) {
            this.operator = conjunction;
            this.numberOfOperands = getNumberOfOperands(this.operator);

            var operatorCharacteristics = getOperatorPrecedence(this.operator);

            this.precedence = operatorCharacteristics.precedence;
            this.associativity = operatorCharacteristics.associativity;
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
                this.context = null;
            }
            this.value = null;
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
        console.log('made it here');
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
            this.value = comparator(this.getContext()[this.field], this.standard, this.operation);
            return this.value;
        }
    };

    astNode.getValue = function _getValue() {
        if (this.value == null)
            this.value = this.evaluate();
        return this.value;
    };

    function createFilterTreeFromFilterObject(filterObject) {
        var ret = Object.create(booleanExpressionTree);
        ret.init();
        var operandStack = Object.create(stack);
        operandStack.init();
        var queue = [],
            topOfStack;

        iterateFilterGroup(filterObject, operandStack, queue, ret.getContext);

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

    function iterateFilterGroup(filterObject, stack, queue, contextGetter) {
        var conjunction = filterObject.conjunct,
            idx = 0,
            topOfStack,
            currConjunction = Object.create(conjunct);
        currConjunction.createConjunct(conjunction);
        var face = Object.create(astNode);
        face.createNode(conjunction);

        while (idx < filterObject.filterGroup.length) {
            if (idx > 0 || filterObject.filterGroup.length === 1)
                pushConjunctionOntoStack(face, stack, queue);
            if (filterObject.filterGroup[idx].conjunct) {
                //var paren = Object.create(conjunct);
                //paren.createConjunct('(');
                var parens = Object.create(astNode);
                parens.createNode('(');
                stack.push(parens);
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
                //queue.push(filterObject.filterGroup[idx]);
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

    function comparator(val, base, type) {
        switch (type) {
            case '==':
                return val == base;
            case '===':
                return val === base;
            case '<=':
                return val <= base;
            case '>=':
                return val >= base;
            case '!':
                return !val;
            case '':
                return !!val;
            case '!=':
                return val != base;
            case '!==':
                return val !== base;
            case '>':
                return val > base;
            case '<':
                return val < base;
            case 'eq':
                return val === base;
            case 'neq':
                return val !== base;
            case 'gte':
                return val >= base;
            case 'gt':
                return val > base;
            case 'lte':
                return val <= base;
            case 'lt':
                return val < base;
            case 'not':
                return !!val;
            case 'ct':
                return !!~val.toLowerCase().indexOf(base.toLowerCase());
            case 'nct':
                return !~val.toLowerCase().indexOf(base.toLowerCase());
        }
    }

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

    return {
        createFilterTreeFromFilterObject: createFilterTreeFromFilterObject
    };
})();