import { useState } from "react";

function Facilities() {
  const [search, setSearch] = useState("");

  const [selectedType, setSelectedType] = useState("All");

  const facilities = [
    {
      id: 1,
      name: "City Health Center",
      type: "Health Center",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 001",
      services: ["Antenatal Care", "Maternal Education"],
      icon: "🏥",
    },
    {
      id: 2,
      name: "Community Clinic",
      type: "Clinic",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 002",
      services: ["Pregnancy Support", "Health Education"],
      icon: "🩺",
    },
    {
      id: 3,
      name: "General Hospital",
      type: "Hospital",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 003",
      services: ["Maternity Services", "Postnatal Care"],
      icon: "🏨",
    },
    {
      id: 4,
      name: "Family Health Clinic",
      type: "Clinic",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 004",
      services: ["Maternal Care", "Family Health"],
      icon: "💚",
    },
    {
      id: 5,
      name: "Mother and Baby Center",
      type: "Health Center",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 005",
      services: ["Newborn Care", "Postpartum Support"],
      icon: "👶",
    },
    {
      id: 6,
      name: "Regional Hospital",
      type: "Hospital",
      location: "Kigali, Rwanda",
      phone: "+250 000 000 006",
      services: ["Maternity Services", "Antenatal Care"],
      icon: "🏥",
    },
  ];

  const types = [
    "All",
    "Hospital",
    "Clinic",
    "Health Center",
  ];

  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(search.toLowerCase()) ||
      facility.location.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All" || facility.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="page-container">

      <section className="facilities-hero">
        <div>
          <span className="eyebrow">HEALTHCARE DIRECTORY</span>

          <h1>
            Find Healthcare <span>Facilities.</span>
          </h1>

          <p>
            Explore healthcare facilities and find information
            about maternal and newborn health services.
          </p>
        </div>

        <div className="facility-hero-icon">
          🏥
        </div>
      </section>

      <section className="facility-search-section">

        <div className="section-heading">
          <div>
            <span className="section-label">FACILITY DIRECTORY</span>
            <h2>Healthcare Facilities</h2>
            <p>Search and explore available facilities.</p>
          </div>
        </div>

        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by facility name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-filter">
          {types.map((type) => (
            <button
              key={type}
              className={
                selectedType === type
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="facility-grid">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <div className="facility-card" key={facility.id}>

                <div className="facility-card-top">
                  <div className="facility-icon">
                    {facility.icon}
                  </div>

                  <span className="facility-type">
                    {facility.type}
                  </span>
                </div>

                <h3>{facility.name}</h3>

                <p className="facility-location">
                  📍 {facility.location}
                </p>

                <div className="services">
                  <strong>Available Services</strong>

                  <div className="service-tags">
                    {facility.services.map((service) => (
                      <span key={service}>{service}</span>
                    ))}
                  </div>
                </div>

                <div className="facility-contact">
                  <span>☎ {facility.phone}</span>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No facilities found</h3>
              <p>Try searching with another name or location.</p>
            </div>
          )}
        </div>
      </section>

      <section className="facility-notice">
        <span>ℹ️</span>
        <div>
          <h3>Important Information</h3>
          <p>
            The facilities displayed are fictional demonstration
            records, not verified healthcare providers. Confirm
            facility addresses, phone numbers and services before
            using them.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Facilities;