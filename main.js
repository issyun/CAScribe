const json = {
  title: "text document",
  date: "22-22-22",
  format: "jeffersonian",
  content: [
    {
      type: "turn",
      name: "A",
      content: [
        {
          type: "span",
          text: "Now I shall talk in many different styles",
        },
      ],
    },
    {
      type: "turn",
      name: "BRACADABRA",
      content: [
        {
          type: "span",
          text: "okay",
        },
        {
          type: "symbol",
          text: ":",
        },
      ],
    },
    {
      type: "turn",
      name: "A",
      content: [
        {
          type: "span",
          text: "I can talk ",
        },
        {
          type: "strong",
          text: "bold, ",
        },
        {
          type: "span",
          text: "and in ",
        },
        {
          type: "i",
          text: "italics, ",
        },
        {
          type: "span",
          text: "and I can even ",
        },
        {
          type: "u",
          text: "underline",
        },
        {
          type: "span",
          text: " my text.",
        },
      ],
    },
    {
      type: "turn",
      name: "none",
      content: [
        {
          type: "symbol",
          text: "(",
        },
        {
          type: "span",
          text: "2.0",
        },
        {
          type: "symbol",
          text: ")",
        },
      ],
    },
    {
      type: "turn",
      name: "BRACADABRA",
      content: [
        {
          type: "span",
          text: "wow",
        },
      ],
    },
  ],
};

const documentField = document.getElementById('content');

json.content.map((turn, idx) => {
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
})
