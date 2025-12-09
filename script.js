// ATLANTIC HURRICANE VISUALIZATION DASHBOARD


// Global state
let allHurricanes = [];
let summaryData = {};
let worldData = null;

// Filter state (controlled by visualizations)
let selectedYears = [1950, 2015];
let selectedCategories = new Set(['TD', 'TS', 'Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']);

// Category colors
const categoryColors = {
  TD:   "#1b4f72",
  TS:   "#117a65",
  Cat1: "#9c640c",
  Cat2: "#cb4335",
  Cat3: "#7d3c98",
  Cat4: "#e91e63",
  Cat5: "#5d0000"
};

const categoryOrder = ['TD', 'TS', 'Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5'];

// LOAD DATA

Promise.all([
  d3.json("hurricane_data.json"),
  d3.json("hurricane_summary.json"),
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
]).then(([hurricaneData, summary, world]) => {
  allHurricanes = hurricaneData.hurricanes;
  summaryData = summary;
  worldData = world;
  
  console.log(`Loaded ${allHurricanes.length} hurricanes`);
  
  // Initialize all visualizations
  initializeMap();
  initializeTimeline();
  initializeCategoryChart();
  
}).catch(err => {
  console.error("Error loading data:", err);
  document.body.innerHTML += `<div style="color: red; padding: 20px;">Error loading data: ${err.message}</div>`;
});

// FILTER FUNCTION
function getFilteredHurricanes() {
  return allHurricanes.filter(h => 
    h.year >= selectedYears[0] && 
    h.year <= selectedYears[1] &&
    selectedCategories.has(h.category)
  );
}

// MAP VISUALIZATION

function initializeMap() {
  updateMap();
  createMapLegend();
}

function updateMap() {
  const svg = d3.select("#map");
  const container = svg.node().parentElement;
  const width = container.clientWidth - 30;
  const height = container.clientHeight - 80;
  
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  const projection = d3.geoMercator()
  .center([-60, 25])
  .scale(width / 2.5)
  .translate([width / 2, height / 2]);
  
  const path = d3.geoPath().projection(projection);
  
  // Draw world map
  svg.selectAll("path.country")
    .data(worldData.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", "#e8f4e8")
    .attr("stroke", "#95a5a6")
    .attr("stroke-width", 0.5);
  
  // Draw hurricane tracks
  const filteredHurricanes = getFilteredHurricanes();
  const maxTracks = 200;
  const sampled = filteredHurricanes.length > maxTracks 
    ? filteredHurricanes.filter((_, i) => i % Math.ceil(filteredHurricanes.length / maxTracks) === 0)
    : filteredHurricanes;
  
  const line = d3.line()
    .x(d => projection([d.lon, d.lat])[0])
    .y(d => projection([d.lon, d.lat])[1]);
  
  svg.selectAll(".hurricane-track")
    .data(sampled)
    .enter()
    .append("path")
    .attr("class", "hurricane-track")
    .attr("d", d => line(d.track))
    .attr("stroke", d => categoryColors[d.category])
    .on("mouseover", function(event, d) {
      showTooltip(event, `<strong>${d.name}</strong><br>Year: ${d.year}<br>Category: ${d.category}<br>Max Wind: ${d.maxWind} knots`);
      d3.select(this).style("opacity", 1).style("stroke-width", 3);
    })
    .on("mouseout", function() {
      hideTooltip();
      d3.select(this).style("opacity", 0.6).style("stroke-width", 1.5);
    });
}

function createMapLegend() {
  const legend = d3.select("#mapLegend");
  legend.selectAll("*").remove();
  
  categoryOrder.forEach(cat => {
    const item = legend.append("div").attr("class", "legend-item");
    item.append("div")
      .attr("class", "legend-color")
      .style("background-color", categoryColors[cat]);
    item.append("span").text(cat);
  });
}

// TIMELINE WITH BRUSHING

let timelineBrush = null;
let timelineXScale = null;

function initializeTimeline() {
  updateTimeline();
}

function updateTimeline() {
  const svg = d3.select("#timeline");
  const container = svg.node().parentElement;
  const width = container.clientWidth - 30;
  const height = container.clientHeight - 60;
  const margin = {top: 10, right: 20, bottom: 40, left: 50};
  
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  // Get ALL data (not filtered by year, but by category)
  const filteredByCategory = allHurricanes.filter(h => selectedCategories.has(h.category));
  
  const yearCounts = d3.rollup(
    filteredByCategory,
    v => v.length,
    d => d.year
  );
  
  const data = Array.from(yearCounts, ([year, count]) => ({year, count}))
    .sort((a, b) => a.year - b.year);
  
  // Scales
  timelineXScale = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  
  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => timelineXScale(d.year))
    .attr("y", d => y(d.count))
    .attr("width", timelineXScale.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", d => {
      // Highlight bars in selected range
      return (d.year >= selectedYears[0] && d.year <= selectedYears[1]) ? "#3498db" : "#bdc3c7";
    })
    .on("mouseover", function(event, d) {
      showTooltip(event, `Year: ${d.year}<br>Hurricanes: ${d.count}`);
    })
    .on("mouseout", hideTooltip);
  
  // X Axis
  const xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(timelineXScale)
      .tickValues(timelineXScale.domain().filter((d, i) => i % 5 === 0)));
  
  xAxis.selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");
  
  // Y Axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  
  // Y Axis label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Count");
  
  // ADD BRUSH
  timelineBrush = d3.brushX()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("end", brushed);
  
  svg.append("g")
    .attr("class", "brush")
    .call(timelineBrush);
  
  // Set initial brush
  const x1 = timelineXScale(selectedYears[0]);
  const x2 = timelineXScale(selectedYears[1]) + timelineXScale.bandwidth();
  svg.select(".brush").call(timelineBrush.move, [x1, x2]);
}

