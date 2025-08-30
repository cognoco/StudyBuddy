#!/usr/bin/env python3
"""
Security Policy Evaluator
Evaluates security scan results against defined policies and gates
"""

import json
import os
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Any
import yaml


class SecurityPolicyEvaluator:
    """Evaluates security findings against policy thresholds"""
    
    def __init__(self, reports_dir: str, policy_file: str):
        self.reports_dir = Path(reports_dir)
        self.policy_file = Path(policy_file)
        self.policy = self.load_policy()
        
        self.evaluation_results = {
            'policy_version': self.policy.get('version', '1.0'),
            'evaluation_timestamp': '',
            'gate_status': 'PASS',  # PASS, WARN, FAIL
            'findings': {
                'critical_issues_count': 0,
                'high_issues_count': 0,
                'medium_issues_count': 0,
                'low_issues_count': 0,
                'secrets_count': 0,
                'license_violations': 0
            },
            'policy_violations': [],
            'recommendations': [],
            'exemptions_applied': []
        }

    def load_policy(self) -> Dict[str, Any]:
        """Load security policy configuration"""
        try:
            with open(self.policy_file, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"Policy file not found: {self.policy_file}")
            return self.get_default_policy()
        except yaml.YAMLError as e:
            print(f"Error parsing policy file: {e}")
            return self.get_default_policy()

    def get_default_policy(self) -> Dict[str, Any]:
        """Return default security policy if file not found"""
        return {
            'name': 'Default Security Policy',
            'version': '1.0',
            'thresholds': {
                'critical': {'max_allowed': 0, 'action': 'fail'},
                'high': {'max_allowed': 10, 'action': 'warn'},
                'medium': {'max_allowed': 25, 'action': 'info'},
                'low': {'max_allowed': 50, 'action': 'track'}
            },
            'secrets': {'block_on_detection': True},
            'licenses': {
                'forbidden': ['GPL', 'GPL-2.0', 'GPL-3.0', 'AGPL', 'LGPL']
            }
        }

    def evaluate_vulnerability_thresholds(self, findings: Dict[str, int]):
        """Evaluate vulnerability counts against policy thresholds"""
        thresholds = self.policy.get('thresholds', {})
        
        for severity in ['critical', 'high', 'medium', 'low']:
            count = findings.get(f'{severity}_issues_count', 0)
            threshold_config = thresholds.get(severity, {})
            max_allowed = threshold_config.get('max_allowed', 999)
            action = threshold_config.get('action', 'track')
            
            if count > max_allowed:
                violation = {
                    'type': 'vulnerability_threshold',
                    'severity': severity,
                    'count': count,
                    'max_allowed': max_allowed,
                    'action': action,
                    'message': f'{severity.title()} vulnerability threshold exceeded: {count} > {max_allowed}'
                }
                
                self.evaluation_results['policy_violations'].append(violation)
                
                # Update gate status based on action
                if action == 'fail':
                    self.evaluation_results['gate_status'] = 'FAIL'
                elif action == 'warn' and self.evaluation_results['gate_status'] != 'FAIL':
                    self.evaluation_results['gate_status'] = 'WARN'

    def evaluate_secret_detection(self, findings: Dict[str, int]):
        """Evaluate secret detection results against policy"""
        secrets_config = self.policy.get('secrets', {})
        block_on_detection = secrets_config.get('block_on_detection', True)
        secrets_count = findings.get('secrets_count', 0)
        
        if secrets_count > 0 and block_on_detection:
            violation = {
                'type': 'secrets_detected',
                'count': secrets_count,
                'action': 'fail',
                'message': f'Secrets detected in codebase: {secrets_count} found'
            }
            
            self.evaluation_results['policy_violations'].append(violation)
            self.evaluation_results['gate_status'] = 'FAIL'

    def evaluate_license_compliance(self, license_data: Dict[str, Any]):
        """Evaluate license compliance against policy"""
        licenses_config = self.policy.get('licenses', {})
        forbidden_licenses = licenses_config.get('forbidden', [])
        
        license_violations = 0
        
        # Check for forbidden licenses in scan results
        if 'non_compliant_packages' in license_data:
            for package in license_data['non_compliant_packages']:
                package_license = package.get('license', '')
                
                for forbidden in forbidden_licenses:
                    if forbidden.lower() in package_license.lower():
                        license_violations += 1
                        violation = {
                            'type': 'forbidden_license',
                            'package': package.get('name'),
                            'license': package_license,
                            'action': 'review',
                            'message': f'Package {package.get("name")} uses forbidden license: {package_license}'
                        }
                        self.evaluation_results['policy_violations'].append(violation)
        
        self.evaluation_results['findings']['license_violations'] = license_violations
        
        if license_violations > 0:
            if self.evaluation_results['gate_status'] != 'FAIL':
                self.evaluation_results['gate_status'] = 'WARN'

    def apply_exemptions(self):
        """Apply policy exemptions to reduce false positives"""
        exemptions_config = self.policy.get('exemptions', {})
        known_issues = exemptions_config.get('known_issues', {}).get('packages', [])
        
        # Apply known issue exemptions
        for exemption in known_issues:
            package_name = exemption.get('name')
            max_severity = exemption.get('max_severity', 'low')
            reason = exemption.get('reason', 'Known acceptable risk')
            
            exemption_applied = {
                'type': 'known_issue',
                'package': package_name,
                'max_severity': max_severity,
                'reason': reason
            }
            
            self.evaluation_results['exemptions_applied'].append(exemption_applied)

    def generate_recommendations(self):
        """Generate actionable recommendations based on policy violations"""
        recommendations = []
        
        # Critical vulnerability recommendations
        critical_violations = [v for v in self.evaluation_results['policy_violations'] 
                             if v.get('severity') == 'critical']
        if critical_violations:
            recommendations.append({
                'priority': 'URGENT',
                'category': 'Vulnerabilities',
                'action': 'Fix all critical vulnerabilities immediately',
                'details': f'{len(critical_violations)} critical vulnerabilities require immediate attention'
            })
        
        # Secret detection recommendations
        secret_violations = [v for v in self.evaluation_results['policy_violations'] 
                           if v.get('type') == 'secrets_detected']
        if secret_violations:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Secrets',
                'action': 'Remove detected secrets and implement proper secret management',
                'details': 'Use environment variables, secret managers, or encrypted configuration'
            })
        
        # License compliance recommendations
        license_violations = [v for v in self.evaluation_results['policy_violations'] 
                            if v.get('type') == 'forbidden_license']
        if license_violations:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Compliance',
                'action': 'Review and replace packages with forbidden licenses',
                'details': f'{len(license_violations)} packages need license review'
            })
        
        # General security recommendations
        recommendations.extend([
            {
                'priority': 'LOW',
                'category': 'Process',
                'action': 'Implement automated security scanning in CI/CD',
                'details': 'Prevent security issues from reaching production'
            },
            {
                'priority': 'LOW', 
                'category': 'Monitoring',
                'action': 'Set up security monitoring and alerting',
                'details': 'Get notified about new vulnerabilities in dependencies'
            }
        ])
        
        self.evaluation_results['recommendations'] = recommendations

    def process_scan_results(self):
        """Process all available scan results and evaluate against policies"""
        
        # Initialize findings counters
        findings = self.evaluation_results['findings']
        
        # Process each artifact directory
        for artifact_dir in self.reports_dir.iterdir():
            if not artifact_dir.is_dir():
                continue
                
            # Process NPM audit results
            npm_audit_file = artifact_dir / 'npm-audit.json'
            if npm_audit_file.exists():
                try:
                    with open(npm_audit_file, 'r') as f:
                        npm_data = json.load(f)
                    
                    metadata = npm_data.get('metadata', {}).get('vulnerabilities', {})
                    findings['critical_issues_count'] += metadata.get('critical', 0)
                    findings['high_issues_count'] += metadata.get('high', 0)
                    findings['medium_issues_count'] += metadata.get('moderate', 0)
                    findings['low_issues_count'] += metadata.get('low', 0)
                    
                except Exception as e:
                    print(f"Error processing NPM audit: {e}")
            
            # Process Snyk results
            snyk_file = artifact_dir / 'snyk-test.json'
            if snyk_file.exists():
                try:
                    with open(snyk_file, 'r') as f:
                        snyk_data = json.load(f)
                    
                    vulnerabilities = snyk_data.get('vulnerabilities', [])
                    for vuln in vulnerabilities:
                        severity = vuln.get('severity', 'unknown').lower()
                        if severity in ['critical', 'high', 'medium', 'low']:
                            findings[f'{severity}_issues_count'] += 1
                            
                except Exception as e:
                    print(f"Error processing Snyk results: {e}")
            
            # Process secret detection results
            secrets_file = artifact_dir / 'secrets-audit.json'
            if secrets_file.exists():
                try:
                    with open(secrets_file, 'r') as f:
                        secrets_data = json.load(f)
                    
                    # Count secrets across all files
                    for file_secrets in secrets_data.get('results', {}).values():
                        findings['secrets_count'] += len(file_secrets)
                        
                except Exception as e:
                    print(f"Error processing secrets results: {e}")
            
            # Process license results
            licenses_file = artifact_dir / 'licenses.json'
            if licenses_file.exists():
                try:
                    with open(licenses_file, 'r') as f:
                        license_data = json.load(f)
                    
                    # Simulate license compliance check
                    forbidden_licenses = self.policy.get('licenses', {}).get('forbidden', [])
                    for package, info in license_data.items():
                        package_licenses = info.get('licenses', '')
                        if isinstance(package_licenses, list):
                            package_licenses = ' '.join(package_licenses)
                        
                        for forbidden in forbidden_licenses:
                            if forbidden.lower() in package_licenses.lower():
                                findings['license_violations'] += 1
                                break
                                
                except Exception as e:
                    print(f"Error processing license results: {e}")
        
        # Evaluate findings against policies
        self.evaluate_vulnerability_thresholds(findings)
        self.evaluate_secret_detection(findings)
        
        # Apply exemptions
        self.apply_exemptions()
        
        # Generate recommendations
        self.generate_recommendations()

    def save_evaluation_results(self, output_file: str):
        """Save evaluation results to JSON file"""
        from datetime import datetime
        
        self.evaluation_results['evaluation_timestamp'] = datetime.utcnow().isoformat()
        
        with open(output_file, 'w') as f:
            json.dump(self.evaluation_results, f, indent=2)
        
        print(f"Security policy evaluation results saved to: {output_file}")

    def print_summary(self):
        """Print evaluation summary to console"""
        print("\n" + "="*60)
        print("🔒 SECURITY POLICY EVALUATION SUMMARY")
        print("="*60)
        
        print(f"Gate Status: {self.evaluation_results['gate_status']}")
        print(f"Policy Version: {self.evaluation_results['policy_version']}")
        
        findings = self.evaluation_results['findings']
        print(f"\n📊 Findings Summary:")
        print(f"  Critical Issues: {findings['critical_issues_count']}")
        print(f"  High Issues: {findings['high_issues_count']}")
        print(f"  Medium Issues: {findings['medium_issues_count']}")
        print(f"  Low Issues: {findings['low_issues_count']}")
        print(f"  Secrets Found: {findings['secrets_count']}")
        print(f"  License Violations: {findings['license_violations']}")
        
        violations = self.evaluation_results['policy_violations']
        if violations:
            print(f"\n⚠️  Policy Violations ({len(violations)}):")
            for i, violation in enumerate(violations[:5], 1):  # Show first 5
                print(f"  {i}. {violation['message']}")
            
            if len(violations) > 5:
                print(f"  ... and {len(violations) - 5} more")
        
        recommendations = self.evaluation_results['recommendations']
        if recommendations:
            print(f"\n💡 Top Recommendations:")
            for i, rec in enumerate(recommendations[:3], 1):  # Show top 3
                print(f"  {i}. [{rec['priority']}] {rec['action']}")
        
        print("\n" + "="*60)


def main():
    parser = argparse.ArgumentParser(description='Evaluate security scan results against policies')
    parser.add_argument('--reports-dir', required=True, help='Directory containing security scan reports')
    parser.add_argument('--policy-file', required=True, help='YAML file containing security policies')
    parser.add_argument('--output', required=True, help='Output file for evaluation results (JSON)')
    
    args = parser.parse_args()
    
    evaluator = SecurityPolicyEvaluator(args.reports_dir, args.policy_file)
    evaluator.process_scan_results()
    evaluator.save_evaluation_results(args.output)
    evaluator.print_summary()
    
    # Exit with appropriate code based on gate status
    gate_status = evaluator.evaluation_results['gate_status']
    if gate_status == 'FAIL':
        sys.exit(1)
    elif gate_status == 'WARN':
        sys.exit(0)  # Warning doesn't fail the build
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()