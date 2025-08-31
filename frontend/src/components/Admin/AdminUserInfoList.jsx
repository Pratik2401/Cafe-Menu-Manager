import { useState, useEffect } from 'react';
import { Table, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { FaUsers, FaDownload } from 'react-icons/fa';
import Switch from 'react-switch';
import { getUserInfoList, getUserInfoSettings, updateUserInfoSettings } from '../../api/admin';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminCommon.css';

const AdminUserInfoList = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [userInfoList, setUserInfoList] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    updateBreadcrumb([{ label: 'User Info' }]);
    fetchUserInfoList();
    fetchSettings();
  }, [updateBreadcrumb]);

  const fetchUserInfoList = async () => {
    try {
      const response = await getUserInfoList();
      // console.log('User info response:', response);
      
      // Handle different response structures
      if (response && Array.isArray(response)) {
        // If response is directly an array
        setUserInfoList(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has a data property that is an array
        setUserInfoList(response.data);
      } else if (response && typeof response === 'object') {
        // If response is a single object, wrap it in an array
        setUserInfoList([response]);
      } else {
        // Default to empty array
        setUserInfoList([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user info list:', error);
      setUserInfoList([]);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await getUserInfoSettings();
      // console.log('Settings response:', response);
      
      // Handle different response structures
      let enabled = true; // Default value
      
      if (response && response.enabled !== undefined) {
        // Direct response object
        enabled = response.enabled;
      } else if (response && response.data && response.data.enabled !== undefined) {
        // Nested in data property
        enabled = response.data.enabled;
      }
      
      setIsEnabled(enabled);
      // Store the setting in localStorage for the client-side to use
      localStorage.setItem('userInfoEnabled', enabled.toString());
      // console.log('Set userInfoEnabled in localStorage from API:', enabled.toString());
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Default to enabled on error
      setIsEnabled(true);
      localStorage.setItem('userInfoEnabled', 'true');
      // console.log('Error fetching settings, defaulting userInfoEnabled to true');
    }
  };

  const handleToggleEnable = async () => {
    try {
      const newEnabledState = !isEnabled;
      // console.log('Updating user info enabled state to:', newEnabledState);
      
      // Update the backend setting
      await updateUserInfoSettings({ enabled: newEnabledState });
      
      // Update local state
      setIsEnabled(newEnabledState);
      
      // Update localStorage for the client-side to use
      localStorage.setItem('userInfoEnabled', newEnabledState.toString());
      // console.log('Updated userInfoEnabled in localStorage:', newEnabledState.toString());
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const csvData = userInfoList.map(({ name, email, number, birthday, optIn, createdAt }) => ({
    Name: name,
    Email: email,
    Phone: number,
    Birthday: birthday ? new Date(birthday).toLocaleDateString() : '-',
    'Opted In': optIn ? 'Yes' : 'No',
    'Submission Date': new Date(createdAt).toLocaleDateString()
  }));

  if (loading) {
    return (
      <div className="admin-common-container">
        <div className="admin-common-loading">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-common-container">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Card className="admin-common-card">
        <Card.Header className="admin-common-card-header">
          <h3 className="admin-common-section-title">
            <FaUsers className="me-2" />
            User Information Submissions
          </h3>
          <div className="d-flex gap-3">
            <div className="d-flex align-items-center gap-2">
              <span>Collection:</span>
              <Switch
                checked={isEnabled}
                onChange={handleToggleEnable}
                onColor="#64E239"
                offColor="#545454"
                checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
                uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
                width={70}
                height={30}
                handleDiameter={22}
              />
            </div>
            <CSVLink
              data={csvData}
              filename={"user-info-list.csv"}
              className="btn CsvExportBtn"
            >
              <FaDownload className="me-1" />CSV
            </CSVLink>
          </div>
        </Card.Header>
        <Card.Body className="admin-common-card-body">
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Birthday</th>
                  <th>Opted In</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {userInfoList.length > 0 ? (
                  userInfoList.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td className="text-break">{user.email}</td>
                      <td>{user.number}</td>
                      <td>{user.birthday ? new Date(user.birthday).toLocaleDateString() : '-'}</td>
                      <td>{user.optIn ? 'Yes' : 'No'}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No user information found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminUserInfoList;