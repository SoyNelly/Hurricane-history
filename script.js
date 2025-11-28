// ATLANTIC HURRICANE VISUALIZATION DASHBOARD

// Global state
let allHurricanes = [];
let summaryData = {};
let filteredHurricanes = [];
let worldData = null;

// Category colors (using the Saffir-Simpson scale)
const categoryColors = {
  'TD': '#74b9ff',
  'TS': '#0984e3',
  'Cat1': '#fdcb6e',
  'Cat2': '#e17055',
  'Cat3': '#d63031',
  'Cat4': '#a29bfe',
  'Cat5': '#6c5ce7'
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
  filteredHurricanes = [...allHurricanes];
  
  console.log(`Loaded ${allHurricanes.length} hurricanes`);
  
  // Initialize visualizations
  initializeMap();
  initializeTimeline();
  initializeCategoryChart();
  
  // Setup interactions
  setupControls();
  
}).catch(err => {
  console.error("Error loading data:", err);
  document.body.innerHTML += `<div style="color: red; padding: 20px;">Error loading data: ${err.message}</div>`;
});

// MAP VISUALIZATION

function initializeMap() {
  const svg = d3.select("#map");
  const width = svg.node().getBoundingClientRect().width;
  const height = 500;
  
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  // Clear existing content
  svg.selectAll("*").remove();
  
  // Map projection
  const projection = d3.geoMercator()
    .center([-60, 25])
    .scale(width / 4)
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
  updateMap();
  
  // Create legend
  createMapLegend();
}

function updateMap() {
  const svg = d3.select("#map");
  const width = svg.node().getBoundingClientRect().width;
  const height = 500;
  
  const projection = d3.geoMercator()
    .center([-60, 25])
    .scale(width / 4)
    .translate([width / 2, height / 2]);
  
  // Remove existing tracks
  svg.selectAll(".hurricane-track").remove();
  
  // Sampling tracks if too many (for performance)
  const maxTracks = 200;
  const sampled = filteredHurricanes.length > maxTracks 
    ? filteredHurricanes.filter((_, i) => i % Math.ceil(filteredHurricanes.length / maxTracks) === 0)
    : filteredHurricanes;
  
  // Draw tracks
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
      showTooltip(event, `
        <strong>${d.name}</strong><br>
        Year: ${d.year}<br>
        Category: ${d.category}<br>
        Max Wind: ${d.maxWind} knots
      `);
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

// TIMELINE VISUALIZATION

function initializeTimeline() {
  updateTimeline();
}

function updateTimeline() {
  const svg = d3.select("#timeline");
  const width = svg.node().getBoundingClientRect().width;
  const height = 300;
  const margin = {top: 20, right: 30, bottom: 50, left: 60};
  
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  //get data option from dropdown menu and set values for y axis title
  const count_t = d3.select("#timelineMetric").property("value");

  const titles = {
    count: "Hurricanes Per Year",
    major: "Major Hurricanes (Cat 3+) Per Year"
  };

  //further filter data to get specific attribute asked for
  const count_filtered = filteredHurricanes.filter(d =>{
    if(count_t == "count"){return true;}
    if(count_t == "major"){return d.category[3] >= 3;}
    return true;
  });

  // Aggregate data by year
  const yearCounts = d3.rollup(
    count_filtered,
    v => v.length,
    d => d.year
  );
  

  const data = Array.from(yearCounts, ([year, count]) => ({year, count}))
    .sort((a, b) => a.year - b.year);
  
  // Scales
  const x = d3.scaleBand()
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
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", "#3498db")
    .on("mouseover", function(event, d) {
      showTooltip(event, `Year: ${d.year}<br>Hurricanes: ${d.count}`);
      d3.select(this).attr("fill", "#e74c3c");
    })
    .on("mouseout", function() {
      hideTooltip();
      d3.select(this).attr("fill", "#3498db");
    });
  
  // X Axis
  const xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues(x.domain().filter((d, i) => i % 5 === 0)));
  
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
    .text(titles[count_t]);
}

// CATEGORY DISTRIBUTION CHART

function initializeCategoryChart() {
  updateCategoryChart();
}

function updateCategoryChart() {
  const svg = d3.select("#categoryChart");
  const width = svg.node().getBoundingClientRect().width;
  const height = 300;
  const margin = {top: 20, right: 30, bottom: 50, left: 60};
  
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  
  // Aggregate data by category
  const categoryCounts = d3.rollup(
    filteredHurricanes,
    v => v.length,
    d => d.category
  );
  
  const data = categoryOrder.map(cat => ({
    category: cat,
    count: categoryCounts.get(cat) || 0
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
  
  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.category))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", d => categoryColors[d.category])
    .on("mouseover", function(event, d) {
      showTooltip(event, `Category: ${d.category}<br>Count: ${d.count}`);
      d3.select(this).style("opacity", 0.7);
    })
    .on("mouseout", function() {
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
    .text("Number of Storms");
}


// INTERACTIVE CONTROLS

function setupControls() {
  // Year range sliders
  const yearStart = d3.select("#yearStart");
  const yearEnd = d3.select("#yearEnd");
  const yearStartLabel = d3.select("#yearStartLabel");
  const yearEndLabel = d3.select("#yearEndLabel");
  
  yearStart.on("input", function() {
    yearStartLabel.text(this.value);
    updateFilters();
  });
  
  yearEnd.on("input", function() {
    yearEndLabel.text(this.value);
    updateFilters();
  });
  
  // Category filters
  d3.selectAll(".cat-filter").on("change", updateFilters);
  
  // Reset button
  d3.select("#resetBtn").on("click", () => {
    yearStart.property("value", 1950);
    yearEnd.property("value", 2015);
    yearStartLabel.text("1950");
    yearEndLabel.text("2015");
    d3.selectAll(".cat-filter").property("checked", true);
    updateFilters();
  });
  d3.select("#timelineMetric").on("change",updateTimeline)
}

function updateFilters() {
  const yearStart = +d3.select("#yearStart").property("value");
  const yearEnd = +d3.select("#yearEnd").property("value");
  
  const selectedCategories = [];
  d3.selectAll(".cat-filter").each(function() {
    if (this.checked) {
      selectedCategories.push(this.value);
    }
  });
  
  // Filter hurricanes
  filteredHurricanes = allHurricanes.filter(h => 
    h.year >= yearStart && 
    h.year <= yearEnd &&
    selectedCategories.includes(h.category)
  );
  
  console.log(`Filtered: ${filteredHurricanes.length} hurricanes`);
  
  // Update all visualizations
  updateMap();
  updateTimeline();
  updateCategoryChart();
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
