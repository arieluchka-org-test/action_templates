#!/usr/bin/env node

/**
 * Post-process CHANGELOG files to add Jira ticket links
 * This script runs after release-please creates the PR
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://brightsourceenergy.atlassian.net';
const TICKET_PATTERN = /([A-Z]{2,10}-\d+)/i;

// Get the list of changed CHANGELOG files from the PR
function getChangedChangelogs() {
  try {
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return changedFiles
      .split('\n')
      .filter(file => file.includes('CHANGELOG.md') && file.trim().length > 0);
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

// Extract Jira ticket from commit SHA by looking at the PR branch name
function getJiraTicketFromCommit(commitSha) {
  try {
    // Get the PR number from the commit message
    const commitMessage = execSync(`git log --format=%B -n 1 ${commitSha}`, { encoding: 'utf-8' });
    const prMatch = commitMessage.match(/#(\d+)/);
    
    if (prMatch) {
      const prNumber = prMatch[1];
      // Get the head branch name of the PR
      const branchName = execSync(
        `gh pr view ${prNumber} --json headRefName --jq .headRefName`,
        { encoding: 'utf-8' }
      ).trim();
      
      const ticketMatch = branchName.match(TICKET_PATTERN);
      if (ticketMatch) {
        return ticketMatch[1].toUpperCase();
      }
    }
  } catch (error) {
    // Silently fail - not all commits will have PRs
  }
  return null;
}

// Process a single changelog file
function processChangelog(changelogPath) {
  console.log(`Processing ${changelogPath}...`);
  
  let content = fs.readFileSync(changelogPath, 'utf-8');
  let modified = false;
  
  // Find all commit references in the format ([SHA](URL))
  const commitPattern = /\* ([^(]+) \(\[#(\d+)\]\([^)]+\)\) \(\[([a-f0-9]+)\]\(([^)]+)\)\)/g;
  
  content = content.replace(commitPattern, (match, message, prNumber, sha, url) => {
    // Try to get Jira ticket from this commit
    const ticket = getJiraTicketFromCommit(sha);
    
    if (ticket && !match.includes(ticket)) {
      const jiraLink = `${JIRA_BASE_URL}/browse/${ticket}`;
      modified = true;
      console.log(`  Adding ${ticket} link to commit ${sha.substring(0, 7)}`);
      return `* ${message} ([#${prNumber}](${url.replace(sha, prNumber).replace('/commit/', '/pull/')})) ([${sha}](${url})) ([${ticket}](${jiraLink}))`;
    }
    
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(changelogPath, content, 'utf-8');
    console.log(`  ✓ Updated ${changelogPath}`);
    return true;
  }
  
  console.log(`  No Jira tickets found for ${changelogPath}`);
  return false;
}

// Main execution
function main() {
  console.log('Adding Jira links to changelogs...');
  console.log(`Jira Base URL: ${JIRA_BASE_URL}`);
  
  const changelogs = getChangedChangelogs();
  
  if (changelogs.length === 0) {
    console.log('No changelog files found in this commit');
    return;
  }
  
  console.log(`Found ${changelogs.length} changelog file(s)`);
  
  let updatedCount = 0;
  for (const changelog of changelogs) {
    if (processChangelog(changelog)) {
      updatedCount++;
    }
  }
  
  console.log(`\nUpdated ${updatedCount} changelog file(s) with Jira links`);
}

main();
