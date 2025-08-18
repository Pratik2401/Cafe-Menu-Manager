import React, { useState, useEffect } from 'react';
import { getAllAllergies } from '../../api/customer';
import '../../styles/AllergyNote.css';

const AllergyNote = () => {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const response = await getAllAllergies();
        setAllergies(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching allergies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllergies();
  }, []);

  if (loading || allergies.length === 0) {
    return null;
  }

  return (
    <div className="allergy-note">
      <h3>Allergies</h3>
      <ul className="allergy-list">
        {allergies.map((allergy) => (
          <li key={allergy._id} className="allergy-item">
            <img src={allergy.image} alt={allergy.name} className="allergy-icon" />
            {allergy.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllergyNote;