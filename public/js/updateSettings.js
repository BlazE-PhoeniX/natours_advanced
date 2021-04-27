import { showAlert } from "./alert";

export const updateSettings = async function (data, type) {
  const res = await (
    await fetch(
      `/api/v1/users/${
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