function brushed(event) {
  if (!event.selection) return;
  
  const [x0, x1] = event.selection;
  
  // Find years in brush range
  const years = timelineXScale.domain().filter(year => {
    const xPos = timelineXScale(year) + timelineXScale.bandwidth() / 2;
    return xPos >= x0 && xPos <= x1;
  });
  
  if (years.length > 0) {
    selectedYears = [Math.min(...years), Math.max(...years)];
    console.log(`Brushed years: ${selectedYears[0]} - ${selectedYears[1]}`);
    
    // Update other visualizations
    updateMap();
    updateCategoryChart();
    
    // Update bar colors
    d3.select("#timeline").selectAll(".bar")
      .attr("fill", d => {
        return (d.year >= selectedYears[0] && d.year <= selectedYears[1]) ? "#3498db" : "#bdc3c7";
      });
  }
}

// CATEGORY CHART WITH CLICK TO TOGGLE


function initializeCategoryChart() {
  updateCategoryChart();
}

function updateCategoryChart() {
  const svg = d3.select("#categoryChart");
  const container = svg.node().parentElement;
  const width = container.clientWidth - 30;
  const height = container.clientHeight - 60;
  const margin = {top: 10, right: 20, bottom: 40, left: 50};
  
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  // Filter by year only
  const filteredByYear = allHurricanes.filter(h => 
    h.year >= selectedYears[0] && h.year <= selectedYears[1]
  );
  
  const categoryCounts = d3.rollup(
    filteredByYear,
    v => v.length,
    d => d.category
  );
  
  const data = categoryOrder.map(cat => ({
    category: cat,
    count: categoryCounts.get(cat) || 0,
    selected: selectedCategories.has(cat)
  }));
  
  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([margin.left, width - margin.right])
    .padding(0.3);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  
  // Bars with click interaction
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.category))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", d => d.selected ? categoryColors[d.category] : "#bdc3c7")
    .attr("stroke", d => d.selected ? "#2c3e50" : "none")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("click", function(event, d) {
      // Toggle category
      if (selectedCategories.has(d.category)) {
        selectedCategories.delete(d.category);
      } else {
        selectedCategories.add(d.category);
      }
      
      console.log(`Clicked ${d.category}, now selected:`, Array.from(selectedCategories));
      
      // Update all visualizations
      updateMap();
      updateTimeline();
      updateCategoryChart();
    })
    .on("mouseover", function(event, d) {
      showTooltip(event, `Category: ${d.category}<br>Count: ${d.count}<br><em>Click to ${d.selected ? 'hide' : 'show'}</em>`);
      if (d.selected) {
        d3.select(this).style("opacity", 0.7);
      }
    })
    .on("mouseout", function(event, d) {
      hideTooltip();
      d3.select(this).style("opacity", 1);
    });
  
  // X Axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  
  // Y Axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  
  // Y Axis label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Count");
}


// TOOLTIP HELPERS

function showTooltip(event, html) {
  const tooltip = d3.select("#tooltip");
  tooltip.html(html)
    .classed("show", true)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
}

function hideTooltip() {
  d3.select("#tooltip").classed("show", false);
}
