import os

# Folder containing the files
folder_path = r"Images/PNG"

# Iterate through all files in the folder
for filename in os.listdir(folder_path):
    old_path = os.path.join(folder_path, filename)
    if os.path.isfile(old_path):
        new_filename = filename.lower()
        new_path = os.path.join(folder_path, new_filename)
        os.rename(old_path, new_path)

print("All filenames have been lowercased.")
