package com.taskboard.domain.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByStatusOrderBySortOrderAsc(String status);

    List<Task> findAllByOrderByStatusAscSortOrderAsc();

    @Query("SELECT COALESCE(MAX(t.sortOrder), -1) FROM Task t WHERE t.status = :status")
    Integer findMaxSortOrderByStatus(String status);
}
