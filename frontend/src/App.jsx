import { useEffect, useState } from "react";

function getBaseApiUrl(path) {
  return window.location.protocol === "file:" ? `http://localhost:8080${path}` : path;
}

async function readResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `The server returned an error (${response.status}).`);
  }
  return data;
}

function getConnectionError(error) {
  return error instanceof TypeError
    ? "Could not connect to the analyzer API. Make sure the backend application is running, then open it at http://localhost:8080."
    : error.message;
}

function LoadingScreen() {
  return (
    <section className="loading-screen" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <h1>AI Resume Analyzer</h1>
      <p>Resume Analysis &amp; Job Recommendation System</p>
      <p className="loading-message">Preparing your analyzer...</p>
    </section>
  );
}

function Recommendation({ job }) {
  return (
    <article className="result-item">
      <h3>{job.jobTitle}</h3>
      <p className="score">Match: {job.matchScore}%</p>
      <p className="missing">
        <strong>Missing Skills: </strong>
        {Array.isArray(job.missingSkills) && job.missingSkills.length
          ? job.missingSkills.join(", ")
          : "None"}
      </p>
    </article>
  );
}

function HistoryItem({ record, onDelete }) {
  const date = record.createdAt ? new Date(record.createdAt) : null;

  return (
    <article className="history-item">
      <div className="history-info">
        <h3>{record.candidateName || "Anonymous"} — ID #{record.id}</h3>
        <p>
          <strong>Top Match:</strong> {record.topJobTitle || "N/A"} (
          {record.topMatchScore ?? 0}%)
        </p>
        {record.extractedSkills && (
          <p className="history-meta">
            <strong>Skills:</strong> {record.extractedSkills}
          </p>
        )}
        {record.missingSkills && (
          <p className="history-meta">
            <strong>Missing Skills:</strong> {record.missingSkills}
          </p>
        )}
        {record.createdAt && (
          <p className="history-meta">
            Analyzed on: {Number.isNaN(date.getTime()) ? record.createdAt : date.toLocaleString()}
          </p>
        )}
      </div>
      <button
        className="btn-delete"
        type="button"
        onClick={() => onDelete(record.id)}
        aria-label={`Delete analysis record ${record.id}`}
      >
        Delete
      </button>
    </article>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [records, setRecords] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      loadHistory();
    }
  }, [isReady]);

  async function loadHistory() {
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const response = await fetch(getBaseApiUrl("/api/resumes"));
      const data = await readResponse(response);
      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid history response.");
      }
      setRecords(data);
    } catch (error) {
      console.error("Error loading history:", error);
      setHistoryError(`Could not fetch history: ${getConnectionError(error)}`);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function analyzeResume(event) {
    event.preventDefault();
    setAnalysis(null);
    setAnalysisError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setAnalysisError("Please enter a name.");
      return;
    }
    if (!file) {
      setAnalysisError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("file", file);
    setIsAnalyzing(true);

    try {
      const response = await fetch(getBaseApiUrl("/api/resume/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await readResponse(response);
      if (!data || !Array.isArray(data.recommendations)) {
        throw new Error(data?.error || "The server response is missing job recommendations.");
      }
      setAnalysis(data);
      await loadHistory();
    } catch (error) {
      console.error(error);
      setAnalysisError(getConnectionError(error));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function deleteHistoryRecord(id) {
    if (!window.confirm(`Are you sure you want to delete analysis record #${id} from the database?`)) {
      return;
    }

    try {
      const response = await fetch(getBaseApiUrl(`/api/resumes/${id}`), { method: "DELETE" });
      await readResponse(response);
      await loadHistory();
    } catch (error) {
      window.alert(`Failed to delete record: ${getConnectionError(error)}`);
    }
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <span className="eyebrow">CAREER MATCHING, MADE SIMPLE</span>
          <h1>AI Resume Analyzer</h1>
          <p>Resume Analysis &amp; Job Recommendation System</p>
        </div>
      </header>

      <main>
        <section className="card">
          <div className="section-heading">
            <span className="step-number">01</span>
            <div>
              <h2>Upload Resume</h2>
              <p>See how your experience matches the roles you want.</p>
            </div>
          </div>
          <form onSubmit={analyzeResume}>
            <label className="field-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
            <label className="upload-area" htmlFor="resumePdf">
              <span className="upload-icon" aria-hidden="true">
                ↑
              </span>
              <strong>Select your PDF resume</strong>
              <span>{file ? file.name : "PDF files only"}</span>
              <input
                id="resumePdf"
                name="file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing resume..." : "Analyze Resume"}
              {!isAnalyzing && <span aria-hidden="true">→</span>}
            </button>
          </form>
        </section>

        <section className="card" aria-labelledby="result-heading">
          <div className="section-heading">
            <span className="step-number">02</span>
            <div>
              <h2 id="result-heading">Analysis Result</h2>
              <p>Your resume analysis and recommended job matches.</p>
            </div>
          </div>
          {analysisError ? (
            <p className="error" role="alert">
              {analysisError}
            </p>
          ) : analysis ? (
            <div role="status" aria-live="polite">
              {analysis.analysisId && (
                <div className="badge-saved">
                  <span>
                    ✓ <strong>Saved to MySQL Database</strong> (Analysis ID: #{analysis.analysisId})
                  </span>
                  {analysis.savedAt && <span>{new Date(analysis.savedAt).toLocaleTimeString()}</span>}
                </div>
              )}
              {analysis.databaseWarning && (
                <p className="warning" role="status">
                  {analysis.databaseWarning}
                </p>
              )}
              <h3 className="candidate-heading">Candidate: {analysis.candidate || name.trim()}</h3>
              {analysis.email && (
                <p className="analysis-meta">
                  <strong>Email:</strong> {analysis.email}
                </p>
              )}
              {Array.isArray(analysis.extractedSkills) && analysis.extractedSkills.length > 0 && (
                <p className="analysis-meta">
                  <strong>Detected Skills:</strong> {analysis.extractedSkills.join(", ")}
                </p>
              )}
              {analysis.recommendations.map((job, index) => (
                <Recommendation key={`${job.jobTitle}-${index}`} job={job} />
              ))}
            </div>
          ) : (
            <p className="empty-state" role="status" aria-live="polite">
              Upload your resume details and click Analyze Resume.
            </p>
          )}
        </section>

        <section className="card" aria-labelledby="history-heading">
          <div className="history-header">
            <div className="section-heading">
              <span className="step-number">03</span>
              <div>
                <h2 id="history-heading">Saved Analyses</h2>
                <p>Your previous resume analyses.</p>
              </div>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={loadHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? "Refreshing..." : "Refresh History"}
            </button>
          </div>
          <div aria-live="polite">
            {historyError ? (
              <p className="error" role="alert">
                {historyError}
              </p>
            ) : isLoadingHistory && records.length === 0 ? (
              <p className="empty-state">Loading saved records...</p>
            ) : records.length === 0 ? (
              <p className="empty-state">No saved resume analyses found in MySQL yet.</p>
            ) : (
              records.map((record) => (
                <HistoryItem key={record.id} record={record} onDelete={deleteHistoryRecord} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
