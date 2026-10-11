# AI Resume Analyzer & Job Recommendation System

An AI-powered full-stack web application that parses resumes in PDF format, analyzes skills and qualifications against industry job roles, computes percentage match scores, identifies missing skills, and permanently persists candidate analysis results into a MySQL database.

---

## 🌟 Key Features

- **PDF Resume Ingestion**: Upload PDF resumes directly through an intuitive, clean web interface.
- **Automated Text Extraction**: Powered by Apache PDFBox to extract text, candidate details, emails, and skillsets.
- **Skill Matching & Recommendation Engine**: Evaluates resume keywords against job profiles (`Python Developer`, `Web Developer`, `Java Developer`, `Full Stack Developer`, `Data Scientist / AI Engineer`), computing match scores and pinpointing missing skills.
- **Relational MySQL Persistence**: Automatic schema management using Spring Data JPA and Hibernate. Records candidates, match percentages, extracted skills, and recommendations.
- **Saved Analyses History**: View, review, and delete previous analysis records directly from the UI or via REST APIs.
- **Production-Ready**: Configured for local development and cloud deployment (Railway, Render, AWS, etc.) using Docker and dynamic environment variables.

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Fetch API, responsive UI)
- **Backend**: Java 17, Spring Boot 4 / Spring Framework
- **ORM & Data Access**: Spring Data JPA, Hibernate ORM
- **Database**: MySQL 8.x
- **PDF Extraction**: Apache PDFBox 2.0.30
- **Build Tool**: Apache Maven (Wrapper included: `./mvnw`)
- **Version Control**: Git & GitHub
- **Containerization & Deployment**: Docker, Railway / Render

---

## 📁 Project Folder Structure

```text
resume-analyzer/
├── .mvn/wrapper/                  # Maven wrapper binaries
├── src/
│   ├── main/
│   │   ├── java/com/resume/analyzer/
│   │   │   ├── ResumeAnalyzerApplication.java   # Main entry point & DB seeder
│   │   │   ├── controller/
│   │   │   │   ├── JobController.java           # Job endpoints (/api/jobs)
│   │   │   │   └── ResumeController.java        # Resume & Analysis endpoints (/api/resumes)
│   │   │   ├── model/
│   │   │   │   ├── Job.java                     # JPA entity for Job profiles
│   │   │   │   ├── Resume.java                  # JPA entity for Candidate Resume
│   │   │   │   └── ResumeAnalysis.java          # JPA entity for Persisted Analysis Results
│   │   │   ├── repository/
│   │   │   │   ├── JobRepository.java           # Spring Data JPA repository for Jobs
│   │   │   │   ├── ResumeRepository.java        # Spring Data JPA repository for Resumes
│   │   │   │   └── ResumeAnalysisRepository.java# Repository for Analysis Results
│   │   │   └── service/
│   │   │       ├── RecommendationService.java   # PDF parsing & skill scoring logic
│   │   │       └── ResumeService.java           # Business logic & CRUD operations
│   │   └── resources/
│   │       ├── application.properties           # Spring Boot & Database configuration
│   │       ├── data.sql                         # Initial job role seeds
│   │       └── static/                          # Integrated Single-Page Frontend
│   │           ├── index.html                   # User interface
│   │           ├── style.css                    # Responsive styling
│   │           └── script.js                    # Dynamic frontend logic & API calls
├── Dockerfile                     # Multi-stage Docker production build
├── Procfile                       # Cloud platform runner command
├── system.properties              # Java runtime specification (Java 17)
├── pom.xml                        # Maven dependencies & build configurations
└── README.md                      # Complete project documentation
```

---

## ⚙️ Prerequisites

Before running the project locally, ensure you have:
1. **Java JDK 17+** installed (`java -version`)
2. **MySQL Server 8.x** installed and running on port 3306
3. **MySQL Workbench** or MySQL CLI
4. Git installed

---

## 🗄️ MySQL Database Setup

### 1. Start MySQL Server
Ensure the MySQL Windows Service (`MySQL80`) or daemon is running.

### 2. Run Database Setup Commands
Open **MySQL Workbench** or your terminal and execute:

```sql
-- 1. Create the database
CREATE DATABASE IF NOT EXISTS resume_analyzer;

-- 2. Select the database
USE resume_analyzer;

-- 3. Verify created tables (created automatically on Spring Boot startup)
SHOW TABLES;

-- 4. Inspect table structure
DESCRIBE resume_analyses;
DESCRIBE jobs;

-- 5. Query stored resume analyses
SELECT * FROM resume_analyses;
```

