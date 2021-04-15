export const displayMap = locations => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYmxhemVwaG9lbml4IiwiYSI6ImNrbmFkNXJiYjBtcTYzMG55NHNycmlwdHYifQ.atR50NlMkXlMTn52AxgrfA";

  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/blazephoenix/cknbiztr10pyv17r0yr7dkahj",
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  for (let loc of locations) {
    const el = document.createElement("div");
    el.className = "marker";

    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  }

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      right: 100,
      bottom: 150,
      left: 100,
    },
  });
};
