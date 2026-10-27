package com.interviewer.controller;

import com.interviewer.entity.Interview;
import com.interviewer.entity.PracticeItem;
import com.interviewer.entity.User;
import com.interviewer.exception.ResourceNotFoundException;
import com.interviewer.repository.InterviewRepository;
import com.interviewer.repository.PracticeItemRepository;
import com.interviewer.repository.UserRepository;
import com.interviewer.security.CurrentUser;
import com.interviewer.service.PracticeScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Server-side copy of the spaced-repetition queue, so it follows the account. */
@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
public class PracticeController {

    private final PracticeItemRepository practiceRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public List<Map<String, Object>> list() {
        Long userId = currentUser.id();
        return practiceRepository.findByUser_IdOrderByDueAtAsc(userId)
                .stream().map(this::toMap).toList();
    }

    @PutMapping("/{interviewId}/{order}")
    @Transactional
    public Map<String, Object> upsert(
            @PathVariable Long interviewId,
            @PathVariable Integer order,
            @RequestBody Map<String, Object> body) {
        requireOwnedInterview(interviewId);
        Long userId = currentUser.id();
        String question = text(body.get("question"), 5000);
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("question is required");
        }

        PracticeItem item = practiceRepository
                .findByUser_IdAndInterviewIdAndQuestionOrder(userId, interviewId, order)
                .orElseGet(() -> PracticeItem.builder()
                        .user(requireUser(userId))
                        .interviewId(interviewId)
                        .questionOrder(order)
                        .ease(2.5)
                        .intervalDays(0)
                        .reps(0)
                        .dueAt(LocalDateTime.now())
                        .build());

        item.setQuestion(question);
        item.setQuestionType(text(body.get("questionType"), 40));
        item.setScore(intOrNull(body.get("score"), 0, 100));
        item.setExpectedAnswer(text(body.get("expectedAnswer"), 20000));
        item.setSampleResponse(text(body.get("sampleResponse"), 20000));
        item.setFeedback(text(body.get("feedback"), 20000));
        item.setSourceTitle(text(body.get("sourceTitle"), 200));
        return toMap(practiceRepository.save(item));
    }

    @PostMapping("/{interviewId}/{order}/grade")
    @Transactional
    public Map<String, Object> grade(
            @PathVariable Long interviewId,
            @PathVariable Integer order,
            @RequestBody Map<String, Object> body) {
        requireOwnedInterview(interviewId);
        String grade = String.valueOf(body.getOrDefault("grade", "")).toLowerCase();
        if (!PracticeScheduler.GRADES.contains(grade)) {
            throw new IllegalArgumentException("grade must be one of again, hard, good, easy");
        }
        PracticeItem item = practiceRepository
                .findByUser_IdAndInterviewIdAndQuestionOrder(currentUser.id(), interviewId, order)
                .orElseThrow(() -> new ResourceNotFoundException("Practice item not found"));

        return toMap(practiceRepository.save(PracticeScheduler.applyGrade(item, grade, LocalDateTime.now())));
    }

    @DeleteMapping("/{interviewId}/{order}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable Long interviewId, @PathVariable Integer order) {
        practiceRepository.deleteByUser_IdAndInterviewIdAndQuestionOrder(currentUser.id(), interviewId, order);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> clear() {
        practiceRepository.deleteByUser_Id(currentUser.id());
        return ResponseEntity.noContent().build();
    }

    private Interview requireOwnedInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        if (!interview.getCandidate().getId().equals(currentUser.id())) {
            throw new ResourceNotFoundException("Interview not found");
        }
        return interview;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String text(Object value, int max) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return null;
        return text.length() > max ? text.substring(0, max) : text;
    }

    private Integer intOrNull(Object value, int min, int max) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        try {
            int number = Integer.parseInt(String.valueOf(value));
            return Math.min(max, Math.max(min, number));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Map<String, Object> toMap(PracticeItem item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("key", item.getInterviewId() + ":" + item.getQuestionOrder());
        map.put("interviewId", item.getInterviewId());
        map.put("order", item.getQuestionOrder());
        map.put("question", item.getQuestion());
        map.put("questionType", item.getQuestionType());
        map.put("score", item.getScore());
        map.put("expectedAnswer", item.getExpectedAnswer());
        map.put("sampleResponse", item.getSampleResponse());
        map.put("feedback", item.getFeedback());
        map.put("sourceTitle", item.getSourceTitle());
        map.put("ease", item.getEase());
        map.put("intervalDays", item.getIntervalDays());
        map.put("reps", item.getReps());
        map.put("dueAt", item.getDueAt() == null ? null : item.getDueAt().toString());
        map.put("lastGrade", item.getLastGrade());
        map.put("lastReviewedAt", item.getLastReviewedAt() == null ? null : item.getLastReviewedAt().toString());
        map.put("updatedAt", item.getUpdatedAt() == null ? null : item.getUpdatedAt().toString());
        return map;
    }
}
