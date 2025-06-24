# GitHub API Dashboard - Next.js 14 App Router

A comprehensive GitHub API integration dashboard built with Next.js 14, featuring real-time webhooks, security monitoring, and beautiful analytics.

## 🚀 Features

### Core Features

- **Dashboard Overview**: User profile, repository stats, and key metrics
- **Repository Management**: Search, filter, and explore repositories
- **Issues & Pull Requests**: Track and manage issues across repositories
- **Security Dashboard**: Comprehensive vulnerability and security monitoring
- **Real-time Webhooks**: Live GitHub event processing and display
- **Analytics**: Interactive charts and insights about GitHub activity

### GitHub API Integration

- Users API (profile, followers, following)
- Repositories API (details, languages, contributors)
- Issues API (issues and pull requests)
- Pull Requests API (detailed PR tracking)
- Security APIs (Dependabot, Code Scanning, Secret Scanning)
- Webhooks (real-time event processing)

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **GitHub Integration**: Octokit
- **Date Handling**: date-fns

## 📦 Installation

```bash
# Create Next.js app
npx create-next-app@latest github-dashboard --typescript --tailwind --eslint --app

# Navigate to directory
cd github-dashboard

# Install dependencies
npm install @octokit/rest axios lucide-react recharts date-fns uuid @types/uuid
```

## ⚙️ Configuration

### 1. Environment Variables

Create `.env.local`:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username
```

### 2. GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `public_repo` (for public repositories)
   - `read:user` (for user profile)
   - `read:org` (for organizations)
   - `security_events` (for security alerts)
   - `vulnerability_alerts` (for Dependabot alerts)

### 3. Webhook Configuration

1. Go to your GitHub repository
2. Navigate to Settings → Webhooks
3. Click "Add webhook"
4. Configure:
   - **Payload URL**: `https://your-domain.com/api/webhook`
   - **Content type**: `application/json`
   - **Secret**: Your webhook secret from `.env.local`
   - **Events**: Select individual events:
     - Pull requests
     - Pull request reviews
     - Push events
     - Issues
     - Repository (stars, watches)
     - Security advisories

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
github-dashboard/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx               # Dashboard home
│   ├── profile/page.tsx       # User profile
│   ├── repositories/page.tsx  # Repositories listing
│   ├── issues/page.tsx        # Issues management
│   ├── security/page.tsx      # Security dashboard
│   ├── webhooks/page.tsx      # Webhook events
│   ├── analytics/page.tsx     # Analytics charts
│   ├── api/
│   │   ├── webhook/route.ts   # Webhook endpoint
│   │   ├── webhooks/route.ts  # Webhook management
│   │   └── webhook-stats/route.ts
│   ├── globals.css
│   ├── loading.tsx
│   └── error.tsx
├── components/
│   ├── Navigation.tsx         # Main navigation
│   ├── StatsCard.tsx         # Statistics display
│   ├── RepoCard.tsx          # Repository card
│   └── WebhookEvent.tsx      # Webhook event display
├── lib/
│   ├── github.ts             # GitHub API service
│   └── webhook-storage.ts    # Webhook storage
├── utils/
│   └── webhook-verifier.ts   # Webhook verification
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Security Features

### Webhook Security

- HMAC-SHA256 signature verification
- Payload sanitization
- Rate limiting
- Duplicate event detection

### Data Protection

- Environment variable security
- No sensitive data in client-side code
- Proper error handling
- Input validation

## 📊 Dashboard Pages

### 1. **Dashboard** (`/`)

- User profile overview
- Repository statistics
- Recent repositories
- Key metrics

### 2. **Profile** (`/profile`)

- Detailed user information
- Organizations
- Followers and following
- Account statistics

### 3. **Repositories** (`/repositories`)

- Repository listing with search and filters
- Language filtering
- Sort by stars, forks, updated date
- Repository statistics

### 4. **Issues** (`/issues`)

- Issues across repositories
- State filtering (open/closed)
- Repository filtering
- Issue details and labels

### 5. **Security** (`/security`)

- Dependabot alerts
- Code scanning results
- Secret scanning alerts
- Severity-based filtering

### 6. **Webhooks** (`/webhooks`)

- Real-time webhook events
- Event type filtering
- Detailed PR information
- Event statistics

### 7. **Analytics** (`/analytics`)

- Language distribution charts
- Repository statistics
- Timeline visualizations
- Performance metrics

## 🔧 API Endpoints

### Webhook APIs

- `POST /api/webhook` - Webhook receiver
- `GET /api/webhooks` - Get all webhook events
- `DELETE /api/webhooks` - Clear all events
- `GET /api/webhook-stats` - Webhook statistics

## 🚦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
GITHUB_TOKEN=your_production_github_token
WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username
```

## 🔍 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - GitHub API: 5,000 requests/hour (authenticated)
   - Implement caching for production use

2. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Ensure correct content type (application/json)

3. **Security Alerts Not Loading**
   - Verify GitHub token has security permissions
   - Check repository has security features enabled

### Debug Mode

Enable debug logging by adding console statements in:

- `lib/github.ts` for API calls
- `app/api/webhook/route.ts` for webhook processing

## 📈 Performance Optimization

- Server-side rendering with App Router
- Automatic code splitting
- Image optimization
- Static generation where possible
- Efficient API caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test webhook functionality
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development.
