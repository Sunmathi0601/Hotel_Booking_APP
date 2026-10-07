import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./addhotel.css";
import { uploadImageApi } from "./hotels";

const AddHotel = ({ onAddHotel }) => {
	const navigate = useNavigate();
	const [imageError, setImageError] = useState("");
	const [showPreview, setShowPreview] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hotel, setHotel] = useState({
		name: "",
		location: "",
		image: "",
		latitude: "",
		longitude: "",
		price: "",
		room: "",
		rating: "",
		description: "",
	});
	const previewPrice = hotel.price
		? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(hotel.price))
		: "0";

	const updateHotel = (event) => {
		const { name, value } = event.target;
		setHotel((currentHotel) => ({ ...currentHotel, [name]: value }));
	};

	const uploadImage = (event) => {
		const file = event.target.files?.[0];
		setImageError("");

		if (!file) {
			return;
		}

		if (!file.type.startsWith("image/")) {
			setImageError("Choose an image file.");
			event.target.value = "";
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			setImageError("Image size must be 10 MB or less.");
			event.target.value = "";
			return;
		}

		setImageFile(file);
		const previewUrl = URL.createObjectURL(file);
		setHotel((currentHotel) => ({ ...currentHotel, image: previewUrl }));
	};

	const submitHotel = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			let finalImagePath = hotel.image;

			// If a physical file was selected, upload it to Multer backend folder first
			if (imageFile) {
				finalImagePath = await uploadImageApi(imageFile);
			}

			const formattedPrice = new Intl.NumberFormat("en-IN", {
				maximumFractionDigits: 0,
			}).format(Number(hotel.price));

			await onAddHotel({
				...hotel,
				name: hotel.name.trim(),
				location: hotel.location.trim(),
				image: finalImagePath,
				latitude: Number(hotel.latitude),
				longitude: Number(hotel.longitude),
				price: `₹${formattedPrice}`,
				room: hotel.room.trim(),
				rating: hotel.rating.trim(),
				description: hotel.description.trim(),
			});
			navigate("/");
		} catch (err) {
			console.error("Error creating hotel:", err);
			setImageError(err.message || "Failed to upload image or save hotel.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="add-hotel-page">
			<div className={`add-hotel-layout${showPreview ? " has-preview" : ""}`}>
			<form className="add-hotel-form" onSubmit={submitHotel}>
				<h1>Add a hotel</h1>
				<label>
					Hotel name
					<input
						autoComplete="organization"
						name="name"
						onChange={updateHotel}
						required
						value={hotel.name}
					/>
				</label>
				<label>
					Location
					<input
						name="location"
						onChange={updateHotel}
						required
						value={hotel.location}
					/>
				</label>
				<label>
					Latitude
					<input
						max="90"
						min="-90"
						name="latitude"
						onChange={updateHotel}
						placeholder="11.9416"
						required
						step="any"
						type="number"
						value={hotel.latitude}
					/>
				</label>
				<label>
					Longitude
					<input
						max="180"
						min="-180"
						name="longitude"
						onChange={updateHotel}
						placeholder="79.8083"
						required
						step="any"
						type="number"
						value={hotel.longitude}
					/>
				</label>
				<label className="add-hotel-image-field">
					Hotel photo
					<input
						accept="image/*"
						onChange={uploadImage}
						required
						type="file"
					/>
					<span className="add-hotel-image-hint">Image files up to 10 MB (saved to backend uploads folder)</span>
					{imageError && <span className="add-hotel-image-error" role="alert">{imageError}</span>}
				</label>
				<label>
					Price per night (₹)
					<input
						min="1"
						name="price"
						onChange={updateHotel}
						required
						step="1"
						type="number"
						value={hotel.price}
					/>
				</label>
				<label>
					Room types
					<input
						name="room"
						onChange={updateHotel}
						placeholder="Deluxe Room, Suite"
						required
						value={hotel.room}
					/>
				</label>
				<label>
					Rating
					<input
						name="rating"
						onChange={updateHotel}
						placeholder="4.5 ⭐"
						required
						value={hotel.rating}
					/>
				</label>
				<label className="add-hotel-description">
					Description
					<textarea
						name="description"
						onChange={updateHotel}
						required
						rows="4"
						value={hotel.description}
					/>
				</label>
				<div className="add-hotel-actions">
					<button
						className="add-hotel-preview-button"
						disabled={!hotel.image || isSubmitting}
						onClick={() => setShowPreview(true)}
						type="button"
					>
						Preview
					</button>
					<button className="add-hotel-submit" disabled={!hotel.image || isSubmitting} type="submit">
						{isSubmitting ? "Uploading & Creating..." : "Create hotel"}
					</button>
					<button
						className="add-hotel-cancel"
						disabled={isSubmitting}
						onClick={() => navigate("/")}
						type="button"
					>
						Cancel
					</button>
				</div>
			</form>
			{showPreview && (
				<aside className="hotel-preview-card" aria-label="New hotel preview">
					<button
						className="hotel-preview-close"
						aria-label="Close preview"
						onClick={() => setShowPreview(false)}
						type="button"
					>
						×
					</button>
					<img className="hotel-preview-image" src={hotel.image} alt={hotel.name || "Hotel preview"} />
					<div className="hotel-preview-content">
						<p className="hotel-preview-eyebrow">HOTEL PREVIEW</p>
						<h2>{hotel.name.trim() || "Hotel name"}</h2>
						<p>📍 {hotel.location.trim() || "Location"}</p>
						<p>Latitude: {hotel.latitude || "—"}</p>
						<p>Longitude: {hotel.longitude || "—"}</p>
						<p className="hotel-preview-rating">{hotel.rating.trim() || "Rating"}</p>
						<p>🛏 {hotel.room.trim() || "Room types"}</p>
						<p className="hotel-preview-description">
							{hotel.description.trim() || "Description"}
						</p>
						<div className="hotel-preview-price">₹{previewPrice} <span>/ night</span></div>
					</div>
				</aside>
			)}
			</div>
		</main>
	);
};

export default AddHotel;
