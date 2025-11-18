import pandas as pd
import kagglehub

# Get the dataset path
path = kagglehub.dataset_download("noaa/hurricane-database")

# Load Atlantic hurricane data
atlantic_path = f"{path}/atlantic.csv"
df = pd.read_csv(atlantic_path)

print("=== ATLANTIC HURRICANE DATA ===")
print(f"\nDataset shape: {df.shape}")
print(f"\nColumn names:\n{df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head(10))
print(f"\nData types:")
print(df.dtypes)
print(f"\nBasic statistics:")
print(df.describe())
print(f"\nUnique values:")
print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
print(f"Number of unique storms: {df['ID'].nunique() if 'ID' in df.columns else 'N/A'}")
print(f"\nMissing values:")
print(df.isnull().sum())
