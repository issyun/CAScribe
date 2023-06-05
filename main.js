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
    lineNumber.innerText = idx + 1;

    const speakerName = document.createElement("p");
    speakerName.className = "speaker-name block";
    speakerName.setAttribute("data-block-id", uuidv4());
    if (turn.name !== "none") {
      speakerName.innerText = turn.name;
    }

    const utterance = document.createElement("div");
    utterance.className = "utterance block";
    utterance.contentEditable = true;
    utterance.setAttribute("data-block-id", uuidv4());

    turn.content.map((element) => {
      const span = document.createElement("span");
      if (element.style) span.className = element.style;
      span.innerText = element.text;
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

  if (ancestorElement.nodeName == "SPAN") {
    // A. selection is in a single SPAN tag
    const beforeText = startElement.innerText.slice(0, range.startOffset);
    const newText = range.toString();
    const afterText = startElement.innerText.slice(range.endOffset);

    const newElement = document.createElement("span");
    newElement.className = startElement.className;
    if (shouldRemove) {
      newElement.classList.remove("underlined");
    } else {
      newElement.classList.add("underlined");
    }
    newElement.innerText = newText;

    if (beforeText) {
      startElement.innerText = beforeText;
      startElement.insertAdjacentElement("afterend", newElement);
    } else {
      startElement.replaceWith(newElement);
    }

    if (afterText) {
      const afterElement = document.createElement("span");
      afterElement.className = startElement.className;
      afterElement.innerText = afterText;
      newElement.insertAdjacentElement("afterend", afterElement);
    }

    range.selectNodeContents(newElement.firstChild);

    const prevElement = newElement.previousElementSibling;
    const prevLength = prevElement ? prevElement.innerText.length : 0;
    const nextElement = newElement.nextElementSibling;
    const newLength = newElement.innerText.length;

    if (prevElement.className == newElement.className) {
      newElement.innerText = prevElement.innerText + newElement.innerText;
      prevElement.remove();
      range.setStart(newElement.firstChild, prevLength);
    }
    if (nextElement.className == newElement.className) {
      newElement.innerText = newElement.innerText + nextElement.innerText;
      nextElement.remove();
      range.setEnd(newElement.firstChild, prevLength + newLength);
    }

  } else if (ancestorElement.nodeName == "DIV") {
    // B. selection spans across MULTIPLE SPANs
    const beforeText = startElement.innerText.slice(0, range.startOffset);
    const afterText = endElement.innerText.slice(range.endOffset);

    const middleElements = [];
    let walker = startElement.nextElementSibling;
    while (walker != endElement) {
      middleElements.push(walker);
      walker = walker.nextElementSibling;
    }

    if (beforeText) {
      const beforeElement = document.createElement("span");
      beforeElement.className = startElement.className;
      beforeElement.innerText = beforeText;
      startElement.insertAdjacentElement("beforeBegin", beforeElement);
      startElement.innerText = startElement.innerText.slice(range.startOffset);
    }

    middleElements.map((element) => {
      if (shouldRemove) {
        element.classList.remove("underlined");
      } else {
        element.classList.add("underlined");
      }
    });

    if (afterText) {
      const afterElement = document.createElement("span");
      afterElement.className = endElement.className;
      afterElement.innerText = afterText;
      endElement.insertAdjacentElement("afterEnd", afterElement);
      endElement.innerText = endElement.innerText.slice(0, range.endOffset);
    }

    if (shouldRemove) {
      startElement.classList.remove("underlined");
      endElement.classList.remove("underlined");
    } else {
      startElement.classList.add("underlined");
      endElement.classList.add("underlined");
    }

    range.setStart(startElement.firstChild, 0);
    range.setEnd(endElement.firstChild, endElement.innerText.length);

    const prevElement = startElement.previousElementSibling;
    const nextElement = endElement.nextElementSibling;
    if (prevElement.classList == startElement.classList) {
      startElement.innerText = prevElement.innerText + startElement.innerText;
      prevElement.remove();
    }
    if (nextElement.classList == endElement.classList) {
      endElement.innerText = endElement.innerText + nextElement.innerText;
      nextElement.remove();
    }
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
