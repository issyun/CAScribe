import { v4 as uuidv4 } from 'uuid';

let documentData;
async function fetchJson() {
  const res = await fetch('./sample_document.json');
  const json = await res.json();
  documentData = json;
  renderContent(json);
}

function renderContent(data) {
  data.content.map((turn, idx) => {
    const lineNumber = document.createElement('p');
    lineNumber.className = 'line-number';
    lineNumber.innerText = idx + 1;

    const speakerName = document.createElement('p');
    speakerName.className = 'speaker-name block';
    speakerName.setAttribute('data-block-id', uuidv4());
    if (turn.name !== 'none') {
      speakerName.innerText = turn.name;
    }

    const utterance = document.createElement('div');
    utterance.className = 'utterance block';
    utterance.contentEditable = true;
    utterance.setAttribute('data-block-id', uuidv4());

    turn.content.map((element) => {
      const span = document.createElement('span');
      if (element.style) span.className = element.style;
      span.innerText = element.text;
      utterance.appendChild(span);
    });

    const lineData = document.createElement('div');
    lineData.className = 'line-data';
    lineData.appendChild(lineNumber);
    lineData.appendChild(speakerName);
    contentFieldLeft.appendChild(lineData);

    const lineContent = document.createElement('div');
    lineContent.className = 'line-content';
    lineContent.appendChild(utterance);
    contentFieldRight.appendChild(lineContent);
  });
}

const contentFieldLeft = document.getElementById('content-left');
const contentFieldRight = document.getElementById('content-right');
const wrapper = document.getElementById('wrapper');
wrapper.addEventListener('click', handleClick);
wrapper.addEventListener('keydown', handleKeyDown);

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
    return recurFindParent(parent)
  }
}

function underline(selection) {
  const range = selection.getRangeAt(0);
  const startElement = range.startContainer.parentElement;
  const endElement = range.endContainer.parentElement;
  const ancestorElement = range.commonAncestorContainer.parentElement;

  if (startElement.className.includes('underlined')) {
    // A. REMOVE UNDERLINE if selection starts in UNDERLINED

  } else {
    // B. ADD UNDERLINE if selection doesn't start in UNDERLINED
    if (ancestorElement.nodeName == 'SPAN') {
      // B-1. selection is in a single SPAN tag
      const beforeText = startElement.innerText.slice(0, range.startOffset);
      const newText = range.toString();
      const afterText = startElement.innerText.slice(range.endOffset);

      const newElement = document.createElement('span');
      newElement.className = startElement.className + ' underlined';
      newElement.innerText = newText;
  
      if (beforeText) {
        startElement.innerText = beforeText;
        startElement.insertAdjacentElement('afterend', newElement);
      } else {
        startElement.replaceWith(newElement);
      }
  
      if (afterText) {
        const afterElement = document.createElement('span');
        afterElement.className = startElement.className;
        afterElement.innerText = afterText;
        newElement.insertAdjacentElement('afterend', afterElement);
      }

      range.selectNodeContents(newElement);
  
    } else if (ancestorElement.nodeName == 'DIV') {
      // B-2. selection spans across MULTIPLE SPANs
      const beforeText = startElement.innerText.slice(0, range.startOffset);
      const afterText = endElement.innerText.slice(range.endOffset);

      const middleElements = [];
      let walker = startElement.nextElementSibling;
      while (walker != endElement) {
        middleElements.push(walker);
        walker = walker.nextElementSibling;
      }

      if (beforeText) {
        const beforeElement = document.createElement('span');
        beforeElement.className = startElement.className;
        beforeElement.innerText = beforeText;
        startElement.className += ' underlined';
        startElement.insertAdjacentElement('beforeBegin', beforeElement);
        startElement.innerText = startElement.innerText.slice(range.startOffset);
      } else {
        startElement.className += ' underlined';
      }

      middleElements.map((element) => {
        element.className += ' underlined';
      })

      if (afterText) {
        const afterElement = document.createElement('span');
        afterElement.className = endElement.className;
        afterElement.innerText = afterText;
        endElement.className += ' underlined';
        endElement.innerText = endElement.innerText.slice(0, range.endOffset);
        endElement.insertAdjacentElement('afterEnd', afterElement);
      } else {
        endElement.className += ' underlined';
      }

      // TODO: handle already underlined SPANs
    }
  }
  
}

document.getElementById('underline').addEventListener('click', () => {
  const selection = window.getSelection();
  underline(selection);
});

document.getElementById('check-selection').addEventListener('click', () => {
  const selection = window.getSelection();
  console.log(selection);
  console.log(selection.getRangeAt(0));
});