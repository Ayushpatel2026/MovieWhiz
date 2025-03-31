import { getAuth, signOut } from "@react-native-firebase/auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Page = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <Text>MovieWhiz</Text>
      <Text>Hello {user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#dddddd",
    alignItems: "center",
  },
});

export default Page;
