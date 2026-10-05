const loadingScreen = document.getElementById("loadingScreen");
const appContent = document.getElementById("appContent");

window.setTimeout(() => {
    loadingScreen.hidden = true;
    appContent.hidden = false;
}, 5000);

async function analyzeResume() {
    const name = document.getElementById("name").value.trim();
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
    output.textContent = "Analyzing resume...";
    analyzeButton.disabled = true;

    try {
        const apiUrl = window.location.protocol === "file:"
            ? "http://localhost:8080/api/resume/upload"
            : "/api/resume/upload";
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

        const candidateHeading = document.createElement("h3");
        candidateHeading.textContent = `Candidate: ${data.candidate || name}`;
        output.appendChild(candidateHeading);

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
    } catch (error) {
        console.error(error);
        showError(
            output,
            error instanceof TypeError
                ? "Could not connect to the analyzer API. Make sure the application is running, then open it at http://localhost:8080."
                : error.message
        );
    } finally {
        analyzeButton.disabled = false;
    }
}

function showError(output, message) {
    output.className = "error";
    output.textContent = message;
}