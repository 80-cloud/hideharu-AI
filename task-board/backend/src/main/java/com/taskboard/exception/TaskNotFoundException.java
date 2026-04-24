package com.taskboard.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Integer id) {
        super("Task not found: id=" + id);
    }
}
