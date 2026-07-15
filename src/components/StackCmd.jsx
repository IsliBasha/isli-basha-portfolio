import { useCallback, useEffect, useRef, useState } from 'react';
import { SystemDialog } from './SystemDialog.jsx';

const ROOT = 'C:\\ISLI\\STACK';

const DIRS = {
  '':         { subdirs: ['languages', 'frontend', 'backend', 'ai', 'infra'], files: [] },
  languages:  { subdirs: [], files: ['Python', 'Rust', 'TypeScript', 'Kotlin', 'Java 21', 'JavaScript'] },
  frontend:   { subdirs: [], files: ['React 19 / Vite', 'Astro 4', 'Jetpack Compose'] },
  backend:    { subdirs: [], files: ['FastAPI', 'Spring Boot 3', 'Node.js / Express'] },
  ai:         { subdirs: [], files: ['MCP Protocol', 'DeepFace / OpenCV', 'RAG Pipeline'] },
  infra:      { subdirs: [], files: ['Docker', 'Cloudflare Workers (WASM)', 'SQLite / MySQL / PostgreSQL', 'GitHub Actions'] },
};

const NEOFETCH_ART = [
  '--==============================++++++',
  '============================++++++++++',
  '=======================+++++++++++++++',
  '=====================++++++=-=++++++++',
  '=======+=-=======+++++++++---=**++++++',
  '=======+=:-=++++++++++++=:::-=**++++++',
  '=======+====-=========--:----=#*++++++',
  '===++++++++=-::-:----:::::::-+#*******',
  '+++++++++*=-:::-:::::::::::::+#*******',
  '++++++++==-=#%#===::::=##=:::*#*******',
  '++++++++=+==#%%#--::::*%%*:--+#*******',
  '+++++++**#+-=*++==-:::-++-:-=-#*******',
  '+++++++*##*+==--=+---::::----=*#******',
  '+++++++*####*+=--**+=..:=-=---+%*****#',
  '++++****###****+==*=:.::::-==-+%#*####',
  '**********##******#*+==--===--*%######',
  '*********####******+++=-=-=---########',
  '*********#%#####********+=++==+%######',
  '*********#%%%%%%%####****++==--#######',
  '***********#%%%%%#**+======---:=%#####',
  '*************###**=====------:::%%##%%',
  '*****#*+++*+****==-----------:::=%%%%%',
  '#####*++====+++=-==-::--------:::*%%%%',
  '#####++======+++====--:--==---:::=%%%%',
  '####*+++===+====--------==+==--:::%%%%',
];

const MOBILE_BREAKPOINT = 1024;

async function fetchNeofetchOutput() {
  const res = await fetch('/api/neofetch');
  if (!res.ok) throw new Error('Failed to fetch GitHub stats');
  const s = await res.json();

  const statLine = (key, value) => `${key.padEnd(9)}: ${value}`;
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  return [
    ...(isMobile ? [] : NEOFETCH_ART),
    '',
    'IsliBasha@github',
    '-----------------',
    statLine('Repos', s.repos),
    statLine('Stars', s.stars),
    statLine('Commits', s.commits),
    statLine('Followers', s.followers),
    statLine('Forks', s.forks),
    statLine('Issues', s.issues),
    statLine('LOC', `${s.loc} (+${s.locAdd}, -${s.locDel})`),
    '',
  ].join('\n');
}

function getPrompt(cwd) {
  return cwd ? `${ROOT}\\${cwd.toUpperCase()}>` : `${ROOT}>`;
}

function dirOutput(cwd) {
  const dir = DIRS[cwd] ?? DIRS[''];
  const path = cwd ? `${ROOT}\\${cwd.toUpperCase()}` : ROOT;
  return [
    ' Volume in drive C is ISLI',
    ' Volume Serial Number is 1997-0824',
    '',
    ` Directory of ${path}`,
    '',
    '.                   <DIR>',
    '..                  <DIR>',
    ...dir.subdirs.map((d) => `${d.toUpperCase().padEnd(20)}<DIR>`),
    ...dir.files,
    '',
    `        ${dir.subdirs.length} Dir(s)  ${dir.files.length} File(s)`,
  ].join('\n');
}

