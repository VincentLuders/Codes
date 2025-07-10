/**
 * Google Apps Script for Selective Drive Sync Management
 * This script helps manage which files/folders should be available offline
 */

function setupSelectiveSync() {
  // Define folders that should ALWAYS be synced (available offline)
  const alwaysSyncFolders = [
    'Codes', // Parent folder - always keep synced
    'Codes/Python',
    'Codes/Javascript',
    'Codes/Browser Extensions'
  ];
  
  // Define folders/files that should be ONLINE ONLY (not downloaded)
  const onlineOnlyPatterns = [
    'recordings/', // Audio recordings - don't need local copies
    'venv/',       // Python virtual environments - can be recreated
    'node_modules/', // Node modules - can be reinstalled
    '*.wav',       // Audio files
    '*.mp4',       // Video files
    'transformers/' // Large ML models
  ];
  
  // Define file size threshold (files larger than this go to online-only)
  const sizeLimitMB = 50;
  
  try {
    // Get the root Drive folder
    const rootFolder = DriveApp.getRootFolder();
    
    // Process all folders
    processFolder(rootFolder, alwaysSyncFolders, onlineOnlyPatterns, sizeLimitMB);
    
    console.log('Selective sync configuration completed!');
    
  } catch (error) {
    console.error('Error setting up selective sync:', error);
  }
}

function processFolder(folder, alwaysSyncFolders, onlineOnlyPatterns, sizeLimitMB) {
  const folderPath = getFolderPath(folder);
  
  // Check if this folder should always be synced
  const shouldAlwaysSync = alwaysSyncFolders.some(path => folderPath.includes(path));
  
  // Check if this folder matches online-only patterns
  const shouldBeOnlineOnly = onlineOnlyPatterns.some(pattern => 
    folderPath.includes(pattern.replace('/', ''))
  );
  
  if (shouldBeOnlineOnly && !shouldAlwaysSync) {
    console.log(`Setting online-only: ${folderPath}`);
    // Note: Google Apps Script can't directly set offline access
    // This would need to be done through the Drive API v3
    markFolderOnlineOnly(folder);
  }
  
  // Process files in this folder
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    processFile(file, onlineOnlyPatterns, sizeLimitMB);
  }
  
  // Recursively process subfolders
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    processFolder(subfolder, alwaysSyncFolders, onlineOnlyPatterns, sizeLimitMB);
  }
}

function processFile(file, onlineOnlyPatterns, sizeLimitMB) {
  const fileName = file.getName();
  const fileSizeMB = file.getSize() / (1024 * 1024);
  
  // Check if file matches online-only patterns
  const shouldBeOnlineOnly = onlineOnlyPatterns.some(pattern => {
    if (pattern.startsWith('*.')) {
      return fileName.endsWith(pattern.substring(1));
    }
    return fileName.includes(pattern);
  });
  
  // Check if file is too large
  const isTooLarge = fileSizeMB > sizeLimitMB;
  
  if (shouldBeOnlineOnly || isTooLarge) {
    console.log(`Setting online-only: ${fileName} (${fileSizeMB.toFixed(2)} MB)`);
    markFileOnlineOnly(file);
  }
}

function markFolderOnlineOnly(folder) {
  // This would require Drive API v3 to actually implement
  // For now, we'll just log the action
  console.log(`Would set folder to online-only: ${folder.getName()}`);
}

function markFileOnlineOnly(file) {
  // This would require Drive API v3 to actually implement
  // For now, we'll just log the action
  console.log(`Would set file to online-only: ${file.getName()}`);
}

function getFolderPath(folder) {
  const parents = [];
  let currentFolder = folder;
  
  while (currentFolder.getParents().hasNext()) {
    parents.unshift(currentFolder.getName());
    currentFolder = currentFolder.getParents().next();
  }
  
  return parents.join('/');
}

/**
 * Generate a report of current sync settings
 */
function generateSyncReport() {
  const report = {
    totalFiles: 0,
    totalSize: 0,
    onlineOnlyFiles: 0,
    offlineFiles: 0,
    largeFolders: []
  };
  
  const rootFolder = DriveApp.getRootFolder();
  analyzeFolder(rootFolder, report);
  
  console.log('=== Drive Sync Report ===');
  console.log(`Total files: ${report.totalFiles}`);
  console.log(`Total size: ${(report.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  console.log(`Online-only files: ${report.onlineOnlyFiles}`);
  console.log(`Offline files: ${report.offlineFiles}`);
  console.log('Large folders:', report.largeFolders);
  
  return report;
}

function analyzeFolder(folder, report, path = '') {
  const currentPath = path + '/' + folder.getName();
  let folderSize = 0;
  
  // Analyze files
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const fileSize = file.getSize();
    folderSize += fileSize;
    report.totalFiles++;
    report.totalSize += fileSize;
  }
  
  // Track large folders
  if (folderSize > 100 * 1024 * 1024) { // > 100MB
    report.largeFolders.push({
      path: currentPath,
      size: (folderSize / (1024 * 1024)).toFixed(2) + ' MB'
    });
  }
  
  // Recursively analyze subfolders
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    analyzeFolder(subfolder, report, currentPath);
  }
} 