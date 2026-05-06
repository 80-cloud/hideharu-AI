package com.taskboard.domain.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ReorderRequest {

    @NotEmpty(message = "並び替え対象が空です")
    @Valid
    private List<Item> items;

    @Getter
    @NoArgsConstructor
    public static class Item {
        @NotNull(message = "id は必須です")
        @Min(value = 1, message = "id は 1 以上で指定してください")
        private Integer id;

        @NotNull(message = "ステータスは必須です")
        @Pattern(regexp = "todo|doing|done", message = "ステータスは todo / doing / done のいずれかで指定してください")
        private String status;

        @NotNull(message = "並び順は必須です")
        @PositiveOrZero(message = "並び順は0以上の整数で指定してください")
        private Integer sortOrder;
    }
}
