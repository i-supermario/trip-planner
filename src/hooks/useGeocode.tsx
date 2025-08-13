import { useState, useEffect } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

export function useGeocode(placeName: string): GeocodeResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName) {
      setCoords(null);
      setError(null);
      return;
    }

    async function fetchGeocode() {
      setLoading(true);
      setError(null);

      try {
        const encodedPlace = encodeURIComponent(placeName);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedPlace}&key=${GOOGLE_MAPS_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "OK" && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCoords({ lat: location.lat, lng: location.lng });
          console.log(location)
        } else {
          setError(`No results found for "${placeName}"`);
          setCoords(null);
        }
      } catch (err) {
        setError("Failed to fetch geocode data");
        setCoords(null);
      } finally {
        setLoading(false);
      }
    }

    fetchGeocode();
  }, [placeName]);

  return { coords, loading, error };
}
