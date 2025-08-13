"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRoutePlanner from "@/hooks/usePlanner";
import { Loader2 } from "lucide-react";
import RouteDisplay from "@/components/RouteResults";
import MapView from "@/components/MapView"; // New map component

export default function TripPreferences() {
  const [days, setDays] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [travelPace, setTravelPace] = useState("");
  const [includeMeals, setIncludeMeals] = useState(false);
  const [lunchPref, setLunchPref] = useState("");
  const [dinnerPref, setDinnerPref] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const { loading, error, route, getRouteSuggestions } = useRoutePlanner();

  const interestsList = [
    "Nature",
    "History",
    "Museums",
    "Food",
    "Shopping",
    "Nightlife",
    "Adventure",
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests((prev) => [...prev, interest]);
    } else {
      setInterests((prev) => prev.filter((item) => item !== interest));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      days,
      startPoint,
      destination,
      interests,
      travelPace,
      includeMeals,
      lunchPref,
      dinnerPref,
      budget,
      notes,
    };
    await getRouteSuggestions(formData);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Preferences Form */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Trip Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Trip Length */}
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="days">Length of Trip (in days)</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </div>

                {/* Locations */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="start">Starting Point</Label>
                    <Input
                      id="start"
                      type="text"
                      placeholder="City or Location"
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      type="text"
                      placeholder="City or Location"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="flex flex-col gap-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {interestsList.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={interests.includes(interest)}
                          onCheckedChange={(checked) =>
                            handleInterestChange(interest, !!checked)
                          }
                        />
                        <Label htmlFor={interest}>{interest}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Travel Pace */}
                <div className="flex flex-col gap-y-2">
                  <Label>Travel Pace</Label>
                  <Select
                    value={travelPace}
                    onValueChange={(value) => setTravelPace(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Include Meals */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="meals"
                    checked={includeMeals}
                    onCheckedChange={(val) => setIncludeMeals(!!val)}
                  />
                  <Label htmlFor="meals">Include lunch & dinner in itinerary</Label>
                </div>

                {includeMeals && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    <div className="flex flex-col gap-y-2">
                      <Label>Lunch Preference</Label>
                      <Input
                        placeholder="e.g. Italian, Street Food"
                        value={lunchPref}
                        onChange={(e) => setLunchPref(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Dinner Preference</Label>
                      <Input
                        placeholder="e.g. Seafood, Vegan"
                        value={dinnerPref}
                        onChange={(e) => setDinnerPref(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Budget */}
                <div className="flex flex-col gap-y-2">
                  <Label>Budget Range</Label>
                  <Select
                    value={budget}
                    onValueChange={(value) => setBudget(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="mid">Mid-range</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Extra Notes */}
                <div className="flex flex-col gap-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Anything else we should know? Special requests, accessibility needs, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating...
                    </>
                  ) : (
                    "Generate Itinerary"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results in Tabs */}
          {route && (
            <Card className="shadow-lg w-2xl pt-0 border-none">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="list">Route List</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <RouteDisplay route={route} error={error} onReorderStops={() => {}} />
                </TabsContent>
                <TabsContent value="map">
                  <MapView routeData={route} />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </motion.div>
    </main>
  );
}
