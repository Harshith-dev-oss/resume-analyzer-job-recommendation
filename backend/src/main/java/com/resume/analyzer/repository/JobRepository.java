package com.resume.analyzer.repository;

import com.resume.analyzer.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}