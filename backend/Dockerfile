FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# A fresh Vercel Services deploy has no database or JWT secret configured. The
# local profile starts on in-memory H2 and honours the platform PORT, so the
# service answers immediately. Override SPRING_PROFILES_ACTIVE=production (and
# set SPRING_DATASOURCE_*, JWT_SECRET) in the dashboard for persistent data.
ENV SPRING_PROFILES_ACTIVE=local
# Vercel's container runtime routes to port 80 by default; PORT can override.
ENV PORT=80
EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]
