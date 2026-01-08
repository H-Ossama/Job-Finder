# Job Finder & CV AI Assistant

A powerful AI-driven platform that helps job seekers create ATS-compliant CVs and automate their job search process. Built with Next.js, Supabase, and modern web technologies.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password and OAuth (Google, GitHub, LinkedIn)
- 📝 **AI-Powered CV Builder** - Create professional, ATS-compliant resumes
- 🎯 **Smart Job Search** - AI-assisted job discovery and matching
- 📊 **Application Tracking** - Monitor your job applications in one place
- 🤖 **Automation Ready** - Integration with n8n for workflow automation
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth
- **Styling**: CSS Modules with custom design system
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- (Optional) OAuth provider accounts for social login

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Job-Finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy the contents of supabase_schema.sql
   # Paste into Supabase Dashboard > SQL Editor > New Query
   # Execute the query
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be set up

### 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy your project URL and anon/public key
3. Add them to your `.env.local` file

### 3. Run Database Schema

1. Open SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase_schema.sql`
3. Paste and execute the query

This will create:
- `profiles` table - User profile information
- `cvs` table - CV storage and management
- `applications` table - Job application tracking
- Row Level Security (RLS) policies

### 4. Configure OAuth Providers (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
6. Copy Client ID and Client Secret
7. In Supabase Dashboard > Authentication > Providers > Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

#### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in application details:
   - Homepage URL: `http://localhost:3000` (or your production URL)
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID and generate Client Secret
5. In Supabase Dashboard > Authentication > Providers > GitHub:
   - Enable GitHub provider
   - Paste Client ID and Client Secret
   - Save

#### LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. In the Auth tab, add redirect URLs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret
5. In Supabase Dashboard > Authentication > Providers > LinkedIn (OIDC):
   - Enable LinkedIn provider
   - Paste Client ID and Client Secret
   - Save

## 📁 Project Structure

```
Job-Finder/
├── app/
│   ├── auth/
│   │   └── callback/          # OAuth callback handler
│   ├── dashboard/             # User dashboard
│   ├── login/                 # Authentication pages
│   │   ├── actions.js         # Server actions for auth
│   │   ├── page.js            # Login UI
│   │   └── login.module.css   # Login styles
│   ├── globals.css            # Global styles & design system
│   ├── layout.js              # Root layout
│   └── page.js                # Landing page
├── components/
│   ├── Contact.js             # Contact section
│   ├── Features.js            # Features showcase
│   ├── Header.js              # Navigation header
│   └── Hero.js                # Hero section
├── utils/
│   └── supabase/
│       ├── client.js          # Client-side Supabase
│       ├── middleware.js      # Middleware utilities
│       └── server.js          # Server-side Supabase
├── middleware.js              # Route protection
├── supabase_schema.sql        # Database schema
└── package.json
```

## 🎯 Usage

### Authentication

- **Sign Up**: Create a new account with email/password
- **Log In**: Use email/password or OAuth providers
- **OAuth**: Click Google, GitHub, or LinkedIn buttons for social login

### Dashboard

After logging in, users can:
- Create and manage CVs
- Search for jobs
- Track applications
- Update profile settings

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for OAuth redirects) | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key for CV generation (get from [Google AI Studio](https://makersuite.google.com/app/apikey)) | Yes (for CV Builder) |


## 🚢 Deployment

### Railway (Recommended)

Railway is a modern platform for deploying web applications with minimal configuration.

#### Prerequisites
- Railway account ([sign up here](https://railway.app))
- GitHub repository with your code

#### Step-by-Step Guide

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Connect Railway to GitHub**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select your Job-Finder repository

3. **Configure Environment Variables**
   
   In Railway Dashboard, go to Variables and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-railway-domain.railway.app
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Configure Build & Deploy Settings**
   
   Railway should auto-detect Next.js. If not, ensure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`

5. **Get Your Production URL**
   
   After deployment completes:
   - Your app will be available at a Railway-generated URL (e.g., `yourapp-production.railway.app`)
   - Go to Railway Project Settings to set a custom domain if needed

6. **Update OAuth Providers**
   
   Update your OAuth redirect URLs in each provider:
   
   **Google OAuth**:
   - Go to Google Cloud Console > Credentials
   - Add authorized redirect URI: `https://your-railway-domain.railway.app/auth/callback`

   **GitHub OAuth**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Update Authorization callback URL: `https://your-railway-domain.railway.app/auth/callback`

   **LinkedIn OAuth**:
   - Update redirect URLs in LinkedIn Developers portal

7. **Update Supabase Settings**
   
   In Supabase Dashboard:
   - Go to Project Settings > Authentication > URL Configuration
   - Set Site URL to: `https://your-railway-domain.railway.app`
   - Add Redirect URL: `https://your-railway-domain.railway.app/auth/callback`

8. **Deploy**
   
   - Push changes to GitHub
   - Railway will automatically rebuild and redeploy
   - Check deployment logs in Railway Dashboard

#### Railway CLI Alternative (Optional)

If you prefer using the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create a new project
railway init

# Set environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_value
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
railway variables set NEXT_PUBLIC_SITE_URL=https://your-domain
railway variables set GOOGLE_AI_API_KEY=your_value

# Deploy
railway up
```

#### Troubleshooting Railway Deployment

- **Build fails**: Check Railway logs for errors. Ensure Node.js 18+ is available
- **Env variables not loading**: Verify they're set in Railway Variables tab
- **OAuth errors**: Ensure redirect URLs match exactly in provider settings
- **Database connection errors**: Verify Supabase credentials are correct
- **Cold starts**: Normal for Railway. Use a paid plan for faster cold starts

### Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Self-hosted

**Important**: Update `NEXT_PUBLIC_SITE_URL` to your production URL and update OAuth redirect URLs in provider settings.

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### OAuth Not Working

- Verify redirect URLs match exactly in provider settings
- Check that OAuth providers are enabled in Supabase
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
- Clear browser cache and cookies

### Database Errors

- Verify `supabase_schema.sql` was executed successfully
- Check RLS policies are enabled
- Ensure API keys are correct in `.env.local`

### Build Errors

- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
