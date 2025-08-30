#!/bin/bash
set -euo pipefail

# Security Tools Installation Script
# This script installs and configures security scanning tools

echo "🔒 Installing Security Scanning Tools..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install npm packages
install_npm_package() {
    local package=$1
    echo "Installing $package..."
    if npm list -g "$package" >/dev/null 2>&1; then
        echo "✅ $package already installed"
    else
        npm install -g "$package"
        echo "✅ $package installed successfully"
    fi
}

# Install Node.js security tools
echo "📦 Installing Node.js security tools..."
install_npm_package "snyk"
install_npm_package "license-checker"
install_npm_package "license-checker-rseidelsohn"
install_npm_package "eslint-plugin-security"
install_npm_package "eslint-plugin-security-node"

# Install Python security tools
echo "🐍 Installing Python security tools..."
if command_exists python3; then
    echo "Installing detect-secrets..."
    pip3 install detect-secrets --user
    echo "✅ detect-secrets installed"
    
    echo "Installing safety..."
    pip3 install safety --user
    echo "✅ safety installed"
else
    echo "⚠️  Python3 not found. Skipping Python security tools."
fi

# Install GitLeaks
echo "🔍 Installing GitLeaks..."
if command_exists gitleaks; then
    echo "✅ GitLeaks already installed"
else
    # Install GitLeaks based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_amd64.tar.gz
        tar -xf gitleaks_linux_amd64.tar.gz
        sudo mv gitleaks /usr/local/bin/
        rm gitleaks_linux_amd64.tar.gz
        echo "✅ GitLeaks installed"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gitleaks
        echo "✅ GitLeaks installed via Homebrew"
    else
        echo "⚠️  Unsupported OS for automatic GitLeaks installation"
    fi
fi

# Install TruffleHog
echo "🕵️ Installing TruffleHog..."
if command_exists trufflehog; then
    echo "✅ TruffleHog already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/trufflesecurity/trufflehog/releases/latest/download/trufflehog_linux_amd64.tar.gz
        tar -xf trufflehog_linux_amd64.tar.gz
        sudo mv trufflehog /usr/local/bin/
        rm trufflehog_linux_amd64.tar.gz
        echo "✅ TruffleHog installed"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install trufflesecurity/trufflehog/trufflehog
        echo "✅ TruffleHog installed via Homebrew"
    else
        echo "⚠️  Unsupported OS for automatic TruffleHog installation"
    fi
fi

# Install Hadolint (Docker linter)
echo "🐳 Installing Hadolint..."
if command_exists hadolint; then
    echo "✅ Hadolint already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -O /tmp/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
        sudo install /tmp/hadolint /usr/local/bin/hadolint
        rm /tmp/hadolint
        echo "✅ Hadolint installed"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hadolint
        echo "✅ Hadolint installed via Homebrew"
    else
        echo "⚠️  Unsupported OS for automatic Hadolint installation"
    fi
fi

# Configure project-specific security tools
echo "⚙️ Configuring project security tools..."

# Initialize detect-secrets baseline
if command_exists detect-secrets; then
    echo "Initializing detect-secrets baseline..."
    detect-secrets scan --all-files --baseline .secrets.baseline || true
    echo "✅ detect-secrets baseline initialized"
fi

# Initialize Snyk authentication (if token provided)
if command_exists snyk && [ -n "${SNYK_TOKEN:-}" ]; then
    echo "Authenticating with Snyk..."
    echo "$SNYK_TOKEN" | snyk auth --stdin
    echo "✅ Snyk authenticated"
else
    echo "⚠️  SNYK_TOKEN not provided. Set SNYK_TOKEN environment variable for Snyk integration"
fi

# Create security scan script
echo "📝 Creating security scan script..."
cat > scripts/security/run-security-scan.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🔒 Running Comprehensive Security Scan..."

# Create reports directory
mkdir -p security-reports

# 1. NPM Audit
echo "📦 Running NPM audit..."
npm audit --json > security-reports/npm-audit.json 2>/dev/null || true
npm audit > security-reports/npm-audit.txt 2>/dev/null || true

# 2. Snyk scan
if command -v snyk >/dev/null 2>&1; then
    echo "🔍 Running Snyk scan..."
    snyk test --json > security-reports/snyk.json 2>/dev/null || true
    snyk test > security-reports/snyk.txt 2>/dev/null || true
else
    echo "⚠️  Snyk not available"
fi

# 3. License check
if command -v license-checker >/dev/null 2>&1; then
    echo "📜 Checking licenses..."
    license-checker --json > security-reports/licenses.json 2>/dev/null || true
    license-checker --csv > security-reports/licenses.csv 2>/dev/null || true
else
    echo "⚠️  license-checker not available"
fi

# 4. Secret detection
if command -v detect-secrets >/dev/null 2>&1; then
    echo "🔐 Scanning for secrets..."
    detect-secrets scan --all-files --baseline .secrets.baseline || true
    detect-secrets audit .secrets.baseline --report > security-reports/secrets.json 2>/dev/null || true
else
    echo "⚠️  detect-secrets not available"
fi

# 5. GitLeaks scan
if command -v gitleaks >/dev/null 2>&1; then
    echo "🕵️ Running GitLeaks scan..."
    gitleaks detect --config .gitleaks.toml --report-format json --report-path security-reports/gitleaks.json || true
else
    echo "⚠️  GitLeaks not available"
fi

# 6. TruffleHog scan
if command -v trufflehog >/dev/null 2>&1; then
    echo "🔍 Running TruffleHog scan..."
    trufflehog filesystem . --json > security-reports/trufflehog.json 2>/dev/null || true
else
    echo "⚠️  TruffleHog not available"
fi

echo "✅ Security scan completed! Reports available in security-reports/"
EOF

chmod +x scripts/security/run-security-scan.sh
echo "✅ Security scan script created"

# Install pre-commit hooks for security
echo "🪝 Setting up security pre-commit hooks..."
if [ -d ".git" ]; then
    # Add security checks to existing pre-commit hook
    if [ -f ".husky/pre-commit" ]; then
        echo "Adding security checks to existing pre-commit hook..."
        if ! grep -q "security:scan" .husky/pre-commit; then
            echo "npm run security:scan" >> .husky/pre-commit
        fi
    fi
fi

echo ""
echo "🎉 Security tools installation completed!"
echo ""
echo "📋 Installed tools:"
echo "   ✅ Snyk (dependency vulnerability scanning)"
echo "   ✅ license-checker (license compliance)"
echo "   ✅ detect-secrets (secret detection)"
echo "   ✅ ESLint security plugins"
echo ""
echo "🔧 Available npm scripts:"
echo "   npm run security:scan      - Quick security scan"
echo "   npm run security:audit     - NPM audit"
echo "   npm run security:fix       - Auto-fix vulnerabilities"
echo "   npm run security:licenses  - Check license compliance"
echo "   npm run security:secrets   - Scan for secrets"
echo "   npm run security:full      - Complete security scan"
echo ""
echo "🚀 Quick start:"
echo "   ./scripts/security/run-security-scan.sh"
echo ""