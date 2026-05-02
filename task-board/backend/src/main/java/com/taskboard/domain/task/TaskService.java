package com.taskboard.domain.task;

import com.taskboard.exception.TaskNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Task createTask(TaskRequest request) {
        return taskRepository.save(Task.from(request));
    }

    @Transactional
    public Task updateTask(Integer id, TaskRequest request) {
        Task task = getTaskById(id);
        task.update(request);
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Integer id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
