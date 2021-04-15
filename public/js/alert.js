export const hideAlert = function () {
  const alert = document.querySelector(".alert");
  if (alert) alert.parentElement.removeChild(alert);
};

export const showAlert = function (type, msg) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  setTimeout(hideAlert, 3000);
};
