import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/MenuView.css';
import SearchBar from './SearchBar';
import DailyOffersItem from './DailyOffersItem';
import { getAllCategories, getCafeSettings } from '../../api/customer';
import TopBar from './TopBar';
import EventBanner from './EventBanner';
import Branding from './Branding';
import FeedbackDrawer from './FeedbackDrawer';

export default function DailyOffersView() {
  const [filters, setFilters] = useState({
    veg: false,
    nonveg: false,
    jain: false,
    vegan: false,
    cafeSpeciality: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cafe settings for background image
        try {
          const cafeSettingsResponse = await getCafeSettings();
          if (cafeSettingsResponse?.data?.success && cafeSettingsResponse.data.data.menuCustomization) {
            const { backgroundImage } = cafeSettingsResponse.data.data.menuCustomization;
            if (backgroundImage) {
              setBackgroundImage(backgroundImage);
            }
          }
        } catch (cafeError) {
          console.error("Error fetching cafe settings:", cafeError);
        }
        
        // Fetch categories
        const response = await getAllCategories();
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.categories || []);
        
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="menu-view-container">
      <TopBar/>
      <Branding/>
      <SearchBar
        filters={filters}
        onFiltersChange={updateFilters}
        onSearchChange={handleSearchChange}
        categories={categories}
      />

      <EventBanner />

      <DailyOffersItem
        filters={filters}
        searchQuery={searchQuery}
      />
      
      <FeedbackDrawer />
    </div>
  );
}