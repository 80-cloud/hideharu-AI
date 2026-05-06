package com.taskboard.domain.task;

import com.taskboard.exception.TaskNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks(String status) {
        if (status != null && !status.isBlank()) {
            return taskRepository.findByStatusOrderBySortOrderAsc(status);
        }
        return taskRepository.findAllByOrderByStatusAscSortOrderAsc();
    }

    public Task getTaskById(Integer id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @Transactional
    public Task createTask(TaskRequest request) {
        String status = request.getStatus() != null ? request.getStatus() : "todo";
        int defaultSortOrder = taskRepository.findMaxSortOrderByStatus(status) + 1;
        return taskRepository.save(Task.from(request, defaultSortOrder));
    }

    @Transactional
    public Task updateTask(Integer id, TaskRequest request) {
        Task task = getTaskById(id);
        String previousStatus = task.getStatus();
        task.update(request);
        // ステータスが変わったが sortOrder が指定されていない場合は移動先カラムの末尾に配置する
        if (request.getSortOrder() == null
                && request.getStatus() != null
                && !request.getStatus().equals(previousStatus)) {
            int tail = taskRepository.findMaxSortOrderByStatus(request.getStatus()) + 1;
            task.applyReorder(request.getStatus(), tail);
        }
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Integer id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    @Transactional
    public List<Task> reorder(ReorderRequest request) {
        List<Integer> ids = request.getItems().stream()
                .map(ReorderRequest.Item::getId)
                .toList();

        Map<Integer, Task> tasksById = taskRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Task::getId, Function.identity()));

        for (ReorderRequest.Item item : request.getItems()) {
            Task task = tasksById.get(item.getId());
            if (task == null) {
                throw new TaskNotFoundException(item.getId());
            }
            task.applyReorder(item.getStatus(), item.getSortOrder());
        }

        taskRepository.saveAll(tasksById.values());
        return taskRepository.findAllByOrderByStatusAscSortOrderAsc();
    }
}
