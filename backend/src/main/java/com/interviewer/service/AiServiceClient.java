package com.interviewer.service;

import com.interviewer.entity.Interview;
import com.interviewer.entity.InterviewSession;
import com.interviewer.entity.Evaluation;
import com.interviewer.entity.JobDescription;
import com.interviewer.entity.Question;
import com.interviewer.entity.Resume;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.*;

@Service
public class AiServiceClient {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.service.token:}")
    private String aiServiceToken;

    private final RestTemplate restTemplate;
    private final RestTemplate healthRestTemplate;

    public AiServiceClient(@Value("${ai.service.timeout-ms:30000}") int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new ServiceMeshRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(timeoutMs);
        this.restTemplate = new RestTemplate(factory);

        SimpleClientHttpRequestFactory fastFactory = new ServiceMeshRequestFactory();
        fastFactory.setConnectTimeout(3000);
        fastFactory.setReadTimeout(8000);
        this.healthRestTemplate = new RestTemplate(fastFactory);
    }

    private volatile String healthError;

    public boolean isHealthy() {
        try {
            boolean healthy = healthRestTemplate.getForEntity(aiServiceUrl + "/health", String.class)
                    .getStatusCode().is2xxSuccessful();
            healthError = healthy ? null : "AI service answered without a 2xx status";
            return healthy;
        } catch (Exception e) {
            healthError = e.getClass().getSimpleName() + ": " + e.getMessage();
            return false;
        }
    }

    /** Last health-check failure, so /api/health can say why the AI service is down. */
    public String healthError() {
        String error = healthError;
        if (error == null) {
            return null;
        }
        return error.length() > 300 ? error.substring(0, 300) : error;
    }

    private HttpEntity<Map<String, Object>> entity(Map<String, Object> request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (aiServiceToken != null && !aiServiceToken.isBlank()) {
            headers.set("X-AI-Service-Token", aiServiceToken);
        }
        return new HttpEntity<>(request, headers);
    }

    private Map<String, Object> post(String path, Map<String, Object> request) {
        ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceUrl + path, HttpMethod.POST, entity(request), Map.class);
        return response.getBody();
    }

    public List<Question> generateQuestions(JobDescription jd, Resume resume, int count) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("job_description", jd.getDescription());
            request.put("resume_text", resume != null ? resume.getExtractedText() : "");
            request.put("count", count);
            request.put("experience_level", jd.getExperienceLevel().name());

            ResponseEntity<List> response = restTemplate.exchange(
                    aiServiceUrl + "/ai/generate-questions",
                    HttpMethod.POST,
                    entity(request),
                    List.class
            );

            if (response.getBody() != null) {
                List<Question> questions = new ArrayList<>();
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Map<String, Object> map = (Map<String, Object>) item;
                        Question question = Question.builder()
                                .text((String) map.get("text"))
                                .type(Question.Type.valueOf((String) map.getOrDefault("type", "TECHNICAL")))
                                .difficulty(Question.Difficulty.valueOf((String) map.getOrDefault("difficulty", "MEDIUM")))
                                .expectedAnswer((String) map.get("expected_answer"))
                                .build();
                        questions.add(question);
                    }
                }
                return questions;
            }
        } catch (Exception e) {
            // AI generation is best-effort; the caller falls back to the question bank.
        }
        return Collections.emptyList();
    }

    public String generateFollowUp(String question, String answer) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("question", question);
            request.put("answer", answer);

            Map<String, Object> body = post("/ai/generate-followup", request);
            if (body != null) {
                return (String) body.get("follow_up");
            }
        } catch (Exception e) {
            // No follow-up if the AI service is unavailable.
        }
        return null;
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String expectedAnswer) {
        return evaluateAnswer(question, answer, expectedAnswer, null, null, null);
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String expectedAnswer,
                                              String questionType, String difficulty, String jobContext) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("question", question);
            request.put("answer", answer);
            request.put("expected_answer", expectedAnswer);
            request.put("question_type", questionType);
            request.put("difficulty", difficulty);
            request.put("job_context", jobContext);

            return post("/ai/evaluate-answer", request);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> generateReport(Interview interview) {
        try {
            List<InterviewSession> sessions = interview.getSessions();
            List<Map<String, Object>> evaluations = new ArrayList<>();
            int totalScore = 0;
            int count = 0;

            for (InterviewSession session : sessions) {
                if (session.getEvaluation() != null) {
                    Evaluation eval = session.getEvaluation();
                    Map<String, Object> evalMap = new HashMap<>();
                    evalMap.put("question", session.getQuestion().getText());
                    evalMap.put("answer", session.getCandidateAnswer());
                    evalMap.put("expected_answer", session.getQuestion().getExpectedAnswer() != null ? session.getQuestion().getExpectedAnswer() : "");
                    evalMap.put("score", eval.getScore());
                    evalMap.put("grade", eval.getGrade());
                    evalMap.put("feedback", eval.getFeedback());
                    evalMap.put("sample_response", eval.getSampleResponse() != null ? eval.getSampleResponse() : "");
                    evalMap.put("strengths", eval.getStrengths());
                    evalMap.put("weaknesses", eval.getWeaknesses());
                    evaluations.add(evalMap);
                    totalScore += eval.getScore();
                    count++;
                }
            }

            Map<String, Object> request = new HashMap<>();
            request.put("interview_id", interview.getId());
            request.put("evaluations", evaluations);
            request.put("average_score", count > 0 ? totalScore / count : 0);
            request.put("total_questions", sessions.size());
            request.put("answered_questions", count);
            request.put("job_description", interview.getJobDescription() != null ? interview.getJobDescription().getTitle() : "");

            return post("/ai/generate-report", request);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> parseResume(String resumeText) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("resume_text", resumeText);
            return post("/ai/parse-resume", request);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    /** Rewrites the candidate's own facts into a resume draft; never invents facts. */
    public Map<String, Object> generateResume(Map<String, Object> resumeDraft) {
        try {
            return post("/ai/generate-resume", resumeDraft);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public Map<String, Object> analyzeJobDescription(String jdText) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("job_description", jdText);
            return post("/ai/analyze-jd", request);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    /**
     * Vercel serves bound services over TLS with a private CA that its Node/Python
     * runtimes get injected but a JRE truststore does not. Exempt only the internal
     * mesh host: public calls (Judge0) keep normal certificate validation.
     */
    private static final class ServiceMeshRequestFactory extends SimpleClientHttpRequestFactory {

        private static final String MESH_SUFFIX = ".services.vercel-infra.com";
        private static final SSLSocketFactory MESH_SOCKETS = trustServiceMesh();

        @Override
        protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws IOException {
            super.prepareConnection(connection, httpMethod);
            if (connection instanceof HttpsURLConnection https
                    && https.getURL().getHost().endsWith(MESH_SUFFIX)) {
                https.setSSLSocketFactory(MESH_SOCKETS);
                https.setHostnameVerifier((host, session) -> true);
            }
        }

        private static SSLSocketFactory trustServiceMesh() {
            try {
                TrustManager[] trustMesh = {new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }
                }};
                SSLContext context = SSLContext.getInstance("TLS");
                context.init(null, trustMesh, new SecureRandom());
                return context.getSocketFactory();
            } catch (Exception e) {
                throw new IllegalStateException("Cannot build the service mesh TLS context", e);
            }
        }
    }
}
