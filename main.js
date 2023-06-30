import { v4 as uuidv4 } from "uuid";

async function fetchJson(url) {
    const res = await fetch(url);
    const json = await res.json();
    return json;
}

function loadDocument(data, container) {
    for (const paragraph of data.content) {
        const p = document.createElement("p");
        p.classList.add("block");
        p.contentEditable = true;
        p.setAttribute("data-block-id", uuidv4());

        for (const element of paragraph.content) {
            const span = document.createElement("span");
            if (element.style) {
                for (const c of element.style) {
                    span.classList.add(c);
                }
            }
            span.textContent = element.text;
            p.appendChild(span);
        }

        container.appendChild(p);
    }
}

function saveDocument(contentField) {
    let data = {
        "content": []
    }
    for (const paragraph of contentField.children) {
        const p = {
            "type": "paragraph",
            "content": []
        }
        for (const span of paragraph.children) {
            const s = {
                "style": [Array.from(span.classList)],
                "text": span.textContent
            }
            p.content.push(s);
        }
        data.content.push(p);
    }
    return data;
}

async function init() {
    let documentData = await fetchJson("./sample_document.json");
    loadDocument(documentData, contentField);
}

function recurFindParent(node) {
    /*
    Recursively finds the first "block" element in a node's parent tree.
    */
    const parent = node.parentElement;
    if (!parent) {
        return null;
    } else if (parent.classList.contains("block")) {
        return parent;
    } else {
        return recurFindParent(parent);
    }
}

