"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
}

interface MultiDayRouteData {
  start: Stop;
  destination: Stop;
  [key: `day-${number}`]: { stops: Stop[] };
}

interface RouteMapProps {
  routeData: MultiDayRouteData;
  defaultOptimize?: boolean;
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const colors = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"];

export default function MapView({ routeData, defaultOptimize = false }: RouteMapProps) {
  const [directionsByDay, setDirectionsByDay] = useState<(google.maps.DirectionsResult | null)[]>([]);
  const [optimize, setOptimize] = useState(defaultOptimize);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  // For centering map dynamically
  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoad = (mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
  };

  const dayKeys = Object.keys(routeData).filter((key) => key.startsWith("day-")).sort();

  const generateRoutesByDay = useCallback(() => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    const routePromises: Promise<google.maps.DirectionsResult | null>[] = [];

    for (let i = 0; i < dayKeys.length; i++) {
      const dayKey = dayKeys[i];
      const stops = routeData[dayKey].stops;

      if (stops.length === 0) {
        routePromises.push(Promise.resolve(null));
        continue;
      }

      const origin =
        i === 0
          ? new google.maps.LatLng(routeData.start.latitude, routeData.start.longitude)
          : new google.maps.LatLng(
              routeData[dayKeys[i - 1]].stops.slice(-1)[0].latitude,
              routeData[dayKeys[i - 1]].stops.slice(-1)[0].longitude
            );

      const destination =
        i === dayKeys.length - 1
          ? new google.maps.LatLng(routeData.destination.latitude, routeData.destination.longitude)
          : new google.maps.LatLng(stops.slice(-1)[0].latitude, stops.slice(-1)[0].longitude);

      const waypoints =
        stops.length > 1
          ? stops.slice(0, stops.length - 1).map((stop) => ({
              location: new google.maps.LatLng(stop.latitude, stop.longitude),
              stopover: true,
            }))
          : [];

      const routePromise = new Promise<google.maps.DirectionsResult | null>((resolve) => {
        directionsService.route(
          {
            origin,
            destination,
            waypoints,
            optimizeWaypoints: optimize,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              resolve(result);
            } else {
              console.error(`Directions request failed for ${dayKey}`, status);
              resolve(null);
            }
          }
        );
      });

      routePromises.push(routePromise);
    }

    Promise.all(routePromises).then((results) => {
      setDirectionsByDay(results);
      setSelectedDayIndex(0); // reset to day 1 when routes update
    });
  }, [routeData, optimize, isLoaded, dayKeys]);

  useEffect(() => {
    generateRoutesByDay();
  }, [generateRoutesByDay]);

  // Center map on selected day's origin
  useEffect(() => {
    if (!mapRef.current || directionsByDay.length === 0) return;
    const directions = directionsByDay[selectedDayIndex];
    if (!directions) return;

    // The origin point is in directions.routes[0].legs[0].start_location
    const origin = directions.routes[0].legs[0].start_location;
    if (origin) {
      mapRef.current.panTo(origin);
      mapRef.current.setZoom(10);
    }
  }, [selectedDayIndex, directionsByDay]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div className="space-y-4">
      {/* Optimization Toggle */}
      <div className="flex items-center space-x-4">
        <Checkbox
          id="optimize"
          checked={optimize}
          onCheckedChange={(checked) => setOptimize(!!checked)}
        />
        <Label htmlFor="optimize">Optimize Route</Label>

        {/* Day Selector */}
        <select
          value={selectedDayIndex}
          onChange={(e) => setSelectedDayIndex(parseInt(e.target.value, 10))}
          className="border rounded px-2 py-1"
        >
          {dayKeys.map((dayKey, idx) => (
            <option key={dayKey} value={idx}>
              {dayKey.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: routeData.start.latitude,
          lng: routeData.start.longitude,
        }}
        zoom={8}
        onLoad={onLoad}
      >
        {directionsByDay[selectedDayIndex] && (
          <DirectionsRenderer
            directions={directionsByDay[selectedDayIndex]!}
            options={{
              polylineOptions: {
                strokeColor: colors[selectedDayIndex % colors.length],
                strokeWeight: 5,
              },
              markerOptions: {
                visible: true,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
