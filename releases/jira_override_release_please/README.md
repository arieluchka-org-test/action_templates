# Jira Override Release Please Action

This GitHub Action updates Pull Request bodies with Jira ticket references when PRs are merged from Jira-named branches. This is useful for integrating with release-please workflows.

## What it does

When a commit is pushed, this action:
1. Finds the merged PR associated with the commit
2. Checks if the PR's source branch follows Jira naming conventions (e.g., `QUIKS-674-description`)
3. If yes, appends a special markdown comment to the PR body with a Jira ticket link

The comment format is designed for release-please to pick up:

```markdown
<!--

BEGIN_COMMIT_OVERRIDE
feat: some new feature ([QUIKS-674](https://brightsourceenergy.atlassian.net/browse/QUIKS-674))
END_COMMIT_OVERRIDE

-->
```

## Supported Jira Branch Patterns

The action recognizes branches that start with the pattern `PROJECT-NUMBER`:

- `QUIKS-674-UI-analytics-basic-tests`
- `FOND-1598-SDM-Export-Flattened-Data`
- `DEVOPS-926-Promote-to-Staging-Prod-assign-PR-to-promoter`
- `FRES-3550_new_form`

## Usage

```yaml
name: Update PR with Jira Reference

on:
  push:
    branches:
      - main

jobs:
  update-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Update PR with Jira reference
        uses: ./action_templates/releases/jira_override_release_please
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # Optional: override commit SHA (defaults to github.sha)
          commit-sha: ${{ github.sha }}
          # Optional: override Jira URL (defaults to brightsourceenergy.atlassian.net)
          jira-url: 'https://brightsourceenergy.atlassian.net/'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | GitHub token for API access | Yes | - |
| `commit-sha` | Commit SHA to process | No | `github.sha` |
| `jira-url` | Base URL for Jira instance | No | `https://brightsourceenergy.atlassian.net/` |

## How It Works

1. **Find PR**: Uses the GitHub API to find the merged PR associated with the given commit
2. **Extract Jira Ticket**: Parses the branch name to extract the Jira ticket ID (e.g., `QUIKS-674`)
3. **Check for Existing Override**: Verifies that a commit override doesn't already exist in the PR body
4. **Update PR Body**: Appends the markdown comment with the PR title and Jira ticket link

## Example Output

If a PR titled "feat: add new analytics dashboard" was merged from branch `QUIKS-674-UI-analytics-basic-tests`, the action will append:

```markdown
<!--

BEGIN_COMMIT_OVERRIDE
feat: add new analytics dashboard ([QUIKS-674](https://brightsourceenergy.atlassian.net/browse/QUIKS-674))
END_COMMIT_OVERRIDE

-->
```

## Requirements

- Python 3.10+
- PyGithub library
- GitHub token with PR write permissions

## Notes

- The action skips PRs that already have a `BEGIN_COMMIT_OVERRIDE` comment
- Only processes merged PRs
- If no Jira ticket pattern is found in the branch name, the action exits gracefully
