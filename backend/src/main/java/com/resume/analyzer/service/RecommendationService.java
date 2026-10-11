package com.resume.analyzer.service;

import com.resume.analyzer.model.Job;
import com.resume.analyzer.model.Resume;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RecommendationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    public Map<String, Object> analyzeResume(Resume resume, List<Job> jobs) {
        String resumeText = (
                (resume.getSkills() != null ? resume.getSkills() : "") + " " +
                (resume.getEducation() != null ? resume.getEducation() : "") + " " +
                (resume.getProjects() != null ? resume.getProjects() : "") + " " +
                (resume.getCertifications() != null ? resume.getCertifications() : "") + " " +
                (resume.getExperience() != null ? resume.getExperience() : "")
        ).toLowerCase();

        return generateRecommendations(resume.getName(), resumeText, jobs);
    }

    public Map<String, Object> analyzePdfResume(String name, MultipartFile file, List<Job> jobs) {
        String resumeText = "";
        try {
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            resumeText = stripper.getText(document).toLowerCase();
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to parse PDF: " + e.getMessage());
            return error;
        }

        return generateRecommendations(name, resumeText, jobs);
    }

    private Map<String, Object> generateRecommendations(String candidateName, String resumeText, List<Job> jobs) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        Set<String> extractedSkills = new LinkedHashSet<>();

        for (Job job : jobs) {
            if (job.getRequiredSkills() == null || job.getRequiredSkills().isBlank()) {
                continue;
            }
            String[] requiredSkills = job.getRequiredSkills().toLowerCase().split(",");
            int matched = 0;
            List<String> missingSkills = new ArrayList<>();

            for (String skill : requiredSkills) {
                skill = skill.trim();
                if (!skill.isEmpty() && resumeText.contains(skill)) {
                    matched++;
                    extractedSkills.add(skill);
                } else if (!skill.isEmpty()) {
                    missingSkills.add(skill);
                }
            }

            int total = requiredSkills.length;
            int score = total == 0 ? 0 : (matched * 100) / total;

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("jobTitle", job.getTitle());
            result.put("matchScore", score);
            result.put("missingSkills", missingSkills);

            recommendations.add(result);
        }

        recommendations.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));

        String extractedEmail = "";
        Matcher emailMatcher = EMAIL_PATTERN.matcher(resumeText);
        if (emailMatcher.find()) {
            extractedEmail = emailMatcher.group();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("candidate", candidateName);
        response.put("email", extractedEmail);
        response.put("extractedSkills", new ArrayList<>(extractedSkills));
        response.put("recommendations", recommendations);

        return response;
    }
}