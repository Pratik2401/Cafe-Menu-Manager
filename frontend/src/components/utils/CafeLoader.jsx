import React from 'react';
import '../../styles/CafeLoader.css';

// Loader types
export const LOADER_TYPES = {
  COFFEE_CUP: 'coffee_cup',
  COFFEE_BEAN: 'coffee_bean',
  COFFEE_GRINDER: 'coffee_grinder',
  COFFEE_POUR: 'coffee_pour'
};

const CafeLoader = ({ 
  type = LOADER_TYPES.COFFEE_CUP, 
  text = '',
  size = 40
}) => {
  // Default texts based on loader type
  const defaultTexts = {
    [LOADER_TYPES.COFFEE_CUP]: 'Brewing your coffee...',
    [LOADER_TYPES.COFFEE_BEAN]: 'Grinding fresh beans...',
    [LOADER_TYPES.COFFEE_GRINDER]: 'Preparing your order...',
    [LOADER_TYPES.COFFEE_POUR]: 'Pouring your coffee...'
  };

  // Use provided text or default based on type
  const loaderText = text || defaultTexts[type];

  return (
    <div className="cafe-loader-container">
      <p className="cafe-loader-text" style={{ fontSize: `${size/2}px` }}>{loaderText}</p>
    </div>
  );
};

export default CafeLoader;