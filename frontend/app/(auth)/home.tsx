import { getAuth, signOut } from "@react-native-firebase/auth";
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

const Page = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const navigateToResponseHistory = () => {
    router.push({
      pathname: "/response-history",
      params: { userId: user?.uid },
    });
  };

  const navigateToIdentifyMovie = () => {
    router.push("/identify-movie");
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f3f4f6" barStyle="dark-content" />
      <Text style={styles.title}>🎬 MovieWhiz</Text>
      <Text style={styles.subtitle}>Welcome, {user?.email}</Text>

      <View style={styles.buttonGroup}>
        <CustomButton text="📜 View Response History" onPress={navigateToResponseHistory} />
        <CustomButton text="🔍 Identify a Movie" onPress={navigateToIdentifyMovie} />
        <CustomButton text="🚪 Sign Out" onPress={handleSignOut} isDanger />
      </View>
    </View>
  );
};

const CustomButton = ({
  text,
  onPress,
  isDanger = false,
}: {
  text: string;
  onPress: () => void;
  isDanger?: boolean;
}) => (
  <View style={styles.buttonWrapper}>
    <TouchableNativeFeedback onPress={onPress} background={TouchableNativeFeedback.Ripple("#d1d5db", false)}>
      <View style={[styles.button, isDanger && styles.dangerButton]}>
        <Text style={[styles.buttonText, isDanger && styles.dangerButtonText]}>{text}</Text>
      </View>
    </TouchableNativeFeedback>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  },
  buttonGroup: {
    marginTop: 50,
    width: "100%",
    alignItems: "center",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  dangerButtonText: {
    color: "#ffffff",
  },
});

export default Page;