# Security Policy

## Reporting a Vulnerability

Report security issues to: raheesahmed256@gmail.com

Do not open public issues for security vulnerabilities.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

## Security Considerations

### API Keys
- Never commit API keys to git
- Use .env file (already in .gitignore)
- Never commit .env file
- Rotate keys regularly

### API Server
- Add authentication before deploying
- Use HTTPS in production
- Validate all inputs
- Rate limit requests

### File Operations
- Whitelist allowed directories
- Validate file paths
- Check file permissions

### MCP Servers
- Trust only verified MCP servers
- Review server code before using
- Use stdio for untrusted servers (isolated)

### Database
- Use connection pooling
- Sanitize all queries
- Use prepared statements
- Encrypt sensitive data

## Best Practices

1. Set `maxIterations` to prevent infinite loops
2. Add request timeouts
3. Validate user inputs
4. Monitor token usage
5. Log security events
6. Use persistent storage in production
7. Implement proper error handling

