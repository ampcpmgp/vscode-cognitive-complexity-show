const { window, commands, ExtensionContext, TextDocument } = require("vscode");

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    commands.registerCommand("cognitive-complexity-show.execute", () => {
      const document = window.activeTextEditor?.document;
      if (document) processActiveFile(document);
    })
  );
}

/**
 *
 * @param {TextDocument} document
 */
async function processActiveFile(document) {
  console.log("cognitive-complexity-show", document);

  window.showInformationMessage("Hello World from cognitive-complexity-show!");
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
