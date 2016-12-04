function identity(item) { return item; }

function kestrel(item) {
    return function _kIdentity() {
        return item;
    }
}

var pairFirst = kestrel,
    pairSecond = kestrel(identity);

var pair = curry(function pair(first, second) {
    return function _selector(selector) {
        return selector(first)(second);
    };
});

var ifElse = curry(function ifElse(predicate, ifFunc, elseFunc, data) {
    if (predicate(data))
        return ifFunc(data);
    return elseFunc(data);
});

function wrap(data) {
    return [data];
}

function isArray(data) {
    return Array.isArray(data);
}

function not(fn) {
    return function _not(item) {
        return !fn(item);
    }
}

var or = curry(function or(a, b) {
    return a() || b();
});

var and = curry(function and(a, b) {
    return a() && b();
});

function curry(fn) {
    return function() {
        if (fn.length > arguments.length) {
            var slice = Array.prototype.slice,
                args = slice.apply(arguments);

            return function() {
                return fn.apply(null, args.concat(slice.apply(arguments)));
            }
        }
        return fn.apply(null, arguments);
    }
}

var get = curry(function(property, object) {
    return object[property];
});

var compose = curry(function compose(g, f) {
    return function(x) {
        return g(f(x));
    };
});

function length(list) {
    return list(function _list() { return 0, function _aPair(aPair) { return 1 + length(aPair(rest)); }; });
}

function first(list) {
    return list(function _list() { return "ERROR: Can't take first of an empty list", function _aPair(aPair) { return aPair(pairFirst); }; });
}

function rest(list) {
    return list(function _list() { return "ERROR: Can't take first of an empty list", function _aPair(aPair) { return aPair(pairSecond); }; });
}

function length(list) {
    return list(function _list() { return 0, function _aPair(aPair) { return 1 + length(aPair(pairSecond)); }; });
}

function print(list) {
    return list(function _list() { return "", function _aPair(aPair) { return `${aPair(pairFirst)} ${print(aPair(pairSecond))}`; }; });
}

function EMPTYLIST (whenEmpty, unlessEmpty) {
    return whenEmpty();
}

function node(x) {
    return function _y(y) {
        return function _empty(whenEmpty, unlessEmpty) {
            return unlessEmpty(pair(x)(y));
        };
    };
}