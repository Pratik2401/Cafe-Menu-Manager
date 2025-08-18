import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { createUserInfo } from '../../api/customer';
import '../../styles/UserInfoModal.css';

// This constant is now only used as a fallback if localStorage is not available
const DEFAULT_USER_INFO_ENABLED = true;

const UserInfoModal = () => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    birthday: '',
    optIn: false
  });

  useEffect(() => {
    // Check localStorage setting first
    const userInfoEnabled = localStorage.getItem('userInfoEnabled');
    
    
    // If explicitly disabled in localStorage, don't show the modal
    if (userInfoEnabled === 'false') {
      
      return;
    }
    
    // If not set in localStorage, use the default constant
    if (userInfoEnabled === null && !DEFAULT_USER_INFO_ENABLED) {
      
      return;
    }
    
    // Check if the form has been submitted before
    const hasSubmitted = localStorage.getItem('userInfoSubmitted');
    if (hasSubmitted) return;
    
    // Check if modal has been shown in this session
    const modalShownThisSession = sessionStorage.getItem('userInfoModalShown');
    if (modalShownThisSession) return;
    
    // Mark that we've shown the modal in this session
    sessionStorage.setItem('userInfoModalShown', 'true');
    
    // Check if age verification is in progress
    const checkAgeVerification = () => {
      // Get the isAdult value from localStorage
      const isAdult = localStorage.getItem('isAdult');
      
      // If age verification hasn't been completed yet, don't show the user info modal
      if (isAdult === null) {
        // Wait and check again in 1 second
        setTimeout(checkAgeVerification, 1000);
        return;
      }
      
      // Age verification is complete, show the user info modal
      setShow(true);
    };
    
    // Start checking
    checkAgeVerification();
  }, []);

  const handleClose = () => {
    setShow(false);
    // Mark that the modal has been shown in this session
    sessionStorage.setItem('userInfoModalShown', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send data to backend
      await createUserInfo(formData);
      // Store submission status locally
      localStorage.setItem('userInfoSubmitted', 'true');
      handleClose();
    } catch (error) {
      console.error('Error submitting user info:', error);
      // Still close the modal even if API fails since it's not compulsory
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} className="user-info-modal global-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>Guest Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="custom-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="custom-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="custom-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Birthday</Form.Label>
            <Form.Control
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="custom-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="optIn"
              checked={formData.optIn}
              onChange={handleChange}
              label="I agree to receive communications from you"
              className="custom-checkbox"
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={handleClose} className="custom-btn-secondary">
              Skip
            </Button>
            <Button variant="primary" type="submit" className="custom-btn-primary">
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserInfoModal;