const {
  window,
  commands,
  ExtensionContext,
  TextDocument,
  Range,
  Position,
  workspace,
} = require("vscode");

let isActive = false;

const { getFileOutput, FileOutput } = require("cognitive-complexity-ts");

const decorationType = window.createTextEditorDecorationType({
  after: { margin: "0 0 0 1rem" },
});

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  workspace.onDidChangeTextDocument((ev) => processActiveFile(ev.document));
  window.onDidChangeActiveTextEditor((ev) => processActiveFile(ev?.document));

  context.subscriptions.push(
    commands.registerCommand("cognitive-complexity-show.execute", () => {
      const document = window.activeTextEditor?.document;
      if (document) processActiveFile(document);
    }),
    commands.registerCommand("cognitive-complexity-show.clear", () => {
      window.visibleTextEditors.forEach(() => {
        clearDecorations();
      });
    }),
    commands.registerCommand("cognitive-complexity-show.toggle", () => {
      isActive = !isActive;
      if (isActive) {
        processActiveFile(window.activeTextEditor?.document);
      } else {
        deactivate();
      }
    })
  );
}

function clearDecorations() {
  window.visibleTextEditors.forEach((textEditor) => {
    textEditor.setDecorations(decorationType, []);
  });
}

function getColor(complexity) {
  if (complexity > 15) return "red";
  if (complexity > 10) return "yellow";
  return "green";
}

/**
 *
 * @param {FileOutput["inner"]} inner
 */
function getScoreSum(inner) {
  return inner.reduce((acc, item) => {
    const sum = getScoreSum(item.inner);

    return acc + item.score + sum;
  }, 0);
}

/**
 *
 * @param {FileOutput["inner"]} inner
 */
function flattenInner(inner) {
  return inner.reduce((acc, item) => {
    const flatten = flattenInner(item.inner);
    item.score -= getScoreSum(item.inner);

    return [...acc, item, ...flatten];
  }, []);
}

/**
 *
 * @param {TextDocument} document
 */
async function processActiveFile(document) {
  if (!document || !language(document)) return;

  let arr = {};

  const output = await getFileOutput(document.fileName);
  const flatten = flattenInner(output.inner);

  flatten.forEach((item) => {
    arr[item.line] = decoration(
      item.line,
      `${item.score} - Cognitive Complexity`,
      getColor(item.score)
    );
  });

  const editor = window.visibleTextEditors.find(
    (editor) => editor.document === document
  );

  editor.setDecorations(decorationType, Object.values(arr));
}

function language({ languageId }) {
  switch (languageId) {
    case "typescript":
    case "typescriptreact":
    case "javascript":
    case "javascriptreact":
      return "TS or JS";
    default:
      return undefined;
  }
}

function decoration(line, text, color) {
  return {
    renderOptions: { after: { contentText: text, color } },
    range: new Range(
      new Position(line - 1, 1024),
      new Position(line - 1, 1024)
    ),
  };
}
function deactivate() {
  clearDecorations();
}

module.exports = {
  activate,
  deactivate,
};
