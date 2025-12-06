# Getting Started

## 1. Install

```bash
git clone https://github.com/RaheesAhmed/LangGraph-Agents-Template.git
cd LangGraph-Agents-Template
npm install
```

## 2. Set API Key

### Option A: Use .env File (Recommended)

```bash
cp .env.example .env
```

Edit `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key
```

### Option B: Set in Shell

Linux/Mac:
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
```

Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-your-key"
```

Windows CMD:
```cmd
set ANTHROPIC_API_KEY=sk-ant-your-key
```

## 3. Run Example

```bash
npm run example:basic
```

You should see the agent respond to a math question.

## 4. Try Streaming

```bash
npm run example:streaming
```

Watch real-time token streaming.

## 5. Start API Server

```bash
npm run api:start
```

Test it:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "threadId": "test"}'
```

## 6. Customize

Edit `config/agent.config.json`:

```json
{
  "pattern": "react",
  "tools": {
    "enabledTools": ["calculator"]
  },
  "thinking": {
    "enabled": true
  }
}
```

Run again - agent now shows thinking process.

## Next Steps

- Read [README.md](README.md) for full documentation
- Check `config/examples/` for different patterns
- See `docs/` for API and developer guides
- Add custom tools in `src/tools/`
- Connect MCP servers via config

## Common Issues

**"thread_id required"**
- Add `{ configurable: { thread_id: "any-id" } }` to invoke/stream calls

**"API key not set"**
- Export ANTHROPIC_API_KEY or add to .env file

**"Module not found"**
- Run `npm install`

## Getting Help

- Check [docs/](docs/)
- Open an issue on GitHub
- See examples in `examples/`

