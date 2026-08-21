const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();


// ============================================
// REGISTER
// ============================================

router.post("/register", async (req, res) => {
    try {
        const {
            email,
            password,
            full_name,
            role
        } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: "Email, password and full name are required"
            });
        }

        const allowedRoles = [
            "student",
            "teacher",
            "admin"
        ];

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const { data, error } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name,
                        role: role || "student"
                    }
                }
            });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: data.user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// ============================================
// LOGIN
// ============================================

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            session: data.session,
            user: data.user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


module.exports = router;