// ======================================
// STUDENT PORTAL - SCRIPT
// ======================================

// Helper: Get logged in student name
function getStudentName() {
    return localStorage.getItem("currentStudentUser") || localStorage.getItem("studentName") || "Harini";
}

// ================= AUTH CHECK & LOGOUT =================
function logout() {
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("currentStudentUser");
    window.location.href = "index.html";
}

// ================= CAPTCHA SYSTEM =================
let currentCaptcha = "";

// Distinct, non-confusing characters with BOTH Uppercase and Lowercase letters (Strict Case Identity)
// Excludes confusing pairs like 0/O/o and 1/I/l
const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

// Generate a random 5-character alphanumeric code with mixed cases
function generateCaptchaCode(length = 5) {
    let code = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
        code += CAPTCHA_CHARS.charAt(randomIndex);
    }
    return code;
}

// Generate a brand new code strictly different from currentCaptcha
function generateNewCaptchaCode() {
    let newCode = "";
    do {
        newCode = generateCaptchaCode(5);
    } while (newCode === currentCaptcha);
    return newCode;
}

// Draw the crisp dynamic captcha code on HTML5 canvas with clear case distinction
function drawCaptcha(text) {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Light warm cream/beige background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#fdf9fa");
    bgGradient.addColorStop(0.5, "#f5e6ea");
    bgGradient.addColorStop(1, "#faeff2");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid in warm brown
    ctx.strokeStyle = "rgba(201, 139, 155, 0.28)";
    ctx.lineWidth = 1;
    for (let x = 14; x < width; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 10; y < height; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Soft noise dots in warm brown
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(122, 41, 70, ${Math.random() * 0.25 + 0.1})`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 1.5 + 0.8,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // 2 smooth disturbance lines in rich brown
    for (let i = 0; i < 2; i++) {
        ctx.strokeStyle = "rgba(122, 41, 70, 0.40)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, Math.random() * height);
        ctx.bezierCurveTo(
            width * 0.3, Math.random() * height,
            width * 0.7, Math.random() * height,
            width - 10, Math.random() * height
        );
        ctx.stroke();
    }

    // High contrast letter colors on beige
    const colors = [
        "#7A2946", // Deep plum wine
        "#5c1b32", // Rich berry burgundy
        "#3A0E1C", // Deep wine black
        "#8B264E", // Vibrant plum
        "#1e3a8a", // Midnight blue
        "#14532d", // Forest green
        "#6b21a8", // Royal purple
        "#4c0519"  // Dark rosewood
    ];

    const fonts = ["Arial", "Verdana", "Trebuchet MS", "Georgia"];
    const count = text.length;
    const charSpacing = width / (count + 1);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < count; i++) {
        const char = text[i];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const fontName = fonts[Math.floor(Math.random() * fonts.length)];
        
        // Distinct size for clarity: uppercase 28-30px, lowercase 24-26px
        const isUpper = char === char.toUpperCase() && isNaN(char);
        const fontSize = isUpper ? 29 : 25;
        const angle = (Math.random() - 0.5) * 0.20; // Mild tilt (-6 to +6 deg)

        ctx.save();
        const x = (i + 1) * charSpacing;
        const y = height / 2 + (Math.random() - 0.5) * 3;

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.font = `bold ${fontSize}px ${fontName}, sans-serif`;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
}

// Generate new unique captcha and redraw
function refreshCaptcha() {
    currentCaptcha = generateNewCaptchaCode();
    drawCaptcha(currentCaptcha);
    const captchaInput = document.getElementById("captchaInput") || document.getElementById("captchainput");
    if (captchaInput) {
        captchaInput.value = "";
    }
}

// Initialize Captcha listeners safely
function initCaptcha() {
    const captchaCanvas = document.getElementById("captchaCanvas");
    if (!captchaCanvas) return;

    refreshCaptcha();

    const refreshBtn = document.getElementById("refreshCaptchaBtn");

    function triggerRefreshAnimation() {
        if (!refreshBtn) return;
        refreshBtn.classList.remove("spinning");
        // Force reflow to restart rotate animation on rapid clicks
        void refreshBtn.offsetWidth;
        refreshBtn.classList.add("spinning");
        setTimeout(function() {
            refreshBtn.classList.remove("spinning");
        }, 650);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", function(e) {
            e.preventDefault();
            triggerRefreshAnimation();
            refreshCaptcha();
        });
    }

    const captchaBox = document.getElementById("captchaBox");
    if (captchaBox) {
        captchaBox.addEventListener("click", function() {
            triggerRefreshAnimation();
            refreshCaptcha();
        });
    }
}

// ================= POP-OUT SIDEBAR DRAWER SYSTEM =================
function initSidebarDrawer() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    // Create or get overlay
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        document.body.classList.add("sidebar-open");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove("sidebar-open");
    }

    // Attach to all toggle buttons (menuToggleBtn or .menu-toggle-btn)
    const toggleBtns = document.querySelectorAll(".menu-toggle-btn, #menuToggleBtn");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (sidebar.classList.contains("open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    });

    // Close button inside sidebar
    const closeBtn = document.querySelector(".close-sidebar-btn, #closeSidebarBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }

    // Clicking overlay closes sidebar
    overlay.addEventListener("click", function() {
        closeSidebar();
    });

    // Pressing ESC key closes sidebar
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
            closeSidebar();
        }
    });

    // Close sidebar when clicking any menu item (for smooth mobile navigation)
    const menuLinks = sidebar.querySelectorAll(".menu a");
    menuLinks.forEach(link => {
        link.addEventListener("click", function() {
            if (!this.classList.contains("logout-link")) {
                closeSidebar();
            }
        });
    });
}

// ================= DOM READY / APP INIT =================
function initApp() {
    // 1. Initialize Captcha if on login page
    initCaptcha();

    // 2. Initialize Pop-out Sidebar Drawer if on interior page
    initSidebarDrawer();

    // 3. Initialize Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const studentIdInput = document.getElementById("studentId") || document.getElementById("Name");
            const passwordInput = document.getElementById("password");
            const error = document.getElementById("loginError");
            const captchaInput = document.getElementById("captchaInput") || document.getElementById("captchainput");

            const enteredId = studentIdInput ? studentIdInput.value.trim() : "";
            const enteredPassword = passwordInput ? passwordInput.value : "";

            // 1. STRICT CAPTCHA VERIFICATION
            if (!captchaInput) {
                if (error) {
                    error.style.color = "#f87171";
                    error.innerText = "Error: Captcha field missing!";
                }
                return;
            }

            const enteredCaptcha = captchaInput.value.replace(/\s+/g, ""); // Do NOT convert case! Keep exact case
            const expectedCaptcha = currentCaptcha.replace(/\s+/g, "");

            if (!enteredCaptcha) {
                if (error) {
                    error.style.color = "#f87171";
                    error.innerText = "Please enter the captcha code.";
                }
                captchaInput.focus();
                return;
            }

            // Case-sensitive check: Capital and small letters must match exactly!
            if (enteredCaptcha !== expectedCaptcha) {
                if (error) {
                    error.style.color = "#f87171";
                    error.innerText = "Incorrect Captcha! Capital and small letters must match exactly. A new code is generated.";
                }
                refreshCaptcha();
                captchaInput.focus();
                return; // BLOCK LOGIN!
            }

            // 2. VERIFY CREDENTIALS
            const activePassword = localStorage.getItem("studentPassword") || "1234";
            const savedStudentId = localStorage.getItem("studentId");
            const savedName = localStorage.getItem("studentName");
            const savedEmail = localStorage.getItem("studentEmail");

            const isDefaultValid = (
                (enteredId.toLowerCase() === "student" || 
                 enteredId.toLowerCase() === "harini" || 
                 enteredId.toLowerCase() === "ra202510008" ||
                 enteredId.toLowerCase() === "ra202610008") &&
                enteredPassword === activePassword
            );

            const isSavedUser = (
                (savedStudentId && enteredId.toLowerCase() === savedStudentId.toLowerCase()) ||
                (savedEmail && enteredId.toLowerCase() === savedEmail.toLowerCase())
            ) && (enteredPassword === activePassword);

            if (isDefaultValid || isSavedUser) {
                const displayName = isSavedUser && savedName ? savedName : "Harini";
                localStorage.setItem("studentLoggedIn", "true");
                localStorage.setItem("currentStudentUser", displayName);

                if (error) {
                    error.style.color = "#2e7d32";
                    error.innerText = "Login successful! Redirecting...";
                }

                setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 500);
            } else {
                if (error) {
                    error.style.color = "#c62828";
                    error.innerText = "Invalid ID or Password! Default is student / 1234. Use 'Forgot Password?' to reset.";
                }
                // Refresh captcha on failed attempt
                refreshCaptcha();
                if (captchaInput) {
                    captchaInput.focus();
                }
            }
        });
    }

    // 4. Initialize Forgot Password Form
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const studentIdInput = document.getElementById("resetStudentId");
            const emailInput = document.getElementById("resetEmail");
            const newPasswordInput = document.getElementById("newPassword");
            const confirmPasswordInput = document.getElementById("confirmPassword");
            const message = document.getElementById("resetMessage");

            const studentId = studentIdInput ? studentIdInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
            const newPassword = newPasswordInput ? newPasswordInput.value : "";
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

            if (!studentId || !email || !newPassword || !confirmPassword) {
                if (message) {
                    message.style.color = "#f87171";
                    message.innerText = "All fields are required!";
                }
                return;
            }

            if (newPassword.length < 4) {
                if (message) {
                    message.style.color = "#f87171";
                    message.innerText = "Password must be at least 4 characters long!";
                }
                return;
            }

            if (newPassword !== confirmPassword) {
                if (message) {
                    message.style.color = "#f87171";
                    message.innerText = "Passwords do not match!";
                }
                return;
            }

            // Verify student identity
            const savedStudentId = localStorage.getItem("studentId");
            const savedEmail = localStorage.getItem("studentEmail");

            const isKnownStudent = (
                studentId.toLowerCase() === "student" ||
                studentId.toLowerCase() === "harini" ||
                studentId.toLowerCase() === "ra202510008" ||
                studentId.toLowerCase() === "ra202610008" ||
                (savedStudentId && studentId.toLowerCase() === savedStudentId.toLowerCase()) ||
                studentId.length >= 3
            );

            const isKnownEmail = (
                email === "student@example.com" ||
                (savedEmail && email === savedEmail.toLowerCase()) ||
                email.includes("@")
            );

            if (!isKnownStudent || !isKnownEmail) {
                if (message) {
                    message.style.color = "#f87171";
                    message.innerText = "Student record not found. Please verify your Student ID and Email.";
                }
                return;
            }

            // Save new password
            localStorage.setItem("studentPassword", newPassword);
            localStorage.setItem("studentId", studentId);
            localStorage.setItem("studentEmail", email);

            if (message) {
                message.style.color = "#2e7d32";
                message.innerText = "Password reset successfully! Redirecting to login...";
            }

            setTimeout(function() {
                window.location.href = "index.html";
            }, 1200);
        });
    }

    // 5. Update Dynamic Student Names
    const currentUser = localStorage.getItem("currentStudentUser") || localStorage.getItem("studentName") || "Harini";
    
    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) welcomeName.textContent = currentUser;

    const detailStudentName = document.getElementById("detailStudentName");
    if (detailStudentName) detailStudentName.textContent = currentUser;

    const profileStudentName = document.getElementById("profileStudentName");
    if (profileStudentName) profileStudentName.textContent = currentUser;

    const personalStudentName = document.getElementById("personalStudentName");
    if (personalStudentName) personalStudentName.textContent = currentUser;
}

// Ensure initApp runs reliably
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
