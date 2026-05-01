package com.taskboard.domain.task;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private String priority;
    private LocalDate dueDate;
    private String status;
}
