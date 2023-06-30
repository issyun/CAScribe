import { v4 as uuidv4 } from "uuid";

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

function renderContent(data, container) {
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

    const div = document.createElement("div");
    div.classList.add("line-content");
    div.appendChild(p);
    container.appendChild(div);
  }
}

function recurFindParent(node) {
  const parent = node.parentElement;
  console.log(parent);
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
      newElement.textContent = prevElement.textContent + newElement.textContent;
      prevElement.remove();
      newStartOffset = prevElement.textContent.length;
      newEndOffset += newStartOffset;
    }
    if (nextElement && nextElement.className === newElement.className) {
      newElement.textContent = newElement.textContent + nextElement.textContent;
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
        startElement.parentElement.parentElement.nextElementSibling
          .firstElementChild.firstElementChild;
    }

    while (walker != endElement) {
      middleElements.push(walker);
      if (walker.nextElementSibling) {
        walker = walker.nextElementSibling;
      } else {
        walker =
          walker.parentElement.parentElement.nextElementSibling
            .firstElementChild.firstElementChild;
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
      endElement.textContent = endElement.textContent.slice(0, range.endOffset);
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
          element.textContent = lastElement.textContent + element.textContent;
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
}

const contentField = document.getElementById("content");
const contentWrapper = document.getElementById("content-wrapper");

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

contentWrapper.addEventListener("keydown", (e) => {
  switch (e.key) {
    case 'Enter':
      e.stopPropagation();
      e.preventDefault();
      handleEnter(e);
      break;
    default:
      return;
  }
});

let documentData = fetchJson("./sample_document.json");
documentData.then((val) => {
  renderContent(val, contentField);
});