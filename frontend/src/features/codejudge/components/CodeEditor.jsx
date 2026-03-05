import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, language }) {
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
        theme="vs-dark"
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