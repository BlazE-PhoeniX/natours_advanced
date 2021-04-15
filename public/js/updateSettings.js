import { showAlert } from "./alert";

export const updateSettings = async function (data, type) {
  // data = JSON.stringify(data);
  // console.log(data);

  const res = await (
    await fetch(
      `http://127.0.0.1:3000/api/v1/users/${
        type === "password" ? "update-password" : "update-profile"
      }`,
      {
        method: "PATCH",
        body: data,
        // headers: {
        //   "Content-Type": "application/json",
        // },
      }
    )
  ).json();

  if (res.status === "success") {
    showAlert("success", res.message);
  } else {
    showAlert("error", res.message);
  }
};
