This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🚀 Deployment

### Production Setup
1. Copy `.env.production.template` to `.env.production`
2. Fill in all production environment variables
3. Set up your production database
4. Run the deployment script: `npm run deploy`
5. Follow the `DEPLOYMENT_CHECKLIST.md`

### Health Check
- Health endpoint: `/api/health`
- Use this for monitoring and load balancer health checks

### Log Management
The application includes a comprehensive logging system:
- User activity logs
- Audit trails for sensitive operations
- Login/security logs
- System event logs
- Log analytics and reporting
- Export functionality

Access logs at: `/dashboard/logs` (requires appropriate permissions)

### Features
- ✅ Role-Based Access Control (RBAC)
- ✅ Comprehensive Logging System  
- ✅ Project Management
- ✅ Lead Management
- ✅ Client Management
- ✅ User Management
- ✅ Dashboard and Reports
- ✅ Export/Import Functionality

### Support
For deployment assistance, check the deployment checklist and logs.
