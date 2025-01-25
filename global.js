console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'Project/', title: 'Project' },
  { url: 'Resume/', title: 'Resume' },
  { url: 'Contact/', title: 'Contact' },
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