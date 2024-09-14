import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import CommentForm from "../components/commentForm";

const Place = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/place/${id}`)
            .then((response) => {
                if (response.status === 404) {
                    navigate('/not-found');
                }
                return response.json();
            })
            .then((data) => {
                if (data && Object.keys(data).length === 0) {
                    navigate('/not-found');
                } else {
                    setPlace(data);
                    calculateAverageRating(data.comments);
                }
            })
            .catch((error) => console.error('Error fetching place details:', error));
    }, [id, navigate]);

    const calculateAverageRating = (comments) => {
        if (comments && comments.length > 0) {
            const totalStars = comments.reduce((total, comment) => total + comment.stars, 0);
            const avgRating = Math.round((totalStars / comments.length) * 2) / 2; // Round to nearest 0.5
            setAverageRating(avgRating);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
            } else if (i - 0.5 === rating) {
                stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="text-warning" />);
            } else {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-muted" />);
            }
        }
        return stars;
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        fetch(`http://localhost:5000/api/place/${place._id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    setShowDeleteModal(false);
                    navigate('/places');
                } else {
                    console.error('Failed to delete the place.');
                }
            })
            .catch((error) => console.error('Error deleting place:', error));
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const handleEditClick = () => {
        navigate(`/edit-place/${place._id}`);
    };

    const handleAddCommentClick = () => {
        setShowCommentForm(!showCommentForm);
        if (showCommentForm) {
            // Reset form fields if hiding the form
            resetForm();
        }
    };

    const resetForm = () => {
        // Logic to reset the form fields in the CommentForm component
        setShowCommentForm(false);
    };

    const handleCommentAdded = (newComment) => {
        setPlace((prevPlace) => ({
            ...prevPlace,
            comments: [...prevPlace.comments, newComment],
        }));
        calculateAverageRating([...place.comments, newComment]);
        setShowSuccessModal(true); // Show success modal
        setShowCommentForm(false); // Hide and reset the form
    };

    const handleCommentError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    if (!place) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-4 text-center">
                    <img src={place.pic} className="img-fluid mb-2" alt={place.name} />
                    <p>Located in {place.city}, {place.state}</p>
                </div>

                <div className="col-md-8">
                    <h2 className="mb-4" style={{ color: '#5894F4' }}>{place.name}</h2>
                    <h3 style={{ color: "#AADDEA" }}>Rating</h3>
                    <div className="mb-4">{averageRating === 0 ? "Not Rated" : renderStars(averageRating)}</div>
                    <h3 style={{ color: "#AADDEA" }}>Description</h3>
                    <p className="mb-2" style={{ fontSize: "1.25rem" }}>{place.name} has been
                        serving {place.city}, {place.state} since {place.founded}</p>
                    <p className="mb-5" style={{ fontSize: "1.25rem" }}>Serving {place.cuisines}</p>
                    <button className="btn btn-warning me-2" onClick={handleEditClick}>Edit</button>
                    <button className="btn btn-danger" onClick={handleDeleteClick}>Delete</button>
                </div>
            </div>
            <hr />
            <div className="mt-4">
                <h4 style={{ color: "#AADDEA", display: 'inline-block', marginRight: '10px' }}>Comments</h4>
                <button className="btn btn-info mb-3" onClick={handleAddCommentClick}>
                    {showCommentForm ? 'Hide Comment Form' : 'Add Comment'}
                </button>
                {showCommentForm && (
                    <CommentForm
                        onCommentAdded={handleCommentAdded}
                        onCommentError={handleCommentError}
                        onReset={resetForm}
                    />
                )}
                {place.comments && place.comments.length > 0 ? (
                    place.comments.map((comment) => (
                        <div key={comment._id} className="card mb-2">
                            <div className="card-body">
                                <p><strong>{comment.author}</strong> - {comment.rant ? 'Rant' : 'Rave'}</p>
                                <p>{comment.content}</p>
                                <div>{renderStars(comment.stars)}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No comments available.</p>
                )}
            </div>

            <Modal show={showDeleteModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{place.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Comment added successfully!</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowErrorModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Place;
