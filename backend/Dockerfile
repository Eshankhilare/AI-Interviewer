FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Vercel's container runtime routes to port 80 by default; PORT can override.
ENV PORT=80
EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]
