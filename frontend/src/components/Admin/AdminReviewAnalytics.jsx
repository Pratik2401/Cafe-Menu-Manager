
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Button, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaChartBar, FaUsers, FaThumbsUp, FaDownload } from 'react-icons/fa';
import { getAllFeedback } from '../../api/admin';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminCommon.css';
import '../../styles/ReviewAnalytics.css';

const ReviewAnalytics = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentReviews: []
  });

  useEffect(() => {
    updateBreadcrumb([
      { label: 'Review Analytics' }
    ]);
    
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const response = await getAllFeedback();
        // console.log('Full API Response:', response);
        
        // Handle both possible response structures
        const feedbackData = response.data?.data || response.data || [];
        // console.log('Processed feedback data:', feedbackData);
        
        setReviews(feedbackData);
        
        const totalReviews = feedbackData.length;
        const averageRating = totalReviews > 0 
          ? feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) / totalReviews 
          : 0;
        const ratingDistribution = feedbackData.reduce((acc, feedback) => {
          acc[feedback.rating]++;
          return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        setAnalytics({
          totalReviews,
          averageRating: averageRating.toFixed(1),
          ratingDistribution,
          recentReviews: feedbackData.slice(0, 3)
        });
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load review analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [updateBreadcrumb]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-warning" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaRegStar key={i} className="text-muted" />);
    }
    return stars;
  };

  const getRatingPercentage = (rating) => {
    return analytics.totalReviews > 0 ? (analytics.ratingDistribution[rating] / analytics.totalReviews) * 100 : 0;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Mobile', 'Feedback', 'Rating', 'Date'];
    const csvContent = [
      headers.join(','),
      ...reviews.map(feedback => [
        `"${feedback.name || 'N/A'}"`,
        `"${feedback.mobile || 'N/A'}"`,
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

      <Card className="admin-common-card">
        <Card.Header className="admin-common-card-header">
          <h3 className="admin-common-section-title">
            <FaChartBar className="me-2" />
            Review Analytics
          </h3>
          <Button 
            className="btn CsvExportBtn"
            onClick={exportToCSV}
            disabled={reviews.length === 0}
          >
            <FaDownload className="me-1" /> Export CSV
          </Button>
        </Card.Header>
        <Card.Body className="admin-common-card-body">
          {/* Summary Cards */}
          <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="analytics-card h-100">
            <Card.Body className="text-center py-4">
              <FaUsers className="analytics-icon mb-3" />
              <h3 className="brand-primary mb-2">{analytics.totalReviews}</h3>
              <p className="text-muted mb-0">Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="analytics-card h-100">
            <Card.Body className="text-center py-4">
              <div className="mb-3">{renderStars(analytics.averageRating)}</div>
              <h3 className="brand-primary mb-2">{analytics.averageRating}</h3>
              <p className="text-muted mb-0">Average Rating</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="analytics-card h-100">
            <Card.Body className="text-center py-4">
              <FaThumbsUp className="analytics-icon mb-3" />
              <h3 className="brand-primary mb-2">{Math.round(getRatingPercentage(5) + getRatingPercentage(4))}%</h3>
              <p className="text-muted mb-0">Positive Reviews</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Rating Distribution */}
        <Col lg={6} className="mb-4">
          <Card className="analytics-card h-100">
            <Card.Header>
              <h5 className="mb-0">Rating Distribution</h5>
            </Card.Header>
            <Card.Body>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <div className="rating-stars-container" style={{ width: '80px' }}>
                      {Array(rating).fill().map((_, i) => (
                        <FaStar key={i} className="text-warning" size={14} />
                      ))}
                    </div>
                    <div className="progress flex-grow-1 mx-2">
                      <div 
                        className="progress-bar brand-bg" 
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center" style={{ width: '80px' }}>
                      <span className="rating-count">{analytics.ratingDistribution[rating]}</span>
                      <span className="rating-percent">({Math.round(getRatingPercentage(rating))}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Reviews Section */}
      <Row>
        <Col lg={12}>
          <Card className="analytics-card">
            <Card.Header>
              <h5 className="mb-0">All Customer Reviews</h5>
            </Card.Header>
            <Card.Body>
              <div className="reviews-list" style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px' }}>
                {reviews.map(feedback => (
                  <div key={feedback._id} className="review-item mb-4 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <strong className="brand-primary">{feedback.name || 'Anonymous'}</strong>
                        <div className="text-muted small mt-1">{feedback.mobile || 'No mobile provided'}</div>
                      </div>
                      <div className="text-end">
                        <div className="mb-2">{renderStars(feedback.rating)}</div>
                        <small className="text-muted">{new Date(feedback.createdAt).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</small>
                      </div>
                    </div>
                    <p className="review-comment mb-0" style={{ lineHeight: '1.5' }}>{feedback.feedback}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <p>No reviews available yet.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReviewAnalytics;