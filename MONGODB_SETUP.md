# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for the Creator Dashboard application.

## 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account if you don't have one already.
2. Once logged in, you'll be prompted to create a new organization and project.

## 2. Create a New Cluster

1. Click on "Build a Database" to start setting up a new cluster.
2. Choose the FREE tier option (M0 Sandbox).
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region (choose the region closest to your application's deployment location).
4. Leave the default cluster name or give it a meaningful name like "creator-dashboard-cluster".
5. Click "Create Cluster" - this will take a few minutes to provision.

## 3. Set Up Database Access

1. While the cluster is being created, click on "Database Access" in the left sidebar.
2. Click "Add New Database User".
3. Choose "Password" as the authentication method.
4. Enter a username and a strong, secure password (save these credentials safely).
5. Set user privileges to "Read and write to any database" for simplicity.
6. Click "Add User".

## 4. Configure Network Access

1. Click on "Network Access" in the left sidebar.
2. Click "Add IP Address".
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0).
   - Note: For production, you should restrict access to specific IP addresses for better security.
4. Click "Confirm".

## 5. Get Your Connection String

1. Once your cluster is created, click on "Connect" on your cluster's page.
2. Select "Connect your application".
3. Choose "Node.js" as your driver and select the appropriate version.
4. Copy the provided connection string.
5. Replace `<password>` with your database user's password and `<dbname>` with your preferred database name (e.g., "creator-dashboard").

Example connection string:
```
mongodb+srv://username:<password>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority
```

## 6. Configure Your Application

1. Add the connection string to your server's `.env` file:
```
MONGODB_URI=mongodb+srv://username:<password>@cluster0.example.mongodb.net/creator-dashboard?retryWrites=true&w=majority
```

2. When deploying to Google Cloud Run, add this as a secret:
```bash
gcloud secrets create mongodb-uri --data-file="/path/to/mongodb-uri.txt"
```

## 7. Create Database Collections

The Creator Dashboard application uses the following collections:

1. `users` - Stores user account information
2. `credits` - Stores user credit transactions
3. `savedcontent` - Stores content saved by users
4. `reports` - Stores content reported by users
5. `activities` - Stores user activity logs

These collections will be created automatically when the application first accesses the database.

## 8. Database Indexing (Optional but Recommended)

For better performance, you can create indexes on frequently queried fields:

1. Navigate to your cluster and click on "Collections".
2. Select your database and collection.
3. Click on the "Indexes" tab.
4. Create the following indexes:

For `users` collection:
- `email`: Unique index
- `username`: Unique index

For `savedcontent` collection:
- `userId`: Non-unique index
- `contentId`: Non-unique index

For `activities` collection:
- `userId`: Non-unique index
- `timestamp`: Non-unique index

## 9. MongoDB Atlas Monitoring

MongoDB Atlas provides free monitoring tools:

1. On your cluster's page, click on "Metrics" to view real-time performance data.
2. Set up alerts by clicking on "Alerts" in the left sidebar to get notified about critical events.

## 10. Backup and Restore (Free Tier Limitations)

Free M0 clusters don't include automated backups. For production, consider:

1. Manual exports using MongoDB Compass
2. Upgrading to a paid tier for point-in-time backups
3. Implementing application-level backup strategies

## 11. Connection from Google Cloud Run

When connecting from Google Cloud Run:

1. Ensure your MongoDB Atlas cluster allows connections from 0.0.0.0/0 (anywhere) or from Google Cloud's IP ranges.
2. Use connection pooling in your application to efficiently manage connections.
3. Implement proper error handling and retry logic for transient connection issues.

## 12. Troubleshooting Connection Issues

If you encounter connection problems:

1. Verify network access settings in MongoDB Atlas
2. Check that your connection string is correctly formatted
3. Ensure your username and password are correct
4. Test the connection using MongoDB Compass
5. Check for any firewalls or VPC settings that might block connections 