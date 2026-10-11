package com.resume.analyzer.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String candidateName;

    private String email;

    @Column(length = 2000)
    private String extractedSkills;

    private String topJobTitle;

    private Integer topMatchScore;

    @Column(length = 2000)
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String recommendationsSummary;

    private LocalDateTime createdAt;

    public ResumeAnalysis() {
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public String getTopJobTitle() {
        return topJobTitle;
    }

    public void setTopJobTitle(String topJobTitle) {
        this.topJobTitle = topJobTitle;
    }

    public Integer getTopMatchScore() {
        return topMatchScore;
    }

    public void setTopMatchScore(Integer topMatchScore) {
        this.topMatchScore = topMatchScore;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getRecommendationsSummary() {
        return recommendationsSummary;
    }

    public void setRecommendationsSummary(String recommendationsSummary) {
        this.recommendationsSummary = recommendationsSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
