const {
  window,
  commands,
  ExtensionContext,
  TextDocument,
  Range,
  Position,
} = require("vscode");

const { getFileOutput } = require("cognitive-complexity-ts");

const decorationType = window.createTextEditorDecorationType({
  after: { margin: "0 0 0 1rem" },
});

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    commands.registerCommand("cognitive-complexity-show.execute", () => {
      const document = window.activeTextEditor?.document;
      if (document) processActiveFile(document);
    }),
    commands.registerCommand("cognitive-complexity-show.clear", () => {
      window.visibleTextEditors.forEach((textEditor) => {
        textEditor.setDecorations(decorationType, []);
      });
    })
  );
}

function getColor(complexity) {
  if (complexity > 15) return "red";
  if (complexity > 10) return "yellow";
  return "green";
}

/**
 *
 * @param {TextDocument} document
 */
async function processActiveFile(document) {
  console.log("cognitive-complexity-show", document);
  let arr = {};

  const result = await getFileOutput(document.fileName);

  console.log("filtered log result", result);

  arr[1] = decoration(1, "Cognitive Complexity: 5", "green");
  arr[2] = decoration(2, "Cognitive Complexity: 15", "yellow");
  arr[3] = decoration(3, "Cognitive Complexity: 25", "red");

  const editor = window.visibleTextEditors.find(
    (editor) => editor.document === document
  );

  editor.setDecorations(decorationType, Object.values(arr));
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
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
