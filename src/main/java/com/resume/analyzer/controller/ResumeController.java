package com.resume.analyzer.controller;

import com.resume.analyzer.model.Job;
import com.resume.analyzer.model.Resume;
import com.resume.analyzer.repository.JobRepository;
import com.resume.analyzer.service.RecommendationService;
import com.resume.analyzer.service.ResumeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
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
    public Resume saveResume(@RequestBody Resume resume) {
        return resumeService.saveResume(resume);
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyzeResume(
            @RequestBody Resume resume) {

        List<Job> jobs = jobRepository.findAll();

        return recommendationService.analyzeResume(
                resume,
                jobs
        );
    }

    @PostMapping("/upload")
    public Map<String, Object> uploadResume(
            @RequestParam("name") String name,
            @RequestParam("file") MultipartFile file) {

        List<Job> jobs = jobRepository.findAll();
        return recommendationService.analyzePdfResume(name, file, jobs);
    }
}