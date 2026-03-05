import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Fetch profile info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileError) console.error(profileError);
      else setProfile(profileData);

      // Fetch trusted contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", user.id);
      if (contactsError) console.error(contactsError);
      else setContacts(contactsData || []);

      // Fetch SOS alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("sos_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (alertsError) console.error(alertsError);
      else setSosAlerts(alertsData || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (isActive) await loadDashboardData();
      };
      fetchData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const features = [
    { icon: "🚨", title: "SOS Alerts", description: "Instant emergency alerts with location tracking", color: "#FF3B30", screen: "panic" },
    { icon: "📍", title: "Location Tracking", description: "Real-time location sharing with trusted contacts", color: "#6A0DAD", screen: "routes" },
    { icon: "👥", title: "Emergency Contacts", description: "Quick access to your trusted network", color: "#10B981", screen: "contacts" },
    { icon: "🤖", title: "AI Safety Tips", description: "Smart advice for various situations", color: "#8B5CF6", screen: "tips" },
  ];

  const quickStats = [
    { label: "Contacts", value: contacts.length, icon: "👥" },
    { label: "SOS Alerts", value: sosAlerts.length, icon: "🚨" },
    { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A", icon: "📅" },
    { label: "Status", value: "Active", icon: "🟢" }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
        </Text>
        <Text style={styles.heroSubtitle}>
          Your safety is our priority. Access all your safety features from one place.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.btnDanger} onPress={() => navigation.navigate("panic")}>
            <Text style={styles.btnText}>🚨 Send SOS Alert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate("contacts")}>
            <Text style={styles.btnText}>👥 Manage Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {quickStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Safety Features</Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { borderLeftColor: feature.color }]}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {sosAlerts.length > 0 ? (
          sosAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.activityCard}>
              <Text style={styles.activityDot}>●</Text>
              <Text style={styles.activityText}>
                SOS alert sent on {new Date(alert.created_at).toLocaleDateString()} at {new Date(alert.created_at).toLocaleTimeString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noActivity}>
            <Text style={{ fontSize: 36 }}>📱</Text>
            <Text style={styles.noActivityText}>No recent activity. Your safety log will appear here.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4B5563" },

  hero: { backgroundColor: "#6A0DAD", paddingVertical: 40, paddingHorizontal: 16, alignItems: "center" },
  heroTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 10 },
  heroSubtitle: { fontSize: 16, color: "#FBB6CE", textAlign: "center", marginBottom: 20 },
  heroButtons: { flexDirection: "row", gap: 16 },

  btnDanger: { backgroundColor: "#FF3B30", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginHorizontal: 5 },
  btnSecondary: { backgroundColor: "#FF69B4", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginHorizontal: 5 },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", padding: 16 },
  statCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, width: "45%", marginVertical: 8, alignItems: "center" },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#6A0DAD" },
  statLabel: { fontSize: 14, color: "#4B5563" },

  featuresContainer: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#111827" },
  featureCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 6 },
  featureIcon: { fontSize: 24, marginBottom: 8 },
  featureTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  featureDesc: { fontSize: 14, color: "#4B5563" },

  activityContainer: { paddingHorizontal: 16, marginTop: 20, marginBottom: 40 },
  activityCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 8 },
  activityDot: { color: "#FF3B30", marginRight: 8, fontSize: 12 },
  activityText: { fontSize: 14, color: "#4B5563", flexShrink: 1 },
  noActivity: { alignItems: "center", paddingVertical: 40 },
  noActivityText: { color: "#4B5563", fontSize: 14, textAlign: "center", marginTop: 8 },
});
