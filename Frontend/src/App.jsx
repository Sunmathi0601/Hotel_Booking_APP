import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Card from "./card";
import HotelDetails from "./hoteldetails";
import Booking from "./Booking";
import AddHotel from "./addhotel";
import { fetchHotelsApi, createHotelApi } from "./hotels";
import Nav from "./nav";
import Search from "./search";
import Price from "./price";
import Help from "./help";

function App() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() =>
        window.localStorage.getItem("hotelstay-theme") === "dark" ? "dark" : "light",
    );
    const [filterFormKey, setFilterFormKey] = useState(0);
    const [filters, setFilters] = useState({
        name: "",
        minPrice: 0,
        maxPrice: null,
    });

    const loadHotels = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchHotelsApi();
            setHotels(data);
        } catch (err) {
            console.error("Failed to load hotels:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const filteredHotels = hotels.filter((hotel) => {
        const matchesName = hotel.name
            .toLowerCase()
            .includes(filters.name.toLowerCase());
        const price = Number((hotel.price || "").replace(/[^\d]/g, ""));
        const matchesMinimum = price >= filters.minPrice;
        const matchesMaximum = filters.maxPrice === null || price <= filters.maxPrice;

        return matchesName && matchesMinimum && matchesMaximum;
    });

    const addHotel = async (hotelDetails) => {
        try {
            const createdHotel = await createHotelApi(hotelDetails);
            setHotels((currentHotels) => [createdHotel, ...currentHotels]);
            setFilters({ name: "", minPrice: 0, maxPrice: null });
            setFilterFormKey((currentKey) => currentKey + 1);
            return createdHotel;
        } catch (err) {
            console.error("Error adding hotel:", err);
            alert("Failed to create hotel: " + err.message);
            throw err;
        }
    };

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("hotelstay-theme", theme);
    }, [theme]);

    return (
        <BrowserRouter>
            <Nav
                theme={theme}
                onToggleTheme={() =>
                    setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light")
                }
            />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Search />
                            <Price key={filterFormKey} onApplyFilters={setFilters} />
                            {loading ? (
                                <p style={{ textAlign: "center", margin: "2rem", fontSize: "1.2rem" }}>
                                    Loading hotels from database...
                                </p>
                            ) : error ? (
                                <div style={{ textAlign: "center", margin: "2rem", color: "red" }}>
                                    <p>Failed to connect to backend server or database.</p>
                                    <button
                                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                                        onClick={loadHotels}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <Card hotels={filteredHotels} setHotels={setHotels} />
                            )}
                        </>
                    }
                />
                <Route
                    path="/add-hotel"
                    element={<AddHotel onAddHotel={addHotel} />}
                />
                <Route path="/help" element={<Help />} />
                <Route
                    path="/hotel/:hotelId"
                    element={<HotelDetails hotels={hotels} setHotels={setHotels} />}
                />
                <Route path="/booking-confirmed" element={<Booking />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;