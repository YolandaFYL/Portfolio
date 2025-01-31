import { fetchJSON, renderProjects} from './global.js';
async function loadLatestProjects() {
    try {
        const projects = await fetchJSON('./Lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const latestProjects = projects.slice(0, 3);
        if (!projectsContainer) {
            console.error("Projects container not found in the DOM.");
            return;
        }
        if (!projects || projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects available.</p>";
            return;
        }
        renderProjects(latestProjects, projectsContainer, 'h2');
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}
loadLatestProjects();