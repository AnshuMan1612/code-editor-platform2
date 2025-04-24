# 🧠 Code Editor Platform

A powerful and extensible multi-language code editor built with **Next.js**, **CodeMirror**, and a custom backend that supports real-time code execution, problem switching, and code persistence. Perfect for practicing coding problems with live code execution and test cases.

---

## 🚀 Features 

- 🎯 Multi-language code support (Python, JavaScript, TypeScript, Go, PHP, Rust, C++)
- 🧠 Built-in coding problems with problem statements and sample test cases
- 💾 Auto-saving of code per language and problem
- 🌙 Light/Dark theme toggle with system preference detection
- 🧪 Code execution with sample input/output
- ✅ "Run All Tests" mock functionality
- 🔁 Next question cycling
- ⏱️ Problem-solving timer

---

## 📦 Tech Stack

- **Frontend:** React, Next.js App Router (Client Components), Tailwind CSS, CodeMirror 6
- **Backend:** Next.js API Route using `child_process` for dynamic code execution
- **Languages Supported:**
  - Python
  - JavaScript
  - TypeScript
  - Go
  - PHP
  - Rust
  - C++

---

## 🛠️ How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/code-editor-platform.git

cd code-editor-platform
```
2. Install Dependencies
```
bash
Copy
Edit
npm install
# or
yarn
```
3. Run the Development Server
```
bash
Copy
Edit
npm run dev
# or
yarn dev
```


Visit http://localhost:3000 to view the app.

✅ Important: Ensure your machine has the following compilers/interpreters installed:

Python

Node.js

Go

PHP

Rust (rustc)

g++ (for C++)

🧩 Bonus Features
💡 Backend dynamically compiles/runs code using temp files and system compilers

🔀 "Next Question" button cycles through built-in problems

🗃 LocalStorage persistence per language & problem

🎨 Auto theme toggle based on system preference

⏱️ Timer to track time spent per problem



<img width="1280" alt="image" src="https://github.com/user-attachments/assets/7bb0be57-1eee-465d-b310-5682dd4518a6" />



<img width="1280" alt="image" src="https://github.com/user-attachments/assets/ccc188c0-48c3-4581-a8c3-71033458acd8" />


