#!/usr/bin/env node

/**
 * Simple JSX structure validation
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/pages/Profile.jsx',
  'src/pages/ClassSettings.jsx', 
  'src/pages/ClassManagement.jsx',
  'src/pages/ClassDetail.jsx',
  'src/pages/AssignmentManagement.jsx',
  'src/pages/AssignmentDetail.jsx',
  'src/pages/admin/UserManagement.jsx'
];

console.log('🔍 Validating JSX structure for updated files...\n');

filesToCheck.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for basic JSX structure patterns
    const hasFlexLayout = content.includes('flex min-h-screen bg-gray-50');
    const hasSidebar = content.includes('<Sidebar />');
    const hasMainContent = content.includes('flex-1 lg:ml-64');
    
    // Count opening and closing div tags (basic check)
    const openDivs = (content.match(/<div/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    
    console.log(`📄 ${filePath}:`);
    console.log(`   ✅ Flex layout: ${hasFlexLayout ? 'Yes' : 'No'}`);
    console.log(`   ✅ Sidebar component: ${hasSidebar ? 'Yes' : 'No'}`);
    console.log(`   ✅ Main content area: ${hasMainContent ? 'Yes' : 'No'}`);
    console.log(`   📊 Div tags: ${openDivs} opening, ${closeDivs} closing ${openDivs === closeDivs ? '✅' : '❌'}`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

console.log('🎯 Expected structure for each page:');
console.log(`
<div className="flex min-h-screen bg-gray-50">
  <Sidebar />
  <div className="flex-1 lg:ml-64 p-8">
    {/* page content */}
  </div>
</div>
`);

console.log('✅ All files should now have consistent layout structure!');