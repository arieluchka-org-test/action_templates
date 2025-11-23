# GitHub Actions Template Repository

A comprehensive example repository demonstrating how to create, organize, and manage GitHub Actions workflows and custom actions from a centralized location.

## 📁 Repository Structure

```
.github/
├── actions/                    # Custom reusable actions
│   ├── bash-greeter/          # Bash script action
│   ├── python-processor/      # Python script action
│   └── js-api-fetcher/        # JavaScript/Node.js action
├── workflows/                  # Active workflows
│   ├── demo-actions.yml       # Demonstrates all custom actions
│   └── scheduled-processing.yml # Scheduled automation example
└── workflow-templates/         # Reusable workflow templates
    ├── ci-cd-pipeline.yml     # Standard CI/CD template
    ├── code-quality.yml       # Code quality checks template
    └── release-management.yml # Release automation template
```

## 🎯 Custom Actions

### 1. Bash Greeter Action
**Location:** `.github/actions/bash-greeter/`

A simple action demonstrating bash script usage in GitHub Actions.

**Features:**
- Takes a name as input
- Generates a personalized greeting
- Outputs the greeting message for use in subsequent steps

**Usage:**
```yaml
- uses: ./.github/actions/bash-greeter
  with:
    who-to-greet: 'Your Name'
```

### 2. Python Data Processor Action
**Location:** `.github/actions/python-processor/`

A Python-based action for data processing and statistical operations.

**Features:**
- Processes JSON arrays of numbers
- Performs operations: sum, average, max, min
- Returns calculated results and item count

**Usage:**
```yaml
- uses: ./.github/actions/python-processor
  with:
    data: '[10, 20, 30, 40, 50]'
    operation: 'average'
```

### 3. JavaScript API Fetcher Action
**Location:** `.github/actions/js-api-fetcher/`

A Node.js action for making HTTP requests and processing API responses.

**Features:**
- Fetches data from any HTTP endpoint
- Supports multiple HTTP methods
- Can extract specific fields from JSON responses
- Returns status, success flag, and response data

**Usage:**
```yaml
- uses: ./.github/actions/js-api-fetcher
  with:
    url: 'https://api.github.com/zen'
    method: 'GET'
    extract-field: 'name'
```

## 🔄 Active Workflows

### Demo Actions Workflow
**File:** `.github/workflows/demo-actions.yml`

Demonstrates all three custom actions working together.

**Triggers:**
- Push to main/develop branches
- Pull requests
- Manual dispatch

**Jobs:**
- Tests each custom action individually
- Runs Python processor with multiple operations (matrix strategy)
- Combines all actions in a single job
- Generates a comprehensive summary

### Scheduled Processing Workflow
**File:** `.github/workflows/scheduled-processing.yml`

Automated daily data processing workflow.

**Triggers:**
- Scheduled: Daily at 00:00 UTC
- Manual dispatch

**Features:**
- Generates daily reports using custom actions
- Processes metrics and external data
- Creates and uploads report artifacts
- Demonstrates scheduled automation

## 📋 Workflow Templates

Workflow templates allow you to share common workflow patterns across your organization. Users can access these templates when creating new workflows in their repositories.

### CI/CD Pipeline Template
**File:** `.github/workflow-templates/ci-cd-pipeline.yml`

A comprehensive CI/CD pipeline template with:
- Checkout and validation
- Build stage with artifact upload
- Test stage with matrix strategy
- Conditional deployment to production

### Code Quality Template
**File:** `.github/workflow-templates/code-quality.yml`

Automated code quality checks including:
- Linting
- Code formatting validation
- Security scanning
- Dependency checks
- Scheduled weekly runs

### Release Management Template
**File:** `.github/workflow-templates/release-management.yml`

Automated release workflow that:
- Validates release versions
- Builds release artifacts
- Generates changelogs from git history
- Creates GitHub releases
- Sends notifications

## 🚀 How to Use This Repository

### Using Custom Actions in Your Workflows

1. **Reference actions from this repository:**
   ```yaml
   - uses: your-org/action_templates/.github/actions/bash-greeter@main
     with:
       who-to-greet: 'World'
   ```

2. **Or copy actions to your repository:**
   - Copy the entire action folder to your `.github/actions/` directory
   - Reference locally: `uses: ./.github/actions/bash-greeter`

### Using Workflow Templates

#### For Organization Repositories:
1. Templates in `.github/workflow-templates/` are automatically available
2. Go to **Actions** → **New workflow**
3. Find your custom templates in the workflow selection page

#### For Individual Use:
1. Copy desired template from `.github/workflow-templates/`
2. Paste into `.github/workflows/` in your repository
3. Customize as needed for your project

## 📚 Key Concepts Demonstrated

### Custom Actions
- **Composite Actions:** Combine multiple steps into reusable actions
- **Multiple Languages:** Bash, Python, and JavaScript examples
- **Inputs & Outputs:** Passing data between action steps
- **Action Metadata:** Proper `action.yml` configuration

### Workflows
- **Trigger Events:** Push, pull request, schedule, manual dispatch
- **Job Dependencies:** Using `needs` to chain jobs
- **Matrix Strategy:** Running jobs with multiple configurations
- **Artifacts:** Uploading and downloading build artifacts
- **Conditional Execution:** Running jobs based on conditions
- **Workflow Summaries:** Creating markdown summaries with `$GITHUB_STEP_SUMMARY`

### Best Practices
- ✅ Organized directory structure
- ✅ Comprehensive documentation for each component
- ✅ Reusable and composable actions
- ✅ Clear naming conventions
- ✅ Error handling in scripts
- ✅ Version control with tags/branches

## 🔧 Customization Guide

### Modifying Actions

1. **Bash Action:** Edit `.github/actions/bash-greeter/action.yml`
   - Modify the shell script in the `run` section
   - Add additional inputs/outputs as needed

2. **Python Action:** Edit `.github/actions/python-processor/process.py`
   - Add new operations or data processing logic
   - Update `action.yml` if adding inputs/outputs

3. **JavaScript Action:** Edit `.github/actions/js-api-fetcher/index.js`
   - Modify HTTP request handling
   - Add new npm dependencies in `package.json`

### Creating New Actions

1. Create a new directory under `.github/actions/your-action-name/`
2. Add `action.yml` with metadata and configuration
3. Add your script files (bash, Python, JavaScript, etc.)
4. Create a `README.md` documenting the action
5. Test the action in a workflow

### Creating New Templates

1. Create a new workflow file in `.github/workflow-templates/`
2. Add corresponding `.properties.json` file with metadata:
   ```json
   {
     "name": "Template Name",
     "description": "Template description",
     "iconName": "rocket",
     "categories": ["Category1", "Category2"]
   }
   ```
3. Document the template with comments in the YAML file

## 📖 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Creating Custom Actions](https://docs.github.com/en/actions/creating-actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Workflow Templates](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)

## 🤝 Contributing

To add new actions or templates to this repository:
1. Follow the existing directory structure
2. Include comprehensive documentation
3. Test thoroughly before committing
4. Update this README with new additions

## 📝 License

This is an example repository for educational purposes. Feel free to use and modify as needed.

---

**Note:** This repository serves as a template and learning resource. Adapt the actions and workflows to match your specific needs and organizational requirements.