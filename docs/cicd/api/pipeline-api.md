# Pipeline API Documentation

## 🚀 Overview

The StudyBuddy CI/CD Pipeline API provides programmatic access to pipeline operations, metrics, and configurations. This API enables integration with external tools, monitoring systems, and automation workflows.

**Base URL**: `https://api.github.com/repos/cognoco/StudyBuddy`  
**Authentication**: GitHub Personal Access Token or App Installation Token  
**Rate Limits**: [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

## 📋 OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: StudyBuddy CI/CD Pipeline API
  version: 1.0.0
  description: API for managing StudyBuddy CI/CD pipeline operations
  contact:
    name: DevOps Team
    email: devops@studybuddy.app
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.github.com/repos/cognoco/StudyBuddy
    description: GitHub API Server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: GitHub Personal Access Token

  schemas:
    WorkflowRun:
      type: object
      properties:
        id:
          type: integer
          description: Unique workflow run ID
          example: 1234567890
        name:
          type: string
          description: Workflow name
          example: "Enhanced CI/CD Pipeline"
        status:
          type: string
          enum: [queued, in_progress, completed]
          description: Current run status
        conclusion:
          type: string
          enum: [success, failure, neutral, cancelled, skipped, timed_out, action_required]
          description: Run conclusion (only set when status is completed)
        html_url:
          type: string
          format: uri
          description: URL to view the workflow run
        created_at:
          type: string
          format: date-time
          description: When the workflow run was created
        updated_at:
          type: string
          format: date-time
          description: When the workflow run was last updated
        head_branch:
          type: string
          description: Branch that triggered the run
        head_sha:
          type: string
          description: SHA of the commit that triggered the run
        jobs:
          type: array
          items:
            $ref: '#/components/schemas/Job'

    Job:
      type: object
      properties:
        id:
          type: integer
          description: Unique job ID
        name:
          type: string
          description: Job name
        status:
          type: string
          enum: [queued, in_progress, completed]
        conclusion:
          type: string
          enum: [success, failure, neutral, cancelled, skipped, timed_out, action_required]
        started_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
        steps:
          type: array
          items:
            $ref: '#/components/schemas/Step'

    Step:
      type: object
      properties:
        name:
          type: string
          description: Step name
        status:
          type: string
          enum: [queued, in_progress, completed]
        conclusion:
          type: string
          enum: [success, failure, neutral, cancelled, skipped, timed_out, action_required]
        number:
          type: integer
          description: Step number in the job
        started_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time

    BuildArtifact:
      type: object
      properties:
        id:
          type: integer
          description: Unique artifact ID
        name:
          type: string
          description: Artifact name
        size_in_bytes:
          type: integer
          description: Artifact size in bytes
        url:
          type: string
          format: uri
          description: Download URL
        archive_download_url:
          type: string
          format: uri
          description: Archive download URL
        expired:
          type: boolean
          description: Whether the artifact has expired
        created_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    PipelineMetrics:
      type: object
      properties:
        build_success_rate:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Success rate over the specified period
        average_build_time:
          type: number
          format: float
          description: Average build time in seconds
        deployment_frequency:
          type: number
          format: float
          description: Deployments per day
        lead_time:
          type: number
          format: float
          description: Average lead time in hours
        recovery_time:
          type: number
          format: float
          description: Mean time to recovery in minutes
        change_failure_rate:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Percentage of deployments causing failures

    SecurityScanResult:
      type: object
      properties:
        scan_id:
          type: string
          description: Unique scan identifier
        timestamp:
          type: string
          format: date-time
        vulnerabilities:
          type: object
          properties:
            critical:
              type: integer
              description: Number of critical vulnerabilities
            high:
              type: integer
              description: Number of high vulnerabilities
            moderate:
              type: integer
              description: Number of moderate vulnerabilities
            low:
              type: integer
              description: Number of low vulnerabilities
        tools_used:
          type: array
          items:
            type: string
          description: Security scanning tools used
        report_url:
          type: string
          format: uri
          description: URL to detailed security report

    Error:
      type: object
      properties:
        message:
          type: string
          description: Error message
        documentation_url:
          type: string
          format: uri
          description: Link to relevant documentation

paths:
  /actions/workflows:
    get:
      summary: List repository workflows
      description: Get all workflows configured for the repository
      tags:
        - Workflows
      parameters:
        - name: per_page
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 30
          description: Results per page
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
          description: Page number
      responses:
        '200':
          description: List of workflows
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_count:
                    type: integer
                  workflows:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        name:
                          type: string
                        path:
                          type: string
                        state:
                          type: string
                          enum: [active, deleted, disabled_fork, disabled_inactivity, disabled_manually]
        '401':
          description: Authentication required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /actions/workflows/{workflow_id}/runs:
    get:
      summary: List workflow runs
      description: Get workflow runs for a specific workflow
      tags:
        - Workflow Runs
      parameters:
        - name: workflow_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow ID
        - name: branch
          in: query
          schema:
            type: string
          description: Filter by branch
        - name: status
          in: query
          schema:
            type: string
            enum: [completed, action_required, cancelled, failure, neutral, skipped, stale, success, timed_out, in_progress, queued, requested, waiting]
          description: Filter by status
        - name: per_page
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 30
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
      responses:
        '200':
          description: List of workflow runs
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_count:
                    type: integer
                  workflow_runs:
                    type: array
                    items:
                      $ref: '#/components/schemas/WorkflowRun'
              examples:
                successful_runs:
                  summary: Example of successful workflow runs
                  value:
                    total_count: 2
                    workflow_runs:
                      - id: 1234567890
                        name: "Enhanced CI/CD Pipeline"
                        status: "completed"
                        conclusion: "success"
                        html_url: "https://github.com/cognoco/StudyBuddy/actions/runs/1234567890"
                        created_at: "2024-01-15T10:30:00Z"
                        updated_at: "2024-01-15T10:45:00Z"
                        head_branch: "main"
                        head_sha: "abc123def456"

    post:
      summary: Trigger workflow run
      description: Manually trigger a workflow run
      tags:
        - Workflow Runs
      parameters:
        - name: workflow_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                ref:
                  type: string
                  description: Branch or tag to run workflow on
                  example: "main"
                inputs:
                  type: object
                  description: Workflow input parameters
                  additionalProperties:
                    type: string
              required:
                - ref
            examples:
              trigger_production_deploy:
                summary: Trigger production deployment
                value:
                  ref: "main"
                  inputs:
                    environment: "production"
                    skip_tests: "false"
      responses:
        '204':
          description: Workflow run triggered successfully
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /actions/runs/{run_id}:
    get:
      summary: Get workflow run details
      description: Get detailed information about a specific workflow run
      tags:
        - Workflow Runs
      parameters:
        - name: run_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow run ID
      responses:
        '200':
          description: Workflow run details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkflowRun'
        '404':
          description: Workflow run not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      summary: Cancel workflow run
      description: Cancel a workflow run that is in progress
      tags:
        - Workflow Runs
      parameters:
        - name: run_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow run ID
      responses:
        '202':
          description: Cancellation request accepted
        '409':
          description: Cannot cancel completed workflow
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /actions/runs/{run_id}/jobs:
    get:
      summary: List jobs for workflow run
      description: Get all jobs for a specific workflow run
      tags:
        - Jobs
      parameters:
        - name: run_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow run ID
      responses:
        '200':
          description: List of jobs
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_count:
                    type: integer
                  jobs:
                    type: array
                    items:
                      $ref: '#/components/schemas/Job'

  /actions/runs/{run_id}/artifacts:
    get:
      summary: List workflow run artifacts
      description: Get all artifacts for a workflow run
      tags:
        - Artifacts
      parameters:
        - name: run_id
          in: path
          required: true
          schema:
            type: integer
          description: Workflow run ID
      responses:
        '200':
          description: List of artifacts
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_count:
                    type: integer
                  artifacts:
                    type: array
                    items:
                      $ref: '#/components/schemas/BuildArtifact'

  /actions/artifacts/{artifact_id}:
    get:
      summary: Get artifact details
      description: Get detailed information about a specific artifact
      tags:
        - Artifacts
      parameters:
        - name: artifact_id
          in: path
          required: true
          schema:
            type: integer
          description: Artifact ID
      responses:
        '200':
          description: Artifact details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BuildArtifact'

  /actions/artifacts/{artifact_id}/zip:
    get:
      summary: Download artifact
      description: Download the artifact as a ZIP archive
      tags:
        - Artifacts
      parameters:
        - name: artifact_id
          in: path
          required: true
          schema:
            type: integer
          description: Artifact ID
      responses:
        '302':
          description: Redirect to download URL
        '410':
          description: Artifact expired
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # Custom StudyBuddy Pipeline Endpoints

  /pipeline/metrics:
    get:
      summary: Get pipeline metrics
      description: Get DORA metrics and pipeline performance data
      tags:
        - Metrics
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [7d, 30d, 90d, 1y]
            default: 30d
          description: Time period for metrics calculation
        - name: branch
          in: query
          schema:
            type: string
            default: main
          description: Branch to analyze
      responses:
        '200':
          description: Pipeline metrics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PipelineMetrics'
              examples:
                monthly_metrics:
                  summary: 30-day pipeline metrics
                  value:
                    build_success_rate: 0.95
                    average_build_time: 420.5
                    deployment_frequency: 2.3
                    lead_time: 4.2
                    recovery_time: 25.8
                    change_failure_rate: 0.03

  /pipeline/security-scan:
    post:
      summary: Trigger security scan
      description: Trigger a security vulnerability scan
      tags:
        - Security
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                branch:
                  type: string
                  default: main
                  description: Branch to scan
                tools:
                  type: array
                  items:
                    type: string
                    enum: [npm-audit, snyk, codeql, sonarqube]
                  description: Security tools to use
                  default: ["npm-audit", "snyk"]
      responses:
        '202':
          description: Security scan initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  scan_id:
                    type: string
                  status:
                    type: string
                    enum: [queued, running]
                  estimated_completion:
                    type: string
                    format: date-time

    get:
      summary: Get security scan results
      description: Get latest security scan results
      tags:
        - Security
      parameters:
        - name: scan_id
          in: query
          schema:
            type: string
          description: Specific scan ID (optional)
        - name: branch
          in: query
          schema:
            type: string
            default: main
          description: Branch to get results for
      responses:
        '200':
          description: Security scan results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SecurityScanResult'

  /pipeline/build-status:
    get:
      summary: Get current build status
      description: Get real-time build status across all environments
      tags:
        - Status
      responses:
        '200':
          description: Build status
          content:
            application/json:
              schema:
                type: object
                properties:
                  main:
                    type: object
                    properties:
                      status:
                        type: string
                        enum: [success, failure, in_progress]
                      last_build:
                        type: string
                        format: date-time
                      build_url:
                        type: string
                        format: uri
                  develop:
                    type: object
                    properties:
                      status:
                        type: string
                        enum: [success, failure, in_progress]
                      last_build:
                        type: string
                        format: date-time
                      build_url:
                        type: string
                        format: uri
                  staging:
                    type: object
                    properties:
                      deployment_status:
                        type: string
                        enum: [deployed, deploying, failed]
                      version:
                        type: string
                      health_check:
                        type: string
                        enum: [healthy, unhealthy, unknown]
                  production:
                    type: object
                    properties:
                      deployment_status:
                        type: string
                        enum: [deployed, deploying, failed]
                      version:
                        type: string
                      health_check:
                        type: string
                        enum: [healthy, unhealthy, unknown]

  /pipeline/health:
    get:
      summary: Pipeline health check
      description: Get overall pipeline system health
      tags:
        - Health
      responses:
        '200':
          description: System is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [healthy, degraded, unhealthy]
                  components:
                    type: object
                    properties:
                      github_actions:
                        type: string
                        enum: [operational, degraded, down]
                      eas_build:
                        type: string
                        enum: [operational, degraded, down]
                      security_scanning:
                        type: string
                        enum: [operational, degraded, down]
                      artifact_storage:
                        type: string
                        enum: [operational, degraded, down]
                  last_updated:
                    type: string
                    format: date-time
        '503':
          description: System is unhealthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [unhealthy]
                  issues:
                    type: array
                    items:
                      type: string
```

## 🔐 Authentication

### Personal Access Token

```bash
# Set up authentication
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# Make authenticated request
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/workflows"
```

### App Installation Token

```javascript
// Using Octokit.js
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const { data } = await octokit.rest.actions.listWorkflowRuns({
  owner: 'cognoco',
  repo: 'StudyBuddy',
  workflow_id: 'enhanced-ci-cd.yml'
});
```

## 📊 Usage Examples

### Getting Pipeline Status

```bash
# Get all workflow runs for main branch
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/runs?branch=main&per_page=10"

# Get specific workflow run details
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/runs/1234567890"
```

### Triggering Builds

```bash
# Trigger enhanced CI/CD pipeline
curl -X POST \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"ref": "main", "inputs": {"environment": "production"}}' \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/workflows/enhanced-ci-cd.yml/dispatches"
```

### Downloading Artifacts

```bash
# List artifacts for a run
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/runs/1234567890/artifacts"

