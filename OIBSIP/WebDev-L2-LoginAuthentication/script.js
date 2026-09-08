"use strict";

/*
    SecureGate
    Login Authentication System
    Oasis Infobyte - Web Development & Designing
*/


// ================================
// STORAGE KEYS
// ================================

const USERS_KEY = "securegate_users";
const SESSION_KEY = "securegate_session";


// ================================
// DOM ELEMENTS
// ================================

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const dashboardSection = document.getElementById("dashboard-section");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const registerName = document.getElementById("register-name");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const confirmPassword = document.getElementById("confirm-password");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");

const logoutButton = document.getElementById("logout-btn");

const switchButtons = document.querySelectorAll(".switch-btn");
const passwordToggles = document.querySelectorAll(".password-toggle");


// ================================
// INITIALIZATION
// ================================

document.addEventListener("DOMContentLoaded", () => {

    const session = getSession();

    if (session) {
        showDashboard(session);
    } else {
        showLogin();
    }

});


// ================================
// STORAGE HELPERS
// ================================

function getUsers() {

    try {

        const storedUsers = localStorage.getItem(USERS_KEY);

        if (!storedUsers) {
            return [];
        }

        const users = JSON.parse(storedUsers);

        return Array.isArray(users) ? users : [];

    } catch (error) {

        console.error("Could not read users:", error);

        return [];
    }
}


function saveUsers(users) {

    try {

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

        return true;

    } catch (error) {

        console.error("Could not save users:", error);

        return false;
    }
}


function getSession() {

    try {

        const session = localStorage.getItem(SESSION_KEY);

        return session
            ? JSON.parse(session)
            : null;

    } catch (error) {

        console.error("Could not read session:", error);

        return null;
    }
}


function saveSession(user) {

    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        })
    );
}


function clearSession() {

    localStorage.removeItem(SESSION_KEY);
}


// ================================
// PASSWORD HASHING
// ================================

async function hashPassword(password) {

    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// ================================
// VALIDATION
// ================================

function isValidPassword(password) {

    const minimumLength = password.length >= 8;
    const containsNumber = /\d/.test(password);

    return minimumLength && containsNumber;
}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ================================
// REGISTER
// ================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage(registerMessage);

        const name = registerName.value.trim();
        const email = registerEmail.value
            .trim()
            .toLowerCase();

        const password = registerPassword.value;
        const confirmation = confirmPassword.value;


        // Name validation

        if (name.length < 2) {

            showMessage(
                registerMessage,
                "Please enter a valid name.",
                "error"
            );

            registerName.focus();

            return;
        }


        // Email validation

        if (!isValidEmail(email)) {

            showMessage(
                registerMessage,
                "Please enter a valid email address.",
                "error"
            );

            registerEmail.focus();

            return;
        }


        // Password validation

        if (!isValidPassword(password)) {

            showMessage(
                registerMessage,
                "Password must be at least 8 characters and include one number.",
                "error"
            );

            registerPassword.focus();

            return;
        }


        // Confirm password

        if (password !== confirmation) {

            showMessage(
                registerMessage,
                "Passwords do not match.",
                "error"
            );

            confirmPassword.focus();

            return;
        }


        // Check duplicate account

        const users = getUsers();

        const accountExists = users.some(
            user => user.email === email
        );

        if (accountExists) {

            showMessage(
                registerMessage,
                "An account with this email already exists.",
                "error"
            );

            registerEmail.focus();

            return;
        }


        // Hash password

        const passwordHash =
            await hashPassword(password);


        // Create user

        const newUser = {

            id: createUserId(),

            name: name,

            email: email,

            passwordHash: passwordHash,

            createdAt: new Date().toISOString()
        };


        users.push(newUser);


        if (!saveUsers(users)) {

            showMessage(
                registerMessage,
                "Unable to create the account. Please try again.",
                "error"
            );

            return;
        }


        // Clear registration fields

        registerForm.reset();


        // Show success

        showMessage(
            registerMessage,
            "Account created successfully. You can now sign in.",
            "success"
        );


        // Switch to login after a short delay

        setTimeout(() => {

            showLogin();

            loginEmail.value = email;

            loginPassword.focus();

        }, 900);

    }
);


// ================================
// LOGIN
// ================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage(loginMessage);

        const email = loginEmail.value
            .trim()
            .toLowerCase();

        const password = loginPassword.value;


        if (!isValidEmail(email)) {

            showMessage(
                loginMessage,
                "Please enter a valid email address.",
                "error"
            );

            loginEmail.focus();

            return;
        }


        if (!password) {

            showMessage(
                loginMessage,
                "Please enter your password.",
                "error"
            );

            loginPassword.focus();

            return;
        }


        const users = getUsers();

        const passwordHash =
            await hashPassword(password);


        const user = users.find(
            item =>
                item.email === email &&
                item.passwordHash === passwordHash
        );


        // Generic credential error

        if (!user) {

            showMessage(
                loginMessage,
                "Incorrect email or password.",
                "error"
            );

            return;
        }


        // Create session

        saveSession(user);


        loginForm.reset();


        showDashboard(user);

    }
);


// ================================
// LOGOUT
// ================================

logoutButton.addEventListener(
    "click",
    () => {

        clearSession();

        dashboardSection.classList.remove("active");

        showLogin();

        loginForm.reset();

        loginEmail.focus();

    }
);


// ================================
// SWITCH LOGIN / REGISTER
// ================================

switchButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const destination =
                button.dataset.switch;

            if (destination === "register") {

                showRegister();

            } else {

                showLogin();

            }

        }
    );

});


// ================================
// SHOW LOGIN
// ================================

function showLogin() {

    loginSection.classList.add("active");

    registerSection.classList.remove("active");

    dashboardSection.classList.remove("active");

    clearMessage(registerMessage);
    clearMessage(loginMessage);
}


// ================================
// SHOW REGISTER
// ================================

function showRegister() {

    loginSection.classList.remove("active");

    registerSection.classList.add("active");

    dashboardSection.classList.remove("active");

    clearMessage(loginMessage);
    clearMessage(registerMessage);

    setTimeout(() => {
        registerName.focus();
    }, 0);
}


// ================================
// SHOW DASHBOARD
// ================================

function showDashboard(user) {

    loginSection.classList.remove("active");

    registerSection.classList.remove("active");

    dashboardSection.classList.add("active");


    userName.textContent = user.name;

    userEmail.textContent = user.email;
}


// ================================
// MESSAGES
// ================================

function showMessage(element, text, type) {

    element.textContent = text;

    element.className = `message ${type}`;
}


function clearMessage(element) {

    element.textContent = "";

    element.className = "message";
}


// ================================
// PASSWORD VISIBILITY
// ================================

passwordToggles.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);


            if (input.type === "password") {

                input.type = "text";

                button.textContent = "Hide";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                button.textContent = "Show";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        }
    );

});


// ================================
// USER ID
// ================================

function createUserId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}