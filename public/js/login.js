import { showAlert } from "./alert";

export const login = async (email, password) => {
  const res = await (
    await fetch("/api/v1/users/login", {
      method: "post",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (res.status === "success") {
    showAlert("success", res.message);
    setTimeout(() => {
      location.assign("/");
    }, 1500);
  } else {
    showAlert("error", res.message);
  }
};

export const logout = async () => {
  const res = await (await fetch("/api/v1/users/logout")).json();

  if (res.status === "success") {
    showAlert("success", res.message);
    setTimeout(() => {
      location.assign("/");
    }, 1000);
  } else {
    showAlert("error", res.message);
  }
};
