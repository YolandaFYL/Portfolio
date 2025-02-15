let data = [];
let commits = [];
const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 20 };

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

    const maxDepth = d3.max(data, (d) => d.depth);
    dl.append('dt').text('Deepest line');
    dl.append('dd').text(maxDepth);

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

  const xScale = d3.scaleTime()
      .domain(d3.extent(commits, d => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();

  const yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);

  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
      .data(commits)
      .join('circle')
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => yScale(d.hourFrac))
      .attr('r', 5)
      .attr('fill', 'steelblue');

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);

  svg.append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);
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
