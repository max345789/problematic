# How to Put Problematic Backend Online for Worldwide Access

To make every user across the globe see everyone's posts in real-time, the backend server must be hosted on the public internet (cloud) rather than running only on `localhost`.

---

## Option 1: Free Cloud Deployment via Render.com (Recommended — 3 mins)

1. **Push your code to GitHub** (or push just the `server/` directory to a new repo `problematic-server`).
2. Go to **[https://render.com](https://render.com)** and sign in.
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
5. Under **Advanced** > **Add Disk** (to keep data saved when server restarts):
   - **Name:** `problematic-data`
   - **Mount Path:** `/app/data`
   - **Size:** `1 GB`
6. Click **Create Web Service**.
7. Once deployed, Render gives you a public HTTPS URL, for example:
   `https://problematic-api.onrender.com`

---

## Option 2: Deploy on Railway.app (2 mins)

1. Go to **[https://railway.app](https://railway.app)** and sign in with GitHub.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select the repository and set Root Directory to `/server`.
4. Railway automatically detects Node.js and starts the server.
5. In service settings, click **Generate Domain** to get a public URL (e.g. `https://problematic-server-production.up.railway.app`).

---

## Option 3: Deploy on Any VPS (Ubuntu / Debian / AWS / DigitalOcean)

```bash
# Clone and enter server
git clone <your-repo>
cd problematic/server
npm install

# Start with PM2 for background process management & auto-restart
npm install -g pm2
pm2 start index.js --name "problematic-api"
pm2 save
pm2 startup
```

---

## Final Step: Link the Cloud Server to Problematic App

Once you have your public URL (e.g. `https://your-server.onrender.com`):

1. Create a `.env` file in the project root:
   ```env
   VITE_API_URL=https://your-server.onrender.com/api
   ```
2. Re-compile the Android bundle:
   ```powershell
   npm run build
   npx cap sync android
   cd android
   .\gradlew bundleRelease -x lintVitalRelease
   ```
3. Your new `release/problematic-v1.0.0.aab` will now connect every phone in the world to your shared cloud database!
