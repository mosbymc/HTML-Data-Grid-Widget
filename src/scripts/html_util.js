/**
 *
 * @param element
 * @param id
 * @param attributes
 * @param classes
 * @param styles
 * @return {HTMLElement}
 */
function createElement({ element = '', id = '', attributes = [], classes = [], styles = [] }) {
    var elem = document.createElement(element);
    if (id) elem.id = id;
    attributes.forEach(attr => elem.setAttribute(attr.name, attr.value));
    classes.forEach(cl => elem.classList.add(cl));
    styles.forEach(style => elem.style[style.name] = style.value);
    return elem;
}

/**
 * @description d
 * @param {HTMLElement} toInsert
 * @param {HTMLElement | string} before
 * @return {HTMLElement} Returns the element just inserted
 */
function insertBefore(toInsert, before) {
    if ('string' === typeof before) {
        if (before.indexOf('#') === 0) {
            document.body.insertBefore(toInsert, document.getElementById(before.substr(1)));
            return toInsert;
        }
        else if (before.indexOf('.') === 0) {
            var befores = document.querySelectorAll(before);
            befores.forEach(function _insertBefore(b) {
                document.body.insertBefore(toInsert, b);
            });
            return toInsert;
        }
    }
    else {
        return document.body.insertBefore(toInsert, before);
    }
}

/**
 * @description d
 * @param {HTMLElement} toInsert
 * @param {HTMLElement | string} after
 * @return {HTMLElement} Returns the inserted element
 */
function insertAfter(toInsert, after) {
    if ('string' === typeof after) {
        if (after.indexOf('#') === 0) {
            var afterElem = document.getElementById(after.substr(1));
            afterElem.parentNode.insertBefore(toInsert, afterElem.nextSibling);
            return toInsert;
        }
        else if (after.indexOf('.') === 0) {
            var afterElems = document.querySelectorAll(after);
            afterElems.forEach(function _insertAfter(el) {
                el.parentNode.insertBefore(toInsert, el.nextSibling);
            });
            return toInsert;
        }
    }
    else {
        return after.parentNode.insertBefore(toInsert, after.nextSibling);
    }
}

/**
 * @description d
 * @param {HTMLElement} toAppend
 * @param {HTMLElement | string} to
 * @return {HTMLElement} Returns the appended element
 */
function appendTo(toAppend, to) {
    if ('string' === typeof to) {
        if (to.indexOf('#') === 0) {
            var toElem = document.getElementById(to.substr(1));
            toElem.appendChild(toAppend);
            return toAppend;
        }
        else if (to.indexOf('.') === 0) {
            var toElems = document.querySelectorAll(to);
            toElems.forEach(function _insertAfter(el) {
                el.appendChild(toAppend);
            });
            return toAppend;
        }
    }
    else {
        return to.appendChild(toAppend);
    }
}