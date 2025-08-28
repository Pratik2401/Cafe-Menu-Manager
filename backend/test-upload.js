const fs = require('fs');
const path = require('path');

// Test upload directory setup
const testUploadDirectory = () => {
  console.log('🔍 Testing upload directory setup...');
  
  // Get upload directory from environment variable or use default
  const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'uploads');
  const testFolder = 'backgrounds';
  const uploadDir = path.join(baseUploadDir, testFolder);
  
  console.log('📁 Process working directory:', process.cwd());
  console.log('📁 Base upload directory:', baseUploadDir);
  console.log('📁 Test upload directory:', uploadDir);
  
  // Check if base directory exists
  if (fs.existsSync(baseUploadDir)) {
    console.log('✅ Base upload directory exists');
    
    // Check permissions
    try {
      fs.accessSync(baseUploadDir, fs.constants.W_OK);
      console.log('✅ Base directory is writable');
    } catch (error) {
      console.log('❌ Base directory is not writable:', error.message);
    }
  } else {
    console.log('❌ Base upload directory does not exist');
    
    // Try to create it
    try {
      fs.mkdirSync(baseUploadDir, { recursive: true, mode: 0o755 });
      console.log('✅ Created base upload directory');
    } catch (error) {
      console.log('❌ Failed to create base directory:', error.message);
      return;
    }
  }
  
  // Check test folder
  if (fs.existsSync(uploadDir)) {
    console.log('✅ Test folder exists');
  } else {
    console.log('❌ Test folder does not exist, creating...');
    
    try {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      console.log('✅ Created test folder');
    } catch (error) {
      console.log('❌ Failed to create test folder:', error.message);
      return;
    }
  }
  
  // Test file creation
  const testFile = path.join(uploadDir, 'test-file.txt');
  try {
    fs.writeFileSync(testFile, 'Test content');
    console.log('✅ Successfully created test file');
    
    // Clean up
    fs.unlinkSync(testFile);
    console.log('✅ Successfully deleted test file');
  } catch (error) {
    console.log('❌ Failed to create/delete test file:', error.message);
  }
  
  console.log('🏁 Upload directory test completed');
};

testUploadDirectory();