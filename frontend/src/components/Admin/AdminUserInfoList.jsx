import { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { getUserInfoList, getUserInfoSettings, updateUserInfoSettings } from '../../api/admin';

const AdminUserInfoList = () => {
  const [userInfoList, setUserInfoList] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfoList();
    fetchSettings();
  }, []);

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
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Information Submissions</h2>
        <div className="d-flex gap-3">
          <Form.Check
            type="switch"
            id="user-info-toggle"
            label="Enable User Info Collection"
            checked={isEnabled}
            onChange={handleToggleEnable}
          />
          
          <CSVLink
            data={csvData}
            filename={"user-info-list.csv"}
            className="btn btn-success"
          >
            Export to CSV
          </CSVLink>
        </div>
      </div>

     

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Birthday</th>
            <th>Opted In</th>
            <th>Submission Date</th>
          </tr>
        </thead>
        <tbody>
          {userInfoList.length > 0 ? (
            userInfoList.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.email}</td>
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
  );
};

export default AdminUserInfoList;