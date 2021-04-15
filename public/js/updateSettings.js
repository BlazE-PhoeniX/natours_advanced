import { showAlert } from "./alert";

export const updateSettings = async function (data, type) {
  const res = await (
    await fetch(
      `http://127.0.0.1:3000/api/v1/users/${
        type === "password" ? "update-password" : "update-profile"
      }`,
      {
        method: "PATCH",
        body: data,
      }
    )
  ).json();

  if (res.status === "success") {
    showAlert("success", res.message);
  } else {
    showAlert("error", res.message);
  }
};
