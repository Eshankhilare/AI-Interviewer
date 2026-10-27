package com.interviewer.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** A question the candidate chose to revisit, with the spacing state. */
@Entity
@Table(name = "practice_items", uniqueConstraints = @UniqueConstraint(
        name = "uk_practice_user_question",
        columnNames = {"user_id", "interview_id", "question_order"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "interview_id", nullable = false)
    private Long interviewId;

    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(length = 40)
    private String questionType;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String expectedAnswer;

    @Column(columnDefinition = "TEXT")
    private String sampleResponse;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(length = 200)
    private String sourceTitle;

    private Double ease;
    private Integer intervalDays;
    private Integer reps;
    private LocalDateTime dueAt;

    @Column(length = 10)
    private String lastGrade;

    private LocalDateTime lastReviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (ease == null) ease = 2.5;
        if (intervalDays == null) intervalDays = 0;
        if (reps == null) reps = 0;
        if (dueAt == null) dueAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
