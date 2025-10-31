// Simple test to verify Settings tab functionality
const puppeteer = require('puppeteer');

async function testSettingsTab() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the admin dashboard (assuming we need to login first)
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded successfully');
    
    // Check if Settings tab exists
    const settingsTab = await page.$('[data-testid="settings-tab"]');
    if (settingsTab) {
      console.log('✅ Settings tab found');
      
      // Click on Settings tab
      await settingsTab.click();
      await page.waitForTimeout(1000);
      
      // Check if Settings content is visible
      const settingsContent = await page.$text('Logo Management');
      if (settingsContent) {
        console.log('✅ Settings tab content loaded');
      } else {
        console.log('❌ Settings tab content not found');
      }
    } else {
      console.log('❌ Settings tab not found');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test if puppeteer is available
if (typeof require !== 'undefined') {
  try {
    testSettingsTab();
  } catch (e) {
    console.log('Puppeteer not available, skipping automated test');
  }
}