import React, { useState, useEffect } from 'react';
import { getAllFeedback, deleteFeedback } from '../../api/admin';
import '../../styles/AdminFeedbackManager.css';

export default function AdminFeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await getAllFeedback();
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteFeedback(id);
        setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
        alert('Feedback deleted successfully');
      } catch (error) {
        alert('Error deleting feedback');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Mobile', 'Feedback', 'Rating', 'Date'];
    const csvContent = [
      headers.join(','),
      ...feedbacks.map(feedback => [
        `"${feedback.name || ''}"`,
        `"${feedback.mobile || ''}"`,
        `"${feedback.feedback.replace(/"/g, '""')}"`,
        feedback.rating,
        `"${new Date(feedback.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div className="loading">Loading feedbacks...</div>;

  return (
    <div className="admin-feedback-manager">
      <div className="feedback-header">
        <h2>Customer Feedback Management</h2>
        <button onClick={exportToCSV} className="export-btn">
          Export to CSV
        </button>
      </div>
      
      <div className="feedback-stats">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{feedbacks.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0}</p>
        </div>
      </div>

      <div className="feedback-list">
        {feedbacks.length === 0 ? (
          <p className="no-feedback">No feedback available</p>
        ) : (
          feedbacks.map(feedback => (
            <div key={feedback._id} className="feedback-card">
              <div className="feedback-header-info">
                <div className="customer-info">
                  <strong>{feedback.name}</strong>
                  <span className="mobile">{feedback.mobile}</span>
                </div>
                <div className="feedback-meta">
                  <span className="rating">{renderStars(feedback.rating)}</span>
                  <span className="date">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="feedback-content">
                <p>{feedback.feedback}</p>
              </div>
              <div className="feedback-actions">
                <button 
                  onClick={() => handleDelete(feedback._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}