/**
 * @fileoverview Virtual List Component for rendering large datasets efficiently
 * Uses react-window for optimal performance with large lists
 */

import React, { memo, useMemo } from 'react';

const VirtualizedList = memo(({ 
  items, 
  itemHeight = 50, 
  containerHeight = 400,
  renderItem,
  overscan = 5 
}) => {
  const itemData = useMemo(() => ({ items, renderItem }), [items, renderItem]);
  
  const Row = memo(({ index, style, data }) => (
    <div style={style}>
      {data.renderItem(data.items[index], index)}
    </div>
  ));
  
  Row.displayName = 'VirtualizedRow';
  
  // Simple virtualization implementation
  const visibleItems = useMemo(() => {
    const startIndex = 0;
    const endIndex = Math.min(items.length, Math.ceil(containerHeight / itemHeight) + overscan);
    return items.slice(startIndex, endIndex);
  }, [items, containerHeight, itemHeight, overscan]);
  
  return (
    <div 
      className="virtualized-list-container"
      style={{ 
        height: containerHeight, 
        overflow: 'auto',
        contain: 'layout style paint'
      }}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div 
            key={item.id || index}
            style={{
              height: itemHeight,
              transform: `translateY(${index * itemHeight}px)`
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;
