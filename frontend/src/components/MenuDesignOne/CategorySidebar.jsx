import React, { useState, useEffect } from 'react';
import { Offcanvas, ListGroup, Accordion, CloseButton } from 'react-bootstrap';
import { getAllSubCategories } from '../../api/customer';
import '../../styles/CategorySidebar.css';

export default function CategorySidebar({ show, handleClose, categories, onCategorySelect, onSubCategorySelect }) {
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await getAllSubCategories();
        const subCategoriesData = response.data || [];
        
        // Group subcategories by category ID
        const grouped = subCategoriesData.reduce((acc, subCategory) => {
          const categoryId = subCategory.category?.serialId || subCategory.categoryId;
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(subCategory);
          return acc;
        }, {});
        
        setSubCategories(grouped);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchSubCategories();
    }
  }, [show]);

  const handleCategoryClick = (category) => {
    onCategorySelect(category);
    handleClose();
  };

  const handleSubCategoryClick = (category, subCategory) => {
    onSubCategorySelect(category, subCategory);
    handleClose();
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="category-sidebar">
      <Offcanvas.Header>
        <Offcanvas.Title>Menu Categories</Offcanvas.Title>
        <CloseButton onClick={handleClose} />
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="text-center">Loading categories...</div>
        ) : (
          <Accordion defaultActiveKey="0" flush>
            {categories.map((category, index) => (
              <Accordion.Item key={category.serialId} eventKey={String(index)}>
                <Accordion.Header onClick={() => handleCategoryClick(category)}>
                  {category.name}
                </Accordion.Header>
                <Accordion.Body>
                  <ListGroup variant="flush">
                    {subCategories[category.serialId]?.map(subCategory => (
                      <ListGroup.Item 
                        key={subCategory.serialId}
                        action
                        onClick={() => handleSubCategoryClick(category, subCategory)}
                      >
                        {subCategory.name}
                      </ListGroup.Item>
                    ))}
                    {(!subCategories[category.serialId] || subCategories[category.serialId].length === 0) && (
                      <ListGroup.Item disabled>No subcategories available</ListGroup.Item>
                    )}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}