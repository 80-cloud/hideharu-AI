package com.taskboard.domain.task;

import com.taskboard.exception.TaskNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks(String status) {
        if (status != null && !status.isBlank()) {
            return taskRepository.findByStatus(status);
        }
        return taskRepository.findAll();
    }

    public Task getTaskById(Integer id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    public Task createTask(TaskRequest request) {
        return taskRepository.save(Task.from(request));
    }
}
