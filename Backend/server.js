require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { connectDB, pool } = require("./db");

const app = express();


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}


app.use("/uploads", express.static(uploadsDir));

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

connectDB();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `hotel-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});


const formatHotel = (row) => ({
    id: row.id,
    name: row.name,
    image: row.image,
    location: row.location,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    price: row.price,
    room: row.room,
    rating: row.rating,
    description: row.description,
});

// Basic status route
app.get("/", (req, res) => {
    res.send("Hotel Booking Backend Running");
});


app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            status: "success",
            message: "PostgreSQL Database connected successfully",
            timestamp: result.rows[0].now,
        });
    } catch (err) {
        console.error("Database test route error:", err.message);
        res.status(500).json({
            status: "error",
            message: "Failed to connect to PostgreSQL database",
            error: err.message,
        });
    }
});

app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }
        const imagePath = `uploads/${req.file.filename}`;
        const imageUrl = `http://localhost:5000/${imagePath}`;
        res.json({
            message: "Image uploaded successfully",
            imagePath: imagePath,
            imageUrl: imageUrl,
        });
    } catch (err) {
        console.error("Image upload error:", err.message);
        res.status(500).json({ error: "Failed to upload image", message: err.message });
    }
});

app.get("/api/hotels", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM hotels ORDER BY id ASC");
        const hotels = result.rows.map(formatHotel);
        res.json(hotels);
    } catch (err) {
        console.error("Error fetching hotels:", err.message);
        res.status(500).json({ error: "Failed to fetch hotels", message: err.message });
    }
});

app.get("/api/hotels/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }
        res.json(formatHotel(result.rows[0]));
    } catch (err) {
        console.error(`Error fetching hotel ID ${id}:`, err.message);
        res.status(500).json({ error: "Failed to fetch hotel", message: err.message });
    }
});

app.post("/api/hotels", upload.single("image"), async (req, res) => {
    const { name, location, latitude, longitude, price, room, rating, description } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = `uploads/${req.file.filename}`;
    }

    if (!name || !location || !price) {
        return res.status(400).json({ error: "Name, location, and price are required fields." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO hotels (name, image, location, latitude, longitude, price, room, rating, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                name.trim(),
                image ? image.trim() : "",
                location.trim(),
                Number(latitude) || 0,
                Number(longitude) || 0,
                price.trim(),
                room ? room.trim() : "",
                rating ? rating.trim() : "",
                description ? description.trim() : "",
            ]
        );

        res.status(201).json(formatHotel(result.rows[0]));
    } catch (err) {
        console.error("Error creating hotel:", err.message);
        res.status(500).json({ error: "Failed to create hotel", message: err.message });
    }
});

app.put("/api/hotels/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const { name, location, latitude, longitude, price, room, rating, description } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = `uploads/${req.file.filename}`;
    }

    try {
        const result = await pool.query(
            `UPDATE hotels
       SET name = $1, image = $2, location = $3, latitude = $4, longitude = $5, price = $6, room = $7, rating = $8, description = $9
       WHERE id = $10
       RETURNING *`,
            [
                name ? String(name).trim() : "",
                image ? String(image).trim() : "",
                location ? String(location).trim() : "",
                Number(latitude) || 0,
                Number(longitude) || 0,
                price ? String(price).trim() : "",
                room ? String(room).trim() : "",
                rating ? String(rating).trim() : "",
                description ? String(description).trim() : "",
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        res.json(formatHotel(result.rows[0]));
    } catch (err) {
        console.error(`Error updating hotel ID ${id}:`, err.message);
        res.status(500).json({ error: "Failed to update hotel", message: err.message });
    }
});

app.delete("/api/hotels/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        res.json({ message: "Hotel deleted successfully", id: Number(id) });
    } catch (err) {
        console.error(`Error deleting hotel ID ${id}:`, err.message);
        res.status(500).json({ error: "Failed to delete hotel", message: err.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});