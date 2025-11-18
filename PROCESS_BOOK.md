# Atlantic Hurricane History Dashboard - Process Book
**Project by:** Andrianna Arroyo, Cameron Del Collo, Donnell Washington 
**Course:** CPSC 4030/6030 - Data Visualization  
**Date:** November 2025

---

## 1. Overview and Motivation

### Project Goal
This project aims to create an interactive web-based visualization dashboard that explores the history of Atlantic hurricanes from 1950 to 2015. The goal is to enable users to understand patterns in hurricane frequency, intensity, and geographical distribution over time.

### Motivation
Hurricanes are among the most destructive natural disasters, causing billions of dollars in damage and countless lives lost. By understanding historical patterns in hurricane activity we learn it is crucial for:
- **Climate Research**: Identifying trends in hurricane frequency and intensity related to climate change
- **Disaster Preparedness**: Helping coastal communities understand their risk exposure
- **Public Awareness**: Educating the general public about hurricane patterns and severity
- **Policy Making**: Informing decisions about infrastructure and emergency response systems

### Target Audience
- Climate scientists and researchers
- Emergency management professionals
- Educators and students
- General public interested in weather patterns and natural disasters

---

## 2. Related Work

### Inspiration Sources
1. **NOAA's Historical Hurricane Tracks Tool**
   - Provided inspiration for the map-based visualization approach
   - Showed the effectiveness of color-coding by intensity
   - Website: https://coast.noaa.gov/hurricanes/

2. **New York Times Hurricane Visualizations**
   - Demonstrated effective use of interactive timelines
   - Inspired the clean, minimalist design aesthetic
   - Showed how to combine multiple coordinated views

3. **D3.js Gallery Examples**
   - Mike Bostock's map projections tutorials
   - Interactive filtering examples
   - Responsive design patterns

4. **Scientific Papers**
   - "Increasing destructiveness of tropical cyclones over the past 30 years" (Emanuel, 2005)
   - Informed the categorization and metrics used

### Design Principles Applied
- **Visual Hierarchy**: Large map as primary focus, supporting charts below
- **Color Theory**: Used perceptually ordered color scales (blue→yellow→red) for intensity
- **Preattentive Processing**: Color coding allows instant recognition of hurricane categories
- **Progressive Disclosure**: Tooltips provide details on demand

---

## 3. Questions

### Initial Research Questions
1. How has the frequency of hurricanes changed over the past 65 years?
2. What is the distribution of hurricane categories (intensity)?
3. Which geographic regions are most frequently affected?
4. Are there temporal patterns (seasonal, decadal)?

### Evolved Questions
As we explored the data, new questions emerged:
- How do category 5 hurricanes compare in frequency to lower categories?
- What was the most active hurricane year?
- How do individual storm tracks vary by intensity?
- Can we identify any long-term trends in maximum wind speeds?

### Questions Answered by Visualizations
- **Map**: Shows geographic distribution and preferred paths
- **Timeline**: Reveals year-to-year variation and potential trends
- **Category Chart**: Displays intensity distribution across all storms
- **Interactive Filters**: Allows exploration of specific time periods and categories

---

## 4. Data

### Data Source
**NOAA Atlantic Hurricane Database (HURDAT2)**
- Source: National Oceanic and Atmospheric Administration
- Accessed via: Kaggle (noaa/hurricane-database)
- Coverage: 1851-2015
- Our Focus: 1950-2015 (modern era with better data quality)

### Data Structure
- **Total Records**: 49,105 data points
- **Unique Storms**: 1,814 hurricanes (989 in modern era)
- **Attributes**: 22 columns including:
  - Storm ID and Name
  - Date and Time
  - Latitude/Longitude coordinates
  - Maximum sustained wind speed
  - Minimum pressure
  - Wind radii in four quadrants

### Data Scraping/Collection Method
```python
import kagglehub
path = kagglehub.dataset_download("noaa/hurricane-database")
```

