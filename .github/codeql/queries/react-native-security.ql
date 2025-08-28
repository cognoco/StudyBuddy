/**
 * @name Custom React Native Security Queries
 * @description Security-focused queries for React Native applications
 * @kind problem
 * @problem.severity warning
 * @security-severity 7.0
 * @precision high
 * @tags security
 *       react-native
 *       expo
 */

import javascript

// Query 1: Detect insecure AsyncStorage usage
class InsecureAsyncStorageQuery extends Query {
  InsecureAsyncStorageQuery() {
    this = "AsyncStorage security check"
  }

  override predicate hasResult(AstNode node, string message) {
    exists(CallExpr call |
      call.getCalleeName() = "setItem" and
      call.getReceiver().toString().matches("%AsyncStorage%") and
      not call.getArgument(1).toString().matches("%encrypt%") and
      not call.getArgument(1).toString().matches("%hash%")
    |
      node = call and
      message = "AsyncStorage storing potentially sensitive data without encryption"
    )
  }
}

// Query 2: Detect insecure network requests
class InsecureNetworkQuery extends Query {
  InsecureNetworkQuery() {
    this = "Insecure network request"
  }

  override predicate hasResult(AstNode node, string message) {
    exists(CallExpr call |
      call.getCalleeName() = "fetch" and
      call.getArgument(0).toString().matches("http://%")
    |
      node = call and
      message = "HTTP request detected - use HTTPS for security"
    )
  }
}

// Query 3: Detect hardcoded secrets
class HardcodedSecretsQuery extends Query {
  HardcodedSecretsQuery() {
    this = "Hardcoded secrets detection"
  }

  override predicate hasResult(AstNode node, string message) {
    exists(StringLiteral str |
      str.getValue().matches("%api_key%") or
      str.getValue().matches("%secret%") or
      str.getValue().matches("%password%") or
      str.getValue().matches("%token%")
    |
      node = str and
      message = "Potential hardcoded secret detected"
    )
  }
}

// Query 4: Detect insecure random number generation
class InsecureRandomQuery extends Query {
  InsecureRandomQuery() {
    this = "Insecure random number generation"
  }

  override predicate hasResult(AstNode node, string message) {
    exists(CallExpr call |
      call.getCalleeName() = "random" and
      call.getReceiver().toString() = "Math"
    |
      node = call and
      message = "Math.random() is not cryptographically secure - use crypto.randomBytes() for security purposes"
    )
  }
}

// Query 5: Detect potential XSS vulnerabilities
class XSSVulnerabilityQuery extends Query {
  XSSVulnerabilityQuery() {
    this = "Potential XSS vulnerability"
  }

  override predicate hasResult(AstNode node, string message) {
    exists(CallExpr call |
      call.getCalleeName() = "innerHTML" or
      call.getCalleeName() = "dangerouslySetInnerHTML"
    |
      node = call and
      message = "Potential XSS vulnerability - sanitize user input"
    )
  }
}