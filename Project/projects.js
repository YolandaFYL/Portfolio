import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projectsContainer = document.querySelector(".projects");
const projectsTitle = document.querySelector(".projects-title");
const searchInput = document.querySelector(".searchBar");

let projects = [];
let selectedIndex = -1;
let filteredProjects = [];

async function loadProjects() {
  try {
    projects = await fetchJSON("../Lib/projects.json");
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
    renderProjects(projects, projectsContainer, "h2");
    projectsTitle.textContent = `${projects.length} Projects`;
    renderPieChart(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}
loadProjects();

function renderPieChart(projects) {
  if (!projects || projects.length === 0) {
    console.error("No projects available to render pie chart.");
    d3.select("svg").selectAll("*").remove();
    d3.select(".legend").selectAll("*").remove();
    return;
  }

  let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let colors = d3.scaleOrdinal(d3.schemeSet3);

  let svg = d3.select("svg");
  svg.selectAll("*").remove();
  let legend = d3.select(".legend");
  legend.selectAll("*").remove();

  arcData.forEach((d, i) => {
    svg
      .append("path")
      .attr("d", arcGenerator(d))
      .attr("fill", colors(i))
      .attr("class", i === selectedIndex ? "selected" : "")
      .style("--color", i === selectedIndex ? "oklch(60% 45% 0)" : "")
      .on("click", function () {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));
        legend
          .selectAll("li")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));
        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, "h2");
        } else {
          filteredProjects = projects.filter((p) => p.year === d.data.label);
          renderProjects(filteredProjects, projectsContainer, "h2");
        }
      });
  });

  data.forEach((d, idx) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(idx)}`)
      .attr("class", idx === selectedIndex ? "selected" : "")
      .html(`<span class="swatch"></span> ${d.label} (${d.value})`);
  });
}

searchInput.addEventListener("input", (event) => {
  let query = event.target.value.toLowerCase();
  let currentData = selectedIndex === -1 ? projects : filteredProjects;
  filteredProjects = currentData.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query);
  });
  renderProjects(filteredProjects, projectsContainer, "h2");
  renderPieChart(filteredProjects);
});
