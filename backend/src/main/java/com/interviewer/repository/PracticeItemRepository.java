package com.interviewer.repository;

import com.interviewer.entity.PracticeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PracticeItemRepository extends JpaRepository<PracticeItem, Long> {

    List<PracticeItem> findByUser_IdOrderByDueAtAsc(Long userId);

    Optional<PracticeItem> findByUser_IdAndInterviewIdAndQuestionOrder(
            Long userId, Long interviewId, Integer questionOrder);

    void deleteByUser_IdAndInterviewIdAndQuestionOrder(
            Long userId, Long interviewId, Integer questionOrder);

    void deleteByUser_Id(Long userId);
}