### Data Cleanup Process
1. **Coordinate Parsing**: Converted string format (e.g., "28.0N", "80.0W") to decimal degrees
2. **Date Parsing**: Extracted year, month, day from YYYYMMDD format
3. **Invalid Data Filtering**: Removed records with:
   - Negative wind speeds (data quality flags)
   - Missing coordinate data
4. **Category Classification**: Implemented Saffir-Simpson scale:
   - TD (Tropical Depression): < 34 knots
   - TS (Tropical Storm): 34-63 knots
   - Category 1-5: Based on wind speed thresholds
5. **Time Period Selection**: Focused on 1950-2015 for data reliability
6. **Format Conversion**: Converted CSV to JSON for efficient D3.js loading

### Data Quality Issues
- Pre-1950 data has reliability concerns (fewer observations, less accurate measurements)
- Missing pressure data for some storms
- Wind radii often recorded as -999 (missing values)
- Storm naming conventions changed over time

---

## 5. Exploratory Data Analysis

### Initial Visualizations
Before building the final dashboard, we explored the data using Python:

**Basic Statistics:**
- Mean max wind speed: 52 knots
- Standard deviation: 28 knots
- Range: 10-165 knots
- Total storms (1950-2015): 989

**Key Insights from EDA:**

1. **Category Distribution Discovery**
   - Most storms are Tropical Depressions/Storms (TD: 944, TS: 766)
   - Major hurricanes (Cat 3-5) are relatively rare (278 total)
   - Category 5 storms are very rare (22 in 65 years)

2. **Temporal Patterns**
   - High variability in yearly counts
   - Some years have 25+ storms, others have fewer than 10
   - Potential clustering in certain decades

3. **Geographic Patterns**
   - Most storms originate in the tropical Atlantic
   - Common paths: Caribbean → Gulf of Mexico, or Atlantic → US East Coast
   - Storms rarely penetrate far inland

### How EDA Informed Design
- **Color Scale**: Rare Cat 5 storms needed distinct purple color to stand out
- **Map Projection**: Mercator projection chosen to focus on Atlantic basin
- **Filtering**: Year range critical since data quality varies
- **Performance**: 989 storms too many to render all at once → sampling strategy

---

## 6. Design Evolution

**Limitations Identified:**
- Hard to see temporal trends with just a map
- No way to understand category distribution
- Visual clutter with all tracks shown

### Design Iteration 1: Multiple Views
Added supporting visualizations:
- Timeline bar chart to show counts by year
- Category distribution chart
- This provided better analytical capability

### Design Iteration 2: Enhanced Interactivity
- Added category checkboxes for filtering
- Dual sliders for year range selection
- Tooltips for detailed information
- Reset button for convenience

### Design Iteration 3: Visual Refinement
- Improved color palette based on ColorBrewer principles
- Added gradients and shadows for modern look
- Responsive layout for different screen sizes
- Legend for map interpretation

### Final Design Decisions & Justifications

**1. Map Projection Choice: Mercator**
- **Why**: Preserves angles and shapes, familiar to users
- **Trade-off**: Distorts areas at high latitudes (acceptable for our region)
- **Alternative Considered**: Natural Earth (too much distortion for hurricane paths)

**2. Color Encoding for Categories**
- **Why**: Color is the most efficient preattentive attribute for categorical data
- **Principle Applied**: Progressive color intensity matches increasing danger
- **Scale**: Blue (low) → Yellow (moderate) → Red (high) → Purple (extreme)
- **Accessibility**: Tested with ColorBrewer for color-blind safety

**3. Layout: Map Above, Charts Below**
- **Why**: F-pattern reading flow; map is most important visualization
- **Principle**: Visual hierarchy through size and position
- **Supporting Views**: Provide context without competing for attention

**4. Interaction Design**
- **Filtering over Details-on-Demand**: Users want to explore subsets
- **Range Sliders**: More intuitive than dropdown menus for temporal data
- **Checkboxes**: Allow multiple category selection (OR logic)
- **Hover Tooltips**: Details on demand without cluttering interface

