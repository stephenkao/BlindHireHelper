
const DEBUG = false;

const names = new Set();

function log(msg) {
  DEBUG && window.console.log(msg);
}

const styleNode = document.createElement('style');
styleNode.id = 'gde_styles';
document.head.appendChild(styleNode);
const rule = '.gde_redacted, .noteContent { background-color: black; color: black; }';
styleNode.sheet.insertRule(rule, 0);
const hoverRule = '.gde_redacted:hover, .noteContent:hover { background-color: white; }';
styleNode.sheet.insertRule(hoverRule, 1);

function redactNames(rootNode = document) {
  const escapedNames = [...names].map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const namesRe = new RegExp(`(${escapedNames.join('|')})`, 'i');

  const allNodes = rootNode.getElementsByTagName('*');

  [...allNodes].forEach((node) => {
    [...node.childNodes].forEach((childNode) => {
      if (childNode.nodeType === 3) { // only text nodes
        const text = childNode.nodeValue;
        const replacedText = text.replace(namesRe, 'whatever');
        if (replacedText !== text && !node.dataset.redacted) {
          const newNode = document.createElement('span');
          //newNode.style.color = 'black';
          //newNode.style.backgroundColor = 'black';
          newNode.title = text;
          newNode.dataset.redacted = true;
          //newNode.onmouseover = () => newNode.style.backgroundColor = 'white';
          //newNode.onmouseout = () => newNode.style.backgroundColor = 'black';
          newNode.classList.add('gde_redacted');
          newNode.innerHTML = text;
          node.parentNode.replaceChild(newNode, node);
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

      if (candidateNode.classList.contains('hanselNamePlate-leftPanel-lastJobTitle')) {
        // central panel with individual candidate information initial load

        const { parentNode } = candidateNode;
        const newName = parentNode.querySelector('h3').textContent.trim();
        log('central panel, adding: ', newName);
        names.add(newName);

        // remove email address
        parentNode.querySelector('.hanselNamePlate-leftPanel-additional').innerHTML = '';

        redactNames(parentNode);
      } else if (candidateNode.classList.contains('hanselCandidateDetails')) {
        // paginating between candidate detail panels

        // remove email address
        candidateNode.parentNode.querySelector('.hanselNamePlate-leftPanel-additional').innerHTML = '';

        redactNames(candidateNode);
      } else if (candidateNode.classList.contains('HanselCandidateList') && !candidateNode.classList.contains('loading')) {
        // sidebar with all candidates initial load

        [...candidateNode.querySelectorAll('.CandidateListItem-name')].forEach((nameNode) => {
          const newName = nameNode.textContent.trim();
          log('candidate list loaded, adding: ', newName);

          names.add(newName);
        });

        // remove hover events disabling class
        document.querySelector('.CandidateListItem-disable-hover').classList.remove('.CandidateListItem-disable-hover');

        redactNames(candidateNode);
      } else if (candidateNode.classList.contains('CandidateListItem')) {
        // when clicking 'More' in candidate

        const newName = candidateNode.querySelector('.CandidateListItem-name').textContent.trim();
        log('paginating candidate list, adding: ', newName);

        names.add(newName);
        redactNames(candidateNode);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
