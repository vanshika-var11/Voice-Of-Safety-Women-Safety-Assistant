import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (!user) throw new Error("No logged-in user");

      const userId = user.id;
      const emailUsername = user.email ? user.email.split("@")[0] : "";

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        full_name: data.full_name || emailUsername,
      });
    } catch (err) {
      console.error("Error loading profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", profile.id);

      if (error) throw error;
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7b4fff" />
      </View>
    );

  if (!profile)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading profile. Try again later.</Text>
      </View>
    );

  const inputStyle = (editable) => ({
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: editable ? "#fff" : "#e0e0e0",
    marginTop: 5,
  });

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Profile</Text>

      {/* Full Name */}
      <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16 }}>Full Name</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={{ color: "purple", fontWeight: "bold" }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        value={profile.full_name || ""}
        editable={isEditing}
        onChangeText={(value) => setProfile({ ...profile, full_name: value })}
        style={inputStyle(isEditing)}
      />

      {/* Phone */}
      <Text style={{ marginTop: 20 }}>Phone Number</Text>
      <TextInput
        value={profile.phone || ""}
        editable={isEditing}
        onChangeText={(value) => setProfile({ ...profile, phone: value })}
        style={inputStyle(isEditing)}
      />

      {/* Created At */}
      <Text style={{ marginTop: 20 }}>Member Since</Text>
      <TextInput
        value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
        editable={false}
        style={inputStyle(false)}
      />

      {/* Buttons */}
      {isEditing && (
        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
          <Button title={saving ? "Saving..." : "Save Changes"} onPress={updateProfile} disabled={saving} />
          <Button title="Cancel" color="gray" onPress={() => setIsEditing(false)} />
        </View>
      )}
    </View>
  );
}
