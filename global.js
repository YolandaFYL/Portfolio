console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'Projects/', title: 'Projects' },
  { url: 'Resume/', title: 'Resume' },
  { url: 'Contact/', title: 'Contact' },
  { url: 'https://github.com/YolandaFYL', title: 'Github' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');}
  if (a.host !== location.host) {
    a.setAttribute('target', '_blank');} 
  else {a.removeAttribute('target');} 
}
