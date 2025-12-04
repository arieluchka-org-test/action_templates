// Copyright 2024 Custom Integration Example
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

/**
 * This file demonstrates how to integrate the Jira link plugin
 * with the release-please Manifest.
 * 
 * To use this in production, you would need to modify the Manifest class
 * or create a custom ManifestPlugin that uses our addJiraLinksToCommits function.
 */

import {ManifestPlugin} from 'release-please/build/src/plugin';
import {GitHub} from 'release-please';
import {RepositoryConfig} from 'release-please/build/src/manifest';
import {ConventionalCommit} from 'release-please';
import {addJiraLinksToCommits, JiraLinkOptions} from './jira-link';

/**
 * A ManifestPlugin wrapper that uses our Jira link functionality.
 * This allows the plugin to be used within release-please's plugin system.
 */
export class JiraLinkPlugin extends ManifestPlugin {
  private jiraOptions: JiraLinkOptions;

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: JiraLinkOptions = {}
  ) {
    super(github, targetBranch, repositoryConfig);
    
    // Get Jira options from environment variables or use defaults
    this.jiraOptions = {
      jiraBaseUrl:
        options.jiraBaseUrl ||
        process.env.JIRA_BASE_URL ||
        'https://yourcompany.atlassian.net',
      ticketPattern: options.ticketPattern || /([A-Z]{2,10}-\d+)/i,
      linkStyle: options.linkStyle || 'inline',
      debug: options.debug || process.env.JIRA_LINK_DEBUG === 'true',
    };

    this.logger.info(
      `JiraLinkPlugin initialized with base URL: ${this.jiraOptions.jiraBaseUrl}`
    );
  }

  /**
   * Process commits to add Jira links.
   * This method is called by release-please during commit processing.
   */
  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.logger.info(`JiraLinkPlugin processing ${commits.length} commits`);
    
    try {
      return addJiraLinksToCommits(commits, this.jiraOptions);
    } catch (error) {
      this.logger.error(`Error in JiraLinkPlugin: ${error}`);
      // Return unmodified commits if there's an error
      return commits;
    }
  }
}

/**
 * Factory function to create a JiraLinkPlugin instance.
 * This can be used with release-please's plugin registration system.
 */
export function createJiraLinkPlugin(
  github: GitHub,
  targetBranch: string,
  repositoryConfig: RepositoryConfig,
  options: JiraLinkOptions = {}
): JiraLinkPlugin {
  return new JiraLinkPlugin(github, targetBranch, repositoryConfig, options);
}
