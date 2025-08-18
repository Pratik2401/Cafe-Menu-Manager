import React, { useState, useCallback } from 'react';
import { Form, ListGroup, InputGroup, Badge } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

const ItemSearchBar = ({ allItems, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredItems([]);
      setShowSuggestions(false);
    } else {
      if (!Array.isArray(allItems)) {
        console.error('allItems is not an array:', allItems);
        setFilteredItems([]);
        setShowSuggestions(false);
        return;
      }
      
      const filtered = allItems.filter(item => 
        item && item.name && item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowSuggestions(true);
    }
  }, [allItems]);

  const handleSelectItem = useCallback((item) => {
    onSelectItem(item);
    setSearchTerm('');
    setShowSuggestions(false);
  }, [onSelectItem]);

  return (
    <Form.Group className="mb-4 position-relative">
      <Form.Label>Search Items</Form.Label>
      <InputGroup>
        <InputGroup.Text className="bg-light">
          <Search />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type to search items"
          autoComplete="off"
          className="py-2"
        />
      </InputGroup>
      {showSuggestions && filteredItems.length > 0 && (
        <div className="item-suggestions shadow-sm">
          <ListGroup>
            {filteredItems.slice(0, 5).map((item) => (
              <ListGroup.Item 
                key={item._id} 
                action 
                onClick={() => handleSelectItem(item)}
                className="d-flex justify-content-between align-items-center py-2"
              >
                <div>
                  <span>{item.name}</span>
                  {item.eventSpecific && <Badge bg="info" className="ms-2" size="sm">Event</Badge>}
                </div>
                <span className="badge bg-light text-dark">₹{(typeof item.price === 'number' ? item.price.toFixed(2) : '0.00')}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </Form.Group>
  );
};

export default React.memo(ItemSearchBar);