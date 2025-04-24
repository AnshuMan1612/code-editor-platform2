import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

type Language = 'python' | 'javascript' | 'typescript' | 'go' | 'php' | 'rust' | 'cpp';

interface RunCodeRequest {
  language: Language;
  code: string;
  input?: string;
}

function getFileExtension(language: Language): string {
  switch (language) {
    case 'python':
      return 'py';
    case 'javascript':
      return 'js';
    case 'typescript':
      return 'ts';
    case 'go':
      return 'go';
    case 'php':
      return 'php';
    case 'rust':
      return 'rs';
    case 'cpp':
      return 'cpp';
    default:
      return 'txt';
  }
}

function getRunCommand(language: Language, filePath: string): string {
  switch (language) {
    case 'python':
      return `python "${filePath}"`;
    case 'javascript':
      return `node "${filePath}"`;
    case 'typescript':
      // Use ts-node if installed
      return `npx ts-node "${filePath}"`;
    case 'go':
      return `go run "${filePath}"`;
    case 'php':
      return `php "${filePath}"`;
    case 'rust':
      // Compile and run
      const exePath = filePath.replace(/\\.rs$/, '');
      return `rustc "${filePath}" -o "${exePath}" && "${exePath}"`;
    case 'cpp':
      // Compile and run
      const cppExePath = filePath.replace(/\\.cpp$/, '');
      return `g++ "${filePath}" -o "${cppExePath}" && "${cppExePath}"`;
    default:
      return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { language, code, input } = (await request.json()) as RunCodeRequest;

    if (!language || !code) {
      return NextResponse.json({ error: 'Missing language or code' }, { status: 400 });
    }

    const ext = getFileExtension(language);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-run-'));
    const filePath = path.join(tmpDir, `code.${ext}`);

    fs.writeFileSync(filePath, code);

    const command = getRunCommand(language, filePath);
    if (!command) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    return new Promise((resolve) => {
      const proc = exec(command, { timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        // Clean up temp files
        try {
          if (language === 'rust' || language === 'cpp') {
            const exePath = filePath.replace(/\.[^.]+$/, '');
            if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
          }
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
        } catch {}

        if (error) {
          resolve(
            NextResponse.json({
              error: error.message,
              stderr,
              stdout,
            })
          );
        } else {
          resolve(
            NextResponse.json({
              stdout,
              stderr,
            })
          );
        }
      });

      if (input && proc.stdin) {
        proc.stdin.write(input);
        proc.stdin.end();
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