# Download specific artifact
curl -L -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/cognoco/StudyBuddy/actions/artifacts/5678901234/zip" \
     -o build-artifacts.zip
```

### JavaScript SDK Example

```javascript
// StudyBuddy Pipeline SDK
class StudyBuddyPipeline {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.github.com/repos/cognoco/StudyBuddy';
  }

  async getLatestBuild(branch = 'main') {
    const response = await fetch(
      `${this.baseUrl}/actions/runs?branch=${branch}&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    const data = await response.json();
    return data.workflow_runs[0];
  }

  async triggerBuild(branch, inputs = {}) {
    const response = await fetch(
      `${this.baseUrl}/actions/workflows/enhanced-ci-cd.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          ref: branch,
          inputs: inputs
        })
      }
    );
    
    return response.status === 204;
  }

  async getPipelineMetrics(period = '30d') {
    // Custom endpoint for pipeline metrics
    const response = await fetch(
      `${this.baseUrl}/pipeline/metrics?period=${period}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    return await response.json();
  }

  async getSecurityScanResults(branch = 'main') {
    const response = await fetch(
      `${this.baseUrl}/pipeline/security-scan?branch=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    return await response.json();
  }
}

// Usage
const pipeline = new StudyBuddyPipeline(process.env.GITHUB_TOKEN);

