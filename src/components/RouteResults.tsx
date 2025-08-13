"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { useGeocode } from "@/hooks/useGeocode";

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

interface RouteProps {
  route: MultiDayRouteData;
  error?: string | null;
}

function StopItem({ stop, index }: { stop: Stop; index: number }) {
  // const { coords, loading, error } = useGeocode(stop.name);

  return (
    <motion.div
      layout
      className="border rounded-md p-3 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h4 className="font-semibold">Stop {index + 1}</h4>
      <p className="font-medium">{stop.name}</p>
      {/* {loading && <p className="text-sm text-gray-500">Fetching details...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {coords && ( */}
        <div className="text-sm text-gray-600">
          <p>📍 Latitude: {stop.latitude}</p>
          <p>📍 Longitude: {stop.longitude}</p>
        </div>
      {/* )} */}
      {/* {!loading && !coords && !error && (
        <p className="text-sm text-gray-500">No additional data available.</p>
      )} */}
    </motion.div>
  );
}

function DaySection({ dayLabel, stops }: { dayLabel: string; stops: Stop[] }) {
  return (
    <AccordionItem value={dayLabel}>
      <AccordionTrigger className="font-bold">{dayLabel}</AccordionTrigger>
      <AccordionContent>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {stops.map((stop, i) => (
            <StopItem key={`${stop.name}-${i}`} stop={stop} index={i} />
          ))}
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function RouteDisplay({ route, error }: RouteProps) {
  if (!route.start) {
    return (
      <Card className="shadow-lg border-none w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Suggested Route
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          No route available.
        </CardContent>
      </Card>
    );
  }

  const dayKeys = Object.keys(route).filter((key) => key.startsWith("day-"));

  return (
    <Card className="shadow-lg border-none w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Suggested Route
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <motion.p
            className="text-red-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Start */}
        <div className="p-4 rounded-md bg-green-100 border border-green-300">
          <h4 className="font-semibold">Start</h4>
          <p className="font-medium">{route.start.name}</p>
          {typeof route.start.latitude === "number" &&
            typeof route.start.longitude === "number" && (
              <p className="text-sm text-gray-600">
                📍 {route.start.latitude}, {route.start.longitude}
              </p>
            )}
        </div>

        {/* Days */}
        <Accordion type="single" collapsible className="w-full">
          {dayKeys.map((dayKey) => (
            <DaySection
              key={dayKey}
              dayLabel={dayKey.replace("-", " ").toUpperCase()}
              stops={route[dayKey].stops || []}
            />
          ))}
        </Accordion>

        {/* Destination */}
        <div className="p-4 mt-4 rounded-md bg-red-100 border border-red-300">
          <h4 className="font-semibold">Destination</h4>
          <p className="font-medium">{route.destination.name}</p>
          {typeof route.destination.latitude === "number" &&
            typeof route.destination.longitude === "number" && (
              <p className="text-sm text-gray-600">
                📍 {route.destination.latitude}, {route.destination.longitude}
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
