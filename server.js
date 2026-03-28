const express = require('express');
const path = require('path');
const cors = require("cors");
const session = require("express-session"); // ✅ ADD THIS
const bodyParser = require("body-parser");
const routes = require("./routes");
const { closeDBConnection } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIXED CORS (important for session cookies)
app.use(cors({
    origin: true,          // allow all origins (safe for dev)
    credentials: true      // allow cookies
}));

// ✅ Body parsing
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SESSION SETUP (VERY IMPORTANT)
app.use(session({
    name: "bomboozledSession",   // custom cookie name
    secret: "secret-key",        // change in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,           // true only in HTTPS (production)
        httpOnly: true,
        sameSite: "lax"
    }
}));

// ✅ DEBUG (optional but helpful)
app.use((req, res, next) => {
    console.log("SESSION:", req.session);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/", routes);

// ✅ FIX: store server instance
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing server and database connection...');
    server.close(); // ✅ now works
    await closeDBConnection();
    process.exit(0);
});

module.exports = app;