// Get latest build status
const latestBuild = await pipeline.getLatestBuild('main');
console.log(`Latest build: ${latestBuild.conclusion}`);

// Trigger production deployment
const success = await pipeline.triggerBuild('main', {
  environment: 'production',
  skip_tests: 'false'
});

// Get pipeline metrics
const metrics = await pipeline.getPipelineMetrics('7d');
console.log(`Success rate: ${metrics.build_success_rate * 100}%`);
```

### Python SDK Example

```python
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional

class StudyBuddyPipeline:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.github.com/repos/cognoco/StudyBuddy"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def get_workflow_runs(self, branch: str = "main", per_page: int = 30) -> Dict:
        """Get workflow runs for a specific branch."""
        url = f"{self.base_url}/actions/runs"
        params = {
            "branch": branch,
            "per_page": per_page
        }
        
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def trigger_workflow(self, workflow_id: str, branch: str, inputs: Dict = None) -> bool:
        """Trigger a workflow dispatch event."""
        url = f"{self.base_url}/actions/workflows/{workflow_id}/dispatches"
        data = {
            "ref": branch,
            "inputs": inputs or {}
        }
        
        response = requests.post(
            url, 
            headers={**self.headers, "Content-Type": "application/json"},
            data=json.dumps(data)
        )
        
        return response.status_code == 204
    
    def get_build_artifacts(self, run_id: int) -> List[Dict]:
        """Get artifacts for a specific workflow run."""
        url = f"{self.base_url}/actions/runs/{run_id}/artifacts"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()["artifacts"]
    
    def download_artifact(self, artifact_id: int, output_path: str) -> bool:
        """Download an artifact by ID."""
        url = f"{self.base_url}/actions/artifacts/{artifact_id}/zip"
        
        response = requests.get(url, headers=self.headers, allow_redirects=True)
        
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        return False
    
    def get_pipeline_status(self) -> Dict:
        """Get current pipeline status across all environments."""
        # This would call a custom endpoint
        url = f"{self.base_url}/pipeline/build-status"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

