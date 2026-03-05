import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      // 2️⃣ Create profile in profiles table
      if (data.user) {
        const emailUsername = data.user.email ? data.user.email.split("@")[0] : "";
      
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              full_name: emailUsername, // pre-fill from email
              phone: "",
            },
          ]);
      
        if (profileError) throw profileError;
      }

      setMessage("Signup successful!");
      router.push("/login");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 30, marginBottom: 20 }}>Signup</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {message ? (
        <Text style={{ color: message.startsWith("Error") ? "red" : "green", marginBottom: 10 }}>
          {message}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSignup}
        style={{ backgroundColor: "purple", padding: 15, borderRadius: 8, marginBottom: 20 }}
        disabled={loading}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {loading ? "Signing up..." : "Signup"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={{ textAlign: "center", color: "blue" }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
