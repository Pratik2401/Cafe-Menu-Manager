import React, { useEffect, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';
import '../../styles/MenuPopup.css';

export default function MenuPopup({ show, categories, subCategories, onSubCategorySelect, selectedSubCategory, onClose }) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  // Get current selected category from localStorage
  const storedCategory = localStorage.getItem('selectedMainCategory');
  let currentCategoryId = null;
  
  if (storedCategory) {
    try {
      const parsedCategory = JSON.parse(storedCategory);
      currentCategoryId = parsedCategory.id;
    } catch (error) {
      console.error('Error parsing stored category:', error);
    }
  }

  return (
    <div className="menu-popup" ref={popupRef}>
      <ListGroup variant="flush">
        {categories.map(category => {
          const isCurrentCategory = category.serialId === currentCategoryId;
          const categorySubCategories = subCategories[category.serialId] || [];
          
          return (
            <div key={category.serialId}>
              <ListGroup.Item 
                className="category-item"
                action
                active={isCurrentCategory}
                onClick={() => {
                  localStorage.setItem('selectedMainCategory', JSON.stringify({
                    id: category.serialId,
                    name: category.name
                  }));
                  
                  // Update category and subcategory
                  if (categorySubCategories.length > 0) {
                    onSubCategorySelect(categorySubCategories[0], categorySubCategories);
                  }
                  
                  // Trigger category change
                  if (window.updateCategory) {
                    window.updateCategory(category.serialId);
                  }
                }}
              >
                {category.name}
              </ListGroup.Item>
              
              {isCurrentCategory && categorySubCategories.length > 0 && (
                <div className="subcategories-list">
                  {categorySubCategories.map(subCategory => (
                    <ListGroup.Item 
                      key={subCategory.serialId}
                      action
                      active={selectedSubCategory?._id === subCategory._id}
                      className="subcategory-item"
                      onClick={() => {
                        localStorage.setItem('selectedMainCategory', JSON.stringify({
                          id: category.serialId,
                          name: category.name
                        }));
                        
                        // Store selected subcategory for NavigateBar
                        localStorage.setItem('selectedSubCategory', JSON.stringify({
                          _id: subCategory._id,
                          name: subCategory.name
                        }));
                        
                        onSubCategorySelect(subCategory, categorySubCategories);
                        
                        // Trigger NavigateBar update
                        if (window.updateNavigateBar) {
                          window.updateNavigateBar(subCategory);
                        }
                      }}
                    >
                      {subCategory.name}
                    </ListGroup.Item>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </ListGroup>
    </div>
  )
};