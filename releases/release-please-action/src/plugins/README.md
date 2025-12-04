# Jira Link Plugin for Release Please

## Overview

This plugin automatically adds Jira ticket links to changelog entries based on branch names that contain Jira ticket IDs. This creates better traceability between code changes and the issues that prompted them.

## How It Works

The plugin scans commit messages for associated pull requests and extracts Jira ticket IDs from branch names. When a Jira ticket ID is found (e.g., `PLAYG-1008` or `QUIKS-674`), it adds a clickable link to the Jira ticket in the changelog entry.

### Example Branch Names

- `PLAYG-1008-test-jira-github`
- `QUIKS-674-UI-analytics-basic-tests`
- `TICKET-123-some-feature-name`

From these branch names, the plugin will extract:
- `PLAYG-1008`
- `QUIKS-674`
- `TICKET-123`

And add links like: `([PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008))`

## Installation & Usage

### Option 1: Using as a Custom Release Please Action Plugin (Recommended)

Since you've cloned and customized the release-please-action, you can integrate this plugin directly into the manifest processing.

#### Step 1: Import the Plugin

In your `src/index.ts`, import the plugin:

```typescript
import {addJiraLinksToCommits, JiraLinkOptions} from './plugins';
```

#### Step 2: Apply to Commits

You'll need to intercept commits before they're processed by release-please. One approach is to extend the Manifest class or hook into the commit processing pipeline. Here's a conceptual example:

```typescript
// After getting the manifest
const manifest = await loadOrBuildManifest(github, inputs);

// Get the commits (this is conceptual - actual implementation depends on release-please internals)
const commits = await manifest.getCommits();

// Apply Jira link transformation
const jiraOptions: JiraLinkOptions = {
  jiraBaseUrl: process.env.JIRA_BASE_URL || 'https://yourcompany.atlassian.net',
  ticketPattern: /([A-Z]{2,10}-\d+)/i, // Matches PROJECT-123 format
  linkStyle: 'inline',
  debug: true
};

addJiraLinksToCommits(commits, jiraOptions);
```

### Option 2: Direct Integration with Release Please Config

For a more integrated approach, you can create a custom ManifestPlugin class and register it with release-please's plugin factory. This would allow configuration via `release-please-config.json`.

#### Example Plugin Registration

```typescript
import {registerPlugin} from 'release-please';
import {addJiraLinksToCommits} from './plugins';

// Create a plugin builder
registerPlugin('jira-link', (options) => {
  return {
    processCommits(commits) {
      return addJiraLinksToCommits(commits, {
        jiraBaseUrl: options.jiraBaseUrl,
        ticketPattern: options.ticketPattern,
        linkStyle: options.linkStyle,
      });
    }
  };
});
```

Then in your `release-please-config.json`:

```json
{
  "plugins": ["jira-link"],
  "jiraBaseUrl": "https://yourcompany.atlassian.net",
  "ticketPattern": "([A-Z]{2,10}-\\d+)",
  "linkStyle": "inline"
}
```

## Configuration Options

### `JiraLinkOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jiraBaseUrl` | `string` | `'https://yourcompany.atlassian.net'` | Base URL for your Jira instance |
| `ticketPattern` | `RegExp` | `/([A-Z]{2,10}-\d+)/i` | Regex pattern to match Jira ticket IDs in branch names |
| `linkStyle` | `'inline' \| 'newline'` | `'inline'` | How to format the Jira link in the changelog |
| `debug` | `boolean` | `false` | Enable debug logging to console |

### Ticket Pattern Examples

**Default pattern:** `/([A-Z]{2,10}-\d+)/i`
- Matches: `PROJ-123`, `PLAYG-1008`, `QUIKS-674`
- Does not match: `P-123` (too short), `VERYLONGPROJECT-123` (too long)

**Custom patterns:**
```typescript
// Match only specific projects
ticketPattern: /(PLAYG|QUIKS|TICKET)-\d+/i

// Match shorter project codes
ticketPattern: /([A-Z]{1,5}-\d+)/i

// Match with optional prefix
ticketPattern: /(?:feature\/)?([A-Z]{2,10}-\d+)/i
```

### Link Style Examples

**Inline (default):**
```markdown
feat: add new feature ([PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008))
```

**Newline:**
```markdown
feat: add new feature
  [PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008)
```

## Environment Variables

For security and flexibility, you can use environment variables in your GitHub Actions workflow:

```yaml
env:
  JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
```

Then reference it in your code:
```typescript
jiraBaseUrl: process.env.JIRA_BASE_URL || 'https://default.atlassian.net'
```

## Example Workflow Integration

```yaml
name: Release Please

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
      
      - name: Run Custom Release Please with Jira Links
        uses: ./action_templates/releases/release-please-action
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
```

## Testing the Plugin

### Test Data

Create test commits with pull requests from branches like:
- `PLAYG-1008-test-feature`
- `QUIKS-674-bug-fix`

### Verification

1. Run release-please to create a release PR
2. Check the PR description and CHANGELOG.md
3. Verify that commit messages include Jira links
4. Click the links to ensure they point to the correct Jira tickets

### Debug Mode

Enable debug mode to see detailed logging:

```typescript
const jiraOptions: JiraLinkOptions = {
  debug: true,
  // ... other options
};
```

This will output:
- Total number of commits processed
- Branch names found
- Jira tickets extracted
- Links added

## Troubleshooting

### No Links Appearing

1. **Check branch naming:** Ensure branches follow the expected pattern (e.g., `PROJECT-123-description`)
2. **Verify ticket pattern:** The default pattern matches 2-10 uppercase letters followed by a dash and numbers
3. **Enable debug mode:** Set `debug: true` to see what the plugin is finding
4. **Check pull request association:** The plugin requires commits to have associated pull request data

### Wrong Jira URL

- Ensure `jiraBaseUrl` is set correctly (without trailing slash)
- Check that `JIRA_BASE_URL` environment variable is accessible
- Verify the URL format: `https://yourcompany.atlassian.net`

### Duplicate Links

The plugin checks for existing ticket IDs in commit messages to avoid duplicates. If you see duplicates:
- The ticket ID check might not be matching the format
- There might be multiple commits from the same branch

## Future Enhancements

Potential improvements for the plugin:
- Support for multiple Jira instances
- Custom link text formatting
- Integration with Jira API to verify ticket existence
- Support for other issue trackers (GitHub Issues, GitLab, etc.)
- Configurable link placement (before/after commit message)

## Contributing

When modifying the plugin:

1. Edit `src/plugins/jira-link.ts`
2. Run `npm run compile` to generate JavaScript and type definitions
3. Test with a sample repository
4. Update this documentation with any new features or options

## License

Apache License 2.0 - Same as release-please-action
