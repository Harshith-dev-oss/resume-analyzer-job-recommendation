package com.resume.analyzer.controller;

import com.resume.analyzer.model.Job;
import com.resume.analyzer.model.Resume;
import com.resume.analyzer.model.ResumeAnalysis;
import com.resume.analyzer.repository.JobRepository;
import com.resume.analyzer.service.RecommendationService;
import com.resume.analyzer.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping({"/api/resume", "/api/resumes"})
@CrossOrigin
public class ResumeController {

    private final ResumeService resumeService;
    private final RecommendationService recommendationService;
    private final JobRepository jobRepository;

    public ResumeController(
            ResumeService resumeService,
            RecommendationService recommendationService,
            JobRepository jobRepository) {

        this.resumeService = resumeService;
        this.recommendationService = recommendationService;
        this.jobRepository = jobRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveAnalysisRecord(@RequestBody ResumeAnalysis analysis) {
        try {
            ResumeAnalysis saved = resumeService.saveAnalysis(analysis);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to save analysis record: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<ResumeAnalysis> getAllAnalyses() {
        return resumeService.getAllAnalyses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalysisById(@PathVariable Long id) {
        return resumeService.getAnalysisById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Analysis record with ID " + id + " not found.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id) {
        boolean deleted = resumeService.deleteAnalysis(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Analysis record " + id + " deleted successfully."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Analysis record with ID " + id + " not found."));
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeResume(@RequestBody Resume resume) {
        List<Job> jobs = jobRepository.findAll();
        Map<String, Object> analysisResult = recommendationService.analyzeResume(resume, jobs);
        persistAnalysisRecord(resume.getName(), analysisResult);
        return ResponseEntity.ok(analysisResult);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("name") String name,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty. Please upload a valid PDF."));
        }
        if (!Objects.requireNonNullElse(file.getContentType(), "").equalsIgnoreCase("application/pdf")
                && !Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file type. Please upload a PDF resume."));
        }

        List<Job> jobs = jobRepository.findAll();
        Map<String, Object> analysisResult = recommendationService.analyzePdfResume(name, file, jobs);

        if (analysisResult.containsKey("error")) {
            return ResponseEntity.badRequest().body(analysisResult);
        }

        persistAnalysisRecord(name, analysisResult);
        return ResponseEntity.ok(analysisResult);
    }

    private void persistAnalysisRecord(String name, Map<String, Object> analysisResult) {
        try {
            ResumeAnalysis analysis = new ResumeAnalysis();
            analysis.setCandidateName(name != null && !name.isBlank() ? name : "Anonymous");

            if (analysisResult.containsKey("email")) {
                analysis.setEmail((String) analysisResult.get("email"));
            }

            if (analysisResult.containsKey("extractedSkills")) {
                Object skillsObj = analysisResult.get("extractedSkills");
                if (skillsObj instanceof List<?> skillsList) {
                    analysis.setExtractedSkills(String.join(", ", skillsList.stream().map(Object::toString).toList()));
                }
            }

            Object recsObj = analysisResult.get("recommendations");
            if (recsObj instanceof List<?> recsList && !recsList.isEmpty()) {
                Object first = recsList.get(0);
                if (first instanceof Map<?, ?> topMatch) {
                    analysis.setTopJobTitle(Objects.toString(topMatch.get("jobTitle"), "N/A"));
                    Object score = topMatch.get("matchScore");
                    if (score instanceof Number number) {
                        analysis.setTopMatchScore(number.intValue());
                    }
                    Object missing = topMatch.get("missingSkills");
                    if (missing instanceof List<?> missingList) {
                        analysis.setMissingSkills(String.join(", ", missingList.stream().map(Object::toString).toList()));
                    }
                }
                analysis.setRecommendationsSummary(formatRecommendationsSummary(recsList));
            }

            ResumeAnalysis saved = resumeService.saveAnalysis(analysis);
            analysisResult.put("analysisId", saved.getId());
            analysisResult.put("savedAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : "");
            analysisResult.put("status", "SAVED_TO_DATABASE");
        } catch (Exception e) {
            e.printStackTrace();
            analysisResult.put("databaseWarning", "Analysis completed but failed to save to database: " + e.getMessage());
        }
    }

    private String formatRecommendationsSummary(List<?> recsList) {
        StringBuilder sb = new StringBuilder();
        for (Object item : recsList) {
            if (item instanceof Map<?, ?> m) {
                if (sb.length() > 0) sb.append(" | ");
                sb.append(m.get("jobTitle")).append(": ").append(m.get("matchScore")).append("%");
            }
        }
        return sb.toString();
    }
}