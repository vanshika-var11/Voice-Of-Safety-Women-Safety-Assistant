import React, { useEffect } from "react";
import { Vibration, Linking, Alert, Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function ShakeListener() {
  useEffect(() => {
    let lastShake = 0;

    const subscription = Accelerometer.addListener(accel => {
      const totalForce = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

      if (totalForce > 6) { // adjust sensitivity
        const now = Date.now();
        if (now - lastShake > 1000) { // prevent multiple triggers
          lastShake = now;
          Vibration.vibrate(500);

          // Open dialer
          const phoneNumber = Platform.OS === "android" ? "tel:112" : "telprompt:112";
          Linking.openURL(phoneNumber).catch(err => {
            Alert.alert("Error", "Cannot make call: " + err.message);
          });
        }
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, []);

  return null;
}
