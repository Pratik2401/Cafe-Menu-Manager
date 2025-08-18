import React from 'react';

/**
 * Component to display item price based on selected size
 * 
 * @param {Object} props
 * @param {Object} props.item - The item object with price and sizePrices
 * @param {string} props.selectedSizeId - ID of the currently selected size (optional)
 * @param {string} props.className - Additional CSS classes (optional)
 */
const DisplayItemPrice = ({ item, selectedSizeId = null, className = '' }) => {
  // If no sizePrices are associated with the item or no size is selected, show the base price
  if (!item.sizePrices || item.sizePrices.length === 0 || !selectedSizeId) {
    return <span className={className}>₹{item.price}</span>;
  }

  // Find the selected size price from the sizePrices array
  const selectedSizePrice = item.sizePrices.find(sp => sp.sizeId === selectedSizeId);
  
  // If the selected size price exists, show its price, otherwise show the base price
  if (selectedSizePrice) {
    return <span className={className}>₹{selectedSizePrice.price}</span>;
  }
  
  return <span className={className}>₹{item.price}</span>;
};

export default DisplayItemPrice;