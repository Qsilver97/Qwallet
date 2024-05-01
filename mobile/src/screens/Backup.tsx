import tw from "tailwind-react-native-classnames";
import {
  Button,
  Checkbox,
  Image,
  ScrollView,
  Text,
  VStack,
  View,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

const Backup: React.FC = () => {
  const { seeds } = useSelector((state: RootState) => state.app);
  const [backuped, setBackuped] = useState(false);
  const [seedsShowStatus, setSeedsShowStatus] = useState(true);

  const navigation = useNavigation();

  const handleBackup = () => setBackuped(!backuped);
  const handleBack = () => navigation.navigate("Create");
  const handleNext = () => navigation.navigate("Confirm");

  return (
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <VStack
        space={5}
        w="90%"
        maxW="300px"
        style={tw`items-center mx-auto pt-16`}
      >
        <Image
          style={tw`self-center`}
          source={require("../../assets/icon.png")}
          size={"xl"}
        />
        <Text style={tw`text-lg my-4 text-center`}>Create an account</Text>
        <Text style={tw`mb-5 text-center`}>
          A new seed has been generated and needs to be securely backed up. We
          highly recommend to write down on paper for safe keeping.
        </Text>

        <View style={tw`relative`}>
          {typeof seeds === "string" && (
            <TouchableOpacity onPress={() => {}}>
              <TouchableOpacity onPress={() => {}}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  <TextInput
                    style={tw`p-2 border-b border-gray-300 bg-transparent text-gray-800`}
                    value={seeds}
                    editable={false}
                  />
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          {Array.isArray(seeds) && (
            <View>
              {seeds.map((seed, idx) => (
                <View
                  key={`seed-${idx}`}
                  style={tw`flex-row items-center mb-2`}
                >
                  <Text style={tw`w-8`}>{idx + 1}</Text>
                  <TextInput
                    style={tw`flex-1 text-center bg-transparent text-gray-800`}
                    value={seed}
                    secureTextEntry={!seedsShowStatus}
                    editable={false}
                  />
                </View>
              ))}
            </View>
          )}

          <View style={tw`flex-row items-center my-3`}>
            <Text style={tw`ml-2`}>I've Made a Backup</Text>
          </View>

          <View style={tw`flex-row`}>
            <Button.Group space={2} mt="4" w="80%" margin={"auto"}>
              <Button onPress={handleBack} w="50%">
                Back
              </Button>
              <Button onPress={handleNext} w="50%">
                Next
              </Button>
            </Button.Group>
          </View>
        </View>
      </VStack>
    </ScrollView>
  );
};

export default Backup;
