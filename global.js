console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'Projects/index.html', title: 'Projects' },
  { url: 'Resume/index.html', title: 'Resume' },
  { url: 'Contact/index.html', title: 'Contact' },
  { url: 'https://github.com/YolandaFYL', title: 'Github Profile' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}
