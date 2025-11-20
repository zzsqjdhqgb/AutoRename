# TODO List for AutoRename Electron App

## Step 1: Set up Electron project structure
- [x] Initialize npm project
- [x] Install Electron and dependencies (electron, fs, path, etc.)
- [x] Create main.js for main process
- [x] Create index.html for renderer
- [x] Create package.json with scripts

## Step 2: Implement file scanning logic
- [x] Create utils/fileScanner.js to scan Video directory for MKV files
- [x] Filter files matching YYYY-MM-DD hh-mm-ss.mkv pattern
- [x] Exclude files in ignore.json

## Step 3: Implement ignore.json management
- [x] Create utils/ignoreManager.js to read/write ignore.json in Video directory

## Step 4: Implement renaming and moving logic
- [x] Create utils/fileHandler.js for renaming and moving files
- [x] Rename to YYYYMMDD_<LessonNo>_<LessonTag>.mkv
- [x] Move to D:\Record\YYYYMMDD\

## Step 5: Build main process
- [x] Handle IPC communication between main and renderer
- [x] Load next file on app start or after action

## Step 6: Build renderer UI
- [x] Create left panel: date input, lesson no input, tag select, confirm/skip buttons
- [x] Create right panel: video player
- [x] Handle user inputs and send to main process

## Step 7: Integrate all components
- [x] Connect UI to backend logic
- [x] Test file operations

## Step 8: Testing and polishing
- [ ] Test on sample files
- [ ] Handle edge cases (invalid dates, etc.)
- [ ] Package the app
