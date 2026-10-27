package com.interviewer.service;

import com.interviewer.entity.PracticeItem;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/** Same SM-2-lite schedule as the browser queue, so both stay consistent. */
public final class PracticeScheduler {

    public static final Set<String> GRADES = Set.of("again", "hard", "good", "easy");

    private static final Map<String, Double> EASE_DELTA = Map.of(
            "again", -0.2,
            "hard", -0.05,
            "good", 0.0,
            "easy", 0.15);

    private PracticeScheduler() {
    }

    public static PracticeItem applyGrade(PracticeItem item, String grade, LocalDateTime now) {
        double ease = clamp((item.getEase() == null ? 2.5 : item.getEase()) + EASE_DELTA.get(grade), 1.3, 2.8);
        int reps = (item.getReps() == null ? 0 : item.getReps()) + 1;
        int previousDays = item.getIntervalDays() == null ? 0 : item.getIntervalDays();

        int intervalDays;
        switch (grade) {
            case "again" -> intervalDays = 0;
            case "hard" -> intervalDays = Math.max(1, (int) Math.round(previousDays * 1.2));
            case "easy" -> intervalDays = Math.max(4, (int) Math.round((previousDays == 0 ? 2 : previousDays) * ease * 1.3));
            default -> intervalDays = reps == 1 ? 2 : Math.max(2, (int) Math.round(previousDays * ease));
        }

        LocalDateTime dueAt = "again".equals(grade) ? now.plusMinutes(10) : now.plusDays(intervalDays);

        item.setEase(Math.round(ease * 100.0) / 100.0);
        item.setIntervalDays(intervalDays);
        item.setReps(reps);
        item.setDueAt(dueAt);
        item.setLastGrade(grade);
        item.setLastReviewedAt(now);
        return item;
    }

    private static double clamp(double value, double min, double max) {
        return Math.min(max, Math.max(min, value));
    }
}
