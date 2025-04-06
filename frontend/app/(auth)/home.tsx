import { getAuth, signOut } from "@react-native-firebase/auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

const Page = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  // TODO - THIS IS JUST FOR TESTING PURPOSES, IT WILL BE REMOVED LATER
  const exampleMovieTitle = "the-matrix"; // Replace with a way to get an actual movie title
  const exampleUserId = "user123"; // Replace with the actual user ID

  const navigateToMovieInfo = () => {
    const pathName = '/movie-info';
    const params = { movieTitle: exampleMovieTitle };
    router.push({
      pathname: pathName,
      params,
    });
  };

  const navigateToResponseHistory = () => {
    const pathName = '/response-history';
    const params = { userId: exampleUserId };
    router.push({
      pathname: pathName,
      params,
    });
  };

  const navigateToIdentifyMovie = () => {
    router.push('/identify-movie');
  };

  return (
    <View style={styles.container}>
      <Text>MovieWhiz</Text>
      <Text>Hello {user?.email}</Text>

      {/* TODO -  THE BUTTON BELOW IS JUST FOR TESTING PURPOSES, IT WILL BE REMOVED LATER */}
      <TouchableOpacity style={styles.button} onPress={navigateToMovieInfo}>
        <Text>View Movie Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToResponseHistory}>
        <Text>View Response History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToIdentifyMovie}>
        <Text>Identify a Movie</Text>
      </TouchableOpacity>

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
    marginTop: 10, 
    backgroundColor: "#dddddd",
    alignItems: "center",
    borderRadius: 5, 
    width: "80%", 
  },
});

export default Page;