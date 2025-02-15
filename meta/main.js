let data = [];
let commits = [];

const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 20 };

let xScale, yScale;
let brushSelection = null;

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            let commitObj = {
                id: commit,
                url: `https://github.com/YOUR_REPO/commit/${commit}`,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(commitObj, 'lines', {
                value: lines,
                writable: false,
                enumerable: false,
                configurable: false,
            });

            return commitObj;
        });
}

function displayStats() {
    processCommits(); 

    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total Lines of code');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    const fileCount = d3.groups(data, (d) => d.file).length;
    dl.append('dt').text('Total files');
    dl.append('dd').text(fileCount);

    const maxFileLength = d3.max(data, (d) => d.line);
    dl.append('dt').text('Longest file length');
    dl.append('dd').text(maxFileLength);

    const avgFileLength = d3.mean(data, (d) => d.line).toFixed(0);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength);

    const daysWorked = new Set(commits.map((d) => d.datetime.toISOString().split('T')[0])).size;
    dl.append('dt').text('Days Worked');
    dl.append('dd').text(daysWorked);
    
    const workByDay = d3.rollups(commits, (v) => v.length, (d) => d.datetime.getDay());
    const mostActiveDay = d3.greatest(workByDay, (d) => d[1])?.[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dl.append('dt').text('Most Work On');
    dl.append('dd').text(dayNames[mostActiveDay]);

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => d.datetime.toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    dl.append('dt').text('Most work done during');
    dl.append('dd').text(maxPeriod);
}

function createScatterplot() {
  if (!commits.length) return; 

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.top, usableArea.bottom]);

  const gridlines = g.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickSize(-usableArea.width)
      .tickFormat('')
  );
  
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const sortedCommits = d3.sort(commits, d => -d.totalLines);

  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on('start brush end', brushed);

  g.append('g').attr('class', 'brush').call(brush);

  g.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  d3.select(svg.node()).selectAll('.dots, .overlay ~ *').raise();

  g.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));
}

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: +row.line,  
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    processCommits();
    displayStats();
    createScatterplot();
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  const offset = 10; 

  let x = event.clientX + offset;
  let y = event.clientY + offset;

  if (x + tooltipWidth > window.innerWidth) {
    x = event.clientX - tooltipWidth - offset;
  }
  if (y + tooltipHeight > window.innerHeight) {
    y = event.clientY - tooltipHeight - offset;
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}


function updateSelection() {
  d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
  document.getElementById('selection-count').textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap(d => d.lines);

  const breakdown = d3.rollup(lines, v => v.length, d => d.type);

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}
