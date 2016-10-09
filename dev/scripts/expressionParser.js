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
    var dateTimeRegex = '^(((?:(?:(?:(?:(?:(?:(?:(0?[13578]|1[02])(\\/|-|\\.)(31))\\4|(?:(0?[1,3-9]|1[0-2])(\\/|-|\\.)(29|30)\\7))|(?:(?:(?:(?:(31)(\\/|-|\\.)(0?[13578]|1[02])\\10)|(?:(29|30)(\\/|-|\\.)' +
        '(0?[1,3-9]|1[0-2])\\13)))))((?:1[6-9]|[2-9]\\d)?\\d{2})|(?:(?:(?:(0?2)(\\/|-|\\.)(29)\\17)|(?:(29)(\\/|-|\\.)(0?2))\\20)((?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
        '|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:((?:0?[1-9])|(?:1[0-2]))(\\/|-|\\.)(0?[1-9]|1\\d|2[0-8]))\\24|(0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)((?:0?[1-9])|(?:1[0-2]))\\27)' +
        '((?:1[6-9]|[2-9]\\d)?\\d{2}))))|(?:(?:((?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\\/|-|\\.)(?:(?:(?:(0?2)(?:\\31)(29))))' +
        '|((?:1[6-9]|[2-9]\\d)?\\d{2})(\\/|-|\\.)(?:(?:(?:(0?[13578]|1[02])\\35(31))|(?:(0?[1,3-9]|1[0-2])\\35(29|30)))|((?:0?[1-9])|(?:1[0-2]))\\35(0?[1-9]|1\\d|2[0-8])))))' +
        '(?: |T)((0?[1-9]|1[012])(?:(?:(:|\\.)([0-5]\\d))(?:\\44([0-5]\\d))?)?(?:(\\ [AP]M))$|([01]?\\d|2[0-3])(?:(?:(:|\\.)([0-5]\\d))(?:\\49([0-5]\\d))?)$))';

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

    /*var conjunct = {
     createConjunct: function _createConjunct(conjunction) {
     this.operator = conjunction;
     this.numberOfOperands = getNumberOfOperands(this.operator);

     var operatorCharacteristics = getOperatorPrecedence(this.operator);

     this.precedence = operatorCharacteristics.precedence;
     this.associativity = operatorCharacteristics.associativity;
     }
     };*/

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
                    curVal = getNumbersFromTime(initialVal);
                    baseVal = getNumbersFromTime(this.standard);

                    if (initialVal.indexOf('PM') > -1) curVal[0] += 12;
                    if (this.standard.indexOf('PM') > -1) baseVal[0] += 12;

                    curVal = convertTimeArrayToSeconds(curVal);
                    baseVal = convertTimeArrayToSeconds(baseVal);
                    break;
                case 'datetime':
                    var re = new RegExp(dateTimeRegex),
                        execVal1, execVal2;
                    if (re.test(initialVal) && re.test(this.standard)) {
                        execVal1 = re.exec(initialVal);
                        execVal2 = re.exec(this.standard);

                        var dateComp1 = execVal1[2],
                            dateComp2 = execVal2[2],
                            timeComp1 = execVal1[42],
                            timeComp2 = execVal2[42];

                        timeComp1 = getNumbersFromTime(timeComp1);
                        timeComp2 = getNumbersFromTime(timeComp2);
                        if (timeComp1[3] && timeComp1[3] === 'PM')
                            timeComp1[0] += 12;
                        if (timeComp2[3] && timeComp2[3] === 'PM')
                            timeComp2[0] += 12;

                        var year1 = execVal1[15] || execVal1[22] || execVal1[29] || execVal1[30] || execVal1[34],
                            month1 = execVal1[3] || execVal1[6] || execVal1[11] || execVal1[14] || execVal1[16] || execVal1[21] || execVal1[23]
                                || execVal1[28] || execVal1[32] || execVal1[36] || execVal1[38] || execVal1[40],
                            day1 = execVal1[5] || execVal1[8] || execVal1[9] || execVal1[12] || execVal1[18] || execVal1[19] || execVal1[25]
                                || execVal1[26] || execVal1[33] || execVal1[37] || execVal1[39] || execVal1[41];

                        var year2 = execVal2[15] || execVal2[22] || execVal2[29] || execVal2[30] || execVal2[34],
                            month2 = execVal2[3] || execVal2[6] || execVal2[11] || execVal2[14] || execVal2[16] || execVal2[21] || execVal2[23]
                                || execVal2[28] || execVal2[32] || execVal2[36] || execVal2[38] || execVal2[40],
                            day2 = execVal2[5] || execVal2[8] || execVal2[9] || execVal2[12] || execVal2[18] || execVal2[19] || execVal2[25]
                                || execVal2[26] || execVal2[33] || execVal2[37] || execVal2[39] || execVal2[41];

                        dateComp1 = new Date(year1, month1, day1);
                        dateComp2 = new Date(year2, month2, day2);
                    }
                    else {
                        curVal = 0;
                        baseVal = 0;
                    }
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
                    curVal = initialVal.toString();
                    baseVal = this.standard.toString();
                    break;
            }

            this._value = comparator(curVal, baseVal, this.operation);
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

    function comparator(val, base, type) {
        switch (type) {
            case 'eq':
            case '===':
                return val === base;
            case '==':
                return val == base;
            case 'neq':
            case '!==':
                return val !== base;
            case '!=':
                return val != base;
            case 'gte':
            case '>=':
                return val >= base;
            case 'gt':
            case '>':
                return val > base;
            case 'lte':
            case '<=':
                return val <= base;
            case 'lt':
            case '<':
                return val < base;
            case 'not':
            case '!':
            case 'falsey':
                return !val;
            case 'truthy':
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

    function getNumbersFromTime(val) {
        var re = /^(0?[1-9]|1[012])(?:(?:(:|\.)([0-5]\d))(?:\2([0-5]\d))?)?(?:(\ [AP]M))$|^([01]?\d|2[0-3])(?:(?:(:|\.)([0-5]\d))(?:\7([0-5]\d))?)$/;
        if (!re.test(val)) return [];
        var timeGroups = re.exec(val);
        var hours = timeGroups[1] ? +timeGroups[1] : +timeGroups[6];
        var minutes, seconds, meridiem, retVal = [];
        if (timeGroups[2]) {
            minutes = timeGroups[3] || '00';
            seconds = timeGroups[4]  || '00';
            meridiem = timeGroups[5].replace(' ', '') || null;
        }
        else if (timeGroups[6]) {
            minutes = timeGroups[8] || '00';
            seconds = timeGroups[9] || '00';
        }
        else{
            minutes = '00';
            seconds = '00';
        }
        retVal.push(hours);
        retVal.push(minutes);
        retVal.push(seconds);
        if (meridiem) retVal.push(meridiem);
        return retVal;
    }

    function convertTimeArrayToSeconds(timeArray) {
        var hourVal = parseInt(timeArray[0].toString()) === 12 || parseInt(timeArray[0].toString()) === 24 ? parseInt(timeArray[0].toString()) - 12 : parseInt(timeArray[0]);
        return 3660 * hourVal + 60 * parseInt(timeArray[1]) + parseInt(timeArray[2]);
    }

    return {
        createFilterTreeFromFilterObject: createFilterTreeFromFilterObject
    };
})();