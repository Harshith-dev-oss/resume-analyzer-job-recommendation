async function analyzeResume() {
    const name = document.getElementById("name").value;
    const fileInput = document.getElementById("resumePdf");
    const output = document.getElementById("output");

    if (!name.trim()) {
        output.innerHTML = "<span style='color: red;'>Please enter a name.</span>";
        return;
    }

    if (!fileInput.files.length) {
        output.innerHTML = "<span style='color: red;'>Please select a PDF file.</span>";
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", fileInput.files[0]);

    output.innerHTML = "Analyzing resume...";

    try {
        const response = await fetch("/api/resume/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            output.innerHTML = `<span style='color: red;'>Error: ${data.error}</span>`;
            return;
        }

        let html = `
            <h3>
                Candidate: ${data.candidate}
            </h3>
        `;

        data.recommendations.forEach(job => {
            html += `
                <div class="result-item">
                    <h3>
                        ${job.jobTitle}
                    </h3>
                    <div class="score">
                        Match: ${job.matchScore}%
                    </div>
                    <div class="missing">
                        <strong>
                            Missing Skills:
                        </strong>
                        ${
                            job.missingSkills.length
                            ? job.missingSkills.join(", ")
                            : "None"
                        }
                    </div>
                </div>
            `;
        });

        output.innerHTML = html;

    } catch (error) {
        output.innerHTML = "Error connecting to server.";
        console.error(error);
    }
}