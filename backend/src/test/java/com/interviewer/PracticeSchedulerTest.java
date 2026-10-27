package com.interviewer;

import com.interviewer.entity.PracticeItem;
import com.interviewer.service.PracticeScheduler;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PracticeSchedulerTest {

    private final LocalDateTime now = LocalDateTime.of(2026, 10, 27, 12, 0);

    private PracticeItem item() {
        return PracticeItem.builder().ease(2.5).intervalDays(0).reps(0).dueAt(now).build();
    }

    @Test
    void firstGoodReviewSchedulesTwoDays() {
        PracticeItem graded = PracticeScheduler.applyGrade(item(), "good", now);

        assertEquals(2, graded.getIntervalDays());
        assertEquals(1, graded.getReps());
        assertEquals(2.5, graded.getEase());
        assertEquals(now.plusDays(2), graded.getDueAt());
    }

    @Test
    void againComesBackInTenMinutesAndLowersEase() {
        PracticeItem graded = PracticeScheduler.applyGrade(item(), "again", now);

        assertEquals(0, graded.getIntervalDays());
        assertEquals(now.plusMinutes(10), graded.getDueAt());
        assertTrue(graded.getEase() < 2.5);
    }

    @Test
    void easeNeverDropsBelowOnePointThree() {
        PracticeItem current = item();
        for (int i = 0; i < 10; i++) {
            current = PracticeScheduler.applyGrade(current, "again", now);
        }
        assertEquals(1.3, current.getEase());
    }

    @Test
    void secondGoodReviewGrowsTheInterval() {
        PracticeItem first = PracticeScheduler.applyGrade(item(), "good", now);
        PracticeItem second = PracticeScheduler.applyGrade(first, "good", now.plusDays(2));

        assertTrue(second.getIntervalDays() >= 4);
        assertEquals(2, second.getReps());
    }
}
