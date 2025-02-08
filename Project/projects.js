import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

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

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let data = [1, 2, 3, 4, 5, 5];
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, i) => {
    d3.select('svg')
       .append('path')
       .attr('d', arc)
       .attr('fill', colors(i))
});

