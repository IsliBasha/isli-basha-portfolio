import { useCallback, useRef, useState } from 'react';
import { WindowStackProvider } from './context/WindowStack.jsx';
import { Window } from './components/Window.jsx';
import { Taskbar } from './components/Taskbar.jsx';
import { DesktopIcon } from './components/DesktopIcon.jsx';
import { ProjectCard } from './components/ProjectCard.jsx';
import { StackCmd } from './components/StackCmd.jsx';
import { StickyNote } from './components/StickyNote.jsx';
import { SystemDialog } from './components/SystemDialog.jsx';
import { Minesweeper } from './components/Minesweeper.jsx';
import { Snake } from './components/Snake.jsx';
import { BSOD } from './components/BSOD.jsx';
import { BootSequence } from './components/BootSequence.jsx';
import { Screensaver } from './components/Screensaver.jsx';
import { ContextMenu } from './components/ContextMenu.jsx';
import { ResumeViewer } from './components/ResumeViewer.jsx';
import { VisitorCounterContent } from './components/VisitorCounter.jsx';
import { useInactivity } from './hooks/useInactivity.js';
import { projects } from './data/projects.js';

const WINDOW_ORDER = [
  'about',
  'projects',
  'stack',
  'contact',
  'stats',
  'resume',
  'minesweeper',
  'snake',
];
const INITIALLY_CLOSED = [
  'about',
  'projects',
  'stack',
  'contact',
  'resume',
  'minesweeper',
  'snake',
];

function NotepadAbout() {
  return (
    <>
      <div className="explorer-menubar" role="menubar">
        {['File', 'Edit', 'Format', 'View', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="explorer-menu-item"
            role="menuitem"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="notepad-body">
        <h2 className="font-bold mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
          ~/ whoami
        </h2>
        <p className="mb-2">
          I build software end-to-end — from the database schema up to the
          pixel on screen — from Tirana, Albania. I care a lot about how
          things feel under load, which usually means obsessing over the
          boring layers: caching, indexing, bundle size, render cost.
        </p>
        <p>
          Lately I am digging into edge computing and the parts of
          WebAssembly that actually ship.
        </p>
      </div>
      <div className="notepad-statusbar">
        <span>about.txt</span>
        <span>UTF-8</span>
      </div>
    </>
  );
}

function ContactExe() {
  return (
    <>
      <div className="explorer-menubar" role="menubar">
        {['File', 'Edit', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="explorer-menu-item"
            role="menuitem"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="contact-body">
        <ul className="contact-links">
          <li>
            <span className="contact-links__label">Email:</span>
            <a href="mailto:islibasha1@gmail.com">islibasha1@gmail.com</a>
          </li>
          <li>
            <span className="contact-links__label">GitHub:</span>
            <a href="https://github.com/IsliBasha" target="_blank" rel="noreferrer noopener">
              github.com/IsliBasha
            </a>
          </li>
          <li>
            <span className="contact-links__label">LinkedIn:</span>
            <a href="https://linkedin.com/in/islibasha" target="_blank" rel="noreferrer noopener">
              linkedin.com/in/islibasha
            </a>
          </li>
        </ul>
        <ContactForm />
      </div>
      <div className="explorer-statusbar">Ready</div>
    </>
  );
}

function ProjectsExplorer({ projects: projectList }) {
  return (
    <>
      <div className="explorer-menubar" role="menubar">
        {['File', 'Edit', 'View', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="explorer-menu-item"
            role="menuitem"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="explorer-address-bar">
        <span className="explorer-address-label">Address</span>
        <div
          className="explorer-address-field"
          aria-label="Current location: C:\ISLI\PROJECTS"
        >
          C:\ISLI\PROJECTS
        </div>
      </div>
      <div className="explorer-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectList.map((p) => (
            <ProjectCard
              key={p.id}
              name={p.name}
              description={p.description}
              stack={p.stack}
              href={p.href}
              iconType={p.iconType}
            />
          ))}
        </div>
      </div>
      <div className="explorer-statusbar">{projectList.length} object(s)</div>
    </>
  );
}

const CONTACT_MAX = 280;

function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = textareaRef.current?.value?.trim();
    if (!message) return;

    setStatus('sending');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!r.ok) throw new Error('non-ok');
      setStatus('ok');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        setCharCount(0);
      }
    } catch {
      setStatus('error');
    }
  };

  const counterClass = [
    'contact-msg-counter',
    charCount >= CONTACT_MAX
      ? 'contact-msg-counter--full'
      : charCount >= Math.floor(CONTACT_MAX * 0.8)
        ? 'contact-msg-counter--near'
        : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <form onSubmit={handleSubmit} className="contact-form">
        <label htmlFor="contact-msg" className="contact-form__label">
          Quick Message
        </label>
        <textarea
          ref={textareaRef}
          id="contact-msg"
          name="message"
          className="win-field"
          placeholder="Type your message…"
          maxLength={CONTACT_MAX}
          required
          disabled={status === 'sending'}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
        <div className="contact-msg-meta">
          <span className={counterClass}>{charCount} / {CONTACT_MAX}</span>
        </div>
        <div className="flex justify-end mt-2">
          <button type="submit" className="win-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </div>
      </form>

      <SystemDialog
        open={status === 'ok'}
        title="Message"
        message="Message sent. Thank you."
        onClose={() => setStatus('idle')}
      />
      <SystemDialog
        open={status === 'error'}
        title="Error"
        message="Could not send message. Please try again."
        onClose={() => setStatus('idle')}
      />
    </>
  );
}

