// app/java-backend-frontend/src/main/java/com/example/myfullstackapp/MyFullstackAppApplication.java
package com.example.myfullstackapp;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController // This makes this class a REST controller
@RequestMapping("/internal/api") // All endpoints in this controller will start with /internal/api
public class MyFullstackAppApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(MyFullstackAppApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(MyFullstackAppApplication.class);
    }

    // --- API Endpoints ---

    // Public Status Endpoint
    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend is online! (Java API)");
        System.out.println("Java Backend status check received.");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/public-data")
    public ResponseEntity<Map<String, String>> getPublicData() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is public data from the Java backend!");
        System.out.println("Access to public data granted.");
        return ResponseEntity.ok(response);
    }
    // Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // Use your actual test credentials from .env
        String apiUsername = System.getenv("API_USERNAME") != null ? System.getenv("API_USERNAME") : "testuser";
        String apiPassword = System.getenv("API_PASSWORD") != null ? System.getenv("API_PASSWORD") : "testpassword";

        if (apiUsername.equals(username) && apiPassword.equals(password)) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", "fake-jwt-token-for-java-demo"); // Dummy token
            System.out.println("User " + username + " logged in successfully.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid credentials");
            System.out.println("Login attempt failed for username: " + username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // Protected Data Endpoint
    @GetMapping("/data")
    public ResponseEntity<Map<String, String>> getProtectedData(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }

        if ("fake-jwt-token-for-java-demo".equals(token)) { // Verify dummy token
            Map<String, String> response = new HashMap<>();
            response.put("message", "This is protected data from the Java backend!");
            response.put("user", System.getenv("API_USERNAME") != null ? System.getenv("API_USERNAME") : "testuser");
            System.out.println("Access to protected data granted.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Unauthorized: No valid token provided");
            System.out.println("Access to protected data denied: No valid token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // Protected Resource Creation Endpoint (echoes back sent data)
    @PostMapping("/resource")
    public ResponseEntity<Map<String, Object>> createResource(@RequestHeader(name = "Authorization", required = false) String authorizationHeader,
                                                              @RequestBody Map<String, Object> newResourceData) {
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }

        if ("fake-jwt-token-for-java-demo".equals(token)) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Resource created successfully!");
            Map<String, Object> resource = new HashMap<>(newResourceData);
            resource.put("id", "res-" + System.currentTimeMillis()); // Dummy ID
            resource.put("createdBy", System.getenv("API_USERNAME") != null ? System.getenv("API_USERNAME") : "testuser");
            response.put("resource", resource);
            System.out.println("Resource created: " + newResourceData);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Unauthorized: No valid token provided for resource creation");
            System.out.println("Resource creation denied: No valid token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/probe")
    public ResponseEntity<Map<String, Object>> handleProbe(@RequestHeader Map<String, String> headers) {
        System.out.println("Received /probe request.");
        headers.forEach((key, value) -> System.out.println("Header: " + key + " = " + value));

        Map<String, Object> response = new HashMap<>();
        response.put("status", "probe received");
        response.put("timestamp", System.currentTimeMillis());
        response.put("receivedHeaders", headers);
        return ResponseEntity.ok(response);
    }
}