function handleStyle(selection, styleClass) {
    const range = selection.getRangeAt(0);
    const startElement = range.startContainer.parentElement;
    const endElement = range.endContainer.parentElement;
    const ancestorElement = range.commonAncestorContainer.parentElement;

    const shouldRemove = startElement.classList.contains(styleClass);

    if (ancestorElement.nodeName === "SPAN") {
        // A. selection is in a single SPAN tag
        const beforeText = startElement.textContent.slice(0, range.startOffset);
        const newText = range.toString();
        const afterText = startElement.textContent.slice(range.endOffset);

        const newElement = document.createElement("span");
        newElement.className = startElement.className;
        if (shouldRemove) {
            newElement.classList.remove(styleClass);
        } else {
            newElement.classList.add(styleClass);
        }
        newElement.textContent = newText;

        if (beforeText) {
            startElement.textContent = beforeText;
            startElement.insertAdjacentElement("afterend", newElement);
        } else {
            startElement.replaceWith(newElement);
        }

        if (afterText) {
            const afterElement = document.createElement("span");
            afterElement.className = startElement.className;
            afterElement.textContent = afterText;
            newElement.insertAdjacentElement("afterend", afterElement);
        }

        // Concatenate surrounding elements with identical classes
        const prevElement = newElement.previousElementSibling;
        const nextElement = newElement.nextElementSibling;
        let newStartOffset = 0;
        let newEndOffset = newElement.textContent.length;

        if (prevElement && prevElement.className === newElement.className) {
            newElement.textContent =
                prevElement.textContent + newElement.textContent;
            prevElement.remove();
            newStartOffset = prevElement.textContent.length;
            newEndOffset += newStartOffset;
        }
        if (nextElement && nextElement.className === newElement.className) {
            newElement.textContent =
                newElement.textContent + nextElement.textContent;
            nextElement.remove();
        }

        // Update range for selection
        const newRange = document.createRange();
        newRange.setStart(newElement.firstChild, newStartOffset);
        newRange.setEnd(newElement.firstChild, newEndOffset);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else if (ancestorElement.nodeName === "DIV") {
        // B. selection spans across MULTIPLE SPANs
        const beforeText = startElement.textContent.slice(0, range.startOffset);
        const afterText = endElement.textContent.slice(range.endOffset);

        const middleElements = [];

        let walker;
        if (startElement.nextElementSibling) {
            walker = startElement.nextElementSibling;
        } else {
            walker =
                startElement.parentElement.nextElementSibling.firstElementChild;
        }

        while (walker != endElement) {
            middleElements.push(walker);
            if (walker.nextElementSibling) {
                walker = walker.nextElementSibling;
            } else {
                walker =
                    walker.parentElement.nextElementSibling.firstElementChild;
            }
        }

        if (beforeText) {
            const beforeElement = document.createElement("span");
            beforeElement.className = startElement.className;
            beforeElement.textContent = beforeText;
            startElement.insertAdjacentElement("beforeBegin", beforeElement);
            startElement.textContent = startElement.textContent.slice(
                range.startOffset
            );
        }

        for (const element of middleElements) {
            if (shouldRemove) {
                element.classList.remove(styleClass);
            } else {
                element.classList.add(styleClass);
            }
        }

        if (afterText) {
            const afterElement = document.createElement("span");
            afterElement.className = endElement.className;
            afterElement.textContent = afterText;
            endElement.insertAdjacentElement("afterEnd", afterElement);
            endElement.textContent = endElement.textContent.slice(
                0,
                range.endOffset
            );
        }

        if (shouldRemove) {
            startElement.classList.remove(styleClass);
            endElement.classList.remove(styleClass);
        } else {
            startElement.classList.add(styleClass);
            endElement.classList.add(styleClass);
        }

        // Concatenate elements with identical classes
        const prevElement = startElement.previousElementSibling;
        const nextElement = endElement.nextElementSibling;
        let newStartOffset = 0;
        let newEndOffsetFromEnd = 0;
        let startRefIndex = 0;
        let endRefIndexFromEnd = 0;

        const concatRefs = [];
        const newRefs = []; // for selection range
        if (prevElement) {
            concatRefs.push(prevElement);
            startRefIndex = 1;
        }
        concatRefs.push(startElement, ...middleElements, endElement);
        if (nextElement) {
            concatRefs.push(nextElement);
            endRefIndexFromEnd = 1;
        }

        let lastElement = null;
        for (const element of concatRefs) {
            if (lastElement && lastElement.className == element.className) {
                if (lastElement.parentElement == element.parentElement) {
                    if (element == startElement) {
                        newStartOffset = lastElement.textContent.length;
                        startRefIndex = 0;
                    }
                    if (element == nextElement) {
                        newEndOffsetFromEnd = element.textContent.length;
                        endRefIndexFromEnd = 0;
                    }
                    element.textContent =
                        lastElement.textContent + element.textContent;
                    lastElement.remove();
                    newRefs.pop();
                }
            }
            lastElement = element;
            newRefs.push(element);
        }
        const endRefIndex = newRefs.length - 1 - endRefIndexFromEnd;
        const newEndOffset =
            newRefs[endRefIndex].textContent.length - newEndOffsetFromEnd;

        // Update range for selection
        const newRange = document.createRange();
        newRange.setStart(newRefs[startRefIndex].firstChild, newStartOffset);
        newRange.setEnd(newRefs[endRefIndex].firstChild, newEndOffset);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}

function handleEnter(e) {
    const selection = document.getSelection();
    const range = selection.getRangeAt(0);
    const parent = recurFindParent(range.startContainer);

    // Check if empty paragraph
    if (range.startContainer.tagName && range.startContainer.tagName == "P") {
        const p = document.createElement("p");
        p.classList.add("block");
        p.contentEditable = true;
        p.setAttribute("data-block-id", uuidv4());

        const span = document.createElement("span");
        const t = document.createTextNode("\u200D");
        span.appendChild(t);
        p.appendChild(span);

        range.startContainer.insertAdjacentElement("afterend", p);
        range.setStartBefore(p.firstElementChild);
        range.setEndBefore(p.firstElementChild);
        return;
    }
    if (parent.classList.contains("block")) {
        if (range.collapsed) {
            const startElement = range.startContainer.parentElement;
            const beforeText = startElement.textContent.slice(
                0,
                range.startOffset
                );
            const afterText = startElement.textContent.slice(range.endOffset);
                
            const afterElements = [];
            if (startElement.nextElementSibling) {
                let walker = startElement.nextElementSibling;
                while (walker != parent.lastElementChild) {
                    afterElements.push(walker);
                    if (walker.nextElementSibling) {
                        walker = walker.nextElementSibling;
                    }
                }
                afterElements.push(parent.lastElementChild);
            }

            if (afterText) {
                startElement.textContent = beforeText;
            }

            const p = document.createElement("p");
            p.classList.add("block");
            p.contentEditable = true;
            p.setAttribute("data-block-id", uuidv4());

            if (afterText) {
                const span = document.createElement("span");
                span.className = startElement.className;
                span.textContent = afterText;
                p.appendChild(span);
            }
            for (const span of afterElements) {
                p.appendChild(span);
            }
            if (afterElements.length < 1) {
                const span = document.createElement("span");
                span.className = startElement.className;
                const t = document.createTextNode("\u200D");
                span.appendChild(t);
                p.appendChild(span);
            }

            parent.insertAdjacentElement("afterend", p);
            range.setStartBefore(p.firstElementChild);
            range.setEndBefore(p.firstElementChild);
        }
    }
}

const contentField = document.getElementById("content");

document.getElementById("style-bold").addEventListener("click", () => {
    const selection = window.getSelection();
    handleStyle(selection, "bold");
});

document.getElementById("style-italic").addEventListener("click", () => {
    const selection = window.getSelection();
    handleStyle(selection, "italic");
});

document.getElementById("style-underline").addEventListener("click", () => {
    const selection = window.getSelection();
    handleStyle(selection, "underlined");
});

document.getElementById("check-selection").addEventListener("click", () => {
    const selection = window.getSelection();
    console.log(selection);
    console.log(selection.getRangeAt(0));
});

contentField.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "Enter":
            e.stopPropagation();
            e.preventDefault();
            handleEnter(e);
            break;
        default:
            return;
    }
});

init();
