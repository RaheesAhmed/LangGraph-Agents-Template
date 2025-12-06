# Deployment Guide

## Local Development

```bash
cp .env.example .env
# Add your API keys to .env
npm install
npm run example:basic
```

## API Server

### Development

```bash
npm run api:start
```

### Production

```bash
npm run build
PORT=8080 node dist/api-server.js
```

## Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/api-server.js"]
```

Build and run:
```bash
docker build -t langgraph-agent .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  langgraph-agent
```

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`

Optional:
- `PORT` - API server port (default: 3000)
- `CONFIG_PATH` - Agent config path
- `DATABASE_URL` - For PostgreSQL persistence

## Database Setup (Optional)

For PostgreSQL persistence:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

Update config:
```json
{
  "persistence": {
    "backend": "postgres",
    "connectionString": "${DATABASE_URL}"
  }
}
```

## Cloud Platforms

### Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Railway

```bash
railway init
railway up
```

### Render

Connect GitHub repo, add environment variables.

### AWS/GCP/Azure

Use Docker image or deploy as Node.js app.

## Health Check

```bash
curl http://localhost:3000/health
```

## Monitoring

Add logging:
```json
{
  "verbose": true
}
```

## Security Checklist

- [ ] API keys in environment variables (not code)
- [ ] .env file in .gitignore
- [ ] Authentication on API endpoints
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Input validation
- [ ] Error handling
- [ ] CORS configured properly

## Performance

- Use persistent checkpointer (PostgreSQL/SQLite)
- Cache agent instance
- Set max iterations
- Trim message history
- Monitor token usage

## Troubleshooting

**Agent slow**
- Reduce `maxIterations`
- Disable thinking mode
- Use fewer tools

**High memory usage**
- Trim message history
- Use persistent checkpointer

**API timeouts**
- Increase timeout settings
- Add request queue

## Support

- [GitHub Issues](https://github.com/RaheesAhmed/LangGraph-Agents-Template/issues)
- [Documentation](docs/)

