package com.taskboard.domain.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<Task> getAllTasks(@RequestParam(required = false) String status) {
        return taskService.getAllTasks(status);
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable @Min(1) Integer id) {
        return taskService.getTaskById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(@Valid @RequestBody TaskRequest request) {
        return taskService.createTask(request);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable @Min(1) Integer id, @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }

    @PutMapping("/reorder")
    public List<Task> reorderTasks(@Valid @RequestBody ReorderRequest request) {
        return taskService.reorder(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable @Min(1) Integer id) {
        taskService.deleteTask(id);
    }
}