---

## 🔐 Environment Variables

The application is securely configured in `src/main/resources/application.properties` to support both local defaults and cloud production variables:

| Variable Name | Description | Local Default | Production Example |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for MySQL | `jdbc:mysql://127.0.0.1:3306/resume_analyzer?...` | `jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}` |
| `SPRING_DATASOURCE_USERNAME` | MySQL Username | `root` | Supplied by cloud provider |
| `SPRING_DATASOURCE_PASSWORD` | MySQL Password | `root` | Supplied by cloud provider |
| `PORT` | Web server listening port | `8080` | Assigned automatically |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Hibernate Schema mode | `update` | `update` or `validate` |

---

## 🚀 How to Run Locally

### Step 1: Open Terminal in Project Folder
Navigate to the directory containing `pom.xml`:
```powershell
cd C:\Users\harsh\OneDrive\Desktop\AI-RESUME-ANALYZER\resume-analyzer
```

### Step 2: Build and Run with Maven Wrapper
```powershell
.\mvnw.cmd spring-boot:run
```
*(On Linux/macOS: `./mvnw spring-boot:run`)*

### Step 3: Access the Application
Open your web browser and visit:
👉 **`http://localhost:8080`**

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resume/upload` | Upload a PDF resume (`multipart/form-data`: `name`, `file`). Analyzes skills, matches against job roles, saves results to MySQL, and returns match summary with `analysisId`. |
| `POST` | `/api/resume/analyze` | Analyzes JSON resume data and saves record to MySQL. |
| `GET` | `/api/resumes` | Retrieves all saved analysis records ordered by latest first. |
| `GET` | `/api/resumes/{id}` | Retrieves a single saved analysis record by ID. |
| `DELETE`| `/api/resumes/{id}` | Deletes a saved analysis record by ID from MySQL. |
| `GET` | `/api/jobs` | Retrieves all available job profiles and required skills. |
| `POST` | `/api/jobs` | Creates a new job profile. |

---

## 🧪 Testing Instructions

### 1. Test Analysis & Database Storage via Frontend
1. Open `http://localhost:8080` in your browser.
2. Enter a candidate full name (e.g., `Nishani Harshith`).
3. Select any valid PDF resume and click **Analyze Resume**.
4. Check that:
   - Match results are displayed with scores and missing skills.
   - A green banner confirms **"Saved to MySQL Database (Analysis ID: #X)"**.
   - The analysis appears in the **Saved Analyses (MySQL Database)** section below.

### 2. Test Verification in MySQL
Run in MySQL Workbench:
```sql
USE resume_analyzer;
SELECT id, candidate_name, email, top_job_title, top_match_score, extracted_skills, created_at FROM resume_analyses;
```

### 3. Test API via cURL / PowerShell
```powershell
# Get all saved records:
curl.exe http://localhost:8080/api/resumes

# Upload a test resume:
curl.exe -X POST "http://localhost:8080/api/resume/upload" -F "name=Jane Doe" -F "file=@path/to/resume.pdf"
```

---

## ☁️ Deployment Guide (Railway)

### 1. Push code to GitHub
```bash
git add .
git commit -m "Complete MySQL database integration and production configuration"
git push origin main
```

### 2. Deploy on Railway
1. Go to [railway.com](https://railway.com) and log in.
2. Click **New Project** → **Provision MySQL**.
3. Click **New** → **GitHub Repo** → select `resume-analyzer-job-recommendation`.
4. Under the Spring Boot Service **Variables**, add:
   - `SPRING_DATASOURCE_URL`: `${{MySQL.MYSQL_URL}}` *(or `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true`)*
   - `SPRING_DATASOURCE_USERNAME`: `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
5. Under service **Settings**, click **Generate Domain** to get your live public URL!

---

## 🖼️ Application Preview

- **Header & Upload Section**: Modern card-based UI with name and PDF file selector.
- **Match Breakdown**: Color-coded match cards showing job title, percentage match, and missing skillset tags.
- **History Viewer**: Interactive log displaying previous candidates stored in MySQL with timestamp and record deletion.

---

## 🔒 Limitations and Future Improvements

1. **OCR Support**: Currently processes standard digital PDF text. Future updates can integrate Tesseract OCR for scanned PDF images.
2. **AI Semantic Matching**: Future enhancements can integrate LLM embeddings (e.g. Gemini API / LangChain4j) for deep semantic comprehension beyond keyword matching.
3. **Role-Based Authentication**: Adding Spring Security with JWT tokens for multi-tenant recruiter portals.
