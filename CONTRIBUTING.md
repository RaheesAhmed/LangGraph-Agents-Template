# Contributing

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## Development Setup

```bash
git clone https://github.com/RaheesAhmed/LangGraph-Agents-Template.git
cd LangGraph-Agents-Template
npm install
export ANTHROPIC_API_KEY="your-key"
npm run example:basic
```

## Code Guidelines

- Use TypeScript
- Follow existing code style
- Add types for new functions
- Update docs if adding features
- Test changes before submitting

## Adding New Features

### New Agent Pattern

1. Create pattern file in `src/patterns/`
2. Add pattern to `AgentPatternSchema` in `src/config/schema.ts`
3. Update `buildAgentGraph()` in `src/agent/core.ts`
4. Add example config in `config/examples/`

### New Tool

1. Create tool in `src/tools/`
2. Register in `TOOL_REGISTRY` in `src/tools/index.ts`
3. Update docs

### New Node

1. Create node function in `src/nodes/`
2. Export from node file
3. Use in pattern builders

## Testing

Run examples to test:
```bash
npm run example:basic
npm run example:streaming
npm run api:start
```

## Documentation

Update relevant docs when adding features:
- README.md - If changing core functionality
- docs/DEVELOPER_GUIDE.md - If changing data structures
- docs/API_DOCUMENTATION.md - If changing API
- docs/QUICK_REFERENCE.md - If adding common patterns

## Pull Request Process

1. Update CHANGELOG.md
2. Ensure examples still work
3. Update documentation
4. Test with different configs
5. Describe changes in PR

## Questions

Open an issue or discussion on GitHub.

