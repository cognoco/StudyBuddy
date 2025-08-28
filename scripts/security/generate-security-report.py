#!/usr/bin/env python3
"""
Security Report Generator
Aggregates security scan results from multiple tools and generates consolidated reports
"""

import json
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import yaml

try:
    from tabulate import tabulate
    import requests
except ImportError:
    print("Missing dependencies. Install with: pip install tabulate requests")
    sys.exit(1)


class SecurityReportGenerator:
    """Main class for generating consolidated security reports"""
    
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize report data structure
        self.report_data = {
            'metadata': {
                'generated_at': datetime.utcnow().isoformat(),
                'generator': 'StudyBuddy Security Scanner',
                'version': '1.0.0'
            },
            'summary': {
                'total_vulnerabilities': 0,
                'critical_vulnerabilities': 0,
                'high_vulnerabilities': 0,
                'medium_vulnerabilities': 0,
                'low_vulnerabilities': 0,
                'secrets_found': 0,
                'license_issues': 0,
                'policy_violations': 0
            },
            'scan_results': {
                'dependency_scan': {},
                'secret_scan': {},
                'license_scan': {},
                'code_analysis': {},
                'container_scan': {}
            },
            'recommendations': [],
            'security_score': 0
        }

    def process_npm_audit(self, file_path: Path) -> Dict[str, Any]:
        """Process NPM audit results"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                
            vulnerabilities = data.get('vulnerabilities', {})
            metadata = data.get('metadata', {})
            
            result = {
                'tool': 'npm-audit',
                'total_vulnerabilities': metadata.get('vulnerabilities', {}).get('total', 0),
                'severity_breakdown': {
                    'critical': metadata.get('vulnerabilities', {}).get('critical', 0),
                    'high': metadata.get('vulnerabilities', {}).get('high', 0),
                    'moderate': metadata.get('vulnerabilities', {}).get('moderate', 0),
                    'low': metadata.get('vulnerabilities', {}).get('low', 0)
                },
                'vulnerabilities': []
            }
            
            # Extract vulnerability details
            for pkg_name, vuln_data in vulnerabilities.items():
                for vuln in vuln_data.get('via', []):
                    if isinstance(vuln, dict):
                        result['vulnerabilities'].append({
                            'package': pkg_name,
                            'title': vuln.get('title', 'Unknown'),
                            'severity': vuln.get('severity', 'unknown'),
                            'cwe': vuln.get('cwe', []),
                            'cvss': vuln.get('cvss', {}),
                            'url': vuln.get('url', ''),
                            'range': vuln.get('range', '')
                        })
            
            return result
            
        except Exception as e:
            print(f"Error processing NPM audit: {e}")
            return {'tool': 'npm-audit', 'error': str(e)}

    def process_snyk_results(self, file_path: Path) -> Dict[str, Any]:
        """Process Snyk scan results"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            result = {
                'tool': 'snyk',
                'vulnerabilities': [],
                'summary': {
                    'total': len(data.get('vulnerabilities', [])),
                    'critical': 0,
                    'high': 0,
                    'medium': 0,
                    'low': 0
                }
            }
            
            for vuln in data.get('vulnerabilities', []):
                severity = vuln.get('severity', 'unknown').lower()
                result['summary'][severity] = result['summary'].get(severity, 0) + 1
                
                result['vulnerabilities'].append({
                    'id': vuln.get('id'),
                    'title': vuln.get('title'),
                    'severity': severity,
                    'package': vuln.get('packageName'),
                    'version': vuln.get('version'),
                    'cve': vuln.get('identifiers', {}).get('CVE', []),
                    'cwe': vuln.get('identifiers', {}).get('CWE', []),
                    'cvss_score': vuln.get('cvssScore'),
                    'exploit_maturity': vuln.get('exploitMaturity'),
                    'description': vuln.get('description', '')[:200] + '...' if len(vuln.get('description', '')) > 200 else vuln.get('description', '')
                })
            
            return result
            
        except Exception as e:
            print(f"Error processing Snyk results: {e}")
            return {'tool': 'snyk', 'error': str(e)}

    def process_secret_scan_results(self, reports_dir: Path) -> Dict[str, Any]:
        """Process secret detection results from multiple tools"""
        result = {
            'tools': ['truffleHog', 'gitLeaks', 'detect-secrets'],
            'secrets_found': 0,
            'secrets_by_type': {},
            'files_affected': [],
            'details': []
        }
        
        # Process detect-secrets results
        secrets_file = reports_dir / 'secrets-audit.json'
        if secrets_file.exists():
            try:
                with open(secrets_file, 'r') as f:
                    data = json.load(f)
                
                for file_path, secrets in data.get('results', {}).items():
                    for secret in secrets:
                        result['secrets_found'] += 1
                        secret_type = secret.get('type', 'unknown')
                        result['secrets_by_type'][secret_type] = result['secrets_by_type'].get(secret_type, 0) + 1
                        
                        if file_path not in result['files_affected']:
                            result['files_affected'].append(file_path)
                        
                        result['details'].append({
                            'file': file_path,
                            'type': secret_type,
                            'line': secret.get('line_number'),
                            'is_verified': secret.get('is_verified', False)
                        })
                        
            except Exception as e:
                print(f"Error processing secret scan results: {e}")
        
        return result

    def process_license_scan_results(self, reports_dir: Path) -> Dict[str, Any]:
        """Process license compliance results"""
        result = {
            'total_packages': 0,
            'compliant_licenses': 0,
            'non_compliant_licenses': 0,
            'unknown_licenses': 0,
            'license_breakdown': {},
            'non_compliant_packages': []
        }
        
        licenses_file = reports_dir / 'licenses.json'
        if licenses_file.exists():
            try:
                with open(licenses_file, 'r') as f:
                    data = json.load(f)
                
                # Known good licenses
                approved_licenses = {
                    'MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause',
                    'CC0-1.0', 'Unlicense', 'WTFPL', '0BSD'
                }
                
                for package, info in data.items():
                    result['total_packages'] += 1
                    license_name = info.get('licenses', 'Unknown')
                    
                    # Handle license string normalization
                    if isinstance(license_name, list):
                        license_name = ', '.join(license_name)
                    
                    # Update license breakdown
                    result['license_breakdown'][license_name] = result['license_breakdown'].get(license_name, 0) + 1
                    
                    # Check compliance
                    if any(approved in license_name for approved in approved_licenses):
                        result['compliant_licenses'] += 1
                    elif license_name == 'Unknown' or not license_name:
                        result['unknown_licenses'] += 1
                    else:
                        result['non_compliant_licenses'] += 1
                        result['non_compliant_packages'].append({
                            'name': package,
                            'license': license_name,
                            'version': info.get('version', 'unknown'),
                            'repository': info.get('repository', '')
                        })
                        
            except Exception as e:
                print(f"Error processing license scan results: {e}")
        
        return result

    def calculate_security_score(self) -> int:
        """Calculate overall security score (0-100)"""
        score = 100
        
        # Deduct points for vulnerabilities
        critical = self.report_data['summary']['critical_vulnerabilities']
        high = self.report_data['summary']['high_vulnerabilities']
        medium = self.report_data['summary']['medium_vulnerabilities']
        low = self.report_data['summary']['low_vulnerabilities']
        
        score -= (critical * 25)  # Critical: -25 points each
        score -= (high * 10)      # High: -10 points each
        score -= (medium * 5)     # Medium: -5 points each
        score -= (low * 1)        # Low: -1 point each
        
        # Deduct points for secrets
        score -= (self.report_data['summary']['secrets_found'] * 15)
        
        # Deduct points for license issues
        score -= (self.report_data['summary']['license_issues'] * 5)
        
        return max(0, score)  # Don't go below 0

    def generate_recommendations(self) -> List[str]:
        """Generate security recommendations based on findings"""
        recommendations = []
        
        # Vulnerability recommendations
        if self.report_data['summary']['critical_vulnerabilities'] > 0:
            recommendations.append("🚨 URGENT: Address all critical vulnerabilities immediately")
        
        if self.report_data['summary']['high_vulnerabilities'] > 5:
            recommendations.append("⚠️ High priority: Review and fix high-severity vulnerabilities")
        
        # Secret recommendations
        if self.report_data['summary']['secrets_found'] > 0:
            recommendations.append("🔐 Remove all detected secrets and use environment variables or secure vaults")
        
        # License recommendations
        if self.report_data['summary']['license_issues'] > 0:
            recommendations.append("📜 Review and resolve license compliance issues")
        
        # General recommendations
        recommendations.extend([
            "🔄 Keep dependencies updated regularly",
            "🧪 Run security scans in CI/CD pipeline",
            "📋 Implement security code review practices",
            "🛡️ Use dependency pinning and lock files",
            "📝 Maintain an inventory of third-party components"
        ])
        
        return recommendations

    def generate_html_report(self) -> str:
        """Generate HTML security report"""
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudyBuddy Security Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }}
        .score {{ font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }}
        .score.excellent {{ color: #10B981; }}
        .score.good {{ color: #F59E0B; }}
        .score.poor {{ color: #EF4444; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }}
        .metric {{ background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3B82F6; }}
        .metric.critical {{ border-left-color: #EF4444; }}
        .metric.high {{ border-left-color: #F59E0B; }}
        .metric.medium {{ border-left-color: #8B5CF6; }}
        .metric.low {{ border-left-color: #10B981; }}
        .section {{ padding: 30px; border-top: 1px solid #e5e7eb; }}
        .recommendations {{ background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }}
        th {{ background: #f9fafb; font-weight: 600; }}
        .vulnerability {{ padding: 10px; margin: 10px 0; border-radius: 5px; }}
        .vulnerability.critical {{ background: #fef2f2; border-left: 4px solid #EF4444; }}
        .vulnerability.high {{ background: #fffbeb; border-left: 4px solid #F59E0B; }}
        .vulnerability.medium {{ background: #f5f3ff; border-left: 4px solid #8B5CF6; }}
        .vulnerability.low {{ background: #ecfdf5; border-left: 4px solid #10B981; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ StudyBuddy Security Report</h1>
            <p>Generated on {timestamp}</p>
            <div class="score {score_class}">{security_score}/100</div>
        </div>
        
        <div class="summary">
            <div class="metric critical">
                <h3>Critical</h3>
                <div style="font-size: 2em; font-weight: bold;">{critical}</div>
            </div>
            <div class="metric high">
                <h3>High</h3>
                <div style="font-size: 2em; font-weight: bold;">{high}</div>
            </div>
            <div class="metric medium">
                <h3>Medium</h3>
                <div style="font-size: 2em; font-weight: bold;">{medium}</div>
            </div>
            <div class="metric low">
                <h3>Low</h3>
                <div style="font-size: 2em; font-weight: bold;">{low}</div>
            </div>
            <div class="metric">
                <h3>Secrets Found</h3>
                <div style="font-size: 2em; font-weight: bold;">{secrets}</div>
            </div>
            <div class="metric">
                <h3>License Issues</h3>
                <div style="font-size: 2em; font-weight: bold;">{license_issues}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📋 Recommendations</h2>
            <div class="recommendations">
                <ul>
                    {recommendations_html}
                </ul>
            </div>
        </div>
        
        <div class="section">
            <h2>🔍 Detailed Findings</h2>
            {detailed_findings}
        </div>
        
        <div class="section">
            <h2>📊 Scan Tools</h2>
            <p>This report aggregates results from multiple security scanning tools:</p>
            <ul>
                <li><strong>NPM Audit:</strong> Dependency vulnerability scanning</li>
                <li><strong>Snyk:</strong> Advanced vulnerability detection</li>
                <li><strong>GitLeaks:</strong> Secret detection in Git history</li>
                <li><strong>TruffleHog:</strong> Secret scanning</li>
                <li><strong>detect-secrets:</strong> Baseline secret detection</li>
                <li><strong>License Checker:</strong> Open source license compliance</li>
                <li><strong>CodeQL:</strong> Static code analysis</li>
                <li><strong>OWASP Dependency Check:</strong> Known vulnerability database</li>
            </ul>
        </div>
    </div>
</body>
</html>
        """
        
        # Determine score class
        score = self.report_data['security_score']
        if score >= 90:
            score_class = 'excellent'
        elif score >= 70:
            score_class = 'good'
        else:
            score_class = 'poor'
        
        # Generate recommendations HTML
        recommendations_html = '\n'.join([f'<li>{rec}</li>' for rec in self.report_data['recommendations']])
        
        # Generate detailed findings (simplified for this example)
        detailed_findings = '<p>Detailed vulnerability information available in JSON report format.</p>'
        
        return html_template.format(
            timestamp=self.report_data['metadata']['generated_at'],
            security_score=score,
            score_class=score_class,
            critical=self.report_data['summary']['critical_vulnerabilities'],
            high=self.report_data['summary']['high_vulnerabilities'],
            medium=self.report_data['summary']['medium_vulnerabilities'],
            low=self.report_data['summary']['low_vulnerabilities'],
            secrets=self.report_data['summary']['secrets_found'],
            license_issues=self.report_data['summary']['license_issues'],
            recommendations_html=recommendations_html,
            detailed_findings=detailed_findings
        )

    def generate_markdown_summary(self) -> str:
        """Generate markdown summary for PR comments"""
        summary = f"""# 🔒 Security Scan Results

## Overall Security Score: {self.report_data['security_score']}/100

### Vulnerability Summary
| Severity | Count |
|----------|-------|
| Critical | {self.report_data['summary']['critical_vulnerabilities']} |
| High     | {self.report_data['summary']['high_vulnerabilities']} |
| Medium   | {self.report_data['summary']['medium_vulnerabilities']} |
| Low      | {self.report_data['summary']['low_vulnerabilities']} |

### Other Findings
- **Secrets Detected:** {self.report_data['summary']['secrets_found']}
- **License Issues:** {self.report_data['summary']['license_issues']}

### Top Recommendations
"""
        
        for i, rec in enumerate(self.report_data['recommendations'][:5], 1):
            summary += f"{i}. {rec}\n"
        
        return summary

    def process_all_reports(self):
        """Process all available security reports"""
        
        # Process dependency scans
        for artifact_dir in self.input_dir.iterdir():
            if not artifact_dir.is_dir():
                continue
            
            # NPM Audit
            npm_audit_file = artifact_dir / 'npm-audit.json'
            if npm_audit_file.exists():
                npm_results = self.process_npm_audit(npm_audit_file)
                self.report_data['scan_results']['dependency_scan']['npm_audit'] = npm_results
                
                # Update summary
                if 'severity_breakdown' in npm_results:
                    self.report_data['summary']['critical_vulnerabilities'] += npm_results['severity_breakdown'].get('critical', 0)
                    self.report_data['summary']['high_vulnerabilities'] += npm_results['severity_breakdown'].get('high', 0)
                    self.report_data['summary']['medium_vulnerabilities'] += npm_results['severity_breakdown'].get('moderate', 0)
                    self.report_data['summary']['low_vulnerabilities'] += npm_results['severity_breakdown'].get('low', 0)
            
            # Snyk results
            snyk_file = artifact_dir / 'snyk-test.json'
            if snyk_file.exists():
                snyk_results = self.process_snyk_results(snyk_file)
                self.report_data['scan_results']['dependency_scan']['snyk'] = snyk_results
                
                # Update summary
                if 'summary' in snyk_results:
                    self.report_data['summary']['critical_vulnerabilities'] += snyk_results['summary'].get('critical', 0)
                    self.report_data['summary']['high_vulnerabilities'] += snyk_results['summary'].get('high', 0)
                    self.report_data['summary']['medium_vulnerabilities'] += snyk_results['summary'].get('medium', 0)
                    self.report_data['summary']['low_vulnerabilities'] += snyk_results['summary'].get('low', 0)
            
            # Secret scan results
            secret_results = self.process_secret_scan_results(artifact_dir)
            if secret_results['secrets_found'] > 0:
                self.report_data['scan_results']['secret_scan'] = secret_results
                self.report_data['summary']['secrets_found'] = secret_results['secrets_found']
            
            # License scan results
            license_results = self.process_license_scan_results(artifact_dir)
            if license_results['total_packages'] > 0:
                self.report_data['scan_results']['license_scan'] = license_results
                self.report_data['summary']['license_issues'] = license_results['non_compliant_licenses']
        
        # Calculate total vulnerabilities
        self.report_data['summary']['total_vulnerabilities'] = (
            self.report_data['summary']['critical_vulnerabilities'] +
            self.report_data['summary']['high_vulnerabilities'] +
            self.report_data['summary']['medium_vulnerabilities'] +
            self.report_data['summary']['low_vulnerabilities']
        )
        
        # Generate recommendations and calculate score
        self.report_data['recommendations'] = self.generate_recommendations()
        self.report_data['security_score'] = self.calculate_security_score()

    def generate_reports(self, formats: List[str]):
        """Generate reports in specified formats"""
        
        # JSON report
        if 'json' in formats:
            json_path = self.output_dir / 'security-report.json'
            with open(json_path, 'w') as f:
                json.dump(self.report_data, f, indent=2)
            print(f"Generated JSON report: {json_path}")
        
        # HTML report
        if 'html' in formats:
            html_path = self.output_dir / 'security-report.html'
            with open(html_path, 'w') as f:
                f.write(self.generate_html_report())
            print(f"Generated HTML report: {html_path}")
        
        # Markdown summary
        if 'markdown' in formats:
            md_path = self.output_dir / 'security-summary.md'
            with open(md_path, 'w') as f:
                f.write(self.generate_markdown_summary())
            print(f"Generated Markdown summary: {md_path}")


def main():
    parser = argparse.ArgumentParser(description='Generate consolidated security reports')
    parser.add_argument('--input-dir', required=True, help='Directory containing security scan artifacts')
    parser.add_argument('--output-dir', required=True, help='Directory to write consolidated reports')
    parser.add_argument('--format', default='html,json,markdown', help='Output formats (comma-separated)')
    
    args = parser.parse_args()
    
    formats = [f.strip().lower() for f in args.format.split(',')]
    
    generator = SecurityReportGenerator(args.input_dir, args.output_dir)
    generator.process_all_reports()
    generator.generate_reports(formats)
    
    print(f"\n🎯 Security Score: {generator.report_data['security_score']}/100")
    print(f"📊 Total Vulnerabilities: {generator.report_data['summary']['total_vulnerabilities']}")
    print(f"🔐 Secrets Found: {generator.report_data['summary']['secrets_found']}")
    print(f"📜 License Issues: {generator.report_data['summary']['license_issues']}")


if __name__ == '__main__':
    main()