**5. Performance Optimization**
- **Sampling Strategy**: Display max 200 tracks to prevent rendering lag
- **Trade-off**: Some storms not shown, but overall patterns preserved
- **Alternative**: Could add "Show All" toggle for powerful machines

### Deviations from Proposal
- **Added**: Category distribution chart (not in original plan)
- **Changed**: Switched from Natural Earth to Mercator projection
- **Enhanced**: More sophisticated filtering than originally proposed
- **Simplified**: Removed pressure visualization (wind speed more intuitive)

---

## 7. Implementation

### Technology Stack
- **D3.js v7**: Core visualization library
- **HTML5/CSS3**: Structure and styling
- **Vanilla JavaScript**: Interactivity and data processing
- **Python**: Data preprocessing (pandas, kagglehub)

### Key Implementation Components

#### 1. Hurricane Tracks Map
**Intent**: Show geographic distribution and preferred paths of Atlantic hurricanes

**Functionality**:
- Renders world basemap using GeoJSON
- Draws hurricane tracks as colored paths
- Color-coded by Saffir-Simpson category
- Interactive hover for storm details

**Technical Approach**:
```javascript
const projection = d3.geoMercator()
  .center([-60, 25])  // Focus on Atlantic
  .scale(width / 4);

const line = d3.line()
  .x(d => projection([d.lon, d.lat])[0])
  .y(d => projection([d.lon, d.lat])[1]);
```

**Design Elements**:
- Semi-transparent tracks (opacity: 0.6) to show overlaps
- Hover increases opacity and stroke width for emphasis
- Sampling for performance (max 200 tracks)


#### 2. Temporal Timeline (Bar Chart)
**Intent**: Reveal year-to-year variation in hurricane frequency

**Functionality**:
- Aggregates storms by year
- Bar height represents count
- Interactive tooltips show exact numbers
- Updates dynamically with filters

**Technical Approach**:
```javascript
const yearCounts = d3.rollup(
  filteredHurricanes,
  v => v.length,
  d => d.year
);
```

**Design Elements**:
- X-axis shows every 5th year to reduce clutter
- Rotated labels for readability
- Consistent blue color
- Hover changes color to red for feedback

#### 3. Category Distribution Chart
**Intent**: Show relative frequency of different hurricane intensities

**Functionality**:
- Groups storms by Saffir-Simpson category
- Bar height shows count per category
- Color matches map legend for consistency
- Updates with active filters

**Technical Approach**:
```javascript
const categoryCounts = d3.rollup(
  filteredHurricanes,
  v => v.length,
  d => d.category
);
```

**Design Elements**:
- Ordered left-to-right by increasing intensity
- Category-specific colors for easy matching to map
- Logarithmic scale considered but rejected (linear more honest)

#### 4. Interactive Filtering System
**Intent**: Allow users to explore specific subsets of the data

**Components**:
- **Year Range Sliders**: Two HTML5 range inputs with live labels
- **Category Checkboxes**: Multi-select for intensity filtering
- **Reset Button**: Return to default view

**Update Flow**:
1. User adjusts filter controls
2. Event listeners trigger `updateFilters()`
3. Data is filtered based on current selections
4. All three visualizations update simultaneously
5. Console logs filtered count for debugging

**Code Architecture**:
```javascript
function updateFilters() {
  // Get current filter values
  // Filter hurricane array
  // Update all visualizations
  updateMap();
  updateTimeline();
  updateCategoryChart();
}
```

#### 5. Tooltip System
**Intent**: Provide details on demand without visual clutter

**Features**:
- Appears on hover over any interactive element
- Shows context-specific information
- Follows mouse cursor with offset
- Smooth fade in/out transitions

**Information Displayed**:
- Map tracks: Storm name, year, category, max wind
- Timeline bars: Year and count
- Category bars: Category name and count

### Data Processing Pipeline
1. **Download**: Kaggle API retrieves NOAA dataset
2. **Parse**: Python script reads CSV, processes coordinates
3. **Transform**: Apply category classification, filter by date
4. **Aggregate**: Create summary statistics
5. **Export**: Save as JSON for web consumption
6. **Load**: D3.js fetches JSON files on page load

