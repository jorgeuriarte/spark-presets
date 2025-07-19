const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. Navigating to frontend...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    
    // Check if there's a token in the URL (from OAuth callback)
    const url = page.url();
    console.log('Current URL:', url);
    
    if (url.includes('token=')) {
      console.log('Token found in URL, OAuth callback successful!');
      
      // Wait for the app to process the token
      await page.waitForTimeout(2000);
      
      // Check if we're on the dashboard and if Dropbox is connected
      const dashboardElement = await page.$('text="Mis Presets de Spark"');
      if (dashboardElement) {
        console.log('✓ Successfully redirected to dashboard');
        
        // Check if presets are loading
        const loadingElement = await page.$('text="Cargando presets..."');
        if (loadingElement) {
          console.log('✓ Presets are loading from Dropbox');
        }
        
        // Wait a bit to see if presets load
        await page.waitForTimeout(3000);
        
        // Take a screenshot
        await page.screenshot({ path: 'dashboard-after-oauth.png' });
        console.log('✓ Screenshot saved as dashboard-after-oauth.png');
      }
    } else {
      console.log('No token in URL, checking login page...');
      
      // Look for Connect button
      const connectButton = await page.$('text="Conectar con Dropbox"');
      if (connectButton) {
        console.log('✓ Login page loaded with Connect button');
        await page.screenshot({ path: 'login-page.png' });
      }
    }
    
    // Check localStorage for auth token
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    console.log('Auth token in localStorage:', authToken ? 'Present' : 'Not found');
    
    // Check if API calls are being made
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API call: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Wait a bit more to capture any API calls
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();