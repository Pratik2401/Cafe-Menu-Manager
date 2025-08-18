import React, { useState, useRef } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { importItemsFromCSV } from '../../api/admin';

const CSVImportButton = ({ subcategoryId, onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('subcategoryId', subcategoryId);

      const result = await importItemsFromCSV(formData);
      setSuccess(result.message);
      
      if (onImportSuccess) {
        onImportSuccess(result.items);
      }
      
      // Clear file input
      fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv"
        style={{ display: 'none' }}
      />
      
      <Button 
        variant="success" 
        onClick={handleButtonClick}
        disabled={loading || !subcategoryId}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Importing...
          </>
        ) : (
          'Import from CSV'
        )}
      </Button>

      {error && (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mt-2 mb-0">
          {success}
        </Alert>
      )}
      
    </div>
  );
};

export default CSVImportButton;