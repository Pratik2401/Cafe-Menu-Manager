/**
 * @fileoverview Cache Monitor Component for Development
 * Shows cache statistics and allows manual cache management
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Table } from 'react-bootstrap';
import { getCacheStats, clearCache, clearAllCache } from '../../hooks/useApiCache';

const CacheMonitor = () => {
  const [stats, setStats] = useState({ cacheSize: 0, pendingRequests: 0, cacheKeys: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleClearCache = (key) => {
    clearCache(key);
    setRefreshKey(prev => prev + 1);
  };

  const handleClearAllCache = () => {
    clearAllCache();
    setRefreshKey(prev => prev + 1);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="mt-3" style={{ fontSize: '12px' }}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>API Cache Monitor</span>
        <div>
          <Badge variant="info" className="me-2">
            Cache: {stats.cacheSize}
          </Badge>
          <Badge variant="warning" className="me-2">
            Pending: {stats.pendingRequests}
          </Badge>
          <Button size="sm" variant="outline-danger" onClick={handleClearAllCache}>
            Clear All
          </Button>
        </div>
      </Card.Header>
      <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {stats.cacheKeys.length === 0 ? (
          <p className="text-muted mb-0">No cached data</p>
        ) : (
          <Table size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Cache Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.cacheKeys.map((key) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleClearCache(key)}
                    >
                      Clear
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default CacheMonitor;