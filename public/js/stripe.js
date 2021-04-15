import { showAlert } from "./alert";

export const bookTour = async tourId => {
  const stripe = Stripe(
    "pk_test_51Ig93XSGuKtLVB8egl2JCpRxqpcuSD5Hk4AKntFivk8wMgzIw9ClLWGzY0Cl6vDGX2zMuirISYV86xMKmp6tbeF500DNzjSTQd"
  );

  try {
    const response = await (await fetch(`/bookings/checkout/${tourId}`)).json();

    stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
