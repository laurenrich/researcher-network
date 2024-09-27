const data = [
    { category: 'Professor', avg: 2.17 },
    { category: 'Assistant Professor', avg: 2.46 },
    { category: 'Endowed Professor', avg: 2.36 },
    { category: 'Associate Professor', avg: 2.34 },
    
]

const width = 600;
const height = 400;
const margin = { top: 20, right: 30, bottom: 60, left: 50 };


const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left + 50},${margin.top})`);


const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2)

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.avg)])
    .range([height, 0])

svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`) 
    .call(d3.axisBottom(x))
     

svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))  

svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.category))
    .attr('y', d => y(d.avg))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.avg))


svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(-40, ${height / 2}) rotate(-90)`)
    .text('Average Number of Connections'); 

