import { ProjectIcon } from './ProjectIcon.jsx';

// Not currently mounted by any surface — the desktop uses MyWorkExplorer and
// the phone uses nokia/screens/WorkDetail. Kept in the shape src/data/projects.js
// exports so it stays usable rather than silently rotting.
export function ProjectCard({ name, description, stack, link, privateNote, iconType }) {
  return (
    <article className="project-card">
      <header className="project-card__header">
        <ProjectIcon type={iconType} />
        <h3 className="project-card__name">{name}</h3>
      </header>
      <p className="project-card__desc">{description}</p>
      <div className="project-card__stack" aria-label={`${name} stack`}>
        {stack.map((tech) => (
          <span key={tech} className="win-sunken win95-pill">
            {tech}
          </span>
        ))}
      </div>
      <div className="project-card__foot">
        {link ? (
          <a
            className="win-btn"
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${name}`}
          >
            {link.label}
          </a>
        ) : (
          <span className="win-sunken win95-pill">{privateNote}</span>
        )}
      </div>
    </article>
  );
}
