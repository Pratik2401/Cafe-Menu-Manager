import React from 'react';
import { PulseLoader } from 'react-spinners';
import '../../styles/CafeSpinner.css';

const CafeSpinner = ({ loading = true, size = 15, text = 'Loading...', color = '#6c3a1f' }) => {
  if (!loading) return null;
  
  return (
    <div className="cafe-spinner-container">
      <div className="cafe-spinner-content">
        <div className="cafe-spinner-icon">
          <i className="bi bi-cup-hot"></i>
        </div>
        <PulseLoader color={color} size={size} loading={loading} />
        <p className="cafe-spinner-text">{text}</p>
      </div>
    </div>
  );
};

export default CafeSpinner;