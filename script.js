// =========================================
// VALIDATION FUNCTIONS
// =========================================

// Validate Email Format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Password (Minimum 6 characters)
function isValidPassword(password) {
    return password.length >= 6;
}

// Show Error Message
function showError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let errorDiv = formGroup.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    input.classList.add('error');
    input.classList.remove('success');
}

// Clear Error Message
function clearError(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorDiv = formGroup.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.textContent = '';
    }
    
    input.classList.remove('error');
    input.classList.add('success');
}

// =========================================
// LOGIN FORM VALIDATION
// =========================================

function validateLogin() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let isValid = true;

    // Clear previous errors
    clearError(email);
    clearError(password);

    // Validate Email
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Invalid email format');
        isValid = false;
    }

    // Validate Password
    if (!password.value.trim()) {
        showError(password, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(password.value)) {
        showError(password, 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

// =========================================
// SIGNUP FORM VALIDATION
// =========================================

function validateSignup() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    let isValid = true;

    // Clear previous errors
    clearError(name);
    clearError(email);
    clearError(password);
    clearError(confirmPassword);

    // Validate Name
    if (!name.value.trim()) {
        showError(name, 'Name is required');
        isValid = false;
    }

    // Validate Email
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Invalid email format');
        isValid = false;
    }

    // Validate Password
    if (!password.value.trim()) {
        showError(password, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(password.value)) {
        showError(password, 'Password must be at least 6 characters');
        isValid = false;
    }

    // Validate Confirm Password
    if (!confirmPassword.value.trim()) {
        showError(confirmPassword, 'Please confirm your password');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

// =========================================
// PROFILE FORM VALIDATION
// =========================================

function validateProfile() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    let isValid = true;

    clearError(name);
    clearError(email);
    clearError(phone);

    if (!name.value.trim()) {
        showError(name, 'Name is required');
        isValid = false;
    }

    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Invalid email format');
        isValid = false;
    }

    if (phone.value && phone.value.length < 10) {
        showError(phone, 'Phone number must be at least 10 digits');
        isValid = false;
    }

    return isValid;
}

// =========================================
// SETTINGS FORM VALIDATION
// =========================================

function validateSettings() {
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    let isValid = true;

    clearError(currentPassword);
    clearError(newPassword);
    clearError(confirmPassword);

    // Only validate if user is changing password
    if (currentPassword.value || newPassword.value) {
        if (!currentPassword.value.trim()) {
            showError(currentPassword, 'Current password is required');
            isValid = false;
        }

        if (!newPassword.value.trim()) {
            showError(newPassword, 'New password is required');
            isValid = false;
        } else if (!isValidPassword(newPassword.value)) {
            showError(newPassword, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword.value.trim()) {
            showError(confirmPassword, 'Please confirm your new password');
            isValid = false;
        } else if (newPassword.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
    }

    return isValid;
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateLogin()) {
                handleLogin(e);
            }
        });
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateSignup()) {
                handleSignup(e);
            }
        });
    }

    // Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateProfile()) {
                alert('Profile updated successfully!');
            }
        });
    }

    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateSettings()) {
                alert('Settings updated successfully!');
            }
        });
    }
});

// =========================================
// LOGIN LOGIC (Single Function)
// =========================================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple mock authentication logic
    if (email === "admin@seantech.com" && password === "admin123") {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Admin User');
        alert("Login Successful! Welcome Admin.");
        
        // Redirect based on role
        if (localStorage.getItem('userRole') === 'admin') {
            window.location.href = "admin.html";
        } else {
            window.location.href = "profile.html";
        }
    } else if (email === "user@demo.com" && password === "user123") {
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userName', 'Demo User');
        alert("Login Successful! Welcome User.");
        window.location.href = "profile.html";
    } else {
        alert("Invalid credentials");
    }
}

// =========================================
// SIGNUP LOGIC
// =========================================

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    alert("Signup Successful! Please log in.");
    window.location.href = "login.html";
}