export const API_URL = "http://localhost:5000/api/hotels";
export const UPLOAD_URL = "http://localhost:5000/api/upload";

// API helper functions
export const fetchHotelsApi = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch hotels");
    return await res.json();
};

export const fetchHotelByIdApi = async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch hotel with id ${id}`);
    return await res.json();
};

export const uploadImageApi = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image file");
    const data = await res.json();
    return data.imagePath; // Returns e.g. "uploads/hotel-1700000000.jpg"
};

export const createHotelApi = async (hotelData) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelData),
    });
    if (!res.ok) throw new Error("Failed to create hotel");
    return await res.json();
};

export const updateHotelApi = async (id, hotelData) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotelData),
    });
    if (!res.ok) throw new Error(`Failed to update hotel with id ${id}`);
    return await res.json();
};

export const deleteHotelApi = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete hotel with id ${id}`);
    return await res.json();
};

export const getHotelImageSource = (image) => {
    if (!image) return "/picture3.jpg";
    if (/^(blob:|data:image\/|https?:\/\/)/i.test(image)) {
        return image;
    }
    const cleanPath = image.replace(/^\/+/, "");
    if (cleanPath.startsWith("uploads/")) {
        return `http://localhost:5000/${cleanPath}`;
    }
    return `/${cleanPath}`;
};

export const getMapEmbedUrl = (latitude, longitude) => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lon) || lon < -180 || lon > 180) {
        return null;
    }

    const mapParams = new URLSearchParams({
        bbox: `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`,
        layer: "mapnik",
        marker: `${lat},${lon}`,
    });

    return `https://www.openstreetmap.org/export/embed.html?${mapParams}`;
};
