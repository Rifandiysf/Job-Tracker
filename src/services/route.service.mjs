const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function geocodeAddress(address) {
  const queries = [
    address,
    address.replace(/\bNo\.?\s*\d+\b/gi, ""),
    address
      .replace(/\bNo\.?\s*\d+\b/gi, "")
      .replace(/Kec\.?\s*[^,]+,?/gi, "")
      .replace(/\b\d{5}\b/g, ""),
    address
      .replace(/\bNo\.?\s*\d+\b/gi, "")
      .replace(/Kec\.?\s*[^,]+,?/gi, "")
      .replace(/\b\d{5}\b/g, ""),
  ];

  const uniqueQueries = [
    ...new Set(
      queries.map((query) =>
        query.replace(/\s+/g, " ").replace(/,\s*,/g, ",").trim()
      )
    ),
  ];

  for (const query of uniqueQueries) {
    console.log("Mencoba geocode:", query);

    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      countrycodes: "id",
      addressdetails: "1",
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent": "jobfin/1.0",
        "Accept-Language": "id",
      },
    });

    if (!res.ok) {
      console.log("Nominatim error:", res.status);
      continue;
    }

    const data = await res.json();

    console.log("Hasil:", data);

    if (data.length > 0) {
      const result = data[0];

      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
  }

  const err = new Error(
    `Alamat "${address}" tidak ditemukan`
  );

  err.statusCode = 422;

  throw err;
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
