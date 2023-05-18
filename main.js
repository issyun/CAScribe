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
      let type;
      if (element.type === 'symbol') {
        type = 'span';
      } else {
        type = element.type;
      }
      const node = document.createElement(type);
      node.innerText = element.text;
      utterance.appendChild(node);
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
  console.log(range);
  if (range.commonAncestorContainer.nodeType == 3) { // nodeType 3: text
    const ancestorLength = range.commonAncestorContainer.length
    if (range.commonAncestorContainer.parentNode.nodeName == 'SPAN') {
      let newNode = document.createElement('u');
      range.surroundContents(newNode);
    } else if (range.commonAncestorContainer.parentNode.nodeName == 'U') {
      if (range.startOffset == 0 && range.endOffset == ancestorLength) {
        // remove underline
      }
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