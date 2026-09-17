const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function geocodeAddress(address) {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "job-tracker-app" },
  });
  const data = await res.json();

  if (!data.length) {
    const err = new Error(`Alamat "${address}" tidak ditemukan`);
    err.statusCode = 422;
    throw err;
  }

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function calculateRoute({ fromLat, fromLng, toLat, toLng }) {
  const url = `${OSRM_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    const err = new Error("Rute tidak dapat dihitung untuk koordinat ini");
    err.statusCode = 422;
    throw err;
  }

  const route = data.routes[0];

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: Math.round(route.duration / 60),
    geometry: route.geometry.coordinates,
  };
}

export { geocodeAddress, calculateRoute };
