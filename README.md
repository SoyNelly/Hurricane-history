# Atlantic Hurricane History Dashboard

An interactive data visualization dashboard exploring 989 Atlantic hurricanes from 1950-2015 using D3.js.

## Project Overview

This project visualizes historical Atlantic hurricane data from the NOAA Hurricane Database, providing interactive tools to explore:
- Geographic distribution of hurricane tracks
- Temporal patterns in hurricane frequency
- Category distribution (Saffir-Simpson scale)
- Interactive filtering by year range and intensity

**Course:** CPSC 4030/6030 - Data Visualization  
**Data Source:** NOAA Hurricane Database (HURDAT2) via Kaggle

**GitHub Pages:** [https://soynelly.github.io/Hurricane-history/](https://soynelly.github.io/Hurricane-history/)

## Features

### Three Coordinated Visualizations

1. **Hurricane Tracks Map**
   - Geographic plot of storm paths
   - Color-coded by Saffir-Simpson category
   - Interactive tooltips with storm details
   - Mercator projection focused on Atlantic Basin

2. **Temporal Timeline**
   - Bar chart showing hurricane frequency by year
   - Reveals inter-annual variability
   - Highlights active/quiet periods

3. **Category Distribution**
   - Bar chart of intensity distribution
   - Shows relative frequency of each category
   - Category-specific color encoding

### Interactive Controls

- **Year Range Sliders**: Filter data by time period (1950-2015)
- **Category Checkboxes**: Select specific intensity levels
- **Reset Button**: Return to default view
- **Hover Tooltips**: Details on demand for all elements

## Technologies Used

- **D3.js v7** - Data visualization
- **HTML5/CSS3** - Structure and styling
- **JavaScript ES6** - Interactivity
- **Python** - Data preprocessing
  - pandas
  - kagglehub

## Project Structure

```
Hurricane-history/
├── index.html              # Main webpage
├── styles.css              # Styling and layout
├── script.js               # D3.js visualizations
├── hurricane_data.json     # Processed hurricane tracks
├── hurricane_summary.json  # Aggregated statistics
├── process_data.py         # Data preprocessing script
├── PROCESS_BOOK.md         # Comprehensive documentation
├── README.md               # This file
└── config.yml              # GitHub Pages configuration
```

