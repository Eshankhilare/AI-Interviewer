package com.interviewer.exception;

/** Maps to HTTP 404. Used for missing resources and for resources owned by another user. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
