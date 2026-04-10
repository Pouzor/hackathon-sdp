#!/bin/bash
set -e

echo "Verifying project tooling..."

# GitHub CLI
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo "✓ GitHub CLI authenticated"
  else
    echo "✗ GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  fi
else
  echo "⚠ GitHub CLI not installed. Run: brew install gh"
fi

# Docker
if command -v docker &> /dev/null; then
  if docker info &> /dev/null 2>&1; then
    echo "✓ Docker running"
  else
    echo "✗ Docker not running. Start Docker Desktop."
    exit 1
  fi
else
  echo "⚠ Docker not installed."
fi

# uv (Python)
if command -v uv &> /dev/null; then
  echo "✓ uv installed ($(uv --version))"
else
  echo "⚠ uv not installed. Run: curl -LsSf https://astral.sh/uv/install.sh | sh"
fi

# pnpm (Node)
if command -v pnpm &> /dev/null; then
  echo "✓ pnpm installed ($(pnpm --version))"
else
  echo "⚠ pnpm not installed. Run: npm i -g pnpm"
fi

echo ""
echo "Tooling verification complete!"
