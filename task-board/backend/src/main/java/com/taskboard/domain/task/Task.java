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

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 10)
    private String priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static Task from(TaskRequest request, int defaultSortOrder) {
        Task task = new Task();
        task.title = request.getTitle();
        task.description = request.getDescription();
        task.priority = request.getPriority();
        task.dueDate = request.getDueDate();
        task.status = request.getStatus() != null ? request.getStatus() : "todo";
        task.sortOrder = request.getSortOrder() != null ? request.getSortOrder() : defaultSortOrder;
        task.createdAt = LocalDateTime.now();
        task.updatedAt = LocalDateTime.now();
        return task;
    }

    public void update(TaskRequest request) {
        this.title = request.getTitle();
        this.description = request.getDescription();
        this.priority = request.getPriority();
        this.dueDate = request.getDueDate();
        this.status = request.getStatus() != null ? request.getStatus() : this.status;
        if (request.getSortOrder() != null) {
            this.sortOrder = request.getSortOrder();
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void applyReorder(String newStatus, int newSortOrder) {
        this.status = newStatus;
        this.sortOrder = newSortOrder;
        this.updatedAt = LocalDateTime.now();
    }
}
