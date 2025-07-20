// playwright/tests/global.teardown.ts
import { execSync } from 'child_process';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function globalTeardown() {
  console.log('\n--- Running Playwright Global Teardown ---');

  const projectRoot = path.resolve(__dirname, '../..'); // Go up two levels from playwright/tests
  const tomcatContainerName = 'my-tomcat-app'; // Match the container_name in docker-compose.yml

  // Check if the Tomcat container is running
  // docker ps -q -f name=my-tomcat-app will return the container ID if running, empty string otherwise
  const isTomcatRunning = execSync(`docker ps -q -f name=${tomcatContainerName}`, { stdio: 'pipe' }).toString().trim();

  if (isTomcatRunning) {
    console.log(`Detected running Docker container '${tomcatContainerName}'. Attempting to stop services.`);
    try {
      // Stop the Docker Compose services started by webServer
      execSync('docker compose down', { cwd: projectRoot, stdio: 'inherit' });
      console.log('Docker Compose services stopped successfully.');
    } catch (error) {
      console.error('Error during Docker Compose teardown:', error);
      // Do not throw here, as teardown should ideally complete even if cleanup fails
    }
  } else {
    console.log(`Docker container '${tomcatContainerName}' not found running. Skipping 'docker compose down'.`);
  }

  console.log('--- Playwright Global Teardown Complete ---');
}

export default globalTeardown;