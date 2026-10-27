package com.interviewer;

import com.interviewer.security.AuthRateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class AuthRateLimitFilterTest {

    @Test
    void blocksAfterLimitAndIgnoresOtherPaths() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(true, 2);

        assertThat(call(filter, "/api/auth/login", "1.2.3.4")).isEqualTo(200);
        assertThat(call(filter, "/api/auth/login", "1.2.3.4")).isEqualTo(200);
        assertThat(call(filter, "/api/auth/login", "1.2.3.4")).isEqualTo(429);

        // A different client has its own window.
        assertThat(call(filter, "/api/auth/login", "5.6.7.8")).isEqualTo(200);
        // Non-auth paths are never limited.
        assertThat(call(filter, "/api/interviews", "1.2.3.4")).isEqualTo(200);
    }

    @Test
    void disabledFilterIsPassThrough() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(false, 1);
        assertThat(call(filter, "/api/auth/login", "9.9.9.9")).isEqualTo(200);
        assertThat(call(filter, "/api/auth/login", "9.9.9.9")).isEqualTo(200);
    }

    private int call(AuthRateLimitFilter filter, String path, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.addHeader("X-Forwarded-For", ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }
}
