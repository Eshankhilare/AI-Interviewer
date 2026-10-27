package com.interviewer.exception;

/** Maps to HTTP 409: the request is valid but the resource is in the wrong state. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
