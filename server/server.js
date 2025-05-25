require("dotenv").config(); // <<< สำคัญที่สุด!

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const bodyParse = require("body-parser");
const connectDB = require("./Config/db");
const mongoSanitize = require("express-mongo-sanitize"); // ✅ ป้องกัน NoSQL Injection
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();
connectDB();

// ✅ Helmet + CSP (สำหรับ reCAPTCHA)
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "deny" }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "https://www.google.com",
        "https://www.gstatic.com",
        "'unsafe-inline'"
      ],
      "style-src": [
        "'self'",
        "https://fonts.googleapis.com",
        "'unsafe-inline'"
      ],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "frame-src": ["https://www.google.com", "https://www.recaptcha.net"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": [
        "'self'",
        "https://www.google.com",
        "https://www.gstatic.com",
        ...(process.env.CLIENT_URL || "").split(",").map((url) => url.trim())
      ],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
    },
  })
);

// ✅ CORS รองรับหลายโดเมนจาก .env
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("⛔ CORS Blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ โหลดไฟล์รูปข้าม origin ได้
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ✅ Rate Limit
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
app.use(mongoSanitize()); // ✅ ป้องกัน NoSQL Injection

// ✅ ตั้งค่า cookie-parser สำหรับการจัดการ Cookies
app.use(cookieParser());

// ✅ ตั้งค่า CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// ✅ Route สำหรับฟอร์มที่มี CSRF Token
app.get("/form", csrfProtection, (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <button type="submit">Submit</button>
    </form>
  `);
});

// ✅ Route สำหรับรับคำขอจากฟอร์ม
app.post("/submit", csrfProtection, (req, res) => {
  res.send("Form submitted successfully!");
});

// ✅ Load routes อย่างปลอดภัย
const routePath = path.join(__dirname, "Routes");
fs.readdirSync(routePath).forEach((file) => {
  const route = require(path.join(routePath, file));
  if (typeof route === "function") {
    app.use("/api", route);
  } else {
    console.warn(`⚠️  Route "${file}" ไม่ใช่ middleware function (router). ข้ามไฟล์นี้ไป`);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is Running on port ${PORT}`));
