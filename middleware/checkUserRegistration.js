async function checkUserRegistration(req, res, next) {
  console.log("BODY:", req.body);

  const { emailAddress } = req.body;

  if (!emailAddress) {
    return res.status(400).json({ message: "Email address is required" });
  }

  try {
    const { collection } = await connectDB();

    console.log("Searching for:", emailAddress);

    const user = await collection.findOne({ email: emailAddress });

    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ message: "User not registered" });
    }

    next();
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
}