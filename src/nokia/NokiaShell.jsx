// Persistent Nokia chrome: a header bar and a softkey bar wrapping each
// screen's scroll-locked content. Also exports the small header pieces so
// each screen can compose its own header slot (idle/menu vs section variant).

export function SignalBars() {
  return (
    <span className="nk-signal" aria-hidden="true">
      <span className="nk-signal__bar" />
      <span className="nk-signal__bar" />
      <span className="nk-signal__bar" />
      <span className="nk-signal__bar" />
    </span>
  );
}

export function Battery() {
  return (
    <span className="nk-battery" aria-hidden="true">
      <span className="nk-battery__cell" />
      <span className="nk-battery__cell" />
      <span className="nk-battery__cell" />
    </span>
  );
}

// Idle / menu header variant: signal bars · live clock · battery.
export function StatusHeader({ time }) {
  return (
    <>
      <SignalBars />
      <span className="nk-clock">{time}</span>
      <Battery />
    </>
  );
}

// Section header variant: "N TITLE" left, context (clock / counter / etc.) right.
export function SectionHeader({ title, context }) {
  return (
    <>
      <span className="nk-sec-title">{title}</span>
      {context != null && <span className="nk-sec-context">{context}</span>}
    </>
  );
}

function SoftKey({ item, className }) {
  return (
    <button
      type="button"
      className={`nk-softkey ${className}`}
      onClick={item?.action}
      disabled={!item}
      aria-hidden={item ? undefined : true}
    >
      {item?.label ?? ''}
    </button>
  );
}

export function NokiaShell({
  header,
  leftKey,
  rightKey,
  centerKey,
  bare = false,
  className = '',
  contentRef,
  onContentClick,
  children,
}) {
  if (bare) {
    return (
      <section className={`nk-viewport nk-viewport--bare ${className}`}>
        {children}
      </section>
    );
  }

  return (
    <section className={`nk-viewport ${className}`}>
      {header != null && <header className="nk-header">{header}</header>}
      <div className="nk-content" ref={contentRef} onClick={onContentClick}>
        {children}
      </div>
      <div className="nk-softkeys">
        {centerKey ? (
          <SoftKey className="nk-softkey--center" item={centerKey} />
        ) : (
          <>
            <SoftKey className="nk-softkey--left" item={leftKey} />
            <SoftKey className="nk-softkey--right" item={rightKey} />
          </>
        )}
      </div>
    </section>
  );
}
