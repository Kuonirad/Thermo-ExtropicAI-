#!/bin/bash
set -e

# TNN-Criticality-Engine Repository Hardening Script
# Usage: ./setup_repo.sh <owner>/<repo>
# Requires: gh cli authenticated with admin scope

REPO=$1

if [ -z "$REPO" ]; then
    echo "Usage: $0 <owner>/<repo>"
    exit 1
fi

echo "🔒 Hardening Repository: $REPO"

# 1. Enable Vulnerability Alerts & Security Features
echo "   - Enabling security features..."
gh api -X PUT "repos/$REPO/vulnerability-alerts" --silent
gh api -X PUT "repos/$REPO/automated-security-fixes" --silent

# 2. Branch Protection (The "High Risk" Check)
# - Required Status Checks (Strict)
# - Require PR Reviews
# - Dismiss Stale Reviews
# - Enforce for Admins (Critical!)
echo "   - Applying Branch Protection to 'main'..."
gh api -X PUT "repos/$REPO/branches/main/protection" \
    -f required_status_checks.strict=true \
    -f required_status_checks.contexts[]="SLSA Level 3 Build & Attest" \
    -f required_status_checks.contexts[]="Scorecard analysis" \
    -f required_status_checks.contexts[]="fuzz" \
    -f required_pull_request_reviews.dismiss_stale_reviews=true \
    -f required_pull_request_reviews.require_code_owner_reviews=true \
    -f required_pull_request_reviews.required_approving_review_count=1 \
    -f enforce_admins=true \
    -f allow_force_pushes=false \
    -f allow_deletions=false

# 3. Permissions (Least Privilege)
echo "   - Setting default workflow permissions to 'read'..."
gh api -X PUT "repos/$REPO/actions/permissions" -f enabled=true -f default_workflow_permissions="read"

echo "✅ Repository Hardened."
