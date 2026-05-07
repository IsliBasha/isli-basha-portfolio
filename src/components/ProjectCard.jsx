import { ProjectIcon } from './ProjectIcon.jsx';

export function ProjectCard({ name, description, stack, href, iconType }) {
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
        <a
          className="win-btn"
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`View source for ${name} on GitHub`}
        >
          View Source
        </a>
      </div>
    </article>
  );
}
