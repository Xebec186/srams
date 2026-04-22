package com.srams.exception;

public record ErrorResponse<T>(int status, String message, T data) {}
