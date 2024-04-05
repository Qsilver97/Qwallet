import React, { useState } from "react";
import {
  VStack,
  Text,
  Input,
  Icon,
  Button,
  Pressable,
  Image,
  ScrollView,
  IconButton,
  useToast,
} from "native-base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";

const Login: React.FC<{
  navigation: NativeStackNavigationProp<any>;
}> = ({ navigation }) => {
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [loginWaiting, setLoginWaiting] = useState<boolean>(false);

  const toast = useToast();

  const handleLogin = () => {
    setLoginWaiting(true);
    setTimeout(() => {
      setLoginWaiting(false);
      navigation.navigate("Dashboard");
      setPasswordStatus(true);
      toast.show({ description: "Login failed. Please try again." });
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <VStack
        style={tw`items-center my-auto mx-auto`}
        w="90%"
        maxW="300px"
        space={5}
      >
        <Image source={require("../../assets/icon.png")} alt="Logo" size="xl" />
        <Text fontSize="2xl">Login</Text>
        <Text textAlign="center">
          Enter your password to access your account.{"\n"}
          Each password corresponds to a unique user account.
        </Text>
        <Input
          style={tw`w-full`}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          type={passwordVisible ? "text" : "password"}
          InputRightElement={
            <IconButton
              icon={
                <Icon
                  as={
                    <MaterialIcons
                      name={passwordVisible ? "visibility" : "visibility-off"}
                    />
                  }
                  size="md"
                />
              }
              onPress={() => setPasswordVisible(!passwordVisible)}
              size="md"
              style={tw`mr-2`}
            />
          }
        />
        {passwordStatus && (
          <Text color="red.600">Password does not exist.</Text>
        )}
        <Button
          onPress={handleLogin}
          isLoading={loginWaiting}
          isDisabled={password === "" || loginWaiting}
          style={tw`w-full`}
        >
          Login
        </Button>
        <Button
          onPress={() => navigation.navigate("Create")}
          variant="outline"
          style={tw`w-full`}
        >
          Create
        </Button>
        <Pressable onPress={() => navigation.navigate("Restore")}>
          <Text color="info.500" mt="2">
            Restore your wallet from your seed
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
};

export default Login;
