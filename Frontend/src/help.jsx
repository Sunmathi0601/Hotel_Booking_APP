import "./help.css";

const helpTopics = [
    {
        title: "Booking Assistance",
        description: "Find your perfect stay and reserve your room with ease.",
    },
    {
        title: "Payment & Security",
        description: "Enjoy a smooth and secure booking experience.",
    },
    {
        title: "Cancellation Policy",
        description: "Review flexible cancellation options before confirming your stay.",
    },
    {
        title: "Check-in & Check-out",
        description: "Find all arrival and departure details in your booking.",
    },
];

const Help = () => (
    <main className="help-page">
        <header className="help-header">
            <p className="help-eyebrow">Guest services</p>
            <h1>How can we help?</h1>
            <p className="help-intro">Thoughtful guidance for a seamless stay.</p>
        </header>

        <section className="help-topic-grid" aria-label="Guest support topics">
            {helpTopics.map((topic, index) => (
                <article className="help-topic" key={topic.title}>
                    <span className="help-topic-number" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                        <h2>{topic.title}</h2>
                        <p>{topic.description}</p>
                    </div>
                </article>
            ))}
        </section>

        <section className="help-concierge" aria-labelledby="help-concierge-title">
            <p className="help-eyebrow">Personal assistance</p>
            <h2 id="help-concierge-title">Need Assistance?</h2>
            <p>Our concierge team is here to assist you.</p>
        </section>
    </main>
);

export default Help;