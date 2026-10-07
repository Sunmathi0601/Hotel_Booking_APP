const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "hotel_booking",
        password: process.env.DB_PASSWORD || "postgres",
        port: parseInt(process.env.DB_PORT || "5432", 10),
      }
);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

const seedHotels = [
  {
    name: "Grand Palace Hotel",
    image: "picture3.jpg",
    location: "Dubai, UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    price: "₹10,000",
    room: "Deluxe Room, Suite",
    rating: "4.5 ⭐",
    description: "A luxury hotel with comfortable rooms and excellent facilities.",
  },
  {
    name: "Sea View Resort",
    image: "picture4.jpeg",
    location: "Pondicherry, Tamil Nadu",
    latitude: 11.9416,
    longitude: 79.8083,
    price: "₹15,000",
    room: "Sea View Room, Deluxe Room",
    rating: "4.6 ⭐",
    description: "Beautiful sea view resort with a peaceful environment.",
  },
  {
    name: "Lumina Hotel",
    image: "picture6.jpeg",
    location: "Calangute, Goa",
    latitude: 15.5449,
    longitude: 73.7553,
    price: "₹15,000",
    room: "Luxury Room, Suite",
    rating: "4.8 ⭐",
    description: "A premium hotel with modern rooms and luxury facilities.",
  },
  {
    name: "Green Valley Hotel",
    image: "pictrue7.jpeg",
    location: "Ooty, Tamil Nadu",
    latitude: 11.4064,
    longitude: 76.6932,
    price: "₹75,000",
    room: "Standard Room, Deluxe Room",
    rating: "4.4 ⭐",
    description: "A beautiful hotel surrounded by the green hills of Ooty.",
  },
  {
    name: "City Star Hotel",
    image: "picture2.jpg",
    location: "Madurai, Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
    price: "₹4,000",
    room: "Standard Room, Deluxe Room",
    rating: "4.2 ⭐",
    description: "Comfortable stay in the heart of Madurai city.",
  },
  {
    name: "Velvet Horizon",
    image: "picture8.jpg",
    location: "Udaipur, Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125,
    price: "₹8,500",
    room: "Deluxe Room, Suite",
    rating: "4.7 ⭐",
    description: "A stylish hotel offering a beautiful and relaxing stay.",
  },
  {
    name: "Golden Willow",
    image: "picture9.jpg",
    location: "Salem, Tamil Nadu",
    latitude: 11.6643,
    longitude: 78.1460,
    price: "₹11,999",
    room: "Luxury Room, Suite",
    rating: "4.5 ⭐",
    description: "A comfortable luxury hotel with excellent hospitality.",
  },
  {
    name: "Family City Hotel",
    image: "picture10.jpg",
    location: "Pune, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    price: "₹5,000",
    room: "Standard Room, Deluxe Room",
    rating: "4.3 ⭐",
    description: "A modern hotel with comfortable rooms and great service.",
  },
];

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log(`PostgreSQL Connected Successfully! (Server Time: ${res.rows[0].now})`);

  
    await client.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude NUMERIC(10, 6) NOT NULL,
        longitude NUMERIC(10, 6) NOT NULL,
        price VARCHAR(100) NOT NULL,
        room VARCHAR(255) NOT NULL,
        rating VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Hotels table initialized.");

  
    const countRes = await client.query("SELECT COUNT(*) FROM hotels");
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      console.log("Hotels table is empty. Seeding initial demo hotels...");
      for (const hotel of seedHotels) {
        await client.query(
          `INSERT INTO hotels (name, image, location, latitude, longitude, price, room, rating, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            hotel.name,
            hotel.image,
            hotel.location,
            hotel.latitude,
            hotel.longitude,
            hotel.price,
            hotel.room,
            hotel.rating,
            hotel.description,
          ]
        );
      }
      console.log(`Successfully seeded ${seedHotels.length} demo hotels into PostgreSQL database!`);
    } else {
      console.log(`Hotels table already contains ${count} records.`);
    }

    client.release();
  } catch (error) {
    console.error("PostgreSQL Connection / Init Error:", error.message);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectDB,
};
