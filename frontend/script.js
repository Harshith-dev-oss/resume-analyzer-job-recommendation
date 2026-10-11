const loadingScreen = document.getElementById("loadingScreen");
const appContent = document.getElementById("appContent");

window.setTimeout(() => {
    loadingScreen.hidden = true;
    appContent.hidden = false;
    loadHistory();
}, 2500);

function getBaseApiUrl(path) {
    if (window.location.protocol === "file:") {
        return "http://localhost:8080" + path;
    }
    return path;
}

async function analyzeResume() {
    const nameInput = document.getElementById("name");
    const name = nameInput.value.trim();
    const fileInput = document.getElementById("resumePdf");
    const output = document.getElementById("output");
    const analyzeButton = document.getElementById("analyzeButton");

    if (!name) {
        showError(output, "Please enter a name.");
        return;
    }

    if (!fileInput.files.length) {
        showError(output, "Please select a PDF file.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", fileInput.files[0]);

    output.className = "";
    output.textContent = "Analyzing resume with AI rules & saving to MySQL database...";
    analyzeButton.disabled = true;

    try {
        const apiUrl = getBaseApiUrl("/api/resume/upload");
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.error || `The server returned an error (${response.status}).`);
        }

        if (!data || data.error) {
            throw new Error(data?.error || "The server returned an invalid response.");
        }

        if (!Array.isArray(data.recommendations)) {
            throw new Error("The server response is missing job recommendations.");
        }

        output.replaceChildren();

        // Database status notification
        if (data.analysisId) {
            const badge = document.createElement("div");
            badge.className = "badge-saved";
            badge.innerHTML = `<span>&#10003; <strong>Saved to MySQL Database</strong> (Analysis ID: #${data.analysisId})</span><span style="font-size:0.85rem; color:#047857;">${new Date().toLocaleTimeString()}</span>`;
            output.appendChild(badge);
        }

        const candidateHeading = document.createElement("h3");
        candidateHeading.textContent = `Candidate: ${data.candidate || name}`;
        output.appendChild(candidateHeading);

        if (data.email) {
            const emailPara = document.createElement("p");
            emailPara.style.color = "#4b5563";
            emailPara.style.marginTop = "4px";
            emailPara.innerHTML = `<strong>Email:</strong> ${data.email}`;
            output.appendChild(emailPara);
        }

        if (Array.isArray(data.extractedSkills) && data.extractedSkills.length) {
            const skillsPara = document.createElement("p");
            skillsPara.style.color = "#4b5563";
            skillsPara.style.margin = "8px 0 16px 0";
            skillsPara.innerHTML = `<strong>Detected Skills:</strong> ${data.extractedSkills.join(", ")}`;
            output.appendChild(skillsPara);
        }

        data.recommendations.forEach(job => {
            const result = document.createElement("div");
            result.className = "result-item";

            const title = document.createElement("h3");
            title.textContent = job.jobTitle;
            result.appendChild(title);

            const score = document.createElement("div");
            score.className = "score";
            score.textContent = `Match: ${job.matchScore}%`;
            result.appendChild(score);

            const missing = document.createElement("div");
            missing.className = "missing";
            const missingLabel = document.createElement("strong");
            missingLabel.textContent = "Missing Skills: ";
            missing.append(missingLabel, document.createTextNode(
                Array.isArray(job.missingSkills) && job.missingSkills.length
                    ? job.missingSkills.join(", ")
                    : "None"
            ));
            result.appendChild(missing);

            output.appendChild(result);
        });

        // Automatically refresh history to reflect new database entry
        loadHistory();

    } catch (error) {
        console.error(error);
        showError(
            output,
            error instanceof TypeError
                ? "Could not connect to the analyzer API. Make sure the backend application is running, then open it at http://localhost:8080."
                : error.message
        );
    } finally {
        analyzeButton.disabled = false;
    }
}

async function loadHistory() {
    const historyOutput = document.getElementById("historyOutput");
    if (!historyOutput) return;

    try {
        const apiUrl = getBaseApiUrl("/api/resumes");
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to load history (${response.status})`);
        }
        const records = await response.json();

        historyOutput.replaceChildren();

        if (!Array.isArray(records) || records.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.style.color = "#64748b";
            emptyMsg.textContent = "No saved resume analyses found in MySQL yet.";
            historyOutput.appendChild(emptyMsg);
            return;
        }

        records.forEach(rec => {
            const item = document.createElement("div");
            item.className = "history-item";

            const info = document.createElement("div");
            info.style.flex = "1";

            const title = document.createElement("h4");
            title.textContent = `${rec.candidateName || "Anonymous"} — ID #${rec.id}`;
            info.appendChild(title);

            const topMatch = document.createElement("p");
            topMatch.style.margin = "4px 0";
            topMatch.innerHTML = `<strong>Top Match:</strong> ${rec.topJobTitle || "N/A"} (${rec.topMatchScore != null ? rec.topMatchScore : 0}%)`;
            info.appendChild(topMatch);

            if (rec.extractedSkills) {
                const skills = document.createElement("p");
                skills.className = "history-meta";
                skills.innerHTML = `<strong>Skills:</strong> ${rec.extractedSkills}`;
                info.appendChild(skills);
            }

            if (rec.missingSkills) {
                const missing = document.createElement("p");
                missing.className = "history-meta";
                missing.innerHTML = `<strong>Missing Skills:</strong> ${rec.missingSkills}`;
                info.appendChild(missing);
            }

            if (rec.createdAt) {
                const time = document.createElement("p");
                time.className = "history-meta";
                const dateObj = new Date(rec.createdAt);
                time.textContent = `Analyzed on: ${isNaN(dateObj) ? rec.createdAt : dateObj.toLocaleString()}`;
                info.appendChild(time);
            }

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "btn-delete";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteHistoryRecord(rec.id);

            item.appendChild(info);
            item.appendChild(deleteBtn);

            historyOutput.appendChild(item);
        });

    } catch (err) {
        console.error("Error loading history:", err);
        historyOutput.innerHTML = `<p style="color: #dc2626;">Could not fetch history: ${err.message}</p>`;
    }
}

async function deleteHistoryRecord(id) {
    if (!confirm(`Are you sure you want to delete analysis record #${id} from the database?`)) {
        return;
    }

    try {
        const apiUrl = getBaseApiUrl(`/api/resumes/${id}`);
        const response = await fetch(apiUrl, { method: "DELETE" });
        if (!response.ok) {
            throw new Error(`Failed to delete record (${response.status})`);
        }
        loadHistory();
    } catch (err) {
        alert("Failed to delete record: " + err.message);
    }
}

function showError(output, message) {
    output.className = "error";
    output.textContent = message;
}