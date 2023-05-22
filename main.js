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

  // CASE 1: Selection is in a single SPAN tag
  if (ancestorElement.nodeName == 'SPAN') {
    const beforeText = startElement.innerText.slice(0, range.startOffset);
    const newText = range.toString();
    const afterText = startElement.innerText.slice(range.endOffset);

    startElement.innerText = beforeText;

    const newElement = document.createElement('span');
    newElement.innerText = newText;
    startElement.insertAdjacentElement('afterend', newElement);
    range.selectNodeContents(newElement);

    const afterElement = document.createElement('span');
    afterElement.innerText = afterText;
    newElement.insertAdjacentElement('afterend', afterElement);
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