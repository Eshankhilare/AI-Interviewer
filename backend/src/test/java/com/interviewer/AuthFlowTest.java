package com.interviewer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Email/phone login and the Google provider contract. */
@SpringBootTest(properties = {
        "app.google.client-id=",
        "app.google.client-secret="
})
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AuthFlowTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String register(String email, String phone) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "Str0ngPassw0rd!x",
                                "fullName", "Auth Test",
                                "phone", phone))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void registersWithPhoneAndSignsInWithIt() throws Exception {
        String id = UUID.randomUUID().toString().substring(0, 8);
        String phone = "+9199" + Math.abs(id.hashCode());
        register("phone-" + id + "@example.com", phone);

        MvcResult login = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", phone,
                                "password", "Str0ngPassw0rd!x"))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(login.getResponse().getContentAsString());
        assertThat(body.get("token").asText()).isNotBlank();
        assertThat(body.get("email").asText()).isEqualTo("phone-" + id + "@example.com");
    }

    @Test
    void rejectsADuplicatePhoneNumber() throws Exception {
        String id = UUID.randomUUID().toString().substring(0, 8);
        String phone = "+9188" + Math.abs(id.hashCode());
        register("first-" + id + "@example.com", phone);

        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "second-" + id + "@example.com",
                                "password", "Str0ngPassw0rd!x",
                                "fullName", "Second",
                                "phone", phone))))
                .andExpect(status().isConflict());
    }

    @Test
    void providersEndpointIsPublicAndReportsGoogle() throws Exception {
        mvc.perform(get("/api/auth/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.google").isBoolean());
    }

    @Test
    void unknownIdentifierReturnsUnauthorized() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "nobody-" + UUID.randomUUID() + "@example.com",
                                "password", "Str0ngPassw0rd!x"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void googleStartWithoutKeysExplainsTheProblem() throws Exception {
        mvc.perform(get("/api/auth/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("google_not_configured")));
    }
}
