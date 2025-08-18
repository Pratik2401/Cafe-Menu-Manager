import React from 'react';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';
import { useBreadcrumb } from './AdminBreadcrumbContext';
// No loader needed
import '../../styles/Breadcrumb.css';

const Breadcrumb = () => {
  const { breadcrumbItems } = useBreadcrumb();

  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <BootstrapBreadcrumb className="custom-breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <BootstrapBreadcrumb.Item
          key={index}
          active={index === breadcrumbItems.length - 1}
          onClick={item.onClick}
          className={item.onClick ? 'clickable' : ''}
        >
          {item.label}
        </BootstrapBreadcrumb.Item>
      ))}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;