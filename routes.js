const express = require("express");
const path = require("path");
const router = express.Router();
const { connectDB } = require("./db");

// ================= MIDDLEWARE =================

// ✅ Check login
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(403).json({
    message: "Access denied. Please log in first."
  });
}

// ✅ Track last page
function trackLastPage(req, res, next) {
  if (req.session.user) {
    req.session.lastPage = req.path;
  }
  next();
}

// ✅ Prevent logged-in users from login/register pages
function preventAuthPages(req, res, next) {
  if (req.session.user) {
    return res.redirect(req.session.lastPage || "/bomboozled");
  }
  next();
}

// ================= ROUTES =================

// Public Pages
router.get("/", preventAuthPages, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

router.get("/login", preventAuthPages, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

router.get("/register", preventAuthPages, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "from.html"));
});

// ================= PROTECTED =================

router.get("/instructions", isAuthenticated, trackLastPage, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bamboozled-game-simplified.html"));
});

router.get("/bomboozled", isAuthenticated, trackLastPage, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

router.get("/final", isAuthenticated, trackLastPage, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "final.html"));
});

// ================= LOGIN =================

router.post("/login", async (req, res) => {
  console.log("LOGIN API CALLED");
  console.log("BODY:", req.body);

  try {
    const { email, contactNumber } = req.body;

    if (!email || !contactNumber) {
      return res.status(400).json({
        message: "Email and contact number required"
      });
    }

    const { collection } = await connectDB();

    const user = await collection.findOne({
      email: email,
      contactno: contactNumber
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials"
      });
    }

    // ✅ SAVE SESSION
    req.session.user = {
      name: user.name,
      email: user.email
    };

    req.session.save((err) => {
      if (err) {
        console.error("SESSION ERROR:", err);
        return res.status(500).json({ message: "Session error" });
      }

      res.json({
        message: "Login successful",
        redirectUrl: "/instructions"
      });
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error during login"
    });
  }
});

// ================= REGISTER (FIXED) =================

router.post("/register", async (req, res) => {
  console.log("REGISTER API CALLED");
  console.log("BODY:", req.body);

  try {
    const { name, email, contactno } = req.body;

    if (!name || !email || !contactno) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const { collection } = await connectDB();

    // ✅ Check if user exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ✅ Insert user
    await collection.insertOne({
      name,
      email,
      contactno
    });

    console.log("USER REGISTERED");

    // ✅ AUTO LOGIN AFTER REGISTER
    req.session.user = {
      name,
      email
    };

    req.session.save((err) => {
      if (err) {
        console.error("SESSION ERROR:", err);
        return res.status(500).json({ message: "Session error" });
      }

      res.status(201).json({
        message: "Registration successful",
        redirectUrl: "/instructions"
      });
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error during registration"
    });
  }
});

// ================= LOGOUT =================

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({
      message: "Logout successful",
      redirectUrl: "/"
    });
  });
});

module.exports = router;