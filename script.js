// Select the SVG
const svg = d3.select("#map");
const width = parseInt(svg.style("width"));
const height = parseInt(svg.style("height"));

// Map projection (turns lat/long into x/y)
const projection = d3.geoNaturalEarth1()
  .scale(width / 6.5)
  .translate([width / 2, height / 2]);

// GeoPath generator
const path = d3.geoPath().projection(projection);

// Load world map (GeoJSON)
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .then(worldData => {

    // Draw the shapes
    svg.selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#bcd9ea")
      .attr("stroke", "#333");
  })
  .catch(err => console.error("Error loading map:", err));