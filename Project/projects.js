import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let projects = await fetchJSON('../Lib/projects.json');

async function loadProjects() {
    try {
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

function renderPieChart(projects) {
    if (!projects || projects.length === 0) {
        console.error("No projects available to render pie chart.");
        return;
    }
    let rolledData = d3.rollups(projects,(v) => v.length,(d) => d.year);
    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    d3.select('svg').selectAll('*').remove();
    arcData.forEach((d, i) => {
        d3.select('svg').append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(i));
    });
    let legend = d3.select('.legend').html('');
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} (${d.value})`);
    });
}
renderPieChart(projects);


searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});