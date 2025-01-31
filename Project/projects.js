import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../Lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
async function loadProjects() {
    try {
        const projects = await fetchJSON('../Lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects available.</p>";
            return;
        }
        renderProjects(projects, projectsContainer, 'h2');
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}
loadProjects();
