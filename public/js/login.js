document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        let submitButton = event.target.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.innerText = "Logging...";

        let loginEmail = document.getElementById('loginEmail').value.trim();
        let loginContactNumber = document.getElementById('loginContactNumber').value.trim();

        // ================= VALIDATION =================
        let isValid = true;

        const loginEmailError = document.getElementById('loginEmailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(loginEmail)) {
            loginEmailError.style.display = 'block';
            isValid = false;
        } else {
            loginEmailError.style.display = 'none';
        }

        const loginContactNumberError = document.getElementById('loginContactNumberError');
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(loginContactNumber)) {
            loginContactNumberError.style.display = 'block';
            isValid = false;
        } else {
            loginContactNumberError.style.display = 'none';
        }

        if (!isValid) {
            submitButton.disabled = false;
            submitButton.innerText = "Login";
            return;
        }

        // ================= LOGIN API =================
        try {
            console.log("Sending login request...");

            let response = await fetch("http://localhost:3000/login", { // ✅ FIXED URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // ✅ VERY IMPORTANT
                body: JSON.stringify({
                    email: loginEmail,
                    contactNumber: loginContactNumber
                })
            });

            let result = await response.json();

            console.log("Response:", result);

            if (response.ok) {
                // ✅ Store user locally (optional)
                localStorage.setItem("playerEmail", loginEmail);

                // ✅ Redirect
                window.location.href = result.redirectUrl;

            } else {
                alert(result.message || "Login failed");
                submitButton.disabled = false;
                submitButton.innerText = "Login";
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Server error. Try again.");
            submitButton.disabled = false;
            submitButton.innerText = "Login";
        }
    });
});