function processCommand(raw, cwd) {
  const trimmed = raw.trim();
  if (!trimmed) return { output: '' };

  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(' ');

  switch (cmd.toLowerCase()) {
    case 'cls':
      return { clear: true };

    case 'dir':
      return { output: dirOutput(cwd) };

    case 'cd': {
      if (!arg || arg === '\\' || arg === '/') return { output: '', newCwd: '' };
      if (arg === '..') return { output: '', newCwd: '' };
      const target = arg.toLowerCase().replace(/\\/g, '');
      if (DIRS[target]) return { output: '', newCwd: target };
      return { output: 'The system cannot find the path specified.' };
    }

    case 'help':
      return {
        output: [
          'For more information on a specific command, type HELP command-name',
          '',
          'CD       Displays the name of or changes the current directory.',
          'CLS      Clears the screen.',
          'DIR      Displays a list of files and subdirectories.',
          'ECHO     Displays messages.',
          'HELP     Provides Help information for commands.',
          'NEOFETCH Displays live GitHub stats.',
          'TYPE     Displays the contents of a text file.',
          'VER      Displays the Windows version.',
        ].join('\n'),
      };

    case 'ver':
      return { output: '\nMicrosoft(R) Windows 95\n   (C)Copyright Microsoft Corp 1981-1995.\n' };

    case 'echo':
      return { output: arg || '' };

    case 'type': {
      const file = arg.toLowerCase().replace(/\.txt$/, '');
      if (file === 'readme') {
        return {
          output: [
            '',
            'ISLI BASHA',
            'Agent & Automation Specialist -- Ofive Global',
            '',
            'Builds software end-to-end, from database schema to pixel on screen.',
            'Focused on caching, indexing, bundle size, and render cost.',
            'Currently building agentic automation systems at Ofive Global.',
            '',
            'Email   : islibasha1@gmail.com',
            'GitHub  : github.com/IsliBasha',
            '',
          ].join('\n'),
        };
      }
      return { output: `File not found - ${arg || '(none)'}` };
    }

    case 'neofetch':
      return { async: true, pending: 'Fetching GitHub stats...', run: fetchNeofetchOutput };

    default:
      return {
        output: `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`,
      };
  }
}

const INITIAL_LINES = [
  'Microsoft(R) Windows 95',
  '   (C)Copyright Microsoft Corp 1981-1995.',
  '',
  `${ROOT}> dir`,
  ...dirOutput('').split('\n'),
  '',
];

export function StackCmd() {
  const [lines, setLines] = useState(INITIAL_LINES);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(null);

  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const runCommand = useCallback(
    async (raw) => {
      const result = processCommand(raw, cwd);

      if (result.clear) {
        setLines([]);
      } else if (result.async) {
        setLines((prev) => [...prev, `${getPrompt(cwd)}${raw}`, result.pending]);
        try {
          const output = await result.run();
          setLines((prev) => [...prev, ...output.split('\n')]);
        } catch {
          setLines((prev) => [...prev, 'Failed to fetch GitHub stats.']);
        }
      } else {
        setLines((prev) => [
          ...prev,
          `${getPrompt(cwd)}${raw}`,
          ...(result.output ? result.output.split('\n') : []),
        ]);
      }

      if (result.newCwd !== undefined) setCwd(result.newCwd);

      setHistoryIdx(-1);
      if (raw.trim()) setCmdHistory((prev) => [raw.trim(), ...prev]);
      setInput('');
    },
    [cwd],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        runCommand(input);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        if (nextIdx >= 0) {
          setHistoryIdx(nextIdx);
          setInput(cmdHistory[nextIdx]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = historyIdx - 1;
        setHistoryIdx(Math.max(nextIdx, -1));
        setInput(nextIdx < 0 ? '' : cmdHistory[nextIdx]);
      }
    },
    [input, cmdHistory, historyIdx, runCommand],
  );

  return (
    <>
      <div className="explorer-menubar" role="menubar">
        {['Edit', 'View', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="explorer-menu-item"
            role="menuitem"
            onClick={() => setMenuOpen(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        ref={outputRef}
        className="stack-cmd__output"
        onClick={() => inputRef.current?.focus()}
        aria-label="Terminal. Type help for available commands."
        role="log"
        aria-live="polite"
      >
        {lines.map((line, i) => (
          <div key={i} className="stack-cmd__line">
            {line || ' '}
          </div>
        ))}
        <div className="stack-cmd__prompt-row">
          <span className="stack-cmd__prompt" aria-hidden="true">
            {getPrompt(cwd)}
          </span>
          <input
            ref={inputRef}
            className="stack-cmd__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={`Terminal prompt: ${getPrompt(cwd)}`}
          />
        </div>
      </div>
      <SystemDialog
        open={menuOpen !== null}
        title={menuOpen ?? 'Menu'}
        message="This feature is not implemented."
        onClose={() => setMenuOpen(null)}
      />
    </>
  );
}
