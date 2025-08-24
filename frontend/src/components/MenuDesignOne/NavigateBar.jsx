import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { getAllSubCategories, getAllCategories } from '../../api/customer';
import '../../styles/NavigateBar.css';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function NavigateBar({ onSubCategorySelect, categoryId, customMessages, searchQuery }) {
  const [subCategory, setSubCategory] = useState([]);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

 useEffect(() => {
    const getSubCategories = async () => {
      setLoading(true);
      try {
        let selectedCategoryId;
        
        if (categoryId) {
          selectedCategoryId = categoryId;
        } else {
          const storedCategory = localStorage.getItem('selectedMainCategory');
          if (!storedCategory) {
            console.warn('No category found in props or localStorage.');
            setSubCategory([]);
            setLoading(false);
            return;
          }
          selectedCategoryId = JSON.parse(storedCategory).id;
        }
        
        const response = await getAllSubCategories();
        
        const filteredSubCategories = response.data.filter(subcategory => {
          if (subcategory.category) {
            return subcategory.category.serialId === selectedCategoryId;
          } else if (subcategory.categoryId) {
            return subcategory.categoryId === selectedCategoryId;
          }
          return false;
        });

        setSubCategory(filteredSubCategories);
        
        // Check if there's a selected subcategory from MenuPopup
        const storedSubCategory = localStorage.getItem('selectedSubCategory');
        let targetIndex = 0;
        
        if (storedSubCategory) {
          try {
            const parsedSubCategory = JSON.parse(storedSubCategory);
            const foundIndex = filteredSubCategories.findIndex(sub => 
              sub._id === parsedSubCategory._id || sub.name === parsedSubCategory.name
            );
            if (foundIndex !== -1) {
              targetIndex = foundIndex;
            }
          } catch (error) {
            console.error('Error parsing stored subcategory:', error);
          }
        }
        
        setCurrentIndex(targetIndex);

        if (filteredSubCategories.length > 0) {
          const targetSubCategory = filteredSubCategories[targetIndex];
          setActiveSubCategoryId(targetSubCategory.serialId);
          
          // Notify parent about the selected subcategory
          if (onSubCategorySelect) {
            onSubCategorySelect(targetSubCategory, filteredSubCategories);
          }
          
          // Update swiper to show the correct subcategory
          setTimeout(() => {
            if (swiperRef.current) {
              swiperRef.current.slideTo(targetIndex, 0);
            }
          }, 100);
        } else {
          setActiveSubCategoryId(null);
          if (onSubCategorySelect) {
            onSubCategorySelect(null, []);
          }
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    getSubCategories();
  }, [onSubCategorySelect, categoryId, searchQuery]);
  
  // Set up global function for NavigateBar updates
  useEffect(() => {
    window.updateNavigateBar = (selectedSubCategory) => {
      const foundIndex = subCategory.findIndex(sub => 
        sub._id === selectedSubCategory._id || sub.name === selectedSubCategory.name
      );
      if (foundIndex !== -1 && foundIndex !== currentIndex) {
        setCurrentIndex(foundIndex);
        setActiveSubCategoryId(subCategory[foundIndex].serialId);
        
        if (swiperRef.current) {
          swiperRef.current.slideTo(foundIndex, 0);
        }
      }
    };
    
    return () => {
      delete window.updateNavigateBar;
    };
  }, [subCategory, currentIndex]);

  const handleSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);
    const selectedSubCategory = subCategory[newIndex];
    setActiveSubCategoryId(selectedSubCategory.serialId);
    
    // Update localStorage
    localStorage.setItem('selectedSubCategory', JSON.stringify({
      _id: selectedSubCategory._id,
      name: selectedSubCategory.name
    }));
    
    if (onSubCategorySelect) {
      onSubCategorySelect(selectedSubCategory, subCategory);
    }
  };

  const navigateToPrevious = () => {
    if (swiperRef.current && currentIndex > 0) {
      swiperRef.current.slidePrev();
    }
  };

  const navigateToNext = () => {
    if (swiperRef.current && currentIndex < subCategory.length - 1) {
      swiperRef.current.slideNext();
    }
  };

  // If searching, show search results header (check this first)
  if (searchQuery && searchQuery.trim() && !loading) {
    return (
      <div className="NavigateBarContainer d-flex align-items-center">
        <Button 
          className="PreviousBtn disabled-arrow" 
          disabled={true}
        >
          &lt;
        </Button>

        <div className="SubCategory-Container" style={{ flex: 1 }}>
          <div className="SubCategory-Item SubCategory-Item-Center">
            <Button
              className="SubCategory-ItemButton SubCategory-ItemButtonActive"
            >
              Search Results
            </Button>
          </div>
        </div>

        <Button 
          className="NextBtn disabled-arrow" 
          disabled={true}
        >
          &gt;
        </Button>
      </div>
    );
  }

  if (!loading && subCategory.length < 1) {
    return null;
  }

  const canNavigateLeft = currentIndex > 0;
  const canNavigateRight = currentIndex < subCategory.length - 1;

  return (
    <div className="NavigateBarContainer d-flex align-items-center">
      <Button 
        className={`PreviousBtn ${!canNavigateLeft || loading ? 'disabled-arrow' : ''}`} 
        onClick={navigateToPrevious} 
        disabled={!canNavigateLeft || loading}
      >
        &lt;
      </Button>

      <div className="SubCategory-Container" style={{ flex: 1 }}>
        {loading ? (
          <CafeLoader 
            type={LOADER_TYPES.COFFEE_GRINDER} 
            size={30}
            text={customMessages?.loadingText || "Loading categories..."} 
          />
        ) : (
          <Swiper
            modules={[Navigation]}
            spaceBetween={0}
            slidesPerView={1}
            centeredSlides={true}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            onSlideChange={handleSlideChange}
            allowTouchMove={true}
            speed={300}
            initialSlide={currentIndex}
            key={`${categoryId}-${subCategory.length}`}
            threshold={20}
            touchRatio={1.5}
          >
            {subCategory.map((item, index) => (
              <SwiperSlide key={item.serialId}>
                <div className="SubCategory-Item SubCategory-Item-Center">
                  <Button
                    data-subcategory-id={item.serialId}
                    className="SubCategory-ItemButton SubCategory-ItemButtonActive"
                  >
                    {item.name}
                  </Button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <Button 
        className={`NextBtn ${!canNavigateRight || loading ? 'disabled-arrow' : ''}`} 
        onClick={navigateToNext} 
        disabled={!canNavigateRight || loading}
      >
        &gt;
      </Button>
    </div>
  );
}
