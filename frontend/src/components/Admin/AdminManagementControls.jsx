import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { FaUtensils, FaEdit, FaRuler, FaAllergies, FaCogs } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import FoodCategoryManagement from './AdminFoodCategoryManagement';
import TagManagement from './AdminTagManagement';
import AdminSizeManagement from './AdminSizeManagement';
import AllergyManagement from './AdminAllergyManagement';
import AdminVariationManagement from './AdminVariationManagement';
import '../../styles/ManagementControls.css';

const ManagementControls = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [activeSection, setActiveSection] = useState('food-categories');

  // Update breadcrumb based on active section
  useEffect(() => {
    const sectionLabels = {
      'food-categories': 'Food Categories',
      'tags': 'Tag Management',
      'sizes': 'Size Management',
      'allergies': 'Allergy Management',
      'variations': 'Variation Management'
    };
    
    updateBreadcrumb([
      { label: 'Management Controls' },
      { label: sectionLabels[activeSection] || 'Management' }
    ]);
  }, [activeSection, updateBreadcrumb]);

  return (
    <div className="management-controls">
      {/* Navigation Tabs */}
      <div className="management-navigation mb-4">
        <Row>
          <Col>
            <Link to="/admin/food-categories" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
              <FaUtensils className="me-2" /> Food Categories
            </Link>
            <Link to="/admin/tags" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
              <FaEdit className="me-2" /> Tags
            </Link>
            <Link to="/admin/sizes" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
              <FaRuler className="me-2" /> Sizes
            </Link>
            <Link to="/admin/allergies" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
              <FaAllergies className="me-2" /> Allergies
            </Link>
            <Link to="/admin/variations" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
              <FaCogs className="me-2" /> Variations
            </Link>
          </Col>
        </Row>
      </div>

      {/* Content Sections */}
      {activeSection === 'food-categories' && (
        <div className="management-section">
          <FoodCategoryManagement isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'tags' && (
        <div className="management-section">
          <TagManagement isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'sizes' && (
        <div className="management-section">
          <AdminSizeManagement isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'allergies' && (
        <div className="management-section">
          <AllergyManagement isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'variations' && (
        <div className="management-section">
          <AdminVariationManagement isStandalone={false} />
        </div>
      )}
    </div>
  );
};

export default ManagementControls;