### Responsive Design
- CSS Grid for flexible layout
- SVG viewBox for scalable graphics
- Media queries for mobile devices
- Maintains aspect ratios across screen sizes

---

## 8. Evaluation

### Insights Gained

#### 1. Frequency Patterns
**Finding**: Hurricane activity varies dramatically year-to-year
- 2005 was the most active year (28 storms visible in timeline)
- Some years have fewer than 5 storms
- No clear linear trend over 65 years (refutes simple climate narrative)

**Visualization Effectiveness**: Timeline chart makes this pattern immediately obvious

#### 2. Category Distribution
**Finding**: Intensity follows expected exponential distribution
- Most storms remain weak (TD/TS)
- Major hurricanes (Cat 3-5) are much rarer
- Category 5 storms are extremely rare (22 in 65 years ≈ 1 every 3 years)

**Visualization Effectiveness**: Bar chart clearly shows this exponential decay

#### 3. Geographic Patterns
**Finding**: Clear preferred tracks emerge
- Most storms originate off African coast or in Caribbean
- Common paths: northward curve along US East Coast
- Gulf of Mexico is a frequent target
- Very few storms cross into Pacific

**Visualization Effectiveness**: Map overlay reveals patterns that would be impossible to see in tabular data

#### 4. Intensity and Location
**Finding**: Strongest storms tend to follow specific paths
- Category 4-5 storms often track through Caribbean
- Storms weaken rapidly over land
- Open ocean storms can maintain intensity longer

**Visualization Effectiveness**: Color-coded map allows instant pattern recognition

### Questions Answered

**How has frequency changed over time?**
- High variability, some indication of increased activity in 1990s-2000s
- No simple linear trend

**What is the category distribution?**
- Exponential: Most storms weak, few are major hurricanes

**Which regions most affected?**
- Caribbean, Gulf Coast, US East Coast most vulnerable

**Are there temporal patterns?**
- Inter-annual variability is high
- Possible decadal clustering (would need longer timeframe to confirm)

### Visualization Strengths

1. **Map Visualization**
   - Excellent for showing geographic patterns
   - Color encoding works well for categories
   - Interactive hover provides details without clutter
   - Sampling maintains performance

2. **Timeline Chart**
   - Year-to-year comparison is intuitive
   - Identifies anomalous years (2005) immediately
   - Supports trend analysis

3. **Category Chart**
   - Distribution is immediately clear
   - Color consistency with map aids understanding
   - Simple and effective

4. **Interaction Design**
   - Filters are intuitive and responsive
   - Multiple views update in sync
   - Reset button prevents "lost" users

### Limitations and Potential Improvements

#### Current Limitations

1. **Map Clutter**
   - **Issue**: Even with sampling, 200 tracks can overlap confusingly
   - **Impact**: Individual storms hard to trace
   - **Potential Fix**: Add "click to highlight single storm" interaction

2. **Temporal Resolution**
   - **Issue**: Yearly aggregation hides seasonal patterns
   - **Impact**: Can't see that most hurricanes occur August-October
   - **Potential Fix**: Add monthly breakdown chart or seasonal filter

3. **Intensity Over Time**
   - **Issue**: Can't see if storms are getting stronger over decades
   - **Impact**: Climate change question unanswered
   - **Potential Fix**: Add line chart showing max wind speed trend

4. **Limited Storm Details**
   - **Issue**: Tooltips show minimal information
   - **Impact**: Can't explore individual famous storms in depth
   - **Potential Fix**: Side panel with detailed storm info on click

5. **No Landfall Data**
   - **Issue**: Can't distinguish between open-ocean and landfall storms
   - **Impact**: Missing important context for damage/impact
   - **Potential Fix**: Add coastal boundary detection and landfall markers

6. **Performance on Large Datasets**
   - **Issue**: Sampling required, not all storms shown
   - **Impact**: Some storms omitted from map view
   - **Potential Fix**: Implement clustering or on-demand loading

#### Future Enhancements

