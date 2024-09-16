import { Command } from 'commander';
import fetch from 'node-fetch';

const program = new Command();

program
  .name('GitHub-Activity')
  .description('CLI to fetch GitHub user activity')
  .version('1.0.0');

program.command('gh-activity')
  .description('show GitHub user activity')
  .argument('<username>', 'GitHub username')
  .action(async (username) => {
    console.log(`Fetching GitHub activity for ${username}`);
    
    const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 3000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return await response.json();
        } catch (error) {
          if (i < retries - 1) {
            console.log(`Retrying... (${i + 1})`);
            await new Promise(resolve => setTimeout(resolve, backoff));
          } else {
            throw error;
          }
        }
      }
    };

    try {
      const events = await fetchWithRetry(`https://api.github.com/users/${username}/events`);
      events.forEach(event => {
        switch (event.type) {
          case 'PushEvent':
            console.log(`Pushed to ${event.repo.name}`);
            break;
          case 'WatchEvent':
            console.log(`Starred ${event.repo.name}`);
            break;
          case 'ForkEvent':
            console.log(`Forked ${event.repo.name}`);
            break;
           case 'CreateEvent':
            console.log(`Created ${event.repo.name}`);
            break; 
          default:
            console.log(`Unknown event type: ${event.type}`);
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });

program.parse();