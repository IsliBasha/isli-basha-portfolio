import { useCallback, useRef, useState } from 'react';
import { WindowStackProvider } from './context/WindowStack.jsx';
import { Window } from './components/Window.jsx';
import { Taskbar } from './components/Taskbar.jsx';
import { DesktopIcon } from './components/DesktopIcon.jsx';
import { StackCmd } from './components/StackCmd.jsx';
import { SystemDialog } from './components/SystemDialog.jsx';
import { Minesweeper } from './components/Minesweeper.jsx';
import { Snake } from './components/Snake.jsx';
import { BSOD } from './components/BSOD.jsx';
import { BootSequence } from './components/BootSequence.jsx';
import { Screensaver } from './components/Screensaver.jsx';
import { ContextMenu } from './components/ContextMenu.jsx';
import { ResumeViewer } from './components/ResumeViewer.jsx';
import { VisitorCounterContent } from './components/VisitorCounter.jsx';
import { MyWorkExplorer } from './components/MyWorkExplorer.jsx';
import { DisplayProperties } from './components/DisplayProperties.jsx';
import { PixelIcon } from './components/PixelIcon.jsx';
import { AppGlyph } from './lib/AppGlyph.jsx';
import { useInactivity } from './hooks/useInactivity.js';
import { bio } from './data/bio.js';

const WINDOW_ORDER = [
  'about',
  'stack',
  'contact',
  'stats',
  'resume',
  'minesweeper',
  'snake',
  'mywork',
  'display',
];
const INITIALLY_CLOSED = [
  'about',
  'stack',
  'contact',
  'resume',
  'minesweeper',
  'snake',
  'mywork',
  'display',
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
        {bio.paragraphs.map((text, i) => (
          <p key={i} className={i < bio.paragraphs.length - 1 ? 'mb-2' : undefined}>
            {text}
          </p>
        ))}
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
        <dl className="contact-links">
          <dt className="contact-links__label">Email:</dt>
          <dd className="contact-links__value">
            <a href="mailto:islibasha1@gmail.com">islibasha1@gmail.com</a>
          </dd>
          <dt className="contact-links__label">GitHub:</dt>
          <dd className="contact-links__value">
            <a href="https://github.com/IsliBasha" target="_blank" rel="noreferrer noopener">
              github.com/IsliBasha
            </a>
          </dd>
          <dt className="contact-links__label">LinkedIn:</dt>
          <dd className="contact-links__value">
            <a href="https://linkedin.com/in/islibasha" target="_blank" rel="noreferrer noopener">
              linkedin.com/in/islibasha
            </a>
          </dd>
        </dl>
        <ContactForm />
      </div>
      <div className="explorer-statusbar">
        <span className="explorer-statusbar__panel">Ready</span>
      </div>
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
          Message:
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

export function DesktopApp() {
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
          <DesktopIcon kind="stack"       label="cmd"             target="stack"       defaultPos={{ x: 16, y: 96  }} />
          <DesktopIcon kind="contact"     label="contact.exe"     target="contact"     defaultPos={{ x: 16, y: 176 }} />
          <DesktopIcon kind="resume"      label="resume.pdf"      target="resume"      defaultPos={{ x: 16, y: 256 }} />
          <DesktopIcon kind="minesweeper" label="minesweeper.exe" target="minesweeper" defaultPos={{ x: 16, y: 336 }} />
          <DesktopIcon kind="snake"       label="snake.exe"       target="snake"       defaultPos={{ x: 16, y: 416 }} />
          <DesktopIcon kind="mywork"      label="my work"         target="mywork"      defaultPos={{ x: 16, y: 496 }} />
        </div>

        <Window
          id="about"
          title="about.txt - Notepad"
          icon={<AppGlyph kind="about" size={16} />}
          className="win-about"
          bootDelayMs={0}
          contentClassName="win-about__content"
        >
          <NotepadAbout />
        </Window>

        <Window
          id="stack"
          title="cmd"
          icon={<AppGlyph kind="stack" size={16} />}
          className="win-stack"
          bootDelayMs={240}
          contentClassName="win-stack__content"
        >
          <StackCmd />
        </Window>

        <Window
          id="contact"
          title="contact.exe"
          icon={<AppGlyph kind="contact" size={16} />}
          className="win-contact"
          bootDelayMs={360}
          contentClassName="win-contact__content"
        >
          <ContactExe />
        </Window>

        <Window
          id="stats"
          title="SiteCounter.exe"
          icon={<AppGlyph kind="stats" size={16} />}
          className="win-stats"
          bootDelayMs={0}
          contentClassName="win-stats__content"
        >
          <VisitorCounterContent />
        </Window>

        <Window
          id="resume"
          title="resume.pdf - Adobe Acrobat"
          icon={<AppGlyph kind="resume" size={16} />}
          className="win-resume"
          bootDelayMs={0}
          contentClassName="win-resume__content"
        >
          <ResumeViewer />
        </Window>

        <Window
          id="minesweeper"
          title="minesweeper.exe"
          icon={<AppGlyph kind="minesweeper" size={16} />}
          className="win-minesweeper"
          bootDelayMs={0}
          contentClassName="win-minesweeper__content"
        >
          <Minesweeper />
        </Window>

        <Window
          id="snake"
          title="snake.exe"
          icon={<AppGlyph kind="snake" size={16} />}
          className="win-snake"
          bootDelayMs={0}
          contentClassName="win-snake__content"
        >
          <Snake />
        </Window>

        <Window
          id="mywork"
          title="my work"
          icon={<AppGlyph kind="mywork" size={16} />}
          className="win-mywork"
          bootDelayMs={0}
          contentClassName="win-mywork__content"
        >
          <MyWorkExplorer />
        </Window>

        {/* No desktop icon: this one is reached the way Win95 reached it, from
            the desktop's right-click Properties. `app-window` is a stand-in --
            the display icon lands with the rest of the system set. */}
        <Window
          id="display"
          title="Display Properties"
          icon={<PixelIcon id="app-window" size={16} />}
          className="win-display"
          bootDelayMs={0}
          contentClassName="win-display__content"
        >
          <DisplayProperties />
        </Window>
      </main>
      <Taskbar />
      <BSOD />
      <BootSequence />
    </WindowStackProvider>
  );
}
