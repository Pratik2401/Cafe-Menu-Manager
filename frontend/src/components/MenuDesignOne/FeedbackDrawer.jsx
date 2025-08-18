import React, { useState } from 'react';
import '../../styles/FeedbackDrawer.css';
import { BiArrowToTop, BiArrowFromTop } from "react-icons/bi";
import { createFeedback } from '../../api/customer';
import Swal from 'sweetalert2';

export default function FeedbackDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in your name and mobile number',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    if (rating === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Rating Required',
        text: 'Please select a rating to continue',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    try {
      await createFeedback({ name, mobile, feedback, rating });
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback has been submitted successfully. We appreciate your time!',
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true
      });
      setName('');
      setMobile('');
      setRating(0);
      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Unable to submit your feedback. Please try again.',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  return (
    <div className={`feedback-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-handle" onClick={() => setIsOpen(!isOpen)}>
        <span className="drawer-arrow">{isOpen ? <BiArrowFromTop/> : <BiArrowToTop/>}</span>
        <span className="drawer-title">
          {isOpen ? '' : 'Give your Feedback and Rating'}
        </span>
      </div>
      <div className="drawer-content">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="feedback-input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="tel"
            className="feedback-input"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <textarea
            className="feedback-input"
            placeholder="Share your thoughts and help us improve..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="1"
            aria-label="Feedback input"
          />
          <div className="drawer-bottom">
            <div className="rating-section">
              <div className="rating-label">Rating</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${rating >= star ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setRating(star);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!name || !mobile || rating === 0}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}