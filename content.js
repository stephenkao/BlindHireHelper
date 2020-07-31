const names = new Set();

function redactNames() {
  const namesRe = new RegExp(`(${[...names].join('|')})`, 'i');

  const allNodes = document.getElementsByTagName('*');

  [...allNodes].forEach((node) => {
    [...node.childNodes].forEach((childNode) => {
      if (childNode.nodeType === 3) {
        const text = childNode.nodeValue;
        const replacedText = text.replace(namesRe, 'whatever');
        if (replacedText !== text) {
          const newNode = document.createElement('span');
          newNode.style.color = 'black';
          newNode.style.backgroundColor = 'black';
          newNode.title = text;
          newNode.onmouseover = () => newNode.style.backgroundColor = 'white';
          newNode.onmouseout = () => newNode.style.backgroundColor = 'black';
          newNode.innerHTML = text;
          childNode.parentNode.replaceChild(newNode, childNode);
        }
      }
    });
  });
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return;

    [...mutation.addedNodes].forEach((candidateNode) => {
      if (!candidateNode || !candidateNode.classList) return;

      console.log(candidateNode);

      if (candidateNode.classList.contains('hanselNamePlate-leftPanel-lastJobTitle')) {
        // this panel usually loads first
        names.add(candidateNode.parentNode.childNodes[0].textContent.trim());

        // remove email address
        document.querySelector('.hanselNamePlate-leftPanel-additional').innerHTML = '';

        redactNames();
      } else if (candidateNode.classList.contains('hanselCandidateDetails')) {
        redactNames();
      } else if (candidateNode.classList.contains('HanselCandidateList') && !candidateNode.classList.contains('loading')) {
        // then redact all other candidate names too
        [...candidateNode.querySelectorAll('.CandidateListItem-name')].forEach((nameNode) => {
          //nameNode.style.display = 'none';
          names.add(nameNode.textContent.trim());
        });

        // remove hover events disabling class
        document.querySelector('.CandidateListItem-disable-hover').classList.remove('.CandidateListItem-disable-hover');

        redactNames();
      } else if (candidateNode.classList.contains('CandidateListItem')) {
        names.add(candidateNode.textContent.trim());

        redactNames();
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
