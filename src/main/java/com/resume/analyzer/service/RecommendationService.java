package com.resume.analyzer.service;

import com.resume.analyzer.model.Job;
import com.resume.analyzer.model.Resume;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class RecommendationService {

    public Map<String, Object> analyzeResume(Resume resume, List<Job> jobs) {
        String resumeText = (
                resume.getSkills() + " " +
                resume.getEducation() + " " +
                resume.getProjects() + " " +
                resume.getCertifications() + " " +
                resume.getExperience()
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
            error.put("error", "Failed to parse PDF");
            return error;
        }

        return generateRecommendations(name, resumeText, jobs);
    }

    private Map<String, Object> generateRecommendations(String candidateName, String resumeText, List<Job> jobs) {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Job job : jobs) {
            String[] requiredSkills = job.getRequiredSkills().toLowerCase().split(",");
            int matched = 0;
            List<String> missingSkills = new ArrayList<>();

            for (String skill : requiredSkills) {
                skill = skill.trim();
                if (resumeText.contains(skill)) {
                    matched++;
                } else {
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

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("candidate", candidateName);
        response.put("recommendations", recommendations);

        return response;
    }
}