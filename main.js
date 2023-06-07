import { v4 as uuidv4 } from "uuid";

let documentData;
async function fetchJson() {
  const res = await fetch("./sample_document.json");
  const json = await res.json();
  documentData = json;
  renderContent(json);
}

function renderContent(data) {
  data.content.map((turn, idx) => {
    const lineNumber = document.createElement("p");
    lineNumber.className = "line-number";
    lineNumber.textContent = idx + 1;

    const speakerName = document.createElement("p");
    speakerName.className = "speaker-name block";
    speakerName.setAttribute("data-block-id", uuidv4());
    if (turn.name !== "none") {
      speakerName.textContent = turn.name;
    }

    const utterance = document.createElement("p");
    utterance.className = "utterance block";
    utterance.contentEditable = true;
    utterance.setAttribute("data-block-id", uuidv4());

    turn.content.map((element) => {
      const span = document.createElement("span");
      if (element.style) span.className = element.style;
      span.textContent = element.text;
      utterance.appendChild(span);
    });

    const lineData = document.createElement("div");
    lineData.className = "line-data";
    lineData.appendChild(lineNumber);
    lineData.appendChild(speakerName);
    contentFieldLeft.appendChild(lineData);

    const lineContent = document.createElement("div");
    lineContent.className = "line-content";
    lineContent.appendChild(utterance);
    contentFieldRight.appendChild(lineContent);
  });
}

const contentFieldLeft = document.getElementById("content-left");
const contentFieldRight = document.getElementById("content-right");
const wrapper = document.getElementById("wrapper");
wrapper.addEventListener("click", handleClick);
wrapper.addEventListener("keydown", handleKeyDown);

fetchJson();

function handleClick(e) {
  // const selObj = window.getSelection();
  // const range = selObj.getRangeAt(0);
  // console.log(selObj);
  // console.log(range);
  // console.log(recurFindParent(selObj.anchorNode));
  return;
}

function handleKeyDown(e) {
  return;
}

function recurFindParent(node) {
  const parent = node.parentElement;
  if (parent.classList.contains("block")) {
    return parent;
  } else {
    return recurFindParent(parent);
  }
}

function underline(selection) {
  const range = selection.getRangeAt(0);
  const startElement = range.startContainer.parentElement;
  const endElement = range.endContainer.parentElement;
  const ancestorElement = range.commonAncestorContainer.parentElement;

  const shouldRemove = startElement.classList.contains("underlined");

  if (ancestorElement.nodeName === "SPAN") {
    // A. selection is in a single SPAN tag
    const beforeText = startElement.textContent.slice(0, range.startOffset);
    const newText = range.toString();
    const afterText = startElement.textContent.slice(range.endOffset);

    const newElement = document.createElement("span");
    newElement.className = startElement.className;
    if (shouldRemove) {
      newElement.classList.remove("underlined");
    } else {
      newElement.classList.add("underlined");
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
    let walker = startElement.nextElementSibling;
    while (walker != endElement) {
      middleElements.push(walker);
      walker = walker.nextElementSibling;
    }

    if (beforeText) {
      const beforeElement = document.createElement("span");
      beforeElement.className = startElement.className;
      beforeElement.textContent = beforeText;
      startElement.insertAdjacentElement("beforeBegin", beforeElement);
      startElement.textContent = startElement.textContent.slice(range.startOffset);
    }

    for (const element of middleElements) {
      if (shouldRemove) {
        element.classList.remove("underlined");
      } else {
        element.classList.add("underlined");
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
      startElement.classList.remove("underlined");
      endElement.classList.remove("underlined");
    } else {
      startElement.classList.add("underlined");
      endElement.classList.add("underlined");
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
      console.log(element);
      if (lastElement && lastElement.className == element.className) {
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
      lastElement = element;
      newRefs.push(element);
    }
    const endRefIndex = newRefs.length - 1 - endRefIndexFromEnd;
    const newEndOffset = newRefs[endRefIndex].textContent.length - newEndOffsetFromEnd;

    // Update range for selection
    const newRange = document.createRange();
    newRange.setStart(newRefs[startRefIndex].firstChild, newStartOffset);
    newRange.setEnd(newRefs[endRefIndex].firstChild, newEndOffset);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

document.getElementById("underline").addEventListener("click", () => {
  const selection = window.getSelection();
  underline(selection);
});

document.getElementById("check-selection").addEventListener("click", () => {
  const selection = window.getSelection();
  console.log(selection);
  console.log(selection.getRangeAt(0));
});
