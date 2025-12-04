# Integration Guide: Adding Jira Link Plugin to Release Please Action

This guide explains how to integrate the Jira link plugin into the release-please-action's main workflow.

## Architecture Overview

The Jira link plugin has three components:

1. **`jira-link.ts`** - Core functionality with `addJiraLinksToCommits()` function
2. **`jira-link-plugin.ts`** - ManifestPlugin wrapper for integration with release-please
3. **Integration in `index.ts`** - Hooks the plugin into the action workflow

## Step-by-Step Integration

### Step 1: Understanding the Current Flow

The current `src/index.ts` has this flow:

```typescript
export async function main(fetchOverride?: any) {
  const inputs = parseInputs();
  const github = await getGitHubInstance(inputs, fetchOverride);

  if (!inputs.skipGitHubRelease) {
    const manifest = await loadOrBuildManifest(github, inputs);
    outputReleases(await manifest.createReleases());
  }

  if (!inputs.skipGitHubPullRequest) {
    const manifest = await loadOrBuildManifest(github, inputs);
    outputPRs(await manifest.createPullRequests());
  }
}
```

### Step 2: Approach A - Using Environment Variables (Simpler)

The easiest approach is to rely on the `JiraLinkPlugin` class which automatically reads from environment variables:

1. The plugin is already available and compiled
2. Users configure Jira settings via environment variables in their workflow:

```yaml
env:
  JIRA_BASE_URL: 'https://yourcompany.atlassian.net'
  JIRA_LINK_DEBUG: 'true'  # Optional: Enable debug logging
```

3. The plugin needs to be registered with release-please's plugin system

### Step 3: Approach B - Custom Manifest Configuration (More Flexible)

For more control, extend the action inputs and manifest configuration:

#### A. Add New Inputs to `index.ts`

```typescript
interface ActionInputs {
  // ... existing inputs
  jiraBaseUrl?: string;
  jiraTicketPattern?: string;
  jiraLinkStyle?: 'inline' | 'newline';
  enableJiraLinks?: boolean;
}

function parseInputs(): ActionInputs {
  const inputs: ActionInputs = {
    // ... existing inputs
    jiraBaseUrl: getOptionalInput('jira-base-url'),
    jiraTicketPattern: getOptionalInput('jira-ticket-pattern'),
    jiraLinkStyle: (getOptionalInput('jira-link-style') as 'inline' | 'newline') || 'inline',
    enableJiraLinks: getOptionalBooleanInput('enable-jira-links'),
  };
  return inputs;
}
```

#### B. Update `action.yml`

Add new input parameters to the action definition:

```yaml
inputs:
  # ... existing inputs
  
  jira-base-url:
    description: 'Base URL for Jira instance (e.g., https://yourcompany.atlassian.net)'
    required: false
    default: ''
  
  jira-ticket-pattern:
    description: 'Regex pattern to match Jira ticket IDs in branch names'
    required: false
    default: '([A-Z]{2,10}-\\d+)'
  
  jira-link-style:
    description: 'Style of Jira link: inline or newline'
    required: false
    default: 'inline'
  
  enable-jira-links:
    description: 'Enable automatic Jira ticket links in changelogs'
    required: false
    default: 'false'
```

#### C. Integrate Plugin in Manifest Loading

Since release-please's Manifest class handles plugin loading internally, we need to register our plugin:

```typescript
import {registerPlugin} from 'release-please';
import {createJiraLinkPlugin} from './plugins';

// Register the plugin before creating manifests
if (inputs.enableJiraLinks || process.env.ENABLE_JIRA_LINKS === 'true') {
  registerPlugin('jira-link', (options) => {
    return createJiraLinkPlugin(
      options.github,
      options.targetBranch,
      options.repositoryConfig,
      {
        jiraBaseUrl: inputs.jiraBaseUrl || process.env.JIRA_BASE_URL,
        ticketPattern: inputs.jiraTicketPattern 
          ? new RegExp(inputs.jiraTicketPattern) 
          : undefined,
        linkStyle: inputs.jiraLinkStyle,
        debug: core.isDebug(),
      }
    );
  });
}
```

### Step 4: Update release-please-config.json

Users can then enable the plugin in their config:

```json
{
  "plugins": ["jira-link"],
  "packages": {
    ".": {
      "release-type": "node"
    }
  }
}
```

## Recommended Integration Method

For simplicity, I recommend **Approach A with environment variables**, but with one modification to `index.ts` to auto-enable the plugin when environment variables are detected:

### Modified `src/index.ts` (Recommended)

Add this near the top of the `main()` function:

```typescript
export async function main(fetchOverride?: any) {
  core.info(`Running release-please version: ${VERSION}`)
  
  // Auto-register Jira link plugin if environment variable is set
  if (process.env.JIRA_BASE_URL || process.env.ENABLE_JIRA_LINKS === 'true') {
    core.info('Registering Jira link plugin...');
    try {
      const {registerPlugin} = await import('release-please');
      const {createJiraLinkPlugin} = await import('./plugins');
      
      registerPlugin('jira-link', (options) => {
        return createJiraLinkPlugin(
          options.github,
          options.targetBranch,
          options.repositoryConfig,
          {
            jiraBaseUrl: process.env.JIRA_BASE_URL,
            debug: core.isDebug() || process.env.JIRA_LINK_DEBUG === 'true',
          }
        );
      });
      
      core.info('Jira link plugin registered successfully');
    } catch (error) {
      core.warning(`Failed to register Jira link plugin: ${error}`);
    }
  }
  
  // ... rest of the existing main() function
}
```

### User Workflow Configuration

Users would then configure their GitHub workflow like this:

```yaml
name: Release Please with Jira Links

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Release Please with Jira Links
        uses: ./.github/actions/release-please-action  # Or your custom path
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          ENABLE_JIRA_LINKS: 'true'
          # JIRA_LINK_DEBUG: 'true'  # Uncomment for debugging
```

And their `release-please-config.json`:

```json
{
  "plugins": ["jira-link"],
  "packages": {
    ".": {
      "release-type": "node"
    }
  }
}
```

## Testing the Integration

### 1. Create Test Repository

```bash
git init test-repo
cd test-repo
git checkout -b PLAYG-1008-test-feature
echo "console.log('test');" > index.js
git add .
git commit -m "feat: add test feature"
```

### 2. Create Pull Request

Create a PR from the `PLAYG-1008-test-feature` branch to `main`.

### 3. Run Release Please

After merging the PR, release-please will:
1. Detect the commit from the PR
2. Extract `PLAYG-1008` from the branch name
3. Add a Jira link to the changelog entry

### 4. Verify Output

Check the generated release PR for entries like:

```markdown
## Features

* add test feature ([PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008))
```

## Troubleshooting

### Plugin Not Running

- Check that `JIRA_BASE_URL` or `ENABLE_JIRA_LINKS` is set
- Ensure `plugins: ["jira-link"]` is in your config
- Enable debug mode with `JIRA_LINK_DEBUG: 'true'`

### Links Not Appearing

- Verify commits have associated pull requests
- Check branch name format matches the pattern
- Look for plugin logs in GitHub Actions output

### Build Errors

If you get TypeScript compilation errors:
```bash
npm run compile
```

If you get ncc bundling errors (due to path issues), the compiled TypeScript files in `build/` are still usable even if the dist bundle fails.

## Next Steps

1. Implement the integration code in `src/index.ts`
2. Test with a sample repository
3. Document any project-specific Jira URL patterns
4. Consider adding unit tests for the plugin
5. Update the main README.md with Jira plugin documentation
