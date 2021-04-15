import { showAlert } from "./alert";

export const signup = async (name, email, password, passwordConfirm) => {
  const res = await (
    await fetch("http://127.0.0.1:3000/api/v1/users/signup", {
      method: "post",
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirm,
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