function App() {
  const [screensaverOn, setScreensaverOn] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const activateScreensaver = useCallback(() => setScreensaverOn(true), []);
  useInactivity(45_000, activateScreensaver);

  const handleContextMenu = useCallback((e) => {
    if (e.target.closest('.win95-window')) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <WindowStackProvider
      initialOrder={WINDOW_ORDER}
      initialClosed={INITIALLY_CLOSED}
    >
      {screensaverOn && (
        <Screensaver onDismiss={() => setScreensaverOn(false)} />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      <a href="#projects" className="skip-link">
        Skip to projects
      </a>
      <main className="desktop-area" onContextMenu={handleContextMenu}>
        <div className="desktop-icons" aria-label="Desktop shortcuts">
          <DesktopIcon kind="about"       label="about.txt"       target="about"       defaultPos={{ x: 16, y: 16  }} />
          <DesktopIcon kind="projects"    label="projects"        target="projects"    defaultPos={{ x: 16, y: 96  }} />
          <DesktopIcon kind="stack"       label="stack.cmd"       target="stack"       defaultPos={{ x: 16, y: 176 }} />
          <DesktopIcon kind="contact"     label="contact.exe"     target="contact"     defaultPos={{ x: 16, y: 256 }} />
          <DesktopIcon kind="resume"      label="resume.pdf"      target="resume"      defaultPos={{ x: 16, y: 336 }} />
          <DesktopIcon kind="minesweeper" label="minesweeper.exe" target="minesweeper" defaultPos={{ x: 16, y: 416 }} />
          <DesktopIcon kind="snake"       label="snake.exe"       target="snake"       defaultPos={{ x: 16, y: 496 }} />
        </div>

        <div className="sticky-note-wrap">
          <StickyNote />
        </div>


        <Window
          id="about"
          title="about.txt"
          className="win-about"
          bootDelayMs={0}
          contentClassName="win-about__content"
        >
          <NotepadAbout />
        </Window>

        <Window
          id="projects"
          title="projects"
          className="win-projects"
          bootDelayMs={120}
          contentClassName="win-projects__content"
        >
          <ProjectsExplorer projects={projects} />
        </Window>

        <Window
          id="stack"
          title="stack.cmd"
          className="win-stack"
          bootDelayMs={240}
          contentClassName="win-stack__content"
        >
          <StackCmd />
        </Window>

        <Window
          id="contact"
          title="contact.exe"
          className="win-contact"
          bootDelayMs={360}
          contentClassName="win-contact__content"
        >
          <ContactExe />
        </Window>

        <Window
          id="stats"
          title="SiteCounter.exe"
          className="win-stats"
          bootDelayMs={0}
          contentClassName="win-stats__content"
        >
          <VisitorCounterContent />
        </Window>

        <Window
          id="resume"
          title="resume.pdf - Adobe Acrobat"
          className="win-resume"
          bootDelayMs={0}
          contentClassName="win-resume__content"
        >
          <ResumeViewer />
        </Window>

        <Window
          id="minesweeper"
          title="minesweeper.exe"
          className="win-minesweeper"
          bootDelayMs={0}
          contentClassName="win-minesweeper__content"
        >
          <Minesweeper />
        </Window>

        <Window
          id="snake"
          title="snake.exe"
          className="win-snake"
          bootDelayMs={0}
          contentClassName="win-snake__content"
        >
          <Snake />
        </Window>
      </main>
      <Taskbar />
      <BSOD />
      <BootSequence />
    </WindowStackProvider>
  );
}

export default App;
