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
                this.stack.push(Object.create(operator).createNewOperator('(');
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

var contextParser = {
    init: function _init(expression, truthStatements) {
        this.expression = expression;
        this.stack = Object.create(stack).init();
        this.truthStatements = truthStatements;
        this.queue = [];
    },
    parse: function _parse() {
        var re = /(AND|OR|NOT|XOR|\)|\()/,
            nodes = this.expression.split(re),
            operators = ['AND', 'OR', 'NOT', 'XOR'],
            groupings = ['(', ')'],
            opIdx = 0, grpIdx = 0,
            curOp, teIdx;

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] === '' || nodes[i] === ' ')
                continue;

            if (opIdx = operators.indexOf(nodes[i].trim()) > -1) {
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
            else if (grpIdx = groupings.indexOf(nodes[i].trim()) > -1) {
                if (grpIdx === 0)
                    this.stack.push(Object.create(operator).createNewOperator('('));
                else {
                    while (this.stack.peek().value !== '(') {
                        this.queue.push(this.stack.pop());
                    }
                    this.stack.pop();
                }
            }
            else {
                teIdx = this.truthStatements.indexOf(nodes[i].trim());
                this.queue.push(this.truthStatements[teIdx]);
            }

        }

        while (this.stack.length()) {
            this.queue.push(this.stack.pop());
        }
    }
};

var operatorStack = Object.create(stack).init();

var queue = [];