import pandas as pd
import json
import kagglehub
from datetime import datetime

# Get the dataset path
path = kagglehub.dataset_download("noaa/hurricane-database")

# Load Atlantic hurricane data
df = pd.read_csv(f"{path}/atlantic.csv")

print("Processing hurricane data...")

# Clean and process the data
def parse_coordinate(coord_str):
    """Parse coordinate string like '28.0N' or '80.0W' to decimal"""
    if not isinstance(coord_str, str):
        return None
    
    value = float(coord_str[:-1])
    direction = coord_str[-1]
    
    if direction in ['S', 'W']:
        value = -value
    
    return value

# Parse coordinates
df['lat'] = df['Latitude'].apply(parse_coordinate)
df['lon'] = df['Longitude'].apply(parse_coordinate)

# Parse date
df['year'] = df['Date'].astype(str).str[:4].astype(int)
df['month'] = df['Date'].astype(str).str[4:6].astype(int)
df['day'] = df['Date'].astype(str).str[6:8].astype(int)

# Filter out invalid wind speeds
df = df[df['Maximum Wind'] >= 0]

# Categorize hurricanes (Using the Saffir-Simpson scale)
def categorize_hurricane(wind_speed):
    if wind_speed < 34:
        return "TD"  # Tropical Depression
    elif wind_speed < 64:
        return "TS"  # Tropical Storm
    elif wind_speed < 83:
        return "Cat1"
    elif wind_speed < 96:
        return "Cat2"
    elif wind_speed < 113:
        return "Cat3"
    elif wind_speed < 137:
        return "Cat4"
    else:
        return "Cat5"

df['category'] = df['Maximum Wind'].apply(categorize_hurricane)

# Filter to valid coordinates
df_valid = df[(df['lat'].notna()) & (df['lon'].notna())].copy()

print(f"Total records: {len(df)}")
print(f"Valid coordinate records: {len(df_valid)}")
print(f"Year range: {df_valid['year'].min()} - {df_valid['year'].max()}")

# Focus on modern era (1950-2015) for better data quality
df_modern = df_valid[df_valid['year'] >= 1950].copy()
print(f"Modern era records (1950+): {len(df_modern)}")

# Create hurricane tracks (group by storm ID)
hurricanes = []
for storm_id in df_modern['ID'].unique():
    storm_data = df_modern[df_modern['ID'] == storm_id].sort_values('Date')
    
    # Get storm info
    storm_name = storm_data.iloc[0]['Name']
    storm_year = storm_data.iloc[0]['year']
    max_wind = storm_data['Maximum Wind'].max()
    category = categorize_hurricane(max_wind)
    
    # Get track coordinates
    track = []
    for _, row in storm_data.iterrows():
        track.append({
            'lat': row['lat'],
            'lon': row['lon'],
            'wind': int(row['Maximum Wind']),
            'date': f"{row['year']}-{row['month']:02d}-{row['day']:02d}"
        })
    
    hurricanes.append({
        'id': storm_id,
        'name': storm_name,
        'year': int(storm_year),
        'maxWind': int(max_wind),
        'category': category,
        'track': track
    })

print(f"Number of storms: {len(hurricanes)}")

# Save processed data as JSON
output_data = {
    'hurricanes': hurricanes,
    'metadata': {
        'source': 'NOAA Hurricane Database',
        'yearRange': [int(df_modern['year'].min()), int(df_modern['year'].max())],
        'totalStorms': len(hurricanes),
        'lastUpdated': '2015-11-13'
    }
}

output_file = 'hurricane_data.json'
with open(output_file, 'w') as f:
    json.dump(output_data, f, indent=2)

print(f"\n✓ Data saved to {output_file}")

# Create summary statistics for visualizations
yearly_counts = df_modern.groupby('year').agg({
    'ID': 'nunique',
    'Maximum Wind': 'max'
}).reset_index()
yearly_counts.columns = ['year', 'count', 'maxWind']

yearly_stats = []
for _, row in yearly_counts.iterrows():
    yearly_stats.append({
        'year': int(row['year']),
        'count': int(row['count']),
        'maxWind': int(row['maxWind'])
    })

# Category distribution
category_counts = df_modern.groupby('category')['ID'].nunique().to_dict()
category_data = [{'category': k, 'count': int(v)} for k, v in category_counts.items()]

# Save summary data
summary_data = {
    'yearlyStats': yearly_stats,
    'categoryDistribution': category_data
}

with open('hurricane_summary.json', 'w') as f:
    json.dump(summary_data, f, indent=2)

print(f"✓ Summary data saved to hurricane_summary.json")
print("\nCategory distribution:")
for item in sorted(category_data, key=lambda x: x['count'], reverse=True):
    print(f"  {item['category']}: {item['count']} storms")
