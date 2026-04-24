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
}