# Usage example
pipeline = StudyBuddyPipeline(os.environ["GITHUB_TOKEN"])

# Get recent builds
runs = pipeline.get_workflow_runs("main", per_page=5)
for run in runs["workflow_runs"]:
    print(f"Run {run['id']}: {run['conclusion']} - {run['created_at']}")

# Trigger deployment
success = pipeline.trigger_workflow(
    "enhanced-ci-cd.yml", 
    "main", 
    {"environment": "staging"}
)
print(f"Deployment triggered: {success}")
```

## 🚨 Error Handling

### Common Error Responses

```json
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/reference/actions#get-a-workflow-run"
}
```

### Rate Limiting

```http
HTTP/1.1 403 Forbidden
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200

{
  "message": "API rate limit exceeded",
  "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"
}
```

### Best Practices for Error Handling

```javascript
async function makeApiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    // Handle rate limiting
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
      const waitTime = (resetTime * 1000) - Date.now();
      console.log(`Rate limited. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return makeApiCall(url, options); // Retry
    }
    
    // Handle other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## 📚 Additional Resources

### Related Documentation
- [GitHub Actions API Reference](https://docs.github.com/en/rest/reference/actions)
- [Expo EAS API Documentation](https://docs.expo.dev/eas/api/)
- [Pipeline Troubleshooting Guide](../troubleshooting/comprehensive-troubleshooting.md)

### Code Examples
- [Pipeline Integration Scripts](https://github.com/cognoco/StudyBuddy/tree/main/scripts/pipeline)
- [Monitoring Dashboards](https://github.com/cognoco/StudyBuddy/tree/main/monitoring)
- [Custom Actions](https://github.com/cognoco/StudyBuddy/tree/main/.github/actions)

### Support
- **API Issues**: Create issue with `api` label
- **Documentation**: Create issue with `documentation` label  
- **Feature Requests**: Create issue with `enhancement` label

---

**API Version**: 1.0.0  
**Last Updated**: $(date +"%Y-%m-%d")  
**Changelog**: [View API Changelog](./api-changelog.md)