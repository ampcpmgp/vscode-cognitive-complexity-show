const {
  window,
  commands,
  ExtensionContext,
  TextDocument,
  Range,
  Position,
  workspace,
} = require("vscode");

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
    commands.registerCommand("cognitive-complexity-show.toggle", async () => {
      const config = workspace.getConfiguration("cognitiveComplexityShow");
      const currentValue = config.get("enabled", false);
      await config.update("enabled", !currentValue, true); // Update the setting globally

      // The onDidChangeConfiguration event will handle the rest
    })
  );

  // Initial processing based on the setting
  const config = workspace.getConfiguration("cognitiveComplexityShow");
  if (config.get("enabled", false)) {
    processActiveFile(window.activeTextEditor?.document);
  }

  // Handle configuration changes
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("cognitiveComplexityShow.enabled")) {
        const config = workspace.getConfiguration("cognitiveComplexityShow");
        const isEnabled = config.get("enabled", false);
        if (isEnabled) {
          processActiveFile(window.activeTextEditor?.document);
        } else {
          deactivate();
        }
      }
    })
  );
}

function clearDecorations() {
  window.visibleTextEditors.forEach((textEditor) => {
    textEditor.setDecorations(decorationType, []);
  });
}

function getColor(complexity, config) {
  const highColor = config.get("color.high", "red");
  const mediumColor = config.get("color.medium", "yellow");
  const lowColor = config.get("color.low", "green");

  if (complexity > 15) return highColor;
  if (complexity > 10) return mediumColor;
  return lowColor;
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
  const config = workspace.getConfiguration("cognitiveComplexityShow");
  const isEnabled = config.get("enabled", false);

  if (!document || !language(document) || !isEnabled) return;

  let arr = {};

  const output = await getFileOutput(document.fileName);
  const flatten = flattenInner(output.inner);
  const complexityConfig = workspace.getConfiguration(
    "cognitiveComplexityShow"
  );

  flatten.forEach((item) => {
    arr[item.line] = decoration(
      item.line,
      `${item.score} - Cognitive Complexity`,
      getColor(item.score, complexityConfig)
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
