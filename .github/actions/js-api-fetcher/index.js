const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * JavaScript API Fetcher Action
 * Fetches data from APIs and processes the response
 */

async function main() {
  try {
    // Read inputs from environment variables
    const url = process.env.INPUT_URL;
    const method = process.env.INPUT_METHOD || 'GET';
    const extractField = process.env.INPUT_EXTRACT_FIELD || '';

    if (!url) {
      throw new Error('URL input is required');
    }

    console.log(`🚀 Fetching data from: ${url}`);
    console.log(`📡 Method: ${method}`);

    // Make the API request
    const response = await fetch(url, {
      method: method,
      headers: {
        'User-Agent': 'GitHub-Action-JS-Fetcher/1.0'
      }
    });

    const status = response.status;
    const success = response.ok;

    console.log(`📊 Status: ${status}`);
    console.log(`✓ Success: ${success}`);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      
      // Extract specific field if requested
      if (extractField && jsonData[extractField] !== undefined) {
        data = JSON.stringify(jsonData[extractField]);
        console.log(`📦 Extracted field '${extractField}': ${data}`);
      } else {
        data = JSON.stringify(jsonData);
        console.log(`📦 Full JSON response received`);
      }
    } else {
      data = await response.text();
      console.log(`📦 Text response received (${data.length} characters)`);
    }

    // Write outputs to GITHUB_OUTPUT
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
      const outputData = `status=${status}\nsuccess=${success}\ndata=${data}\n`;
      fs.appendFileSync(githubOutput, outputData);
    }

    console.log('✅ API fetch completed successfully');
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
