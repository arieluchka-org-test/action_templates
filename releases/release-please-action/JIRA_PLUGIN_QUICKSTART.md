# Jira Link Plugin - Quick Reference

## What is it?

A custom plugin for release-please that automatically adds Jira ticket links to your changelogs based on branch names.

## Example

**Branch name:** `PLAYG-1008-test-jira-feature`

**Changelog entry becomes:**
```markdown
* feat: add test feature ([PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008))
```

## Files Created

| File | Purpose |
|------|---------|
| `src/plugins/jira-link.ts` | Core functionality - processes commits and adds Jira links |
| `src/plugins/jira-link-plugin.ts` | ManifestPlugin wrapper for integration with release-please |
| `src/plugins/index.ts` | Exports plugin functions |
| `src/plugins/README.md` | Comprehensive documentation |
| `INTEGRATION_GUIDE.md` | Step-by-step integration instructions |
| `examples/release-please-config.example.json` | Example configuration |

## Quick Start

### 1. Set Environment Variables

In your GitHub workflow:

```yaml
env:
  JIRA_BASE_URL: 'https://yourcompany.atlassian.net'
  ENABLE_JIRA_LINKS: 'true'
```

### 2. Enable Plugin in Config

In `release-please-config.json`:

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

### 3. Use Jira Ticket Prefixes in Branch Names

Create branches like:
- `PLAYG-1008-feature-description`
- `QUIKS-674-bug-fix`
- `TICKET-123-improvement`

## Configuration Options

```typescript
{
  jiraBaseUrl: 'https://yourcompany.atlassian.net',  // Your Jira URL
  ticketPattern: /([A-Z]{2,10}-\d+)/i,               // Regex to match tickets
  linkStyle: 'inline',                                // 'inline' or 'newline'
  debug: false                                        // Enable debug logging
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Your Jira instance URL | `https://company.atlassian.net` |
| `ENABLE_JIRA_LINKS` | Enable the plugin | `true` |
| `JIRA_LINK_DEBUG` | Enable debug logging | `true` |

## Supported Branch Name Patterns

By default, matches: `PROJECT-123` where:
- PROJECT: 2-10 uppercase letters
- Number: Any digits

Examples that work:
- ✅ `PLAYG-1008-description`
- ✅ `QUIKS-674-fix`
- ✅ `TICKET-1-test`
- ❌ `P-123` (too short)
- ❌ `VERYLONGPROJECTNAME-123` (too long)

## Customizing the Ticket Pattern

For specific project codes:

```typescript
ticketPattern: /(PLAYG|QUIKS|JIRA)-\d+/i
```

For shorter codes (1-5 letters):

```typescript
ticketPattern: /([A-Z]{1,5}-\d+)/i
```

## Testing

### 1. Create a test branch
```bash
git checkout -b PLAYG-1008-test-feature
```

### 2. Make a commit
```bash
git commit -m "feat: add new feature"
```

### 3. Create and merge a PR

### 4. Run release-please

### 5. Check the generated changelog

Should see:
```markdown
* feat: add new feature ([PLAYG-1008](https://yourcompany.atlassian.net/browse/PLAYG-1008))
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No links appearing | Enable debug mode: `JIRA_LINK_DEBUG: 'true'` |
| Wrong Jira URL | Check `JIRA_BASE_URL` environment variable |
| Pattern not matching | Customize `ticketPattern` in config |
| Plugin not loading | Verify plugin is listed in `release-please-config.json` |

## Integration Status

✅ **Complete:**
- Core plugin functionality (`jira-link.ts`)
- ManifestPlugin wrapper (`jira-link-plugin.ts`)
- TypeScript compilation
- Documentation
- Examples

📝 **To Do:**
- Integrate into `src/index.ts` (see INTEGRATION_GUIDE.md)
- Add to `action.yml` inputs (optional)
- Test with real repositories
- Add unit tests

## Next Steps

1. Read the [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed integration steps
2. Read the [src/plugins/README.md](./src/plugins/README.md) for comprehensive documentation
3. Implement the integration in `src/index.ts` using the recommended approach
4. Test with your repositories

## Support

For issues or questions:
1. Check the debug logs (`JIRA_LINK_DEBUG: 'true'`)
2. Review the INTEGRATION_GUIDE.md
3. Verify your branch naming matches the pattern
4. Ensure pull request data is available in commits
