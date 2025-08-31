import React from 'react';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/Breadcrumb.css';

const Breadcrumb = () => {
  const { breadcrumbItems } = useBreadcrumb();

  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <BootstrapBreadcrumb className="custom-breadcrumb">
      {breadcrumbItems.map((item, index) => {
        const isActive = index === breadcrumbItems.length - 1;
        
        if (item.link && !isActive) {
          return (
            <BootstrapBreadcrumb.Item
              key={index}
              linkAs={Link}
              linkProps={{ to: item.link }}
              className="clickable"
            >
              {item.label}
            </BootstrapBreadcrumb.Item>
          );
        }
        
        return (
          <BootstrapBreadcrumb.Item
            key={index}
            active={isActive}
            className={item.onClick ? 'clickable' : ''}
          >
            {item.onClick ? (
              <span onClick={item.onClick} style={{ cursor: 'pointer' }}>
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </BootstrapBreadcrumb.Item>
        );
      })}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;