import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function DrawerContent(props) {
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Menu</Text>
      </View>

      <DrawerItem label="Dashboard" onPress={() => router.push("/drawer/home")} />
      <DrawerItem label="SOS Alert" onPress={() => router.push("/drawer/panic")} />
      <DrawerItem label="Contacts" onPress={() => router.push("/drawer/contacts")} />
      <DrawerItem label="Safe Routes" onPress={() => router.push("/drawer/routes")} />
      <DrawerItem label="Safety Tips" onPress={() => router.push("/drawer/tips")} />
      <DrawerItem label="Profile" onPress={() => router.push("/drawer/profile")} />

    </DrawerContentScrollView>
  );
}
