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
    speakerName.className = 'speaker-name';
    if (turn.name !== 'none') {
      speakerName.innerText = turn.name;
    }
    const utterance = document.createElement('div');
    utterance.className = 'utterance';
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

    const div = document.createElement('div');
    div.className = 'turn';
    div.appendChild(lineNumber);
    div.appendChild(speakerName);
    div.appendChild(utterance);
    documentField.appendChild(div);
  });
}

const documentField = document.getElementById('content');
const wrapper = document.getElementById('wrapper');
wrapper.addEventListener('click', handleClick);
wrapper.addEventListener('keydown', handleKeyDown);

fetchJson();

function handleClick(e) {
  const selObj = window.getSelection();
  const range = selObj.getRangeAt(0);
  console.log(selObj);
  console.log(range);
  return;
}

function handleKeyDown(e) {
  return;
}