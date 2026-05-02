package com.taskboard.domain.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class TaskRequest {
    @NotBlank(message = "タイトルは必須です")
    @Size(max = 100, message = "タイトルは100文字以内で入力してください")
    private String title;

    @Size(max = 500, message = "説明文は500文字以内で入力してください")
    private String description;

    @NotNull(message = "優先度は必須です")
    @Pattern(regexp = "high|medium|low", message = "優先度は high / medium / low のいずれかで指定してください")
    private String priority;

    private LocalDate dueDate;

    // null の場合は Task.from() で "todo" がデフォルト設定される
    @Pattern(regexp = "todo|doing|done", message = "ステータスは todo / doing / done のいずれかで指定してください")
    private String status;
}
