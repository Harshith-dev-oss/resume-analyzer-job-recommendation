package com.resume.analyzer;

import com.resume.analyzer.model.Job;
import com.resume.analyzer.repository.JobRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class ResumeAnalyzerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResumeAnalyzerApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(JobRepository jobRepository) {
		return args -> {
			if (jobRepository.count() == 0) {
				Job j1 = new Job();
				j1.setTitle("Python Developer");
				j1.setRequiredSkills("python,django,sql,git");
				j1.setDescription("Develop applications using Python and Django");

				Job j2 = new Job();
				j2.setTitle("Web Developer");
				j2.setRequiredSkills("html,css,javascript,sql,git");
				j2.setDescription("Develop responsive web applications");

				Job j3 = new Job();
				j3.setTitle("Java Developer");
				j3.setRequiredSkills("java,spring boot,sql,git");
				j3.setDescription("Develop backend applications using Java and Spring Boot");

				Job j4 = new Job();
				j4.setTitle("Full Stack Developer");
				j4.setRequiredSkills("html,css,javascript,python,sql,git");
				j4.setDescription("Develop complete web applications");

				Job j5 = new Job();
				j5.setTitle("Data Scientist / AI Engineer");
				j5.setRequiredSkills("python,machine learning,sql,data analysis");
				j5.setDescription("Analyze data and develop machine learning models");

				jobRepository.saveAll(List.of(j1, j2, j3, j4, j5));
				System.out.println(">>> Seeded initial job roles into MySQL database.");
			}
		};
	}
}
