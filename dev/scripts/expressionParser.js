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
- Post-increment: x++
- Pre-increment: ++x
- Post-decrement: x--
- Pre-decrement: --x
- Addition: +
- Subtraction/Negation: -
- Multiplication: *
- Division: /
- Bitwise not: ~
- Logical not: !
- Modulus: %
- Exponentiation: **
- In: in
- Instance of: instanceOf
- Less than: <
- Less than or equal to: <=
- Greater than: >
- Greater than or equal to: >=
- Loose equality: ==
- Strict equality: ===
- Loose inequality: !=
- Strict inequality: !==
- Bitwise XOR: ^
- Logical AND: &&
- Logical OR: ||
- Ternary: ?
- In-place multiplication: *=
- In-place division: /=
- In-place addition: +=
- In-place subtraction: -=
- In-place modulus: %=

 */

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
        default:
            return 2;
    }
}

var operator = {
    createNewOperator: function _createNewOperator(token) {
        switch (token) {
            case '!':
            case 'NOT':
                this.precedence = 1;
                this.associtivity = 'LTR';
                this.value = '!';
                this.type = 'operator';
                this.operands = 1;
                break;
            case 'AND':
            case '&&':
                this.precedence = 2;
                this.associtivity = 'RTL';
                this.value = '&&';
                this.type = 'operator';
                this.operands = 2;
                break;
            case 'XOR':
            case '^':
                this.precedence = 3;
                this.associtivity = 'RTL';
                this.value = '^';
                this.type = 'operator';
                this.operands = 2;
                break;
            case 'OR':
            case '||':
                this.precedence = 4;
                this.associtivity = 'RTL';
                this.value = '||';
                this.type = 'operator';
                this.operands = 2;
                break;
            case ')':
                this.precedence = null;
                this.associtivity = null;
                this.value = ')';
                this.type = 'grouper';
                this.operands = null;
                break;
            case '(':
                this.precedence = null;
                this.associtivity = null;
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