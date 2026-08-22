const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./config/supabase");

// Routes
const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const timetableRoutes = require("./routes/timetable");
const adminRoutes = require("./routes/admin");
const swapRoutes = require("./routes/swaps");
const extraClassRoutes = require("./routes/extraClasses");
const reportRoutes = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// Health / Test API
// ============================================
app.get("/", (req, res) => {
    res.json({
        message: "Attendance Tracking System API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .limit(1);

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            message: "Supabase connection successful",
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================
// Routes Registration
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/extra-classes", extraClassRoutes);
app.use("/api/reports", reportRoutes);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Attendance Tracking System API running on port ${PORT}`
    );
});