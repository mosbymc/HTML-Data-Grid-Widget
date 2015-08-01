/*
The MIT License (MIT) 
Copyright © 2014
Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the “Software”), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, merge, 
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var dominator = (function dominator() {
    function findChitlensByTagName(parent, tagArray, elemArray) {
        var index = 0,
            found = false,
            elems = elemArray || [];
        while (index < parent.children.length) {
            found = false;
            for (var i = 0; i < tagArray.length; i++) {
                if (parent.children[index].tagName.toLowerCase() === tagArray[i]) {
                    elems.push(parent.children[index]);
                    found = true;
                    break;
                }
            }
            if (!found && parent.children[index].children.length > 0) {
                findChitlensByTagName(parent.children[index], tagArray, elems);
            }
            index++;
        }
        return elems;
    }

    function getParentByClassName(input, className) {
        var parent = input.parentNode;
        while (parent !== document) {
            if (parent.className.indexOf(className) !== -1) return parent;
            else parent = parent.parentNode;
        }
        return input;
    }

    function findChitlensByClassName(parent, className, elemArray) {
        var index = 0,
            found = false,
            elems = elemArray || [];
        while (index < parent.children.length) {
            found = false;0
            if (parent.children[index].className.indexOf(className) !== -1) {
                elems.push(parent.children[index]);
                found = true;
                break;
            }
            if (!found && parent.children[index].children.length > 0) {
                findChitlensByTagName(parent.children[index], className, elems);
            }
            index++;
        }
        return elems;
    }

    function findChildren(parent, descriptors) {
        var elements = findChitlens(parent, descriptors);
        if (elements.length === 1) {
            var element = elements[0];
            element.each = function(callback) {
                for (var i = 0, length = element.length; i < length; i++) {
                    callback(i, element[i]);
                }
            };
            return element;
        }
        else {
            elements.each = function(callback) {
                for (var i = 0, length = elements.length; i < length; i++) {
                    callback(i, elements[i]);
                }
            };
            return elements;
        }
    }

    function findChitlens(parent, descriptors, elemArray) {
        var index = 0,
            found = false,
            elems = elemArray || [];
            while (index < parent.children.length) {
                found = false;
                var child = parent.children[index];
                for (var i = 0; i < descriptors.length; i++) {
                    if (child.tagName.toLowerCase() === descriptors[i] || child.className.indexOf(descriptors[i]) !== -1 || child.dataset[descriptors[i]]) {
                        elems.push(child);
                        found = true;
                        break;
                    }
                    if (!found && child.children.length > 0) {
                        findChitlens(child, descriptors, elems);
                    }
                }
                index++;
            }
        if (!elems.each) {
            elems.each = function(callback) {
                for (var i = 0, length = elems.length; i < length; i++) {
                    callback(i, elems[i]);
                }
            };
        }
        return elems;
    }

    function findSiblingByClassName(element, dir, className) {
        var sibling;
        switch(dir) {
            case "prev":
                sibling = element.previousElementSibling;
                break;
            case "next":
                sibling = element.nextElementSibling;
        }

        if (sibling) {
            if (sibling.className.indexOf(className) !== -1) {
                return sibling;
            }
            else {
                findSiblingByClassName(sibling, dir, className);
            }
        }
        else return null;
    }
    return {
        findChildren: findChildren,
        getParentByClassName: getParentByClassName
    };
})();
