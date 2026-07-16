import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';

// Placeholder for sections not yet built, so the menu never dead-ends.
// Replaced by real screens in Phase 2 / Phase 3.
export function ComingSoon({ title, context, onBack }) {
  return (
    <NokiaShell
      header={<SectionHeader title={title} context={context} />}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--coming"
    >
      <div className="nk-coming">
        <div className="nk-coming__msg">Under construction</div>
        <div className="nk-coming__sub">shipping soon</div>
      </div>
    </NokiaShell>
  );
}
