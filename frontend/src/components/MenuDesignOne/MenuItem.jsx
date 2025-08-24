import { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { Button, Badge, Offcanvas, ListGroup, Accordion } from 'react-bootstrap';
import { getAllItems, getAllCategories, getAllSizes, getAllSubCategories } from '../../api/customer';
import { useDebounce } from '../../hooks/useDebounce.js';
import NoItems from '../../assets/images/NoItemsImage.webp';
import LoadingVideo from '../../assets/videos/loading.gif';
import '../../styles/MenuItem.css';
import '../../styles/animations.css';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';

// Optimized progressive image loading for MenuItem images
const MenuItemImage = memo(({ src, alt, className, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => setLoaded(true);
          img.onerror = onError;
          img.src = src;
          observer.unobserve(imgRef.current);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, onError]);

  return (
    <div ref={imgRef} className={className} style={{ width: '100%', height: '100%' }}>
      {loaded ? (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
        />
      ) : (
        <div 
          className="d-flex align-items-center justify-content-center bg-light"
          style={{ width: '100%', height: '100%', minHeight: '200px' }}
        >
          <div className="spinner-border spinner-border-sm text-muted"></div>
        </div>
      )}
    </div>
  );
});

MenuItemImage.displayName = 'MenuItemImage';

const MenuItem = memo(({ selectedSubCategory, filters, searchQuery, hasSubCategories, customMessages, onSubCategorySelect, onMenuClick }) => {
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // If onSubCategorySelect is not provided, create a dummy function
  const handleSubCategorySelect = useCallback(onSubCategorySelect || (() => {}), [onSubCategorySelect]);
  
  // Use effect to handle the onMenuClick prop
  useEffect(() => {
    if (onMenuClick) {
      // Set up a global function that can be called to open the sidebar
      window.openMenuItemSidebar = () => {
        setShowSidebar(true);
      };
    }
  }, [onMenuClick]);
  if (!hasSubCategories) {
    return (
      <div className="MenuItemBody">
        <div className="no-items-message">
          <img 
            src={NoItems} 
            alt="Menu items coming soon" 
            className='NoItemsImage'
          />
          <p style={{ 
            color: '#de353c', 
            fontFamily: 'Comic Sans MS, cursive', 
            fontSize: '18px',
            textAlign: 'center',
            marginTop: '15px'
          }}>
            Feeling a little empty today.
          </p>
        </div>
      </div>
    );
  }
  
  if (!selectedSubCategory) return null;

  const [checkedItems, setCheckedItems] = useState({});
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItemsDisplay, setSelectedItemsDisplay] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedVariations, setSelectedVariations] = useState({});

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState({});

  // Function to check if an image URL is valid
  const checkImageUrl = (url, itemName) => {
    if (!url) return false;
    
    // Check if URL is relative or absolute
    if (url.startsWith('/')) {
      // For relative URLs, check if it's a valid path format
      if (url.includes('uploads/')) {
        // console.log(`✓ Valid relative image URL for ${itemName}: ${url}`);
        return true;
      } else {
        // console.log(`⚠️ Suspicious relative image URL for ${itemName}: ${url}`);
        return false;
      }
    } else if (url.startsWith('http')) {
      // For absolute URLs, check if it's a valid URL format
      // console.log(`✓ Valid absolute image URL for ${itemName}: ${url}`);
      return true;
    } else {
      // console.log(`❌ Invalid image URL format for ${itemName}: ${url}`);
      return false;
    }
  };
  
  const loadItems = async () => {
   
    setLoading(true);
    try {
      const response = await getAllItems();
      
      // Process items array
      const items = Array.isArray(response.data) ? response.data : [];
      
      items.forEach(item => {
        // Check image URLs
        if (item.image) {
          checkImageUrl(item.image, item.name);
        }
      });
      
      setMenuItems(items);
      
      // Fetch categories and sizes
      const categoriesResponse = await getAllCategories();
      
      
      // Handle both array and object with categories property
      const categoriesData = Array.isArray(categoriesResponse.data) 
        ? categoriesResponse.data 
        : (categoriesResponse.data.categories || []);
      
      // Fetch sizes separately
      const sizesResponse = await getAllSizes();
      
      
      // Add sizes to categories data for easy lookup
      const sizesData = Array.isArray(sizesResponse.data) 
        ? sizesResponse.data 
        : (sizesResponse.data.data || []);
      
      // Create a combined data structure for easy size lookup
      const categoriesWithSizes = [...categoriesData];
      categoriesWithSizes.sizes = sizesData;
      
      setCategories(categoriesWithSizes);
      
      // Fetch variations
      try {
        const variationsResponse = await import('../../api/customer').then(module => module.getAllVariations());
      
        const variationsData = Array.isArray(variationsResponse.data) 
          ? variationsResponse.data 
          : (variationsResponse.data?.data || []);
        setVariations(variationsData);
      } catch (error) {
        console.error('Error fetching variations:', error);
        setVariations([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items once when the component mounts
  useEffect(() => {
    loadItems();
    

    
    // Fetch all categories and subcategories for the sidebar
    const fetchCategoriesForSidebar = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await getAllCategories();
        const categoriesData = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : (categoriesResponse.data.categories || []);
        setAllCategories(categoriesData);
        
        // Fetch subcategories
        const subCategoriesResponse = await getAllSubCategories();
        const subCategoriesData = subCategoriesResponse.data || [];
        
        // Group subcategories by category ID
        const grouped = {};
        subCategoriesData.forEach(subCategory => {
          const categoryId = subCategory.category?.serialId || subCategory.categoryId;
          if (!grouped[categoryId]) {
            grouped[categoryId] = [];
          }
          grouped[categoryId].push(subCategory);
        });
        
        setAllSubCategories(grouped);
      } catch (error) {
        console.error('Error fetching categories for sidebar:', error);
      }
    };
    
    fetchCategoriesForSidebar();
  }, []);

  const applyFilters = useCallback((item) => {
    // Ignore subcategory match when searchQuery is present
    const subCategoryMatch = debouncedSearchQuery
      ? true // Ignore subcategory when searching
      : selectedSubCategory
      ? item.subCategory._id === selectedSubCategory._id
      : true;

    const searchMatch = debouncedSearchQuery
      ? item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      : true;

    // Include items where show is true or undefined (for backward compatibility)
    const visibilityMatch = item.show !== false;

    // Food category filter - check if any food category filters are selected
    const selectedFoodCategories = Object.keys(filters).filter(key => filters[key]);
    const foodCategoryMatch = selectedFoodCategories.length === 0 || 
      selectedFoodCategories.includes(item.foodCategory);

    return subCategoryMatch && searchMatch && visibilityMatch && foodCategoryMatch;
  }, [debouncedSearchQuery, selectedSubCategory, filters]);

  // State for food categories
  const [foodCategories, setFoodCategories] = useState([]);

  // Fetch food categories using the getAllFoodCategories endpoint
  useEffect(() => {
    const fetchFoodCategories = async () => {
      try {
        const response = await import('../../api/customer').then(module => module.getFoodCategories());
        setFoodCategories(response.data);
      } catch (error) {
        console.error('Error fetching food categories:', error);
      }
    };
    
    fetchFoodCategories();
  }, []);

  // Pre-select first variation and size for all items
  useEffect(() => {
    if (menuItems.length > 0 && categories.sizes) {
      const defaultVariations = {};
      const defaultSizes = {};
      
      menuItems.forEach(item => {
        if (item.hasVariations && item.variations?.length > 0) {
          // Find the first variation with valid sizes (price > 0) or direct price
          const validVariation = item.variations.find(variation => {
            if (variation.sizePrices?.length > 0) {
              // Check if this variation has any sizes with price > 0
              return variation.sizePrices.some(sp => sp.price > 0);
            }
            // For variations with direct price (no sizes)
            return variation.price > 0;
          });
          
          if (validVariation) {
            if (validVariation.sizePrices?.length > 0) {
              // Variation with sizes - select first available size with price > 0
              const validSizes = validVariation.sizePrices.filter(sp => sp.price > 0);
              if (validSizes.length > 0) {
                defaultVariations[item._id] = {
                  variationId: validVariation.variationId,
                  sizeId: validSizes[0].sizeId
                };
              }
            } else {
              // Variation with direct price (no sizes)
              defaultVariations[item._id] = {
                variationId: validVariation.variationId
              };
            }
          }
        } else if (item.sizePrices?.length > 0) {
          // Size-only pricing (no variations) - always select first available size
          const validSizes = item.sizePrices.filter(sp => sp.price > 0);
          if (validSizes.length > 0) {
            defaultSizes[item._id] = validSizes[0].sizeId;
          }
        }
      });
      
      setSelectedVariations(prev => ({ ...prev, ...defaultVariations }));
      setSelectedSizes(prev => ({ ...prev, ...defaultSizes }));
    }
  }, [menuItems.length, categories.sizes]); // Use menuItems.length instead of menuItems to prevent infinite loop

  // Function to get food category name by ID
  const getFoodCategoryName = (foodCategoryId) => {
    const category = foodCategories.find(cat => cat._id === foodCategoryId);
    return category ? category.name : '';
  };
  
  // Function to ensure price is displayed correctly
  const formatPrice = (price) => {
    return price ? `Rs. ${price}` : '';
  };
  
  // Function to handle size selection within current variation
  const handleSizeSelect = (itemId, sizeId) => {
    setSelectedVariations(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], sizeId }
    }));
  };
  
  // Function to handle variation selection
  const handleVariationSelect = (itemId, variationId) => {
    const item = menuItems.find(i => i._id === itemId);
    const variation = item?.variations?.find(v => v.variationId === variationId);
    
    if (variation) {
      if (variation.sizePrices?.length > 0) {
        // Variation with sizes - always auto-select first size with price > 0
        const validSizes = variation.sizePrices.filter(sp => sp.price > 0);
        if (validSizes.length > 0) {
          setSelectedVariations(prev => ({
            ...prev,
            [itemId]: { variationId, sizeId: validSizes[0].sizeId }
          }));
        } else {
          // If no valid sizes (all prices are 0), don't select this variation
          // console.log('No valid sizes found for this variation');
          return;
        }
      } else if (variation.price > 0) {
        // Variation with direct price (no sizes)
        setSelectedVariations(prev => ({
          ...prev,
          [itemId]: { variationId }
        }));
      } else {
        // If variation has no price or all zero prices, don't select it
        // console.log('Variation has no valid price');
        return;
      }
    }
  };
  
  // Function to handle size selection within a variation
  const handleVariationSizeSelect = (itemId, sizeId) => {
    setSelectedVariations(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], sizeId }
    }));
  };
  
  // Function to get the current price based on selected variation and size
  const getCurrentPrice = (item) => {
    if (item.hasVariations && item.variations?.length > 0) {
      const selectedVar = selectedVariations[item._id];
      if (selectedVar) {
        const variation = item.variations.find(v => v.variationId === selectedVar.variationId);
        if (variation) {
          // Check if variation has direct price (no sizes)
          if (variation.price !== undefined && (!variation.sizePrices || variation.sizePrices.length === 0)) {
            return variation.price;
          }
          // Check if variation has size-based pricing
          else if (variation.sizePrices?.length > 0 && selectedVar.sizeId) {
            const sizePrice = variation.sizePrices.find(sp => sp.sizeId === selectedVar.sizeId)?.price;
            return sizePrice !== undefined ? sizePrice : item.price;
          }
        }
      }
      // Fallback to first variation's price if no selection
      const firstVariation = item.variations[0];
      if (firstVariation?.price !== undefined) {
        return firstVariation.price;
      }
    }
    // Handle size-only pricing (no variations)
    else if (item.sizePrices?.length > 0) {
      const selectedSize = selectedSizes[item._id];
      if (selectedSize) {
        const sizePrice = item.sizePrices.find(sp => sp.sizeId === selectedSize)?.price;
        return sizePrice !== undefined ? sizePrice : item.price;
      }
      // Fallback to first size price
      return item.sizePrices[0]?.price || item.price;
    }
    return item.price;
  };
  
  // Function to get addon price based on selected variation and size
  const getAddonPrice = (addon, itemId) => {
    const item = menuItems.find(i => i._id === itemId);
    
    // If addon has no size-specific prices, return direct price if > 0
    if (!addon.prices || addon.prices.length === 0) {
      return addon.price > 0 ? addon.price : null;
    }
    
    let targetPrice = null;
    
    if (item?.hasVariations && item.variations?.length > 0) {
      // Item has variations
      const selectedVar = selectedVariations[itemId];
      if (selectedVar) {
        const variation = item.variations.find(v => v.variationId === selectedVar.variationId);
        
        if (variation?.sizePrices?.length > 0 && selectedVar.sizeId) {
          // Variation with sizes - find variation + size specific price
          const variationSizePrice = addon.prices.find(p => 
            p.variationId === selectedVar.variationId && p.sizeId === selectedVar.sizeId
          )?.price;
          if (variationSizePrice !== undefined) {
            targetPrice = variationSizePrice;
          }
        } else {
          // Variation without sizes - find variation specific price
          const variationPrice = addon.prices.find(p => 
            p.variationId === selectedVar.variationId && !p.sizeId
          )?.price;
          if (variationPrice !== undefined) {
            targetPrice = variationPrice;
          }
        }
      }
    } else if (item?.sizePrices?.length > 0) {
      // Item has only sizes (no variations)
      const targetSizeId = selectedSizes[itemId];
      if (targetSizeId) {
        const sizePrice = addon.prices.find(p => p.sizeId === targetSizeId && !p.variationId)?.price;
        if (sizePrice !== undefined) {
          targetPrice = sizePrice;
        }
      }
    }
    
    // Return price only if > 0, otherwise null to hide addon
    if (targetPrice !== null && targetPrice > 0) {
      return targetPrice;
    }
    
    // Fallback to direct price if > 0
    return addon.price > 0 ? addon.price : null;
  };

  // Debug function to check image visibility
  const debugImageVisibility = (item) => {
    // console.log(`\n--- Image Visibility Check for ${item.name} (ID: ${item._id}) ---`);
    // console.log(`Image URL: ${item.image || 'No image URL'}`);
    
    if (!item.image) {
      // console.log(`❌ Item ${item.name} has no image property`);
      return false;
    }
    
    // We're now ignoring fieldVisibility settings for images
    // console.log(`✅ Item ${item.name} should show image: ${item.image}`);
    return true;
  };
  
  // Memoized filtered items using debounced search for better performance
  const filteredItems = useMemo(() => {
    const items = menuItems.filter(applyFilters);
    
    // Debug image visibility for each item
    items.forEach(item => {
      debugImageVisibility(item);
    });
    
    return items;
  }, [menuItems, selectedSubCategory, filters, debouncedSearchQuery]);

  const toggleExpandedItem = (item) => {
    const uniqueKey = `${item._id}`;

    setExpandedItems((prevExpandedItems) =>
      prevExpandedItems.includes(uniqueKey)
        ? prevExpandedItems.filter((key) => key !== uniqueKey) // Remove if already expanded
        : [...prevExpandedItems, uniqueKey] // Add if not expanded
    );
  };

  const toggleCheckbox = (itemId, index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [index]: !prev[itemId]?.[index],
      },
    }));
  };

  // Get all selected items
  const getSelectedItems = () => {
    const selected = [];
    
    Object.keys(checkedItems).forEach(itemId => {
      const item = menuItems.find(item => item._id === itemId);
      if (!item) return;
      
      const selectedAddOns = [];
      Object.keys(checkedItems[itemId] || {}).forEach(index => {
        if (checkedItems[itemId][index] && item.addOns && item.addOns[index]) {
          selectedAddOns.push(item.addOns[index]);
        }
      });
      
      if (selectedAddOns.length > 0) {
        selected.push({
          item,
          addOns: selectedAddOns
        });
      }
    });
    
    return selected;
  };
  
  const selectedItems = getSelectedItems();
  
  return (
    <div className="MenuItemBody">
      {/* Header Notes Section */}
      {selectedSubCategory && selectedSubCategory.notes && selectedSubCategory.notes.filter(note => note.position === 'header').length > 0 && (
        <div className="subcategory-notes-container">
          {selectedSubCategory.notes.filter(note => note.position === 'header').map((note, index) => (
            <div key={index} className="subcategory-note">
              <h3 className="subcategory-note-heading">{note.heading}</h3>
              <p className="subcategory-note-content">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toggle button to show selected items */}
      {selectedItems.length > 0 && (
        <div className="selected-items-toggle">
          <Button 
            onClick={() => setSelectedItemsDisplay(!selectedItemsDisplay)}
            variant="outline-primary"
            className="mb-3"
          >
            {selectedItemsDisplay ? 'Show All Menu Items' : `Show Selected Items (${selectedItems.length})`}
          </Button>
        </div>
      )}
      
      {loading ? (
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_POUR} 
          text={customMessages?.loadingText || "Brewing your menu items..."} 
          size={35}
        />
      ) : selectedItemsDisplay && selectedItems.length > 0 ? (
        // Display selected items
        <div className="selected-items-container">
          <h4>Selected Items</h4>
          <div className="selected-items-grid">
            {selectedItems.map((selection, idx) => (
              <div className="modern-menu-card" key={`${selection.item._id}-${idx}`}>
                <div className="menu-card-content">
                  {/* Left Column - Text Content (70% width) */}
                  <div className="menu-card-text">
                  <div className='Dish-Container'>
                    <h2 className="dish-name">
                      {selection.item.name.toUpperCase()}
                      {selection.item.tags && selection.item.tags.filter(tag => {
                        if (typeof tag === 'object') return tag.image;
                        const tagObj = foodCategories.find(t => t._id === tag);
                        return tagObj?.image;
                      }).map(tag => {
                        if (typeof tag === 'object') {
                          return (
                            <img 
                              key={tag._id}
                              src={getImageUrl(tag.image)} 
                              alt={tag.name}
                              title={tag.name}
                              style={{ 
                                width: 'auto !important', 
                                height: '20px', 
                                objectFit: 'contain',
                                borderRadius: '2px',
                                marginLeft: '8px'
                              }} 
                            />
                          );
                        } else {
                          const tagObj = foodCategories.find(t => t._id === tag);
                          return tagObj?.image ? (
                            <img 
                              key={tagObj._id}
                              src={getImageUrl(tagObj.image)} 
                              alt={tagObj.name}
                              title={tagObj.name}
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                objectFit: 'contain',
                                borderRadius: '2px',
                                marginLeft: '8px'
                              }} 
                            />
                          ) : null;
                        }
                      })}
                    </h2>
                    {selection.item.tags && selection.item.tags.filter(tag => {
                      if (typeof tag === 'object') return !tag.image;
                      const tagObj = foodCategories.find(t => t._id === tag);
                      return !tagObj?.image;
                    }).length > 0 && (
                      <div className="text-tags-container">
                        {selection.item.tags.filter(tag => {
                          if (typeof tag === 'object') return !tag.image;
                          const tagObj = foodCategories.find(t => t._id === tag);
                          return !tagObj?.image;
                        }).map(tag => {
                          if (typeof tag === 'object') {
                            return (
                              <Badge 
                                key={tag._id}
                                style={{ '--tag-color': tag.color }}
                                className="tag-badge text-tag"
                              >
                                {tag.name}
                              </Badge>
                            );
                          } else {
                            const tagObj = foodCategories.find(t => t._id === tag);
                            return tagObj && !tagObj.image ? (
                              <Badge 
                                key={tagObj._id}
                                style={{ '--tag-color': tagObj.color }}
                                className="tag-badge text-tag"
                              >
                                {tagObj.name}
                              </Badge>
                            ) : null;
                          }
                        })}
                      </div>
                    )}
                    </div>

                    {selection.item.description && (
                      <p className="dish-description">{selection.item.description}</p>
                    )}
                    
                    <div className="price-section">
                      <p className="dish-price">{formatPrice(getCurrentPrice(selection.item))}</p>
                    </div>
                    

                    
                    <div className="addons-section">
                      <p className="addons-heading">Add-ons:</p>
                      <ul className="addons-list">
                        {(() => {
                          // Group addons by price, filtering out zero/null prices
                          const addonsByPrice = {};
                          selection.addOns.forEach(addon => {
                            const price = getAddonPrice(addon, selection.item._id);
                            if (price !== null && price > 0) {
                              if (!addonsByPrice[price]) {
                                addonsByPrice[price] = [];
                              }
                              addonsByPrice[price].push(addon.addOnItem);
                            }
                          });
                          
                          // Only render if there are addons with valid prices
                          const entries = Object.entries(addonsByPrice);
                          if (entries.length === 0) return null;
                          
                          return entries.map(([price, addons], index) => (
                            <li key={index}>
                              {addons.join(' | ')} (Rs. {price})
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Right Column - Image (30% width) */}
                  <div className="menu-card-image-container">
                    {/* Food Image */}
                    {selection.item.image ? (
                      <div className="menu-card-image">
                        <MenuItemImage
                          src={getImageUrl(selection.item.image)} 
                          alt={selection.item.name} 
                          className='menu-card-image-css'
                          onError={(e) => {
                            // console.log(`Image failed to load: ${selection.item.image}`);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  
                  {/* Food Category Symbol - Fixed position */}
                  {selection.item.foodCategory && (
                    <div className="food-category-symbol-fixed">
                      {(() => {
                        const category = foodCategories.find(cat => cat._id === selection.item.foodCategory);
                        return category ? (
                          <img 
                            src={category.icon} 
                            alt={category.name} 
                            title={category.name}
                            className="category-icon"
                          />
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Display regular menu items with the modern design
        <div className="menu-items-grid">
          {filteredItems.length === 0 ? (
            <div className="no-items-message">
              <img 
                src="/uploads/NoItemsImage.webp" 
                alt="No items available" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <p style={{ 
                color: '#de353c', 
                fontFamily: 'Comic Sans MS, cursive', 
                fontSize: '18px',
                textAlign: 'center',
                marginTop: '15px'
              }}>
                Feeling a little empty today.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
            <div className="modern-menu-card" key={item._id}>
              <div className="menu-card-content">
                {/* Left Column - Text Content (70% width) */}
                <div className="menu-card-text">
                
                  <div className='Dish-Container'>
                  <h2 className="dish-name">
                    {item.name.toUpperCase()}
                    {item.tags && item.tags.filter(tag => {
                      if (typeof tag === 'object') return tag.image;
                      const tagObj = foodCategories.find(t => t._id === tag);
                      return tagObj?.image;
                    }).map(tag => {
                      if (typeof tag === 'object') {
                        return (
                          <img 
                            key={tag._id}
                            src={getImageUrl(tag.image)} 
                            alt={tag.name}
                            title={tag.name}
                            style={{ 
                              width: 'auto', 
                              height: '20px', 
                              objectFit: 'contain',
                              borderRadius: '2px',
                              marginLeft: '8px'
                            }} 
                          />
                        );
                      } else {
                        const tagObj = foodCategories.find(t => t._id === tag);
                        return tagObj?.image ? (
                          <img 
                            key={tagObj._id}
                            src={getImageUrl(tagObj.image)} 
                            alt={tagObj.name}
                            title={tagObj.name}
                            style={{ 
                              width: '14px', 
                              height: '14px', 
                              objectFit: 'contain',
                              borderRadius: '2px',
                              marginLeft: '8px'
                            }} 
                          />
                        ) : null;
                      }
                    })}
                  </h2>
                  {item.tags && item.tags.filter(tag => {
                    if (typeof tag === 'object') return !tag.image;
                    const tagObj = foodCategories.find(t => t._id === tag);
                    return !tagObj?.image;
                  }).length > 0 && (
                    <div className="text-tags-container">
                      {item.tags.filter(tag => {
                        if (typeof tag === 'object') return !tag.image;
                        const tagObj = foodCategories.find(t => t._id === tag);
                        return !tagObj?.image;
                      }).map(tag => {
                        if (typeof tag === 'object') {
                          return (
                            <Badge 
                              key={tag._id}
                              style={{ '--tag-color': tag.color }}
                              className="tag-badge text-tag"
                            >
                              {tag.name}
                            </Badge>
                          );
                        } else {
                          const tagObj = foodCategories.find(t => t._id === tag);
                          return tagObj && !tagObj.image ? (
                            <Badge 
                              key={tagObj._id}
                              style={{ '--tag-color': tagObj.color }}
                              className="tag-badge text-tag"
                            >
                              {tagObj.name}
                            </Badge>
                          ) : null;
                        }
                      })}
                    </div>
                  )}
                  </div>

                  {item.fieldVisibility?.description !== false && item.description && (
                    <p className="dish-description">{item.description}</p>
                  )}
                  
                  <div className="price-section">
                    <p className="dish-price">{formatPrice(getCurrentPrice(item))}</p>
                  </div>
                  
                  {/* Variations and Sizes Section */}
                  {(() => {
                    if (item.hasVariations && item.variations?.length > 0) {
                      // Filter variations to only show those with valid prices
                      const validVariations = item.variations.filter(variation => {
                        if (variation.sizePrices?.length > 0) {
                          return variation.sizePrices.some(sp => sp.price > 0);
                        }
                        return variation.price > 0;
                      });
                      
                      if (validVariations.length === 0) return null;
                      
                      return (
                        <div className="variations-section">
                          <div className="variations-list">
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {validVariations.map((variation, idx) => {
                                const variationObj = variations.find(v => v._id === variation.variationId);
                                const isSelected = selectedVariations[item._id]?.variationId === variation.variationId;
                                const variationName = variationObj?.name || `Option ${idx + 1}`;
                                return (
                                  <span 
                                    key={variation.variationId || idx}
                                    className={`variation-option bg-secondary ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleVariationSelect(item._id, variation.variationId)}
                                    role="button"
                                    aria-pressed={isSelected}
                                    title={`Select ${variationName}`}
                                  >
                                    {variationName}
                                  </span>
                                );
                              })}
                            </div>
                            {selectedVariations[item._id] && (() => {
                              const selectedVariation = item.variations.find(v => v.variationId === selectedVariations[item._id].variationId);
                              if (selectedVariation?.sizePrices?.length > 0) {
                                const validSizes = selectedVariation.sizePrices.filter(sp => sp.price > 0);
                                if (validSizes.length === 0) return null;
                                
                                return (
                                  <div className="d-flex flex-wrap gap-1">
                                    {validSizes.map((sp, spIdx) => {
                                      const size = categories.sizes?.find(s => s._id === sp.sizeId);
                                      const isSelected = selectedVariations[item._id]?.sizeId === sp.sizeId;
                                      return (
                                        <span 
                                          key={sp.sizeId || spIdx}
                                          className={`size-option bg-secondary ${isSelected ? 'selected' : ''}`}
                                          onClick={() => handleSizeSelect(item._id, sp.sizeId)}
                                          role="button"
                                          aria-pressed={isSelected}
                                          title={`Select ${size?.name || `Size ${spIdx + 1}`}`}
                                        >
                                          {size?.name || `Size ${spIdx + 1}`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      );
                    } else if (item.sizePrices?.length > 0) {
                      const validSizes = item.sizePrices.filter(sp => sp.price > 0);
                      if (validSizes.length === 0) return null;
                      
                      return (
                        <div className="sizes-section">
                          <div className="d-flex flex-wrap gap-1">
                            {validSizes.map((sp, idx) => {
                              const size = categories.sizes?.find(s => s._id === sp.sizeId);
                              const isSelected = selectedSizes[item._id] === sp.sizeId;
                              return (
                                <span 
                                  key={sp.sizeId || idx}
                                  className={`size-option bg-secondary ${isSelected ? 'selected' : ''}`}
                                  onClick={() => setSelectedSizes(prev => ({ ...prev, [item._id]: sp.sizeId }))}
                                  role="button"
                                  aria-pressed={isSelected}
                                  title={`Select ${size?.name || `Size ${idx + 1}`}`}
                                >
                                  {size?.name || `Size ${idx + 1}`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {item.fieldVisibility?.addOns !== false && item.addOns && item.addOns.length > 0 && (
                    <div className="addons-section">
                      <p className="addons-heading">Add-ons:</p>
                      <ul className="addons-list">
                        {(() => {
                          // Group addons by price, filtering out zero/null prices
                          const addonsByPrice = {};
                          item.addOns.forEach(addon => {
                            const price = getAddonPrice(addon, item._id);
                            if (price !== null && price > 0) {
                              if (!addonsByPrice[price]) {
                                addonsByPrice[price] = [];
                              }
                              addonsByPrice[price].push(addon.addOnItem);
                            }
                          });
                          
                          // Only render if there are addons with valid prices
                          const entries = Object.entries(addonsByPrice);
                          if (entries.length === 0) return null;
                          
                          return entries.map(([price, addons], index) => (
                            <p key={index}>
                              {addons.join(' | ')} (Rs. {price})
                            </p>
                          ));
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Image (30% width) */}
                <div className="menu-card-image-container">
                  {/* Food Image */}
                  {item.image ? (
                    <div className="menu-card-image">
                      <MenuItemImage
                        src={getImageUrl(item.image)} 
                        alt={item.name} 
                        className='menu-card-image-css'
                        onError={(e) => {
                          // console.log(`Image failed to load: ${item.image}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                
                {/* Food Category Symbol - Fixed position */}
                {item.foodCategory && (
                  <div className="food-category-symbol-fixed">
                    {(() => {
                      const category = foodCategories.find(cat => cat._id === item.foodCategory);
                      return category ? (
                        <img 
                          src={getImageUrl(category.icon)} 
                          alt={category.name} 
                          title={category.name}
                          className="category-icon"
                        />
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Footer Notes Section */}
      {selectedSubCategory && selectedSubCategory.notes && selectedSubCategory.notes.filter(note => note.position === 'footer').length > 0 && (
        <div className="subcategory-notes-container">
          {selectedSubCategory.notes.filter(note => note.position === 'footer').map((note, index) => (
            <div key={index} className="subcategory-note">
              <h3 className="subcategory-note-heading">{note.heading}</h3>
              <p className="subcategory-note-content">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className='Self-Branding'> 
        <p className='text-muted'>Enjoying the Snap2Eat experience?</p>
        <p className='text-muted'>Head over to our <a href='https://snap2eat.in/' className='Brank-Link'>website</a> to see how we’re transforming menus into digital experiences.</p>
      </div>

      
      {/* Menu Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)} 
        placement="end"
        className="menu-sidebar"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu Categories</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Accordion flush>
            {allCategories.map(category => {
              const hasSubcategories = allSubCategories[category.serialId]?.length > 0;
              
              return (
                <Accordion.Item key={category.serialId} eventKey={category.serialId}>
                  <Accordion.Header>
                    {category.name}
                  </Accordion.Header>
                  <Accordion.Body>
                    {hasSubcategories ? (
                      <ListGroup variant="flush">
                        {allSubCategories[category.serialId].map(subCategory => (
                          <ListGroup.Item 
                            key={subCategory.serialId}
                            action
                            active={selectedSubCategory?._id === subCategory._id}
                            onClick={() => {
                              // Update localStorage
                              localStorage.setItem('selectedMainCategory', JSON.stringify({
                                id: category.serialId,
                                name: category.name
                              }));
                              
                              // Update selected subcategory
                              handleSubCategorySelect(subCategory, allSubCategories[category.serialId]);
                              
                              setShowSidebar(false);
                            }}
                          >
                            {subCategory.name}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted">No subcategories available</p>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;