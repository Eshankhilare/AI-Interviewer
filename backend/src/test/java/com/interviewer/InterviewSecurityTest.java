package com.interviewer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewer.entity.Interview;
import com.interviewer.entity.JobDescription;
import com.interviewer.entity.Question;
import com.interviewer.entity.Resume;
import com.interviewer.service.AiServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Phase 1 regression tests: ownership, state machine, idempotency and answer-key visibility.
 * A local fake replaces the AI HTTP client so the tests are deterministic and offline.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Import(InterviewSecurityTest.FakeAiConfig.class)
class InterviewSecurityTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class FakeAiConfig {
        @Bean
        @Primary
        AiServiceClient fakeAiServiceClient() {
            return new FakeAiServiceClient();
        }
    }

    static class FakeAiServiceClient extends AiServiceClient {
        FakeAiServiceClient() {
            super(2000);
        }

        @Override
        public List<Question> generateQuestions(JobDescription jd, Resume resume, int count) {
            return List.of();
        }

        @Override
        public String generateFollowUp(String question, String answer) {
            return "Can you go deeper?";
        }

        @Override
        public Map<String, Object> evaluateAnswer(String question, String answer, String expectedAnswer,
                                                  String questionType, String difficulty, String jobContext) {
            return Map.of(
                    "score", 80,
                    "grade", "A",
                    "feedback", "Clear and correct.",
                    "strengths", "Explains trade-offs",
                    "weaknesses", "Could add an example",
                    "sample_response", "A stronger answer...");
        }

        @Override
        public Map<String, Object> generateReport(Interview interview) {
            return Map.of();
        }

        @Override
        public Map<String, Object> parseResume(String resumeText) {
            return Map.of("skills", "Java");
        }

        @Override
        public boolean isHealthy() {
            return true;
        }
    }

    @Test
    void otherUserCannotReadOrMutateInterview() throws Exception {
        String owner = register("owner");
        String stranger = register("stranger");
        long jdId = createJobDescription(owner);
        JsonNode interview = startInterview(owner, jdId, 3);
        long interviewId = interview.get("id").asLong();
        long sessionId = interview.get("sessions").get(0).get("id").asLong();

        mvc.perform(get("/api/interviews/{id}", interviewId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/interviews/{id}/begin", interviewId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/interviews/{id}/next-question", interviewId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(stranger))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "trying to answer"))))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/interviews/{id}/end", interviewId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/reports/{id}", interviewId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());

        // The owner still has access.
        mvc.perform(get("/api/interviews/{id}", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(interviewId));
    }

    @Test
    void otherUserCannotReadOrDeleteResumeAndJobDescription() throws Exception {
        String owner = register("resume-owner");
        String stranger = register("resume-stranger");
        long jdId = createJobDescription(owner);

        MvcResult parsed = mvc.perform(post("/api/resumes/parse-text")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("text", "Java developer with Spring Boot experience"))))
                .andExpect(status().isOk())
                .andReturn();
        long resumeId = read(parsed).get("id").asLong();

        mvc.perform(get("/api/resumes/{id}", resumeId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/resumes/{id}", resumeId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/job-descriptions/{id}", jdId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/job-descriptions/{id}", jdId).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/resumes/{id}", resumeId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.extractedText").value("Java developer with Spring Boot experience"));
    }

    @Test
    void answerKeyIsHiddenUntilInterviewCompletes() throws Exception {
        String owner = register("answer-key");
        long jdId = createJobDescription(owner);
        long interviewId = startInterview(owner, jdId, 1).get("id").asLong();

        mvc.perform(post("/api/interviews/{id}/begin", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/interviews/{id}", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].expectedAnswer").doesNotExist());

        long sessionId = nextQuestion(owner, interviewId).get("id").asLong();
        mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "A complete answer with detail."))))
                .andExpect(status().isOk());
        mvc.perform(post("/api/interviews/{id}/end", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/interviews/{id}", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].expectedAnswer").exists());
    }

    @Test
    void doubleSubmitDoesNotAdvanceOrEvaluateTwice() throws Exception {
        String owner = register("double-submit");
        long jdId = createJobDescription(owner);
        long interviewId = startInterview(owner, jdId, 2).get("id").asLong();
        mvc.perform(post("/api/interviews/{id}/begin", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        long sessionId = nextQuestion(owner, interviewId).get("id").asLong();
        String answer = json(Map.of("sessionId", sessionId, "answer", "First answer with enough detail."));

        MvcResult first = mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answer))
                .andExpect(status().isOk())
                .andReturn();
        long firstEvaluationId = read(first).get("evaluation").get("id").asLong();

        MvcResult second = mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "A different second answer."))))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(read(second).get("evaluation").get("id").asLong()).isEqualTo(firstEvaluationId);

        mvc.perform(get("/api/interviews/{id}", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentQuestionIndex").value(1));
    }

    @Test
    void rejectsInvalidStateTransitions() throws Exception {
        String owner = register("state-machine");
        long jdId = createJobDescription(owner);
        JsonNode interview = startInterview(owner, jdId, 2);
        long interviewId = interview.get("id").asLong();
        long sessionId = interview.get("sessions").get(0).get("id").asLong();

        // Answer before begin.
        mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "Too early."))))
                .andExpect(status().isConflict());

        // End before begin.
        mvc.perform(post("/api/interviews/{id}/end", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isConflict());

        // Begin is idempotent.
        mvc.perform(post("/api/interviews/{id}/begin", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
        mvc.perform(post("/api/interviews/{id}/begin", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "A proper answer."))))
                .andExpect(status().isOk());
        mvc.perform(post("/api/interviews/{id}/end", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        // Nothing is accepted after completion.
        mvc.perform(post("/api/interviews/{id}/answer", interviewId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("sessionId", sessionId, "answer", "Late answer."))))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/interviews/{id}/next-question", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/reports/{id}", interviewId).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsMissingOrMalformedToken() throws Exception {
        mvc.perform(get("/api/interviews"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/interviews").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    private String register(String prefix) throws Exception {
        String email = prefix + "-" + UUID.randomUUID() + "@test.local";
        MvcResult result = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "email", email,
                                "password", "password123",
                                "fullName", "Test User"))))
                .andExpect(status().isOk())
                .andReturn();
        return read(result).get("token").asText();
    }

    private long createJobDescription(String token) throws Exception {
        MvcResult result = mvc.perform(post("/api/job-descriptions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "title", "Backend Developer",
                                "company", "Test Co",
                                "description", "Java Spring Boot backend role",
                                "experienceLevel", "MID"))))
                .andExpect(status().isOk())
                .andReturn();
        return read(result).get("id").asLong();
    }

    private JsonNode startInterview(String token, long jdId, int questions) throws Exception {
        MvcResult result = mvc.perform(post("/api/interviews/start")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "jobDescriptionId", jdId,
                                "title", "Test interview",
                                "mode", "TEXT",
                                "totalQuestions", questions,
                                "durationMinutes", 30))))
                .andExpect(status().isOk())
                .andReturn();
        return read(result);
    }

    private JsonNode nextQuestion(String token, long interviewId) throws Exception {
        MvcResult result = mvc.perform(get("/api/interviews/{id}/next-question", interviewId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return read(result);
    }

    private JsonNode read(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
