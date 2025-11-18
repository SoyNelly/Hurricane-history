import kagglehub
import os

# Download latest version
path = kagglehub.dataset_download("noaa/hurricane-database")

print("Path to dataset files:", path)

# List files in the directory
print("\nFiles in the dataset:")
for file in os.listdir(path):
    print(f"  - {file}")
    file_path = os.path.join(path, file)
    if os.path.isfile(file_path):
        size = os.path.getsize(file_path)
        print(f"    Size: {size:,} bytes")
