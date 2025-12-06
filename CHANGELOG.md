# Changelog

## [1.0.0] - 2025-12-06

Initial release.

### Added

**4 Agent Patterns**
- ReAct
- Reflection
- Planning
- Multi-Agent

**Streaming**
- 5 modes: values, updates, messages, custom, debug
- SSE streaming via REST API
- Custom events for tools and thinking

**Tools**
- Calculator, web search, file operations
- MCP server support (stdio, sse, http)
- Custom tool registration

**Memory**
- Thread-based conversations
- Short-term trimming
- Long-term storage

**Persistence**
- MemorySaver, PostgreSQL, SQLite

**Human-in-the-Loop**
- interrupt() support
- Configurable triggers

**API**
- REST endpoints
- Streaming and non-streaming
- Thread management

**Config**
- JSON-based configuration
- Zod validation
- 5 example configs

**Docs**
- README, Developer Guide, API docs
- Quick reference
- MCP integration guide

### Dependencies

- @langchain/langgraph ^1.0.4
- @langchain/core ^1.1.4
- @langchain/anthropic ^1.2.3
- zod ^3.23.8

