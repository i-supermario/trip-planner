"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Stop {
  name: string;
  latitude?: number;
  longitude?: number;
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

export default function MapLinks({ routeData, defaultOptimize = false }: RouteMapProps) {
  const [optimize, setOptimize] = useState(defaultOptimize);
  const [links, setLinks] = useState<string[]>([]);
  const dayKeys = Object.keys(routeData).filter((key) => key.startsWith("day-")).sort();

  const fetchOptimizedRoute = async (dayKey: `day-${number}`) => {
    const stops = routeData[dayKey].stops;
    if (stops.length === 0) return "#";

    // Get total number of days
    const dayNumbers = Object.keys(routeData)
      .filter(k => k !== "start" && k !== "destination")
      .sort();
    const firstDayKey = dayNumbers[0];
    const lastDayKey = dayNumbers.at(-1);

    // Determine origin and destination for the current day
    let origin;
    let destination;

    if (dayKey === firstDayKey) {
      origin = routeData.start.name;
    } else {
      origin = stops[0].name;
    }

    if (dayKey === lastDayKey) {
      destination = routeData.destination.name;
    } else {
      destination = stops.at(-1).name;
    }

    // Determine intermediate stops
    // For first day: exclude the first stop if it's same as origin
    // For last day: exclude the last stop if it's same as destination
    // For middle days: exclude both first and last stops
    let intermediates;
    if (dayKey === firstDayKey) {
      intermediates = stops.slice(0, -1);
    } else if (dayKey === lastDayKey) {
      intermediates = stops.slice(1);
    } else {
      intermediates = stops.slice(1, -1);
    }

    intermediates = intermediates.map(stop => ({
      address: stop.name
    }));

    const body = {
      origin: { address: origin },
      destination: { address: destination },
      intermediates,
      travelMode: "DRIVE",
      optimizeWaypointOrder: optimize
    };


    console.log(body)

    try {
      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
            "X-Goog-FieldMask":
              "routes,geocodingResults.intermediates.intermediateWaypointRequestIndex",
          },
          body: JSON.stringify(body),
        }
      );

      console.log(res);

      const data = await res.json();
      console.log(data)


      if (data.routes && data.routes.length > 0) {
        // Extract optimized order
        const order = data.geocodingResults?.intermediates?.map(
          (wp: any) => wp.intermediateWaypointRequestIndex
        );

        let orderedStops = intermediates;
        if (order && optimize) {
          orderedStops = order.map((i: number) => intermediates[i]);
        }

        const waypointsString = orderedStops.map((wp) => wp.address).join("|");

        const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(
          destination
        )}&waypoints=${encodeURIComponent(
          waypointsString
        )}&travelmode=driving`;

        return gmapsUrl;
      }
    } catch (error) {
      console.error("Error fetching optimized route:", error);
    }
    return "#";
  };

  const handleGenerateLinks = async () => {
    const allLinks: string[] = [];
    for (const dayKey of dayKeys) {
      const link = await fetchOptimizedRoute(dayKey);
      allLinks.push(link);
    }
    setLinks(allLinks);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Toggle */}
      <div className="flex items-center space-x-4">
        <Checkbox
          id="optimize"
          checked={optimize}
          onCheckedChange={(checked) => setOptimize(!!checked)}
        />
        <Label htmlFor="optimize">Optimize Route</Label>
        <button
          onClick={handleGenerateLinks}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Generate Links
        </button>
      </div>

      {/* Links */}
      <div className="space-y-2">
        {links.map((link, idx) => (
          <div key={idx}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open {dayKeys[idx].toUpperCase()} Route in Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
