#!/bin/bash

# This script runs all necessary setup commands when the container is created.
echo "--- Running Dev Container Setup Script ---"

# --- Fix File Permissions FIRST ---
echo "Fixing file permissions for development directories..."
chown node:node /workspaces 2>/dev/null || echo "Warning: Could not fix /workspaces directory ownership"
# chown -R node:node /workspaces/ 2>/dev/null || echo "Warning: Could not fix /workspaces contents permissions"
chown -R node:node /home/node/ 2>/dev/null || echo "Warning: Could not fix /home/node permissions"
chown -R node:node /usr/local/share/ 2>/dev/null || echo "Warning: Could not fix /usr/local/share permissions"
chown -R node:node /usr/local/lib/ 2>/dev/null || echo "Warning: Could not fix /usr/local/lib permissions"

echo "Updating npm to latest version..."
# Use sudo for global npm installations
sudo npm install -g npm@latest

echo "Installing Claude CLI..."
# Use sudo for global npm installations
sudo npm install -g @anthropic-ai/claude-code

echo "Installing Markdown tree parser..."
# Use sudo for global npm installations
sudo npm install -g @kayvan/markdown-tree-parser

echo "Installing uv (Python package manager)..."
# Install uv system-wide using official installer
curl -LsSf https://astral.sh/uv/install.sh | sudo sh
# Make uv available system-wide by moving from root to /usr/local/bin
sudo mv /root/.local/bin/uv /usr/local/bin/uv 2>/dev/null || echo "uv already in system path"
sudo mv /root/.local/bin/uvx /usr/local/bin/uvx 2>/dev/null || echo "uvx already in system path"
# Ensure node user has access
sudo chmod +x /usr/local/bin/uv /usr/local/bin/uvx

# --- Add Shell Alias for Claude ---
echo "Creating 'cc' alias for 'claude --dangerously-skip-permissions'..."
# This command appends the alias to the node user's .bashrc file.
# This makes the alias available in all future terminal sessions.
echo 'alias cc="claude --dangerously-skip-permissions"' >> /home/node/.bashrc

# Add any other tools you need here in the future
# echo "Installing another tool..."
# Note the use of 'sudo' for apt-get
# sudo apt-get update && sudo apt-get install -y another-tool

echo "--- Setup Complete ---"