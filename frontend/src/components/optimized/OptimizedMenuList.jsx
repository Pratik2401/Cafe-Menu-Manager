/**
 * @fileoverview Optimized Menu List Component
 * Features: Virtual scrolling, React.memo, useMemo for large lists
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import { Card, Button, Badge, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useCategories, useItems } from '../../hooks/useReactQuery.jsx';
import { useAppStore } from '../../store/appStore.js';
import VirtualizedList from '../utils/VirtualizedList.jsx';
import { OptimizedImage } from '../utils/PerformanceUtils.jsx';

// Memoized menu item component
const MenuItemCard = memo(({ item, onItemClick, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart?.(item);
  }, [item, onAddToCart]);

  const handleItemClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  return (
    <Card 
      className="menu-item-card h-100 cursor-pointer hover-shadow transition-all"
      onClick={handleItemClick}
    >
      <div className="position-relative">
        <OptimizedImage
          src={item.image || '/placeholder-food.jpg'}
          alt={item.name}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Price badge */}
        {item.price && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 end-0 m-2 fs-6"
          >
            ${item.price}
          </Badge>
        )}
        
        {/* Availability indicator */}
        {!item.available && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
            <Badge bg="danger">Out of Stock</Badge>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={item.name}>
          {item.name}
        </Card.Title>
        
        {item.description && (
          <Card.Text 
            className="text-muted small flex-grow-1"
            style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.description}
          </Card.Text>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-2">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                bg="secondary" 
                className="me-1 mb-1 small"
              >
                {tag.name}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge bg="light" text="dark" className="small">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Allergy information */}
        {item.allergies && item.allergies.length > 0 && (
          <div className="mb-2">
            <Badge bg="warning" text="dark" className="small">
              Contains: {item.allergies.map(a => a.name).join(', ')}
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto">
          {item.variations && item.variations.length > 0 ? (
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="w-100"
              onClick={handleItemClick}
            >
              View Options
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="sm" 
              className="w-100"
              onClick={handleAddToCart}
              disabled={!item.available}
            >
              {item.available ? 'Add to Cart' : 'Unavailable'}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

// Memoized category filter component
const CategoryFilter = memo(({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  loading 
}) => {
  const handleCategoryClick = useCallback((categoryId) => {
    onCategoryChange(categoryId);
  }, [onCategoryChange]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div className="category-filter mb-3">
      <div className="d-flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handleCategoryClick(null)}
        >
          All Items
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

// Main optimized menu list component
const OptimizedMenuList = memo(({ 
  categoryId = null,
  searchQuery = '',
  onItemClick,
  onAddToCart,
  virtualized = false,
  gridMode = true,
  itemsPerPage = 20
}) => {
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const { searchFilters } = useAppStore();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Fetch items with optimized query
  const { data: items = [], isLoading: itemsLoading } = useItems(
    selectedCategory,
    {
      search: searchQuery,
      ...searchFilters,
      limit: itemsPerPage
    }
  );

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply availability filter
    if (searchFilters.showAvailableOnly) {
      filtered = filtered.filter(item => item.available);
    }

    // Apply price range filter
    if (searchFilters.minPrice !== undefined || searchFilters.maxPrice !== undefined) {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price) || 0;
        return (!searchFilters.minPrice || price >= searchFilters.minPrice) &&
               (!searchFilters.maxPrice || price <= searchFilters.maxPrice);
      });
    }

    return filtered;
  }, [items, searchQuery, searchFilters]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const renderVirtualizedItem = useCallback((item) => (
    <div key={item.id} className="p-2">
      <MenuItemCard
        item={item}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
      />
    </div>
  ), [onItemClick, onAddToCart]);

  const renderGridItem = useCallback((item) => (
    <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
      <MenuItemCard
        item={item}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
      />
    </Col>
  ), [onItemClick, onAddToCart]);

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <Container fluid className="optimized-menu-list">
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        loading={categoriesLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center p-5">
          <Spinner animation="border" className="me-2" />
          Loading menu items...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center p-5">
          <h5 className="text-muted">No items found</h5>
          <p className="text-muted">
            {searchQuery ? `No results for "${searchQuery}"` : 'No items available in this category'}
          </p>
        </div>
      )}

      {/* Menu Items */}
      {!isLoading && filteredItems.length > 0 && (
        <>
          {virtualized ? (
            <div className="virtualized-container">
              <VirtualizedList
                items={filteredItems}
                itemHeight={350}
                containerHeight={600}
                renderItem={renderVirtualizedItem}
              />
            </div>
          ) : gridMode ? (
            <Row className="optimized-grid">
              {filteredItems.map(renderGridItem)}
            </Row>
          ) : (
            <div className="list-view">
              {filteredItems.map((item) => (
                <div key={item.id} className="mb-3">
                  <MenuItemCard
                    item={item}
                    onItemClick={onItemClick}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Load More Button (for pagination) */}
      {!virtualized && filteredItems.length >= itemsPerPage && (
        <div className="text-center mt-4">
          <Button variant="outline-primary" size="lg">
            Load More Items
          </Button>
        </div>
      )}
    </Container>
  );
});

OptimizedMenuList.displayName = 'OptimizedMenuList';

export default OptimizedMenuList;
