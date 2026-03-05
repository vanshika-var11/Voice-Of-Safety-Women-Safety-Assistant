import { View, Text, TouchableOpacity } from "react-native";
//import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
    >
      {/* Logout Button (left) */}
      <TouchableOpacity
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        }}
        style={{
          backgroundColor: "#ff4d4d",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 6,
        }}
      >
      <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>

      {/* App Title */}
      <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "right" }}>
      Women Safety Assistant
      </Text>

    </View>
  );
}
