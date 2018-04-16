var _dominator = {
    elements: [],
    /**
     * @description Accepts a selector string and returns any nodes that are found within the existing dominator
     * instance's elements
     * @param {string} sel - A selector string
     * @return {_dominator} Returns a dominator object instance holding all found children
     */
    find: function _find(sel) {
        var results = [];
        this.elements.forEach(function _findChildOfElem(el) {
            for (var e of el.querySelectorAll(sel))
                results.push(e);
        });
        return dominator(results);
    },
    /**
     * @description Accepts a selector string, an HTMLElement object, or an array of either as well
     * as an optional HTML context and append each child element to each element of the current dominator
     * instance. If the child(ren) are found at any level below one of the parents, it will be removed from
     * the DOM and reinserted at the new position.
     * @param {string|HTMLElement|Array} child - A selector string, HTMLElement object, or an array of either
     * @param {HTMLElement} context - A context within which the children can be found
     * @return {_dominator} Return the current dominator instance
     */
    append: function _append(child, context) {
        if (!_dominator.isPrototypeOf(child)) child = dominator(child, context);

        this.elements.forEach(function _appendEachChild(el, idx) {
            child.elements.forEach(function _appendEachChildNested(ch) {
                if (dominator(el).contains(ch)) ch.parentNode.removeChild(ch);
                let c = 0 === idx ? ch : ch.cloneNode(true);
                el.appendChild(c);
            });
        });

        return this;
    },
    /**
     * @description d
     * @param {string|HTMLElement|Array} appendage
     * @param context
     * @return {_dominator}
     */
    appendTo: function _appendTo(appendage, context) {
        if (!_dominator.isPrototypeOf(appendage)) appendage = dominator(appendage, context);

        this.elements.forEach(function _appendEachElement(el) {
            appendage.elements.forEach(function _appendEachElementNested(app, idx) {
                if (dominator(app).contains(el)) el.parentNode.removeChild(el);
                let e = 0 === idx ? el : el.cloneNode(true);
                app.appendChild(e);
            })
        });

        return this;
    },
    prepend: function _prepend(prep, context) {
        if (!_dominator.isPrototypeOf(prep)) prep = dominator(prep, context);

        this.elements.forEach(function _insertEachElementAfter(el) {
            prep.elements.forEach(function _insertEachElementAfterNested(pr, idx) {
                if (dominator(el).contains(pr)) pr.parentNode.removeChild(pr);
                let p = 0 === idx ? pr : pr.cloneNode(true);
                el.prepend(p);
            });
        });

        return this;
    },
    prependTo: function _prependTo(prep, context) {
        if (!_dominator.isPrototypeOf(prep)) prep = dominator(prep, context);

        this.elements.forEach(function _prependEachElementTo(el) {
            prep.elements.forEach(function _insertEachElementToNested(pr, idx) {
                if (dominator(pr).contains(el)) el.parentNode.removeChild(el);
                let e = 0 === idx ? el : el.cloneNode(true);
                p.prepend(e);
            });
        });

        return this;
    },
    before: function _before(before, context) {
        if (!_dominator.isPrototypeOf(before)) before = dominator(before, context);
        this.elements.forEach(function _insertEachElementBefore(el) {
            before.elements.forEach(function _insertEachElementBeforeNested(be, idx) {
                if (dominator(el.parentNode).contains(be)) el.parentNode.removeChild(be);
                let b = 0 === idx ? be : be.cloneNode(true);
                document.body.insertBefore(b, el);
            });
        });

        return this;
    },
    insertBefore: function _insertBefore(before, context) {
        if (!_dominator.isPrototypeOf(before)) before = dominator(before, context);

        this.elements.forEach(function _insertEachElementBefore(el) {
            before.elements.forEach(function _insertEachNodeBeforeNested(be, idx) {
                if (dominator(be.parentNode).contains(el)) be.parentNode.removeChild(el);
                let e = 0 === idx ? el : el.cloneNode(true);
                document.body.insertBefore(e, be);
            });
        });

        return this;
    },
    after: function _after(after, context) {
        if (!_dominator.isPrototypeOf(after)) after = dominator(after, context);

        this.elements.forEach(function _insertEachElementAfter(el) {
            after.elements.forEach(function _insertEachElementAfterNested(af, idx) {
                if (dominator(el).contains(af)) af.parentNode.removeChild(af);
                let a = 0 === idx ? af : af.cloneNode(true);
                el.parentNode.insertBefore(a, el.nextSibling);
            });
        });

        return this;
    },
    insertAfter: function insertAfter(after, context) {
        if (!_dominator.isPrototypeOf(after)) after = dominator(after, context);

        this.elements.forEach(function _insertEachElementAfter(el) {
            after.elements.forEach(function _insertEachElementAfterNested(af, idx) {
                if (dominator(af).contains(el)) af.parentNode.removeChild(el);
                let e = 0 === idx ? el : el.cloneNode(true);
                af.parentNode.insertBefore(e, af.nextSibling);
            });
        });

        return this;
    },
    remove: function _remove(remove) {
        if (!_dominator.isPrototypeOf(remove)) remove = dominator(remove, this.context);

        if (remove.elements.length) {
            this.elements.forEach(function _removeElements(element) {
                remove.elements.forEach(function _removeElementsNested(rm) {
                    if (dominator(element).contains(rm)) rm.parentNode.removeChild(rm);
                });
            });
        }

        return this;
    },
    attribute: function _attribute(name, value) {
        if ('undefined' === typeof name) {
            let res = [];
            this.elements.forEach(function _getElementAttributes(element) {
                for (let key of Array.from(element.attributes).filter(attr => !(attr.name.replace('data-', '') in element.dataset))) {
                    res.push({ name: key.name, value: key.value });
                }
            });
            return res;
        }
        if ('undefined' === typeof value) return Array.prototype.concat.apply([], this.elements.map(el => el.getAttribute(name)));
        this.elements.forEach(el => el.setAttribute(name, value));
        return this;
    },
    data: function _data(name, value) {
        if ('undefined' === typeof name) {
            let res = [];
            this.elements.forEach(function _getElementDataset(element) {
                for (let key in element.dataset) res.push({ name: key, value: element.dataset[key] });
            });
            return res;
        }
        if ('undefined' === typeof value) {
            return Array.prototype.concat.apply([], this.elements.map(element => element.dataset[name]));
        }
        this.elements.forEach(element => element.dataset[name] = value);
        return this;
    },
    addClass: function _addClass(className) {
        this.elements.forEach(el => el.classList.add(className));
        return this;
    },
    removeClass: function _removeClass(className) {
        this.elements.forEach(el => el.classList.remove(className));
        return this;
    },
    hasClass: function _hasClass(className) {
        return this.elements.some(el => Array.from(el.classList).includes(className));
    },
    css: function _css(style, value) {
        this.elements.forEach(el => el.style[style] = value);
        return this;
    },
    on: function _on(evt, handler) {
        this.elements.forEach(function _attachEvent(el) {
            el.addEventListener(evt, handler);
        });
        return this;
    },
    one: function _one(evt, handler) {
        this.elements.forEach(function _attachSingleFireEvent(el) {
            el.addEventListener(evt, function _eventHandlerWrapper(e) {
                el.removeEventListener(evt, _eventHandlerWrapper);
                handler(e);
            });
        });
        return this;
    },
    merge: function _merge(dom) {
        if (!_dominator.isPrototypeOf(dom)) return this;
        else return dominator(this.elements.concat(dom.elements));
    },
    contains: function _contains(element) {
        element = _dominator.isPrototypeOf(element) ? element.elements[0] : element;
        var result = false;

        for (let el of this.elements) {
            result = findChildElement(el);
        }

        return result;

        function findChildElement(parent) {
            if (parent === element) return true;
            var chitlens = Array.from(parent.children || []),
                found = false;

            while (!found && chitlens.length) {
                found = findChildElement(chitlens.pop());
            }
            return found;
        }
    },
    text: function _text(text) {
        this.elements.forEach(function _AddTextToElement(elem) {
            let firstChild = elem.firstChild;
            if (3 === firstChild.nodeType) {
                firstChild.textContent = text;
            }
            else {
                let innerHtml = elem.innerHTML;
                elem.innerHTML = text + ' ' + innerHtml;
            }
        });
        return this;
    },
    forEach: function _forEach(fn) {
        this.elements.forEach(fn);
        return this;
    },
    [Symbol.iterator]: function *_dominatorIterator() {
        let i = 0;
        while (i < this.elements.length) {
            yield this.elements[i];
            ++i;
        }
    }
};