1. **Additional Data Layers**
   - Add sea surface temperature data maybe?
   - possibly show El Niño/La Niña years
   - Include damage estimates (economic impact)

2. **Comparative Analysis**
   - Compare Atlantic vs Pacific basins
   - Show multi-decadal cycles (AMO, NAO)

3. **Animation**
   - Animate storm progression over time
   - Year-by-year playback of all storms

4. **Predictive Elements**
   - Show forecast cones for recent storms
   - Display uncertainty in historical measurements

5. **Accessibility**
   - Add screen reader support
   - Keyboard navigation for filters
   - Text descriptions of patterns

### How Well Does It Work?

**Overall Assessment: Strong Success**

**Strengths:**
- Achieves primary goal: makes hurricane patterns visible and explorable
- Multiple coordinated views provide comprehensive analysis
- Interaction design is intuitive
- Visual design is clean and professional
- Performance is acceptable even with large dataset

**Weaknesses:**
- Map can still be cluttered
- Limited to exploratory analysis (no statistical modeling)
- Some interesting questions remain unanswered

**User Feedback** (if collected):
- Positive: "Easy to use, patterns immediately visible"
- Suggestion: "Would love to search for specific storms by name"

---

## 9. Conclusion

### Project Outcomes
This project successfully created a fully functional interactive dashboard for exploring Atlantic hurricane history. The combination of a map-based geographic view with supporting temporal and categorical analyses provides a comprehensive tool for understanding hurricane patterns.

### Key Takeaways

1. **Multiple Views Are Essential**: No single chart can tell the complete story
2. **Interaction Enables Discovery**: Filters allow users to find their own insights
3. **Performance Matters**: Had to make sampling trade-offs for responsiveness
4. **Design Iteration Is Crucial**: Initial designs had significant limitations
5. **Data Quality Impacts Results**: Modern era (1950+) much more reliable

### Skills Developed
- D3.js proficiency (maps, charts, interactions)
- Data processing pipeline (Python → JSON → D3)
- Responsive web design
- Visual encoding principles
- User interaction design

### Reflection
Building this dashboard reinforced the importance of iterative design. Our initial concept of "just a map" evolved significantly through EDA and user considerations. The most valuable lesson was balancing analytical power with simplicity—it's easy to add features, but maintaining clarity is harder.

The project also highlighted the challenges of working with real-world data: missing values, quality issues, and performance constraints all required careful handling.

---

## 10. References

### Data Source
- NOAA National Hurricane Center. (2015). *Atlantic Hurricane Database (HURDAT2)*. Retrieved from https://www.kaggle.com/datasets/noaa/hurricane-database

### Inspiration
- NOAA Office for Coastal Management. *Historical Hurricane Tracks*. https://coast.noaa.gov/hurricanes/
- New York Times Graphics Department. Various hurricane visualizations.
- Mike Bostock. *D3.js Gallery*. https://observablehq.com/@d3/gallery

### Technical Documentation
- D3.js v7 Documentation. https://d3js.org/
- Bostock, M., Ogievetsky, V., & Heer, J. (2011). "D3: Data-Driven Documents." *IEEE Trans. Visualization & Comp. Graphics*.

### Design Principles
- Munzner, T. (2014). *Visualization Analysis and Design*. CRC Press.
- Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. Graphics Press.

### Hurricane Science
- National Hurricane Center. *Saffir-Simpson Hurricane Wind Scale*. https://www.nhc.noaa.gov/aboutsshws.php
- Emanuel, K. (2005). "Increasing destructiveness of tropical cyclones over the past 30 years." *Nature*, 436, 686-688.

---

## Appendix: Code Repository
GitHub Repository: https://github.com/SoyNelly/Hurricane-history

**Files:**
- `index.html` - Main webpage structure
- `styles.css` - Visual styling and layout
- `script.js` - D3.js visualizations and interactions
- `process_data.py` - Python data preprocessing script
- `hurricane_data.json` - Processed hurricane track data
- `hurricane_summary.json` - Aggregated statistics
- `README.md` - Project documentation

---

**End of Process Book for now**
