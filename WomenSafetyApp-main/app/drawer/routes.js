import axios from "axios";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { getDistance } from "geolib";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

// Safety color mapping
const safetyColors = {
  Emergency: "red",
  Public: "green",
  Commercial: "blue",
};

// Convert OSM tags to simple safety type
const getSafetyType = (tags) => {
  if (tags.amenity && ["police", "hospital"].includes(tags.amenity)) return "Emergency";
  if (tags.leisure && tags.leisure === "park") return "Public";
  if (tags.shop) return "Commercial";
  return "Public";
};

export default function SafeRoutes() {
  const [userLocation, setUserLocation] = useState(null);
  const [safeZones, setSafeZones] = useState([]);
  const [crimeZones, setCrimeZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [highlightedCard, setHighlightedCard] = useState(null);

  const mapRef = useRef();
  const scrollRef = useRef();

  // 1️⃣ Get User Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // 2️⃣ Fetch crime locations from Supabase
  useEffect(() => {
    const fetchCrimeZones = async () => {
      const { data, error } = await supabase.from("crime_locations").select("*");
      if (error) {
        console.log("Supabase fetch error:", error);
        return;
      }
      const formatted = data.map((item) => ({
        id: item.id,
        name: item.location_name,
        coordinates: { latitude: item.latitude, longitude: item.longitude },
        description: item.description,
      }));
      setCrimeZones(formatted);
    };
    fetchCrimeZones();
  }, []);

  // 3️⃣ Alert when user enters crime danger zone
  useEffect(() => {
    if (!userLocation || crimeZones.length === 0) return;
    crimeZones.forEach((zone) => {
      const dist = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: zone.coordinates.latitude, longitude: zone.coordinates.longitude }
      );
      if (dist <= 500) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Danger Zone Nearby",
            body: `Crime reported near ${zone.name}. Stay alert.`,
          },
          trigger: null,
        });
      }
    });
  }, [userLocation, crimeZones]);

  // 4️⃣ Fetch Safe Zones from OSM via Overpass
  useEffect(() => {
    if (!userLocation) return;

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node(around:1500,${userLocation.latitude},${userLocation.longitude})[amenity~"hospital|police"];
        node(around:1500,${userLocation.latitude},${userLocation.longitude})[leisure=park];
        node(around:1500,${userLocation.latitude},${userLocation.longitude})[shop];
      );
      out body;
    `;

    axios
      .post("https://overpass.kumi.systems/api/interpreter", overpassQuery, {
        headers: { "Content-Type": "text/plain" },
      })
      .then((res) => {
        const zones = res.data.elements.map((el) => ({
          id: el.id,
          name: el.tags.name || "Unnamed",
          type: getSafetyType(el.tags),
          coordinates: { latitude: el.lat, longitude: el.lon },
          description: el.tags.amenity || el.tags.leisure || el.tags.shop || "Public area",
        }));
        setSafeZones(zones);
      })
      .catch((err) => console.log("Overpass fetch error:", err));
  }, [userLocation]);

  // 5️⃣ Fit all markers on map
  useEffect(() => {
    if (userLocation && safeZones.length && mapRef.current) {
      const coordinates = [userLocation, ...safeZones.map((z) => z.coordinates)];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [safeZones, userLocation]);

  // 6️⃣ Scroll to selected card
  useEffect(() => {
    if (selectedZone && scrollRef.current) {
      const index = safeZones.findIndex((z) => z.id === selectedZone.id);
      scrollRef.current.scrollTo({ x: index * (width * 0.8 + 16), animated: true });
      setHighlightedCard(selectedZone.id);
      setTimeout(() => setHighlightedCard(null), 3000);
    }
  }, [selectedZone]);

  const handleEmergencyCall = () => {
    Linking.openURL("tel:112");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Safe Routes & Zones</Text>

      {/* Current Location */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Current Location</Text>
        <Text style={styles.cardText}>
          {userLocation
            ? `📍 ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
            : "📍 Getting your location..."}
        </Text>
      </View>

      {/* Safe Zone Cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 16 }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {safeZones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[styles.card, highlightedCard === zone.id ? styles.highlightedCard : null]}
            onPress={() => setSelectedZone(zone)}
          >
            <Text style={styles.cardTitle}>{zone.name}</Text>
            <Text style={styles.cardText}>{zone.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        {userLocation && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={userLocation}
          > 
            {/* User Marker */}
            <Marker coordinate={userLocation} title="You are here" pinColor="#6A0DAD" />

            {/* Safe Zone Markers */}
            {safeZones.map((zone) => (
              <Marker
                key={zone.id}
                coordinate={zone.coordinates}
                title={zone.name}
                description={zone.description}
                pinColor={safetyColors[zone.type]}
                onPress={() => setSelectedZone(zone)}
              />
            ))}

            {/* 🔴 Crime Zones: show only when user is within 500m */}
            {crimeZones.map((zone) => {
              const dist = getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: zone.coordinates.latitude, longitude: zone.coordinates.longitude }
              );

              if (dist <= 500) {
                return (
                  <Circle
                    key={`crime-${zone.id}`}
                    center={zone.coordinates}
                    radius={150} // smaller radius
                    strokeColor="rgba(255,0,0,0.8)"
                    fillColor="rgba(255,0,0,0.25)"
                  />
                );
              }
              return null;
            })}

            {/* Polyline */}
            {selectedZone && (
              <Polyline
                coordinates={[userLocation, selectedZone.coordinates]}
                strokeColor="green"
                strokeWidth={4}
              />
            )}
          </MapView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111827" },
  card: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  highlightedCard: { borderWidth: 2, borderColor: "#6A0DAD", transform: [{ scale: 1.05 }] },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  cardText: { fontSize: 14, color: "#4b5563" },
  mapContainer: { height: 400, borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  map: { flex: 1 },
  emergencyBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
});
