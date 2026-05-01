package com.taskboard.domain.task;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@NoArgsConstructor
@ToString
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Task from(TaskRequest request) {
        Task task = new Task();
        task.title = request.getTitle();
        task.description = request.getDescription();
        task.priority = request.getPriority();
        task.dueDate = request.getDueDate();
        task.status = request.getStatus() != null ? request.getStatus() : "todo";
        task.createdAt = LocalDateTime.now();
        task.updatedAt = LocalDateTime.now();
        return task;
    }
}
