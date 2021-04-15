import "@babel/polyfill";

import { login, logout } from "./login";

import { signup } from "./signup";

import { updateSettings } from "./updateSettings";

import { displayMap } from "./mapbox";

import { bookTour } from "./stripe";

// dom elements
const loginForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const dataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const map = document.querySelector("#map");
const savePasswordBtn = document.querySelector(".btn--save-password");
const logoutBtn = document.querySelector(".nav__el--logout");
const bookTourBtn = document.querySelector("#book-tour");

if (loginForm)
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    loginForm.querySelector("button").textContent = "Logging in....";
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await login(email, password);
    loginForm.querySelector("button").textContent = "Log in";
  });

if (signupForm)
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    signupForm.querySelector("button").textContent = "Signing up....";
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await signup(name, email, password, passwordConfirm);
    signupForm.querySelector("button").textContent = "Sign up";
  });

if (dataForm)
  dataForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);

    const file = document.getElementById("photo").files[0];

    if (file) formData.append("photo", file, file.name);

    updateSettings(formData, "data");
  });

if (passwordForm)
  passwordForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    savePasswordBtn.innerHTML = "Updating...";
    const oldPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { oldPassword, password, passwordConfirm },
      "password"
    );
    savePasswordBtn.innerHTML = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });

if (map) displayMap(JSON.parse(map.dataset.locations));

if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (bookTourBtn)
  bookTourBtn.addEventListener("click", e => {
    e.target.textContent = "Processing";
    bookTour(e.target.dataset.tourId);
  });
