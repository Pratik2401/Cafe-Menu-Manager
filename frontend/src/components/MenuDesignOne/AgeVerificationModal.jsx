import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../../styles/AgeVerificationModal.css'; // Assuming you have some styles
const AgeVerificationModal = ({ show, onConfirm, onDeny }) => {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false} className="global-modal">
      <Modal.Header>
        <Modal.Title>Age Verification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Some categories contain age-restricted items (21+). Are you 21 years of age or older?</p>
      </Modal.Body>
      <Modal.Footer className='AgeVerificationFooter'>
        <Button variant="secondary" onClick={onDeny} className='DenyButton'>
          No
        </Button>
        <Button variant="primary" onClick={onConfirm} className='ConfirmButton'>
          Yes, I am 21+
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AgeVerificationModal;