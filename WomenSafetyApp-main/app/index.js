// state is maintained whether the user is logged in or not 

// import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {data}=await supabase.auth.getSession();
      // console.log("SESSION:", data.session);
      if (data.session) {
        router.replace("/drawer/home");
      } else {
        router.replace("/login");
      }

      setReady(true);
    };

    checkAuth();
  }, []);

  if (!ready) return null;

  return null;
}

