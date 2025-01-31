import { fetchJSON, renderProjects } from '../global.js';

async function loadProjects() {
    try {
        const projects = await fetchJSON('../Lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');
        if (!projectsContainer) {
            console.error("Projects container not found in the DOM.");
            return;
        }
        if (!projectsTitle) {
            console.error("Projects title element not found in the DOM.");
            return;
        }
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects available.</p>";
            projectsTitle.textContent = "0 Projects";
            return;
        }
        renderProjects(projects, projectsContainer, 'h2');
        projectsTitle.textContent = `${projects.length} Projects`;
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}
loadProjects();
