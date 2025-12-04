// Copyright 2024 Custom Plugin
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ConventionalCommit} from 'release-please';

/**
 * Configuration options for the JiraLink plugin
 */
export interface JiraLinkOptions {
  /**
   * Base URL for Jira instance (e.g., 'https://yourcompany.atlassian.net')
   */
  jiraBaseUrl?: string;

  /**
   * Custom regex pattern to match Jira ticket IDs in branch names
   * Default: /([A-Z]{2,10}-\d+)/i
   */
  ticketPattern?: RegExp;

  /**
   * Whether to add the link inline after the commit message or as a separate line
   * Default: 'inline'
   */
  linkStyle?: 'inline' | 'newline';

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Extract Jira ticket ID from branch name
 * @param branchName The branch name to parse
 * @param ticketPattern The regex pattern to use for matching
 * @returns The Jira ticket ID or null if not found
 */
function extractJiraTicket(
  branchName: string,
  ticketPattern: RegExp
): string | null {
  const match = branchName.match(ticketPattern);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Generate a Jira ticket link
 * @param ticketId The Jira ticket ID (e.g., PLAYG-1008)
 * @param jiraBaseUrl The base URL for the Jira instance
 * @returns The full URL to the Jira ticket
 */
function generateJiraLink(ticketId: string, jiraBaseUrl: string): string {
  return `${jiraBaseUrl}/browse/${ticketId}`;
}

/**
 * Format the Jira link to be appended to the commit message
 * @param ticketId The Jira ticket ID
 * @param jiraBaseUrl The base URL for the Jira instance
 * @param linkStyle The style of link to add
 * @returns Formatted link string
 */
function formatJiraLink(
  ticketId: string,
  jiraBaseUrl: string,
  linkStyle: 'inline' | 'newline'
): string {
  const link = generateJiraLink(ticketId, jiraBaseUrl);
  if (linkStyle === 'newline') {
    return `\n  [${ticketId}](${link})`;
  }
  return ` ([${ticketId}](${link}))`;
}

/**
 * Process commits and add Jira ticket links based on branch names.
 *
 * This function adds Jira ticket links to changelog entries based on
 * branch names that contain Jira ticket IDs.
 *
 * Example branch names:
 * - PLAYG-1008-test-jira-github
 * - QUIKS-674-UI-analytics-basic-tests
 *
 * The function will extract the ticket ID (e.g., PLAYG-1008, QUIKS-674)
 * and append a link to the Jira ticket in the changelog entry.
 *
 * @param commits The set of commits that will feed into release pull request
 * @param options Configuration options for the Jira link processing
 * @returns The modified commit objects with Jira links added
 */
export function addJiraLinksToCommits(
  commits: ConventionalCommit[],
  options: JiraLinkOptions = {}
): ConventionalCommit[] {
  // Set defaults
  const jiraBaseUrl =
    options.jiraBaseUrl || 'https://yourcompany.atlassian.net';
  const ticketPattern = options.ticketPattern || /([A-Z]{2,10}-\d+)/i;
  const linkStyle = options.linkStyle || 'inline';
  const debug = options.debug || false;

  if (debug) {
    console.log(`Processing ${commits.length} commits for Jira links`);
  }

  for (const commit of commits) {
    // Check if the commit has an associated pull request with branch information
    if (commit.pullRequest && commit.pullRequest.headBranchName) {
      const branchName = commit.pullRequest.headBranchName;
      const ticketId = extractJiraTicket(branchName, ticketPattern);

      if (ticketId) {
        if (debug) {
          console.log(`Found Jira ticket ${ticketId} in branch: ${branchName}`);
        }

        // Check if the link is already present to avoid duplicates
        const jiraLink = formatJiraLink(ticketId, jiraBaseUrl, linkStyle);
        if (!commit.message.includes(ticketId)) {
          commit.message += jiraLink;
          if (debug) {
            console.log(`Added Jira link to commit message`);
          }
        }

        // Also update bareMessage for consistency
        if (!commit.bareMessage.includes(ticketId)) {
          commit.bareMessage += jiraLink;
        }
      } else if (debug) {
        console.log(`No Jira ticket found in branch: ${branchName}`);
      }
    } else if (debug) {
      console.log(
        `Commit ${commit.sha.substring(0, 7)} has no associated pull request`
      );
    }
  }

  return commits;
}
