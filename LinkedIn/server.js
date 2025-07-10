const fs = require('fs');
const chokidar = require('chokidar');
const pdfParse = require('pdf-parse');
const path = require('path');

// Directory to watch for new PDF downloads and the target directory for renamed files
const DOWNLOAD_DIR = 'C:/Users/vince/OneDrive - Vincent Lüders/Downloads';
const TARGET_DIR = 'C:/Users/vince/OneDrive - Vincent Lüders/LinkedIn/Candidates';

// Function to parse PDF and extract the candidate's name
async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdfParse(dataBuffer);
    // Regular expression pattern to extract the name
    // Assumes the name is the line after "(LinkedIn)"
    const namePattern = /www\.linkedin\.com\/in\/.+ \(LinkedIn\)\n(.+)\n/;
    const match = namePattern.exec(data.text);

    // Extract the name
    const extractedName = match && match[1].trim() || "Unknown_Name";
    return extractedName;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

// Function to rename and move PDF
function renameAndMovePDF(originalPath, newName) {
  // Include a timestamp in the new filename to ensure uniqueness
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newFileName = `${newName}-${timestamp}.pdf`;
  const newFilePath = path.join(TARGET_DIR, newFileName);

  fs.rename(originalPath, newFilePath, (err) => {
    if (err) throw err;
    console.log(`Renamed and moved: ${newFilePath}`);
  });
}

// Watch the download directory for new PDF files
chokidar.watch(DOWNLOAD_DIR, {ignored: /^\./, persistent: true})
  .on('add', async function(filePath) {
    console.log('File added:', filePath);
    if (path.extname(filePath) === '.pdf') {
      try {
        const name = await parsePDF(filePath);
        renameAndMovePDF(filePath, name);
      } catch (error) {
        console.error('Processing failed for:', filePath, error);
      }
    }
  });

console.log(`Watching for files in ${DOWNLOAD_DIR}...`);