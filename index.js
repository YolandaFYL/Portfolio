import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

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

async function displayGitHubStats(username) {
    const profileStats = document.querySelector('#profile-stats');
    if (!profileStats) {
      console.error("Profile stats container not found!");
      return;
    }
    try {
      const githubData = await fetchGitHubData(username);
      profileStats.innerHTML = `
        <h2 class="stats-title">${githubData.name} GitHub Stats</h2>
        <img src="${githubData.avatar_url}" alt="${githubData.login}" width='200'>
        <dl class="stats-grid">
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
        `;
    } catch (error) {
      profileStats.innerHTML = `<p>Error loading GitHub stats: ${error.message}</p>`;
    }
  }
displayGitHubStats('YolandaFYL');
  