import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./card.css";

const Booking = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;

    if (!booking) {
        return <Navigate to="/" replace />;
    }

    const { hotel, customer, nights, total } = booking;
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    return (
        <main className="hotel-page">
            <section className="booking-confirmation" aria-labelledby="confirmation-title">
                <div className="confirmation-mark" aria-hidden="true">&#10003;</div>
                <p className="confirmation-eyebrow">Reservation complete</p>
                <h1 id="confirmation-title">Booking confirmed</h1>
                <p className="confirmation-message">
                    Your stay at {hotel.name} is confirmed. We look forward to welcoming you.
                </p>

                <dl className="confirmation-details">
                    <div>
                        <dt>Guest</dt>
                        <dd>{customer.name}</dd>
                    </div>
                    <div>
                        <dt>Hotel</dt>
                        <dd>{hotel.name}</dd>
                    </div>
                    <div>
                        <dt>Check-in</dt>
                        <dd>{customer.checkIn}</dd>
                    </div>
                    <div>
                        <dt>Check-out</dt>
                        <dd>{customer.checkOut}</dd>
                    </div>
                    <div>
                        <dt>Guests and room</dt>
                        <dd>{customer.guests} guests, {customer.room}</dd>
                    </div>
                    <div className="confirmation-total">
                        <dt>Total for {nights} {nights === 1 ? "night" : "nights"}</dt>
                        <dd>{formatCurrency(total)}</dd>
                    </div>
                </dl>

                <button className="book-button" onClick={() => navigate("/")}>
                    Back to hotels
                </button>
            </section>
        </main>
    );
};

export default Booking;