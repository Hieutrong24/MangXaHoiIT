import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

export default function CodeEditor({ value, onChange, language }) {
  const [editorTheme, setEditorTheme] = useState(() =>
    typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light"
      ? "vs"
      : "vs-dark"
  );

  useEffect(() => {
    function syncTheme() {
      const mode = document.documentElement.getAttribute("data-theme");
      setEditorTheme(mode === "light" ? "vs" : "vs-dark");
    }

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("ui-preferences:changed", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("ui-preferences:changed", syncTheme);
    };
  }, []);

  function handleEditorDidMount(editor, monaco) {
    // C++ snippet
    monaco.languages.registerCompletionItemProvider("cpp", {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: "main",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "#include <bits/stdc++.h>",
              "using namespace std;",
              "",
              "int main() {",
              "\t$0",
              "}"
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: "fastio",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "ios::sync_with_stdio(false);",
              "cin.tie(NULL);"
            ].join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
        ],
      }),
    });
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <Editor
        height="480px"
        theme={editorTheme}
        language={language}
        value={value}
        onChange={(val) => onChange?.(val || "")}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
