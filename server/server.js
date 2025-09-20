require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const bodyParse = require("body-parser");
const connectDB = require("./Config/db");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();
connectDB();

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.gstatic.com",
        "'unsafe-inline'",
      ],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "'unsafe-inline'",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["https://www.google.com", "https://www.recaptcha.net"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.gstatic.com",
        ...(process.env.CLIENT_URL || "").split(",").map((url) => url.trim()),
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  })
);


const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.options("*", cors()); // Preflight

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("⛔ Blocked CORS Origin:", origin);
        callback(new Error("⛔ CORS Blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ โหลดไฟล์ภาพข้าม origin
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "คุณส่งคำขอมากเกินไป โปรดลองใหม่ในอีก 15 นาที",
});
app.use("/api", limiter);

// ✅ Middleware
app.use(morgan("dev"));
app.use(bodyParse.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(mongoSanitize());
app.use(cookieParser());

// ✅ CSRF
const csrfProtection = csrf({ cookie: true });

// ✅ ฟอร์มทดสอบ CSRF
app.get("/form", csrfProtection, (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post("/submit", csrfProtection, (req, res) => {
  res.send("Form submitted successfully!");
});

// ✅ Load ทุก route
const routePath = path.join(__dirname, "Routes");
fs.readdirSync(routePath).forEach((file) => {
  const route = require(path.join(routePath, file));
  if (typeof route === "function") {
    app.use("/api", route);
  } else {
    console.warn(`⚠️ Route "${file}" ไม่ใช่ middleware function`);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is Running on port ${PORT}`));