import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./card.css";
import { getHotelImageSource, getMapEmbedUrl, updateHotelApi, deleteHotelApi, fetchHotelByIdApi, uploadImageApi } from "./hotels";

const additionalHotelImages = {
    "Grand Palace Hotel": [
        "/grandpalaceimg1.jpg",
        "/grandpalaceimg2.jpg",
        "/grandpalaceimg3.jpg",
        "/grandpalaceimg4.jpg",
    ],
    "Sea View Resort": [
        "/seaviewimg1.jpg",
        "/seaviewimg2.jpg",
        "/seaviewimg3.jpg",
        "/seaviewimg4.jpg",
    ],
    "Lumina Hotel": [
        "/luminaimg1.jpg",
        "/luminaimg2.jpg",
        "/luminaimg3.jpg",
        "/luminaimg4.jpg",
    ],
    "Green Valley Hotel": [
        "/greenvalleyimg1.jpg",
        "/greenvalleyimg2.jpg",
        "/greenvalleyimg3.jpg",
        "/greenvalleyimg4.jpg",
    ],
    "City Star Hotel": [
        "/citystarimg1.jpg",
        "/citystarimg2.jpg",
        "/citystarimg3.jpg",
        "/citystarimg4.jpg",
    ],
    "Velvet Horizon": [
        "/velvetimg1.jpg",
        "/velvetimg2.jpg",
        "/velvetimg3.jpg",
        "/velvetimg4.jpg",
    ],
    "Golden Willow": [
        "/goldenimg1.jpg",
        "/goldenimg2.jpg",
        "/goldenimg3.jpg",
        "/goldenimg4.jpg",
    ],
    "Family City Hotel": [
        "/emberimg1.jpg",
        "/emberimg2.jpg",
        "/emberimg3.jpg",
        "/emberimg4.jpg",
    ],
};

