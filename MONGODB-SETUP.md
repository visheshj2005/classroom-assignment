# 🗄️ MongoDB Setup Guide

Choose one of the following options to set up MongoDB for local development:

## Option 1: Local MongoDB (Recommended for Development)

### Windows Installation

1. **Download MongoDB Community Edition**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and "msi" package
   - Download and run the installer

2. **Install MongoDB**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**
   ```cmd
   # Open Command Prompt and run:
   mongod --version
   ```

4. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows service
   - If not, go to Services (services.msc) and start "MongoDB Server"

5. **Test Connection**
   ```bash
   cd server
   node testConnection.js
   ```

### Mac Installation

1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   # Start MongoDB service
   brew services start mongodb/brew/mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **Test Connection**
   ```bash
   cd server
   node testConnection.js
   ```

### Linux Installation (Ubuntu/Debian)

1. **Import MongoDB GPG Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Test Connection**
   ```bash
   cd server
   node testConnection.js
   ```

## Option 2: MongoDB Atlas (Cloud Database)

### Setup MongoDB Atlas

1. **Create Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free tier)
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., "classroom-portal")

3. **Configure Database Access**
   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, use specific IP addresses

5. **Get Connection String**
   - Go to "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

6. **Update Environment Variables**
   ```env
   # In server/.env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classroom-assignment?retryWrites=true&w=majority
   ```

7. **Test Connection**
   ```bash
   cd server
   node testConnection.js
   ```

## Environment Configuration

### Update server/.env

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/classroom-assignment

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classroom-assignment?retryWrites=true&w=majority

# Other required settings
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Troubleshooting

### Common Issues

#### "Connection Refused" Error
```
❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. Make sure MongoDB is installed and running
2. Check if MongoDB service is started
3. Verify the connection string in server/.env

#### "Authentication Failed" Error (Atlas)
```
❌ Database connection failed: Authentication failed
```

**Solutions:**
1. Check username and password in connection string
2. Ensure database user has correct permissions
3. Verify network access allows your IP

#### "Server Selection Timeout" Error
```
❌ Database connection failed: Server selection timed out
```

**Solutions:**
1. Check internet connection (for Atlas)
2. Verify connection string format
3. Check firewall settings

### Verification Commands

```bash
# Test database connection
cd server
node testConnection.js

# Check MongoDB status (Windows)
sc query MongoDB

# Check MongoDB status (Mac)
brew services list | grep mongodb

# Check MongoDB status (Linux)
sudo systemctl status mongod
```

## Next Steps

Once MongoDB is set up and running:

1. **Test Connection**
   ```bash
   cd server
   node testConnection.js
   ```
   You should see: ✅ Database connection successful

2. **Seed Demo Data**
   ```bash
   cd server
   npm run seed
   ```

3. **Start Application**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## MongoDB GUI Tools (Optional)

### MongoDB Compass
- Official MongoDB GUI
- Download: https://www.mongodb.com/products/compass
- Connect using: `mongodb://localhost:27017`

### Studio 3T
- Third-party MongoDB GUI
- Download: https://studio3t.com/
- Free version available

---

**Need Help?** 
- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Community Forums: https://community.mongodb.com/
- MongoDB Atlas Support: https://support.mongodb.com/