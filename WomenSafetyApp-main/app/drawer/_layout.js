import { Drawer } from "expo-router/drawer";
import Navbar from "../../components/Navbar";
import ShakeListener from "../../components/ShakeListener";


export default function DrawerLayout() {
  return (
    <>
    {/* ShakeListener is mounted once for the entire drawer */}
    <ShakeListener />
    <Navbar />
      <Drawer screenOptions={{ headerShown: false }}>
        <Drawer.Screen name="home" options={{title: "Home"}} />
        <Drawer.Screen name="panic" options={{title: "SOS Panic"}}/>
        <Drawer.Screen name="contacts" options={{title: "Emergency Contacts"}}/>
        <Drawer.Screen name="routes" options={{title: "Safe Routes"}}/>
        <Drawer.Screen name="tips" options={{title: "Safety Tips"}}/>
        <Drawer.Screen name="profile" options={{title: "My Profile"}}/>
      </Drawer>
    </>
  );
}
