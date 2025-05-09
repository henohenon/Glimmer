import * as monaco from "monaco-editor";
import { parseAst } from "@glimmer/ast";
import { generateWAT } from "@glimmer/wat-parser";
import grammar from "@glimmer/tmlanguage";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // ダークテーマ
import "prismjs/components/prism-wasm.js";  // WAT用ハイライト追加

function loadGlimmerLanguage() {
  monaco.languages.register({ id: "glimmer" });

  monaco.languages.setMonarchTokensProvider("glimmer", {
    tokenizer: {
      root: grammar.patterns.map((pattern: { match: string; name: string }) => [
        new RegExp(pattern.match),
        pattern.name,
      ]),
    },
  });
}


const codeBlock = document.getElementById("output");
function updateWat() {
  if (!codeBlock) {
    throw new Error("Code block not found");
  }
  if(!editor) {
    throw new Error("Editor not initialized");
  }
  const code = editor.getValue();
  const ast = parseAst(code);
  const wat = generateWAT(ast);
  codeBlock.textContent = wat;
  Prism.highlightElement(codeBlock as HTMLElement);
}

let editor: monaco.editor.IStandaloneCodeEditor | null = null

async function initializeEditor() {
  await loadGlimmerLanguage();

  const editorElem = document.getElementById("editor");

  if (!editorElem) {
    throw new Error("Editor element not found");
  }

  editor = monaco.editor.create(editorElem, {
    value: "const a = 10;",
    language: "glimmer",
    theme: "vs-dark",
    fontSize: 14,
    minimap: { enabled: false },
  });

  updateWat();
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault(); // Prevent the default browser save action
    updateWat();
  }
});

initializeEditor().catch((error) => {
  console.error("Failed to initialize editor:", error);
});