// ======================================
// SUBJECT DATA & MANAGEMENT
// ======================================

const initialSubjects = [
    {
        name: "Operating System",
        code: "CS304",
        faculty: "Dr. Kumar",
        credits: 4,
        total: 40,
        present: 36
    },
    {
        name: "DBMS",
        code: "CSD05",
        faculty: "Dr. Raj",
        credits: 4,
        total: 40,
        present: 32
    },
    {
        name: "Accounts",
        code: "CSA06",
        faculty: "Dr. Priya",
        credits: 4,
        total: 40,
        present: 30
    },
    {
        name: "Mathematics",
        code: "MAT04",
        faculty: "Prof. Arun",
        credits: 4,
        total: 40,
        present: 38
    },
    {
        name: "Digital Marketing",
        code: "CSDM06",
        faculty: "Prof. Sneha",
        credits: 3,
        total: 40,
        present: 28
    }
];

// Initialize subjects from localStorage or defaults
let subjects = [];
try {
    const saved = localStorage.getItem("studentSubjects");
    if (saved) {
        subjects = JSON.parse(saved);
        if (!subjects || subjects.length === 0) {
            subjects = [...initialSubjects];
            localStorage.setItem("studentSubjects", JSON.stringify(subjects));
        }
    } else {
        subjects = [...initialSubjects];
        localStorage.setItem("studentSubjects", JSON.stringify(subjects));
    }
} catch (e) {
    subjects = [...initialSubjects];
}

// ======================================
// SHOW SUBJECTS
// ======================================
function displaySubjects() {
    const list = document.getElementById("subjectsList");
    if (!list) return;

    list.innerHTML = "";

    if (subjects.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                
                <h3>No Subjects Added</h3>
                <p>Click "+ Add Subject" above to add your first subject, or restore defaults.</p>
                <button class="action-btn" onclick="restoreDefaults()" style="margin-top: 15px;">
                    Restore Default Subjects
                </button>
            </div>
        `;
        return;
    }

    subjects.forEach(function(subject, index) {
        let percentage = 0;
        if (subject.total > 0) {
            percentage = Math.round((subject.present / subject.total) * 100);
        }

        let icon = "";

        let badgeColorClass = "attendance-green";
        if (percentage < 75) {
            badgeColorClass = "attendance-red";
        } else if (percentage < 80) {
            badgeColorClass = "attendance-yellow";
        }

        list.innerHTML += `
            <div class="subject-card">
                <div class="subject-top">
                    
                    <div class="subject-code">${subject.code || "N/A"}</div>
                </div>

                <h2>${subject.name}</h2>
                <p class="subject-faculty">Faculty: <strong>${subject.faculty || "Staff"}</strong></p>

                <div class="details">
                    <div class="detail">
                        <span>Credits</span>
                        <b>${subject.credits || 0}</b>
                    </div>
                    <div class="detail">
                        <span>Total</span>
                        <b>${subject.total || 0}</b>
                    </div>
                    <div class="detail">
                        <span>Present</span>
                        <b>${subject.present || 0}</b>
                    </div>
                    <div class="detail">
                        <span>Attendance</span>
                        <b class="${badgeColorClass}">${percentage}%</b>
                    </div>
                </div>
            </div>
        `;
    });
}

// ======================================
// SHOW & HIDE FORM MODAL
// ======================================
function showForm() {
    const modal = document.getElementById("subjectModal");
    if (modal) {
        modal.classList.add("show");
    }
}

function hideForm() {
    const modal = document.getElementById("subjectModal");
    if (modal) {
        modal.classList.remove("show");
    }
    const form = document.getElementById("addSubjectForm");
    if (form) {
        form.reset();
    }
}

// ======================================
// RESTORE DEFAULTS
// ======================================
function restoreDefaults() {
    subjects = [...initialSubjects];
    localStorage.setItem("studentSubjects", JSON.stringify(subjects));
    displaySubjects();
}

// ======================================
// DELETE SUBJECT
// ======================================
function deleteSubject(index) {
    if (index < 0 || index >= subjects.length) return;
    const confirmed = confirm(`Are you sure you want to delete "${subjects[index].name}"?`);
    if (!confirmed) return;

    subjects.splice(index, 1);
    localStorage.setItem("studentSubjects", JSON.stringify(subjects));
    displaySubjects();
}

// ======================================
// DOM EVENT LISTENERS
// ======================================
document.addEventListener("DOMContentLoaded", function() {
    displaySubjects();

    const addSubjectForm = document.getElementById("addSubjectForm");
    if (addSubjectForm) {
        addSubjectForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const name = document.getElementById("subjectName").value.trim();
            const code = document.getElementById("subjectCode").value.trim();
            const faculty = document.getElementById("faculty").value.trim();
            const credits = Number(document.getElementById("credits").value);
            const total = Number(document.getElementById("totalClasses").value);
            const present = Number(document.getElementById("presentClasses").value);

            if (present > total) {
                alert("Error: Present classes cannot be greater than total classes.");
                return;
            }

            if (!name || !code) {
                alert("Please provide both subject name and course code.");
                return;
            }

            const newSubject = {
                name: name,
                code: code,
                faculty: faculty || "Instructor",
                credits: credits || 3,
                total: total || 0,
                present: present || 0
            };

            subjects.push(newSubject);
            localStorage.setItem("studentSubjects", JSON.stringify(subjects));

            displaySubjects();
            hideForm();
        });
    }
});
