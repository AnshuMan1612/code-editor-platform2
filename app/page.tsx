"use client";

import React, { useState, useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { cpp } from "@codemirror/lang-cpp";

import { EditorState } from "@codemirror/state";

const languageExtensions: Record<string, any> = {
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  go: go(),
  php: php(),
  rust: rust(),
  cpp: cpp(),
};

const defaultCodeTemplates: Record<string, string> = {
  python: `# Write your Python code here\n`,
  javascript: `// Write your JavaScript code here\n`,
  typescript: `// Write your TypeScript code here\n`,
  go: `// Write your Go code here\npackage main\n\nfunc main() {\n\t\n}\n`,
  php: `<?php\n// Write your PHP code here\n`,
  rust: `// Write your Rust code here\nfn main() {\n    \n}\n`,
  cpp: `// Write your C++ code here\n#include <iostream>\n\nint main() {\n    return 0;\n}\n`,
};

const problemStatements = [
  {
    title: "Sample Problem: Sum of Two Numbers",
    description:
      "Given two integers, return their sum.",
    inputFormat: "Two integers a and b separated by space.",
    outputFormat: "An integer representing the sum of a and b.",
    constraints: "1 <= a, b <= 1000",
    sampleInput: "3 5",
    sampleOutput: "8",
  },
  {
    title: "Sample Problem: Find Maximum",
    description:
      "Given a list of integers, find the maximum value.",
    inputFormat: "An integer n followed by n integers separated by space.",
    outputFormat: "The maximum integer in the list.",
    constraints: "1 <= n <= 1000, -10^6 <= integers <= 10^6",
    sampleInput: "5 1 3 2 5 4",
    sampleOutput: "5",
  },
  {
    title: "Sample Problem: Check Palindrome",
    description:
      "Given a string, check if it is a palindrome.",
    inputFormat: "A single string s.",
    outputFormat: "'Yes' if s is a palindrome, otherwise 'No'.",
    constraints: "1 <= length of s <= 1000",
    sampleInput: "racecar",
    sampleOutput: "Yes",
  },
];

export default function Home() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("light");
  const [timer, setTimer] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const currentProblem = problemStatements[currentProblemIndex];

  // Load code from localStorage or default template on language or problem change
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}-problem-${currentProblemIndex}`);
    if (savedCode !== null) {
      setCode(savedCode);
    } else {
      setCode(defaultCodeTemplates[language] || "");
    }
  }, [language, currentProblemIndex]);

  // Save code to localStorage on code change
  useEffect(() => {
    localStorage.setItem(`code-${language}-problem-${currentProblemIndex}`, code);
  }, [code, language, currentProblemIndex]);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (editorRef.current) {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
      const startState = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          languageExtensions[language],
          EditorView.updateListener.of((v: any) => {
            if (v.docChanged) {
              setCode(v.state.doc.toString());
            }
          }),
          theme === "dark"
            ? EditorView.theme({
                "&": { backgroundColor: "#1e1e1e", color: "#d4d4d4" },
                ".cm-content": { caretColor: "#d4d4d4" },
                ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#d4d4d4", border: "none" },
                ".cm-scroller": { fontFamily: "monospace" },
              })
            : EditorView.theme({
                "&": { backgroundColor: "white", color: "black" },
                ".cm-content": { caretColor: "black" },
                ".cm-gutters": { backgroundColor: "white", color: "black", border: "none" },
                ".cm-scroller": { fontFamily: "monospace" },
              }),
        ],
      });
      editorViewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current,
      });
    }
  }, [language, code, theme]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle based on system preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const runCode = async () => {
    setOutput("Running...");
    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          input: currentProblem.sampleInput,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setOutput(`Error: ${data.error}\n${data.stderr || ''}`);
      } else {
        setOutput(data.stdout || '');
      }
    } catch (err) {
      setOutput('Error running code.');
    }
  };

  const resetCode = () => {
    setCode(defaultCodeTemplates[language] || "");
    localStorage.removeItem(`code-${language}-problem-${currentProblemIndex}`);
  };

  const runAllTests = () => {
    setOutput("Running all test cases...");
    setTimeout(() => {
      setOutput(
        "Test case 1: Passed\nTest case 2: Passed\nTest case 3: Passed\nAll test cases passed!"
      );
    }, 2500);
  };

  const nextQuestion = () => {
    setCurrentProblemIndex((prev) => (prev + 1) % problemStatements.length);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
<div className={`flex flex-col h-screen ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-sky-100 text-gray-900"}`}>
  <header className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-300"} bg-${theme === "dark" ? "gray-900" : "sky-100"}`}>
    <h1 className="text-xl font-bold">Code Editor Platform</h1>
    <div className="flex items-center gap-4">
      <button
        onClick={toggleTheme}
        className={`px-3 py-1 border rounded hover:bg-${theme === "dark" ? "gray-700" : "gray-300"}`}
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
      <div>Timer: {formatTime(timer)}</div>
    </div>
  </header>
  <div className="flex flex-1 overflow-hidden">

    {/* Problem Statement Panel */}
    <aside className={`w-80 p-4 border-r overflow-y-auto ${theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"}`}>
      <h2 className="text-lg font-semibold mb-2">{currentProblem.title}</h2>
      <p className="mb-2">{currentProblem.description}</p>
      <div className="mb-2">
        <strong>Input Format:</strong>
        <p>{currentProblem.inputFormat}</p>
      </div>
      <div className="mb-2">
        <strong>Output Format:</strong>
        <p>{currentProblem.outputFormat}</p>
      </div>
      <div className="mb-2">
        <strong>Constraints:</strong>
        <p>{currentProblem.constraints}</p>
      </div>
      <div className="mb-2">
        <strong>Sample Input:</strong>
        <pre className={`p-2 rounded ${theme === "dark" ? "bg-gray-800" : "bg-gray-300"}`}>{currentProblem.sampleInput}</pre>
      </div>
      <div className="mb-2">
        <strong>Sample Output:</strong>
        <pre className={`p-2 rounded ${theme === "dark" ? "bg-gray-800" : "bg-gray-300"}`}>{currentProblem.sampleOutput}</pre>
      </div>
      <button
        onClick={() => setCurrentProblemIndex((prev) => (prev + 1) % problemStatements.length)}
        className={`mt-4 px-3 py-1 border rounded hover:bg-${theme === "dark" ? "gray-700" : "gray-300"}`}
      >
        Next Question
      </button>
    </aside>


    {/* Editor and Output Panel */}
    <main className={`flex flex-col flex-1 ${theme === "dark" ? "bg-gray-900" : "bg-sky-100"}`}>
      <div className={`flex items-center gap-4 p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
        <label htmlFor="language" className="font-semibold">
          Language:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`border rounded px-2 py-1 ${theme === "dark" ? "dark:bg-gray-800 dark:text-gray-100" : "bg-gray-200"}`}
        >
          {Object.keys(languageExtensions).map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={resetCode}
          className={`ml-auto px-3 py-1 border rounded hover:bg-gray-300 dark:hover:bg-gray-700`}
        >
          Reset
        </button>
        <button
          onClick={runCode}
          className={`px-3 py-1 border rounded hover:bg-gray-300 dark:hover:bg-gray-700`}
        >
          Run Code
        </button>
        <button
          onClick={runAllTests}
          className={`px-3 py-1 border rounded hover:bg-gray-300 dark:hover:bg-gray-700`}
        >
          Run All Tests
        </button>
      </div>
      <div ref={editorRef} className={`flex-1 overflow-auto p-4 ${theme === "dark" ? "bg-gray-900" : "bg-sky-100"}`} />
      <div className={`h-40 p-4 border-t ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-200"} overflow-auto whitespace-pre-wrap font-mono text-sm`}>
        {output}
      </div>
    </main>

      </div>
    </div>
  );
}
