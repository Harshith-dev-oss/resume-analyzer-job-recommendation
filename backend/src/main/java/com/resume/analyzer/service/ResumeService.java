package com.resume.analyzer.service;

import com.resume.analyzer.model.Resume;
import com.resume.analyzer.model.ResumeAnalysis;
import com.resume.analyzer.repository.ResumeAnalysisRepository;
import com.resume.analyzer.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;

    public ResumeService(ResumeRepository resumeRepository, ResumeAnalysisRepository resumeAnalysisRepository) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
    }

    public Resume saveResume(Resume resume) {
        return resumeRepository.save(resume);
    }

    public ResumeAnalysis saveAnalysis(ResumeAnalysis analysis) {
        return resumeAnalysisRepository.save(analysis);
    }

    public List<ResumeAnalysis> getAllAnalyses() {
        return resumeAnalysisRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<ResumeAnalysis> getAnalysisById(Long id) {
        return resumeAnalysisRepository.findById(id);
    }

    public boolean deleteAnalysis(Long id) {
        if (resumeAnalysisRepository.existsById(id)) {
            resumeAnalysisRepository.deleteById(id);
            return true;
        }
        return false;
    }
}