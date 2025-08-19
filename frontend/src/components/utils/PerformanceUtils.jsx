/**
 * @fileoverview Performance monitoring utilities
 * Tracks component render times and performance metrics
 */

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';
import VirtualizedList from './VirtualizedList.jsx';

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const MemoizedComponent = memo(WrappedComponent);
  
  return memo((props) => {
    const renderStartTime = useRef(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 50) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return <MemoizedComponent {...props} />;
  });
};

// Hook for measuring component performance
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;
    
    if (import.meta.env.DEV && renderTime > 16) { // 60fps threshold
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });
  
  return { renderCount: renderCount.current };
};

// Optimized image component with lazy loading
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.jpg',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);
  
  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`${className} ${loaded ? 'loaded' : 'loading'}`}
      src={error ? placeholder : undefined}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized search component
export const MemoizedSearchInput = memo(({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);
  
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);
  
  const handleChange = useCallback((e) => {
    setLocalValue(e.target.value);
  }, []);
  
  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="form-control"
    />
  );
});

MemoizedSearchInput.displayName = 'MemoizedSearchInput';

// Performance-optimized table component
export const OptimizedTable = memo(({ 
  data, 
  columns, 
  rowKey = 'id',
  onRowClick,
  virtualized = false,
  ...props 
}) => {
  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);
  
  const renderRow = useCallback((item, index) => (
    <tr 
      key={item[rowKey]} 
      onClick={() => onRowClick?.(item)}
      className={onRowClick ? 'cursor-pointer hover-bg-light' : ''}
    >
      {memoizedColumns.map((column) => (
        <td key={column.key}>
          {typeof column.render === 'function' 
            ? column.render(item[column.key], item, index)
            : item[column.key]
          }
        </td>
      ))}
    </tr>
  ), [memoizedColumns, onRowClick, rowKey]);
  
  if (virtualized && memoizedData.length > 100) {
    return (
      <div className="table-responsive">
        <VirtualizedList
          items={memoizedData}
          itemHeight={50}
          containerHeight={400}
          renderItem={(item, index) => renderRow(item, index)}
        />
      </div>
    );
  }
  
  return (
    <table className="table" {...props}>
      <thead>
        <tr>
          {memoizedColumns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {memoizedData.map((item, index) => renderRow(item, index))}
      </tbody>
    </table>
  );
});

OptimizedTable.displayName = 'OptimizedTable';

// Batch update hook for performance
export const useBatchUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const timeoutRef = useRef();
  
  const addUpdate = useCallback((updateFn) => {
    setUpdates(prev => [...prev, updateFn]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setUpdates(currentUpdates => {
        currentUpdates.forEach(fn => fn());
        return [];
      });
    }, 50); // Batch updates every 50ms
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return addUpdate;
};
