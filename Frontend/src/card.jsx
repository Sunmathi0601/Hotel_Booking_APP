import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./card.css";
import Page from "./page";
import { getHotelImageSource, getMapEmbedUrl, updateHotelApi, deleteHotelApi, uploadImageApi } from "./hotels";

const Card = ({ hotels, setHotels }) => {
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [editDraft, setEditDraft] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [imageError, setImageError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const pageSize = 4;
    const pageCount = Math.ceil(hotels.length / pageSize);
    const safeCurrentPage = Math.min(currentPage, Math.max(pageCount, 1));
    const visibleHotels = hotels.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize,
    );

    const closeDetails = () => {
        setSelectedHotel(null);
        setEditDraft(null);
        setEditImageFile(null);
        setImageError("");
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
            setHotels((currentHotels) =>
                currentHotels.map((hotel) =>
                    hotel.id === updatedHotel.id ? updatedHotel : hotel,
                ),
            );
            setSelectedHotel(updatedHotel);
            setEditDraft(null);
            setEditImageFile(null);
        } catch (err) {
            console.error("Failed to update hotel:", err);
            alert("Failed to save changes: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteHotel = async (hotelToDelete) => {
        if (!window.confirm(`Delete ${hotelToDelete.name}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await deleteHotelApi(hotelToDelete.id);
            setHotels((currentHotels) =>
                currentHotels.filter((hotel) => hotel.id !== hotelToDelete.id),
            );
            closeDetails();
        } catch (err) {
            console.error("Failed to delete hotel:", err);
            alert("Failed to delete hotel: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="hotel-container">
            {hotels.length === 0 && (
                <p className="hotel-empty-state">No hotels match your search or price range.</p>
            )}
            {visibleHotels.map((hotel) => (
                <article className="hotel-card" key={hotel.id}>
                    <img src={getHotelImageSource(hotel.image)} alt={hotel.name} />
                    <div className="hotel-details">
                        <h3>{hotel.name}</h3>
                        <p>📍 {hotel.location}</p>
                        <p>{hotel.description}</p>
                        <div className="card-bottom">
                            <span>{hotel.price} / night</span>
                            <button
                                onClick={() => {
                                    navigate(`/hotel/${hotel.id}`, {
                                        state: { hotel },
                                    });
                                }}
                            >
                                Explore more ➜
                            </button>
                        </div>
                    </div>
                </article>
            ))}

            {pageCount > 1 && (
                <Page
                    currentPage={safeCurrentPage}
                    totalPages={pageCount}
                    onPageChange={setCurrentPage}
                />
            )}

            {selectedHotel && (
                <div className="details-overlay">
                    <section className="full-details" aria-labelledby="selected-hotel-name">
                        <button
                            className="close-button"
                            aria-label="Close hotel details"
                            onClick={closeDetails}
                        >
                            ✕
                        </button>

                        {editDraft ? (
                            <form className="hotel-edit-form" onSubmit={saveHotel}>
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
                                <img
                                    className="details-image"
                                    src={getHotelImageSource(selectedHotel.image)}
                                    alt={selectedHotel.name}
                                />
                                <h2 id="selected-hotel-name">{selectedHotel.name}</h2>
                                <p>📍 {selectedHotel.location}</p>
                                <p className="detail-price">
                                    {selectedHotel.price} / night
                                </p>
                                <p>🛏️ {selectedHotel.room}</p>
                                <p className="rating">{selectedHotel.rating}</p>
                                <p>{selectedHotel.description}</p>
                                <section className="hotel-map-section" aria-label="Hotel location map">
                                    <h3>Hotel location</h3>
                                    <p>
                                        Latitude: {Number.isFinite(Number(selectedHotel.latitude))
                                            ? Number(selectedHotel.latitude).toFixed(6)
                                            : "Unavailable"}
                                        <span> | </span>
                                        Longitude: {Number.isFinite(Number(selectedHotel.longitude))
                                            ? Number(selectedHotel.longitude).toFixed(6)
                                            : "Unavailable"}
                                    </p>
                                    {getMapEmbedUrl(selectedHotel.latitude, selectedHotel.longitude) ? (
                                        <iframe
                                            className="hotel-location-map"
                                            title={`Map showing ${selectedHotel.name}`}
                                            src={getMapEmbedUrl(selectedHotel.latitude, selectedHotel.longitude)}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <p>Map coordinates are not available.</p>
                                    )}
                                </section>
                                <div className="hotel-action-buttons">
                                    <button
                                        className="book-button"
                                        onClick={() => {
                                            navigate(`/hotel/${selectedHotel.id}`, {
                                                state: { hotel: selectedHotel },
                                            });
                                        }}
                                    >
                                        Book Now
                                    </button>
                                    <button
                                        className="edit-button"
                                        onClick={() => setEditDraft({ ...selectedHotel })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        disabled={actionLoading}
                                        onClick={() => deleteHotel(selectedHotel)}
                                    >
                                        {actionLoading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Card;