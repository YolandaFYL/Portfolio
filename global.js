console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'Project/', title: 'Project' },
  { url: 'Resume/', title: 'Resume' },
  { url: 'Contact/', title: 'Contact' },
  { url: 'Meta/', title: 'Meta' },
  { url: 'https://github.com/YolandaFYL', title: 'Github' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);
const ARE_WE_HOME = document.documentElement.classList.contains('home');
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');}
  if (a.host !== location.host) {
    a.setAttribute('target', '_blank');} 
    else {a.removeAttribute('target');} 
  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-selector">
      <option value="auto">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('.color-scheme select');
  select.addEventListener('input', function (event) {
    const selectedScheme = event.target.value;
    
    console.log('Color scheme changed to', selectedScheme);
  });
  
function setColorScheme(colorScheme) {
  if (colorScheme === 'auto') {
    document.documentElement.style.removeProperty('color-scheme');} 
    else {document.documentElement.style.setProperty('color-scheme', colorScheme);}
  }

if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  setColorScheme(savedScheme);
  select.value = savedScheme;
}

select.addEventListener('input', function (event) {
  const selectedScheme = event.target.value;
  setColorScheme(selectedScheme);
  localStorage.colorScheme = selectedScheme;
  console.log('Color scheme changed to', selectedScheme);
});

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data; 
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  if (!containerElement || !(containerElement instanceof HTMLElement)) {
    console.error("Invalid container element provided.");
    return;
  }
  if (!/^h[1-6]$/.test(headingLevel)) {
    console.warn(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
    headingLevel = 'h2';
  }
  containerElement.innerHTML = '';
  project.forEach(project => {
    const article = document.createElement('article');
    const title = project.title || 'Untitled Project';
    const imageSrc = project.image || 'default-image.jpg';   
    const description = project.description || 'No description available.';
    const year = project.year || 'No year available.';
    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${imageSrc}" alt="${title}">
      <div class="project-details">
        <p>${project.description}</p>
        <p class="project-year">c. ${project.year}</p>
      </div>
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  return response.json();
}
