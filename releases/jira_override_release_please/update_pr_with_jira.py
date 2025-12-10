#!/usr/bin/env python3
"""
Updates PR body with Jira ticket reference for commits from Jira branches.
"""

import os
import re
import sys
from github import Github
from typing import Optional, Tuple


def extract_jira_ticket(branch_name: str) -> Optional[str]:
    """
    Extract Jira ticket ID from branch name.
    
    Supports patterns like:
    - QUIKS-674-UI-analytics-basic-tests
    - FOND-1598-SDM-Export-Flattened-Data
    - DEVOPS-926-Promote-to-Staging-Prod-assign-PR-to-promoter
    - FRES-3550_new_form
    
    Returns:
        Jira ticket ID (e.g., "QUIKS-674") or None if not found
    """
    # Pattern: PROJECT_KEY-NUMBER at the start of branch name
    # Project key: uppercase letters, at least 2 characters
    # Number: one or more digits
    pattern = r'^([A-Z]{2,}+-\d+)'
    
    match = re.match(pattern, branch_name)
    if match:
        return match.group(1)
    return None


def get_jira_markdown_link(ticket_id: str, jira_base_url: str) -> str:
    """
    Create a markdown link for a Jira ticket.
    
    Args:
        ticket_id: Jira ticket ID (e.g., "QUIKS-674")
        jira_base_url: Base URL for Jira (e.g., "https://brightsourceenergy.atlassian.net/")
    
    Returns:
        Markdown link (e.g., "[QUIKS-674](https://brightsourceenergy.atlassian.net/browse/QUIKS-674)")
    """
    # Ensure jira_base_url ends with /
    if not jira_base_url.endswith('/'):
        jira_base_url += '/'
    
    jira_url = f"{jira_base_url}browse/{ticket_id}"
    return f"[{ticket_id}]({jira_url})"


def create_commit_override_comment(pr_title: str, jira_link: str) -> str:
    """
    Create the commit override markdown comment.
    
    Args:
        pr_title: Title of the PR
        jira_link: Markdown link to Jira ticket
    
    Returns:
        Markdown comment with commit override
    """
    return f"""<!--

BEGIN_COMMIT_OVERRIDE
{pr_title} ({jira_link})
END_COMMIT_OVERRIDE

-->"""


def find_pr_for_commit(repo, commit_sha: str) -> Optional[any]:
    """
    Find the merged PR associated with a commit.
    
    Args:
        repo: PyGithub Repository object
        commit_sha: SHA of the commit
    
    Returns:
        PullRequest object or None if not found
    """
    try:
        commit = repo.get_commit(commit_sha)
        
        # Get all PRs associated with this commit
        prs = commit.get_pulls()
        
        # Find the first merged PR
        for pr in prs:
            if pr.merged:
                return pr
        
        return None
    except Exception as e:
        print(f"Error finding PR for commit {commit_sha}: {e}")
        return None


def update_pr_body_with_jira(
    repo,
    pr,
    jira_ticket: str,
    jira_base_url: str
) -> bool:
    """
    Update PR body with Jira reference if not already present.
    
    Args:
        repo: PyGithub Repository object
        pr: PullRequest object
        jira_ticket: Jira ticket ID
        jira_base_url: Base URL for Jira
    
    Returns:
        True if PR was updated, False otherwise
    """
    try:
        current_body = pr.body or ""
        
        # Check if commit override already exists
        if "BEGIN_COMMIT_OVERRIDE" in current_body:
            print(f"PR #{pr.number} already has a commit override. Skipping.")
            return False
        
        # Create the Jira link and override comment
        jira_link = get_jira_markdown_link(jira_ticket, jira_base_url)
        override_comment = create_commit_override_comment(pr.title, jira_link)
        
        # Append to PR body
        updated_body = current_body + "\n\n" + override_comment if current_body else override_comment
        
        pr.edit(body=updated_body)
        print(f"✓ Updated PR #{pr.number} with Jira reference: {jira_ticket}")
        return True
        
    except Exception as e:
        print(f"Error updating PR #{pr.number}: {e}")
        return False


def main():
    """Main function to process commit and update PR with Jira reference."""
    # Get environment variables
    github_token = os.environ.get('GITHUB_TOKEN')
    commit_sha = os.environ.get('COMMIT_SHA')
    jira_base_url = os.environ.get('JIRA_BASE_URL', 'https://brightsourceenergy.atlassian.net/')
    repo_name = os.environ.get('GITHUB_REPOSITORY')
    
    # Validate inputs
    if not github_token:
        print("ERROR: GITHUB_TOKEN environment variable is required")
        sys.exit(1)
    
    if not commit_sha:
        print("ERROR: COMMIT_SHA environment variable is required")
        sys.exit(1)
    
    if not repo_name:
        print("ERROR: GITHUB_REPOSITORY environment variable is required")
        sys.exit(1)
    
    print(f"Processing commit: {commit_sha}")
    print(f"Repository: {repo_name}")
    print(f"Jira base URL: {jira_base_url}")
    
    # Initialize GitHub client
    g = Github(github_token)
    repo = g.get_repo(repo_name)
    
    # Find PR for commit
    pr = find_pr_for_commit(repo, commit_sha)
    
    if not pr:
        print(f"No merged PR found for commit {commit_sha}")
        sys.exit(0)
    
    print(f"Found PR #{pr.number}: {pr.title}")
    print(f"PR head branch: {pr.head.ref}")
    
    # Extract Jira ticket from branch name
    jira_ticket = extract_jira_ticket(pr.head.ref)
    
    if not jira_ticket:
        print(f"Branch '{pr.head.ref}' does not appear to be a Jira branch. Skipping.")
        sys.exit(0)
    
    print(f"Detected Jira ticket: {jira_ticket}")
    
    # Update PR body
    success = update_pr_body_with_jira(repo, pr, jira_ticket, jira_base_url)
    
    if success:
        print("✓ Successfully updated PR with Jira reference")
    else:
        print("PR was not updated")
    
    sys.exit(0)


if __name__ == "__main__":
    main()