const HotelDetails = ({ hotels = [], setHotels }) => {
    const { state } = useLocation();
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const bookingSectionRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [editDraft, setEditDraft] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [imageError, setImageError] = useState("");
    const [fetchedHotel, setFetchedHotel] = useState(null);
    const [loadingHotel, setLoadingHotel] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        guests: "1",
        checkIn: "",
        checkOut: "",
        room: "Deluxe Room",
    });

    const hotel = hotels.find((item) => String(item.id) === String(hotelId)) || state?.hotel || fetchedHotel;

    useEffect(() => {
        if (!hotel && hotelId) {
            setLoadingHotel(true);
            fetchHotelByIdApi(hotelId)
                .then((data) => setFetchedHotel(data))
                .catch((err) => console.error("Failed to load hotel details:", err))
                .finally(() => setLoadingHotel(false));
        }
    }, [hotel, hotelId]);

    const nights = customer.checkIn && customer.checkOut
        ? Math.max(
              0,
              Math.ceil(
                  (new Date(`${customer.checkOut}T00:00:00`) -
                      new Date(`${customer.checkIn}T00:00:00`)) /
                      (1000 * 60 * 60 * 24),
              ),
          )
        : 0;
    const nightlyRate = hotel
        ? Number(hotel.price.replace(/[^\d]/g, ""))
        : 0;
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    const updateCustomer = (event) => {
        const { name, value } = event.target;
        setCustomer((current) => ({ ...current, [name]: value }));
    };

    const handleBooking = (event) => {
        event.preventDefault();
        navigate("/booking-confirmed", {
            state: {
                booking: {
                    hotel,
                    customer,
                    nights,
                    total: nightlyRate * nights,
                },
            },
        });
    };

    const handleEditFileChange = (event) => {
        const file = event.target.files?.[0];
        setImageError("");
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setImageError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setImageError("Image file size must be 10 MB or less.");
            event.target.value = "";
            return;
        }

        setEditImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setEditDraft((current) => ({
            ...current,
            image: previewUrl,
        }));
    };

    const saveHotel = async (event) => {
        event.preventDefault();
        setActionLoading(true);
        setImageError("");
        try {
            let finalImagePath = editDraft.image;

            if (editImageFile) {
                finalImagePath = await uploadImageApi(editImageFile);
            }

            const updatedPayload = {
                ...editDraft,
                name: editDraft.name.trim(),
                location: editDraft.location.trim(),
                image: finalImagePath.trim(),
                latitude: Number(editDraft.latitude) || 0,
                longitude: Number(editDraft.longitude) || 0,
                price: editDraft.price.trim(),
                room: editDraft.room.trim(),
                rating: editDraft.rating.trim(),
                description: editDraft.description.trim(),
            };

            const updatedHotel = await updateHotelApi(updatedPayload.id, updatedPayload);
            if (setHotels) {
                setHotels((currentHotels) =>
                    currentHotels.map((item) => item.id === updatedHotel.id ? updatedHotel : item),
                );
            }
            setFetchedHotel(updatedHotel);
            setEditDraft(null);
            setEditImageFile(null);
        } catch (err) {
            console.error("Failed to update hotel:", err);
            alert("Failed to save changes: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteHotel = async () => {
        if (!hotel || !window.confirm(`Delete ${hotel.name}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await deleteHotelApi(hotel.id);
            if (setHotels) {
                setHotels((currentHotels) => currentHotels.filter((item) => item.id !== hotel.id));
            }
            navigate("/");
        } catch (err) {
            console.error("Failed to delete hotel:", err);
            alert("Failed to delete hotel: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loadingHotel) {
        return (
            <main className="hotel-page">
                <p style={{ textAlign: "center", margin: "3rem" }}>Loading hotel details...</p>
            </main>
        );
    }

    if (!hotel) {
        return (
            <main className="hotel-page">
                <h1>No hotel selected</h1>
                <button className="book-button" onClick={() => navigate("/")}>
                    Back to hotels
                </button>
            </main>
        );
    }

    const hotelImages = [
        getHotelImageSource(hotel.image),
        ...(additionalHotelImages[hotel.name] || []),
    ];

    return (
        <main className="hotel-page">
            <button className="back-button" onClick={() => navigate("/")}>
                ← Back to hotels
            </button>
            {editDraft ? (
                <form className="hotel-edit-form hotel-page-edit-form" onSubmit={saveHotel}>
                    <h2>Edit Hotel Information</h2>

                    <label>
                        Hotel name
                        <input
                            required
                            type="text"
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, name: e.target.value }))}
                        />
                    </label>

                    <label>
                        Location
                        <input
                            required
                            type="text"
                            value={editDraft.location}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, location: e.target.value }))}
                        />
                    </label>

                    <label>
                        Price per night
                        <input
                            required
                            type="text"
                            value={editDraft.price}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, price: e.target.value }))}
                        />
                    </label>

                    <label>
                        Room types
                        <input
                            required
                            type="text"
                            value={editDraft.room}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, room: e.target.value }))}
                        />
                    </label>

                    <label>
                        Rating
                        <input
                            required
                            type="text"
                            value={editDraft.rating}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, rating: e.target.value }))}
                        />
                    </label>

                    <label>
                        Description
                        <textarea
                            required
                            rows="3"
                            value={editDraft.description}
                            onChange={(e) => setEditDraft((curr) => ({ ...curr, description: e.target.value }))}
                        />
                    </label>

                    <fieldset className="hotel-edit-image-section">
                        <legend style={{ fontWeight: 600, color: "#12284f", padding: "0 6px" }}>Hotel Image & Upload</legend>
                        <label>
                            Image file name / URL
                            <input
                                required
                                type="text"
                                value={editDraft.image}
                                onChange={(e) => setEditDraft((curr) => ({ ...curr, image: e.target.value }))}
                            />
                        </label>

                        <label className="hotel-edit-file-label">
                            Upload new image file
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditFileChange}
                            />
                            <span className="add-hotel-image-hint">
                                Select an image file to upload and replace hotel picture (max 10 MB)
                            </span>
                        </label>

                        {imageError && <p className="add-hotel-image-error" role="alert">{imageError}</p>}

                        {editDraft.image && (
                            <div className="hotel-edit-preview">
                                <span>Image Preview:</span>
                                <img src={getHotelImageSource(editDraft.image)} alt="Hotel preview" />
                            </div>
                        )}
                    </fieldset>

                    <div className="hotel-edit-coordinates">
                        <label>
                            Latitude
                            <input
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                value={editDraft.latitude}
                                onChange={(e) => setEditDraft((curr) => ({ ...curr, latitude: e.target.value }))}
                            />
                        </label>
                        <label>
                            Longitude
                            <input
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                value={editDraft.longitude}
                                onChange={(e) => setEditDraft((curr) => ({ ...curr, longitude: e.target.value }))}
                            />
                        </label>
                    </div>

                    <div className="hotel-edit-actions">
                        <button className="book-button" type="submit" disabled={actionLoading}>
                            {actionLoading ? "Saving..." : "Save changes"}
                        </button>
                        <button
                            className="back-button"
                            type="button"
                            disabled={actionLoading}
                            onClick={() => {
                                setEditDraft(null);
                                setEditImageFile(null);
                                setImageError("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <article className="hotel-page-content">
                        <div className="hotel-main-image-wrap">
                            <img
                                className="hotel-page-image"
                                src={hotelImages[currentImageIndex]}
                                alt={`${hotel.name} photo ${currentImageIndex + 1}`}
                            />
                            <button
                                className="hotel-image-arrow hotel-image-arrow-left"
                                type="button"
                                aria-label="Previous hotel image"
                                onClick={() => setCurrentImageIndex((index) =>
                                    (index - 1 + hotelImages.length) % hotelImages.length,
                                )}
                            >
                                &#8592;
                            </button>
                            <button
                                className="hotel-image-arrow hotel-image-arrow-right"
                                type="button"
                                aria-label="Next hotel image"
                                onClick={() => setCurrentImageIndex((index) =>
                                    (index + 1) % hotelImages.length,
                                )}
                            >
                                &#8594;
                            </button>
                        </div>
                        <div className="hotel-page-details">
                            <p className="rating">{hotel.rating}</p>
                            <h1>{hotel.name}</h1>
                            <p>📍 {hotel.location}</p>
                            <p>{hotel.description}</p>
                            <p>🛏️ {hotel.room}</p>
                            <p className="detail-price">{hotel.price} / night</p>
                            <p className="hotel-image-count" aria-live="polite">
                                Image {currentImageIndex + 1} of {hotelImages.length}
                            </p>
                        </div>
                    </article>

                    <section className="hotel-map-section hotel-page-map" aria-label="Hotel location map">
                        <h3>Hotel location</h3>
                        {getMapEmbedUrl(hotel.latitude, hotel.longitude) ? (
                            <iframe
                                className="hotel-location-map"
                                title={`Map showing ${hotel.name}`}
                                src={getMapEmbedUrl(hotel.latitude, hotel.longitude)}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <p>Map coordinates are not available.</p>
                        )}
                    </section>

                    <div className="hotel-action-buttons hotel-page-actions">
                        <button
                            className="book-button"
                            type="button"
                            onClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        >
                            Book Now
                        </button>
                        <button
                            className="edit-button"
                            type="button"
                            onClick={() => setEditDraft({ ...hotel })}
                        >
                            Edit
                        </button>
                        <button className="delete-button" type="button" disabled={actionLoading} onClick={deleteHotel}>
                            {actionLoading ? "Deleting..." : "Delete"}
                        </button>
                    </div>

                    <section className="booking-section" ref={bookingSectionRef}>
                <h2>Complete your booking</h2>
                <form className="booking-form" onSubmit={handleBooking}>
                    <label>
                        Full name
                        <input
                            autoComplete="name"
                            name="name"
                            onChange={updateCustomer}
                            required
                            value={customer.name}
                        />
                    </label>
                    <label>
                        Phone number
                        <input
                            autoComplete="tel"
                            name="phone"
                            onChange={updateCustomer}
                            pattern="[0-9+() -]{10,15}"
                            required
                            title="Enter a phone number with 10 to 15 digits."
                            type="tel"
                            value={customer.phone}
                        />
                    </label>
                    <label>
                        Number of guests
                        <input
                            min="1"
                            name="guests"
                            onChange={updateCustomer}
                            required
                            type="number"
                            value={customer.guests}
                        />
                    </label>
                    <label>
                        Check-in
                        <input
                            min={new Date().toISOString().slice(0, 10)}
                            name="checkIn"
                            onChange={updateCustomer}
                            required
                            type="date"
                            value={customer.checkIn}
                        />
                    </label>
                    <label>
                        Check-out
                        <input
                            min={customer.checkIn || new Date().toISOString().slice(0, 10)}
                            name="checkOut"
                            onChange={updateCustomer}
                            required
                            type="date"
                            value={customer.checkOut}
                        />
                    </label>
                    <label>
                        Room type
                        <select name="room" onChange={updateCustomer} value={customer.room}>
                            <option value="Deluxe Room">Deluxe Room</option>
                            <option value="Luxury Suite">Luxury Suite</option>
                            <option value="Family Suite">Family Suite</option>
                        </select>
                    </label>

                    <section className="billing-section" aria-live="polite">
                        <h3>Billing</h3>
                        <div className="billing-line">
                            <span>{customer.room} ({nights} {nights === 1 ? "night" : "nights"})</span>
                            <span>{formatCurrency(nightlyRate)} × {nights}</span>
                        </div>
                        <div className="billing-total">
                            <span>Total</span>
                            <strong>{formatCurrency(nightlyRate * nights)}</strong>
                        </div>
                        <p className="billing-note">Room rates are charged per night. Guest count does not change the listed rate.</p>
                    </section>

                    <button className="book-button confirm-booking" type="submit">
                        Confirm Booking
                    </button>
                </form>
                    </section>
                </>
            )}
        </main>
    );
};

export default HotelDetails;
