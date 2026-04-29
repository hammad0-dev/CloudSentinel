const STORAGE_KEY = "cloudsentinel_projects";

export function readLocalProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertLocalProject(project) {
  const projects = readLocalProjects();
  const idx = projects.findIndex((p) => String(p.id) === String(project.id));
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  writeLocalProjects(projects);
  return projects;
}

export function removeLocalProject(projectId) {
  const next = readLocalProjects().filter((p) => String(p.id) !== String(projectId));
  writeLocalProjects(next);
  return next;
}
