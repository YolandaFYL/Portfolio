let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: +row.line,  
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    displayStats();
}

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

    // Total Lines of Code
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Total Commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Number of distinct files
    const fileCount = d3.groups(data, (d) => d.file).length;
    dl.append('dt').text('Total files');
    dl.append('dd').text(fileCount);

    // Maximum file length (in lines)
    const maxFileLength = d3.max(data, (d) => d.line);
    dl.append('dt').text('Longest file length');
    dl.append('dd').text(maxFileLength);

    // Average file length
    const avgFileLength = d3.mean(data, (d) => d.line).toFixed(0);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength);

    // Deepest line (max depth)
    const maxDepth = d3.max(data, (d) => d.depth);
    dl.append('dt').text('Deepest line');
    dl.append('dd').text(maxDepth);

    // Time of day most work is done
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => d.datetime.toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    dl.append('dt').text('Most work done during');
    dl.append('dd').text(maxPeriod);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