function dominator(elem, context) {
    if (_dominator.isPrototypeOf(elem)) return elem;

    context = context || document;

    if (elem && elem.constructor === Array) {
        return dominator.merge(elem.map(el => dominator(el, context)));
    }

    if ('string' === typeof elem) {
        return Object.create(_dominator, {
            elements: {
                value: Array.from(context.querySelectorAll(elem))
            },
            context: {
                value: context
            },
            inserted: {
                value: true
            }
        });
    }
    else if (elem instanceof Element) {
        return Object.create(_dominator, {
            elements: {
                value: [elem]
            },
            context: {
                value: context
            },
            inserted: {
                value: true
            }
        });
    }
    else if ('object' === typeof elem) {
        var element = document.createElement(elem.type);
        if (elem.id) element.id = id;
        if (elem.attributes) {
            elem.attributes.forEach(attr => element.setAttribute(attr.name, attr.value));
        }
        if (elem.data) {
            elem.data.forEach(d => element.dataset[d.name] = d.value);
        }
        if (elem.classes) {
            elem.classes.forEach(cl => element.classList.add(cl));
        }
        if (elem.styles) {
            elem.styles.forEach(style => element.style[style.name] = style.value);
        }
        if (elem.text) {
            elem.innerText = elem.text;
        }
        return Object.create(_dominator, {
            elements: {
                value: [element]
            },
            context: {
                value: context
            },
            inserted: {
                value: false
            }
        });
    }
}

dominator.merge = function _merge(doms) {
    return Object.create(_dominator, {
        elements: {
            value: Array.prototype.concat.apply([], doms.map(d => d.elements))
        }
    });
};

export { dominator };