import React from 'react';
import { Spinner } from 'react-bootstrap';
import '../../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', variant = 'primary', text = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner-content">
        <Spinner 
          animation="border" 
          role="status"
          variant={variant}
          className={`spinner-${size}`}
        >
          <span className="visually-hidden">{text}</span>
        </Spinner>
        <div className="loading-spinner-icon">
          <i className="bi bi-cup-hot"></i>
        </div>
        <p className="loading-spinner-text">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;