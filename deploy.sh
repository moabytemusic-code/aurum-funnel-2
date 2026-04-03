#!/bin/bash

# AURUM Funnel Deployment Script
# Run this script to push to GitHub and deploy to Vercel

echo "🚀 AURUM Onboarding Funnel - Deployment Script"
echo "=============================================="
echo ""

# Step 1: Create GitHub Repository
echo "📦 Step 1: Push to GitHub"
echo ""
echo "Please create a new repository on GitHub:"
echo "  1. Go to https://github.com/new"
echo "  2. Repository name: aurum-onboarding-funnel"
echo "  3. Keep it Public or Private (your choice)"
echo "  4. DO NOT initialize with README, .gitignore, or license"
echo "  5. Click 'Create repository'"
echo ""
read -p "Press Enter once you've created the repo..."

echo ""
echo "Now enter your GitHub username:"
read -p "> " GITHUB_USERNAME

echo ""
echo "Adding remote and pushing to GitHub..."
git remote add origin https://github.com/$GITHUB_USERNAME/aurum-onboarding-funnel.git
git branch -M main
git push -u origin main

echo ""
echo "✅ Pushed to GitHub!"
echo ""

# Step 2: Deploy to Vercel
echo "🌐 Step 2: Deploy to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "Deploying to Vercel..."
echo "You'll be prompted to log in if you haven't already."
echo ""

# Deploy with defaults
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "  1. Go to your Vercel dashboard to configure your custom domain"
echo "  2. Update the video embed URL in src/app/page.tsx"
echo "  3. Connect the application form to your CRM/backend"
echo "  4. Update support email and contact links"
