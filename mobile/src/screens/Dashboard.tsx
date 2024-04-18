import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faAdd,
  faCheck,
  faCopy,
  faPlus,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
// import Clipboard from "@react-native-community/clipboard";
import tw from "tailwind-react-native-classnames";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  setBalances,
  setMarketcap,
  setRichlist,
  setTokens,
} from "../redux/appSlice";
import NetworkSwitcher from "../components/NetworkSwitcher";
import {
  addAccount,
  basicInfo,
  deleteAccount as deleteAccountF,
  getHistory,
  getToken,
  transfer,
} from "../api/api";
import eventEmitter from "../api/eventEmitter";
import { useNavigation } from "@react-navigation/native";
import {
  Button,
  FlatList,
  Flex,
  IconButton,
  VStack,
  Modal,
  HStack,
  Icon,
} from "native-base";

type TransactionItem = [number, string, string, string];
type RichList = {
  name: string;
  richlist: [[number, string, string]];
};

interface AddressModalProps {
  isAccountModalOpen: boolean;
  toggleAccountModal: () => void;
  allAddresses: string[];
  handleCopy: (address: string) => void;
  handleAddAccount: () => void;
  setDeleteAccount: (address: string) => void;
  toggleDeleteAccountModal: () => void;
  handleClickAccount: (address: string) => void;
  addingStatus: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isAccountModalOpen,
  toggleAccountModal,
  allAddresses,
  handleCopy,
  handleAddAccount,
  setDeleteAccount,
  toggleDeleteAccountModal,
  handleClickAccount,
  addingStatus,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isAccountModalOpen}
    onRequestClose={toggleAccountModal}
  >
    <View style={tw`m-4 bg-white rounded-lg p-4`}>
      <View
        style={tw`flex-row justify-between items-center border-b border-gray-200 pb-4`}
      >
        <Text style={tw`text-lg font-bold`}>Addresses</Text>
        <View style={tw`flex-row items-center`}>
          <Pressable onPress={handleAddAccount} disabled={addingStatus}>
            <FontAwesomeIcon
              icon={faPlus}
              size={24}
              color={addingStatus ? "gray" : "black"}
            />
          </Pressable>
          <Pressable onPress={toggleAccountModal} style={tw`ml-2`}>
            <FontAwesomeIcon icon={faTimes} size={24} color="black" />
          </Pressable>
        </View>
      </View>
      <ScrollView style={tw` mt-4`}>
        {allAddresses.map(
          (item, idx) =>
            item !== "" && (
              <View
                key={`address-${idx}`}
                style={tw`flex-row justify-between items-center py-2`}
              >
                <Pressable onPress={() => handleCopy(item)}>
                  <FontAwesomeIcon icon={faCopy} size={20} color="black" />
                </Pressable>
                <Text
                  onPress={() => handleClickAccount(item)}
                  style={tw`flex-1 mx-2 text-center`}
                >
                  {item}
                </Text>
                <Pressable
                  onPress={() => {
                    setDeleteAccount(item);
                    toggleDeleteAccountModal();
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} size={20} color="black" />
                </Pressable>
              </View>
            )
        )}
      </ScrollView>
    </View>
  </Modal>
);

const Dashboard: React.FC = () => {
  const { login, logout, user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const toggleAccountModal = () => setIsAccountModalOpen(!isAccountModalOpen);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState<boolean>(false);
  const toggleDeleteAccountModal = () =>
    setIsDeleteAccountModalOpen(!isDeleteAccountModalOpen);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const toggleTransferModal = () =>
    setIsTransferModalOpen(!isTransferModalOpen);

  const { tick, balances, tokens, richlist, marketcap } = useSelector(
    (state: RootState) => state.app
  );

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [deleteAccount, setDeleteAccount] = useState<string>("");
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [displayAddress, setDisplayAddress] = useState(currentAddress);
  const [allAddresses, setAllAddresses] = useState<string[]>([]);
  const [addingStatus, setAddingStatus] = useState<boolean>(false);
  const [deletingStatus, setDeletingStatus] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [sendingStatus, setSendingStatus] = useState<
    "open" | "pending" | "closed" | "rejected"
  >("closed");
  const [statusInterval, setStatusInterval] = useState<any>();
  const [sendingResult, setSendingResult] = useState<string>("");
  const [transactionId, setTrasactionId] = useState<string>("");
  const [expectedTick, setExpectedTick] = useState<number>();
  const [histories, setHistories] = useState<TransactionItem[]>([]);
  const [subTitle, setSubTitle] = useState<"Activity" | "Token">("Token");

  const handleAddAccount = () => {
    if (addingStatus) return;
    setAddingStatus(true);
    console.log(
      user?.password,
      user?.accountInfo.addresses.findIndex((item) => item == "")
    );
    addAccount(
      user?.password,
      user?.accountInfo.addresses.findIndex((item) => item == "")
    );
  };

  useEffect(() => {
    basicInfo();
    eventEmitter.on("S2C/add-account", (res) => {
      if (res.data) {
        // console.log(res);
        login(res.data);
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
      }
      setAddingStatus(false);
    });
    eventEmitter.on("S2C/history", (res) => {
      if (res.data) {
        console.log("History: ", res);
        setHistories(res.data.changes[1].txids);
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
        setHistories([]);
      }
    });
    eventEmitter.on("S2C/tokens", (res) => {
      if (res.data.tokens) {
        dispatch(setTokens(res.data.tokens));
      } else {
        Toast.show({ type: "error", text1: "Error ocurred!" });
      }
    });
    eventEmitter.on("S2C/basic-info", (res) => {
      if (res.data) {
        // console.log("Basic Info: "res);
        res.data.balances.map((item: [number, string]) => {
          dispatch(setBalances({ index: item[0], balance: item[1] }));
        });
        dispatch(setTokens(res.data.tokens));
        dispatch(setRichlist(res.data.richlist));
        dispatch(setMarketcap(res.data.marketcap));
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
      }
    });
    eventEmitter.on("S2C/transfer", (res) => {
      if (res.data) {
        console.log("Transfer: ", res.data);
        if (res.data == "failed") {
          setSendingStatus("rejected");
          Toast.show({ type: "error", text1: "Transfer Failed!" });
        } else if (res.data.value.result == "0") {
          setSendingStatus("pending");
        } else if (res.data.value.result == "1") {
          setSendingResult(res.data.value.display);
          setSendingStatus("closed");
        } else {
          setSendingStatus("rejected");
        }
      } else {
        Toast.show({ type: "error", text1: "Error Occured" });
        setSendingStatus("rejected");
      }
    });
    eventEmitter.on("S2C/delete-account", (res) => {
      if (res.data) {
        if (user?.accountInfo.addresses.indexOf(deleteAccount) == 0) {
          handleLogout();
        }
        // delete balances[deleteAccount];
        toggleDeleteAccountModal();
      } else {
        Toast.show({ type: "error", text1: res });
      }
      setDeletingStatus(false);
    });
  }, []);

  useEffect(() => {
    if (currentAddress != "") getHistory(currentAddress);
    getToken();
  }, [currentAddress]);

  const handleLogout = () => {
    logout();
    navigation.navigate("Login");
  };

  const handleDeleteAccount = () => {
    if (deletingStatus) return;
    setDeletingStatus(true);
    if (deleteAccount != "")
      deleteAccountF(
        user?.password,
        user?.accountInfo.addresses.indexOf(deleteAccount),
        deleteAccount
      );
  };

  const handleTransfer = () => {
    if (toAddress == "" || amount == "" || amount == "0") {
      Toast.show({ type: "error", text1: "Invalid address or amount!" });
      return;
    }
    setSendingStatus("open");
    const expectedTick = parseInt(tick) + 5;
    setExpectedTick(expectedTick);
    transfer(
      toAddress,
      allAddresses.indexOf(currentAddress),
      amount,
      expectedTick
    );
  };

  const handleClickAccount = (address: string) => {
    setCurrentAddress(address);
    toggleAccountModal();
  };

  const handleSelectAccount = (address: string) => {
    setCurrentAddress(address);
  };

  useEffect(() => {
    if (sendingStatus == "open" || sendingStatus == "pending") {
      setIsTransferModalOpen(true);
    } else {
      // clearInterval(statusInterval);
    }
  }, [sendingStatus]);

  useEffect(() => {
    if (user?.accountInfo) {
      setCurrentAddress(user?.accountInfo.addresses[0]);
      setAllAddresses(user?.accountInfo.addresses);
    }
  }, [login, user]);

  useEffect(() => {
    if (sendingResult.includes("broadcast for tick")) {
      const sendingResultSplit = sendingResult.split(" ");
      setTrasactionId(sendingResultSplit[1]);
      setExpectedTick(
        parseInt(sendingResultSplit[sendingResultSplit.length - 1])
      );
    } else if (sendingResult.includes("no command pending")) {
      clearInterval(statusInterval);
    }
  }, [sendingResult]);

  useEffect(() => {
    // Assuming Tailwind's 'md' breakpoint is 768px
    if (screenWidth < 1024 && currentAddress.length > 6) {
      const sliceLength = Math.ceil((screenWidth * 20) / 1024);
      const modifiedAddress = `${currentAddress.slice(
        0,
        sliceLength
      )}...${currentAddress.slice(-sliceLength)}`;
      setDisplayAddress(modifiedAddress);
    } else {
      setDisplayAddress(currentAddress);
    }
  }, [screenWidth, currentAddress]);

  const handleCopy = (text: string) => {
    // Clipboard.setString(text);
    Toast.show({ type: "success", text1: "Copied to clipboard" });
  };

  return (
    <ScrollView style={tw`h-full`} nestedScrollEnabled>
      <VStack style={tw`p-4 w-full h-full rounded-xl`}>
        <View style={tw`border-b py-2`}>
          <View style={tw`px-2 flex flex-row items-center`}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../../assets/icon.png")}
                style={tw`w-20 h-20`}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCopy(currentAddress)}
              style={tw`flex-1`}
            >
              <Text
                style={tw`p-2 flex-1 text-base bg-gray-800 rounded-md text-white`}
              >
                {displayAddress}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={tw`mt-4 flex flex-row items-center justify-between`}>
            <NetworkSwitcher />
            <TouchableOpacity onPress={handleLogout}>
              <Text style={tw`bg-blue-800 p-2 rounded-md text-xl text-white`}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`p-4`}>
          <Text style={tw`text-2xl`}>
            Balance:{" "}
            {balances.reduce(
              (acc, currentValue) => acc + Number(currentValue),
              0
            )}
            {" | "}
            <Text style={tw`text-lg`}>
              $
              {balances.reduce(
                (acc, currentValue) => acc + Number(currentValue),
                0
              ) * parseFloat(marketcap.price)}
            </Text>
          </Text>
          <Text style={tw`text-2xl`}>Tick: {tick}</Text>
        </View>

        <View style={tw`flex flex-row flex-wrap`}>
          <TouchableOpacity
            style={tw`p-2 ${addingStatus ? "" : ""} flex-row items-center`}
            onPress={handleAddAccount}
          >
            <FontAwesomeIcon icon={faPlus} style={tw`p-3 text-base`} />
          </TouchableOpacity>
          <ScrollView horizontal={true} style={tw`p-2 flex flex-row`}>
            {allAddresses.map((item, idx) => {
              if (item !== "")
                return (
                  <TouchableOpacity
                    key={`item${idx}`}
                    style={tw`p-2 ${
                      currentAddress === item ? "" : ""
                    } flex-col items-center bg-blue-800 w-32 mx-2`}
                    onPress={() => handleSelectAccount(item)}
                  >
                    <Text style={tw`text-white`}>{`${item.slice(
                      0,
                      5
                    )}...${item.slice(-5)}`}</Text>
                    <Text style={tw`text-white`}>{+balances[idx] | 0}</Text>
                    <View style={tw`flex-row justify-between w-full text-xs`}>
                      <Text style={tw`bg-green-600 px-1 text-white`}>
                        {richlist["QU"]?.find(
                          (jtem) => jtem[1] === item
                        )?.[0] ?? "no rank"}
                      </Text>
                      <Text style={tw`text-white`}>
                        {balances[idx] &&
                          `$${
                            Math.round(
                              parseFloat(balances[idx]) *
                                parseFloat(marketcap.price) *
                                100
                            ) / 100
                          }`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
            })}
          </ScrollView>
        </View>
        <View style={tw`mt-5 flex-wrap flex-row`}>
          <TextInput
            placeholder="Address"
            onChangeText={(text) => setToAddress(text)}
            style={tw`p-2 my-2 mr-1 border rounded-lg w-full bg-transparent`}
          />
          <TextInput
            placeholder="Amount"
            onChangeText={(text) => setAmount(text)}
            style={tw`p-2 my-2 mr-1 border rounded-lg w-32 bg-transparent`}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={handleTransfer}>
            <Text
              style={tw`my-2 py-2 px-5 bg-blue-800  rounded-lg text-white text-lg `}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw`mt-5 pt-3 border-t`}>
          <View style={tw`flex-row  mb-2`}>
            <Text
              onPress={() => setSubTitle("Token")}
              style={tw`${
                subTitle === "Token" ? "bg-blue-800 text-white" : ""
              } py-1 px-3 text-xl`}
            >
              Token
            </Text>
            <Text
              onPress={() => setSubTitle("Activity")}
              style={tw`${
                subTitle === "Activity" ? "bg-blue-800 text-white" : ""
              } py-1 px-3 text-xl`}
            >
              Activity
            </Text>
          </View>
          {subTitle === "Token" && (
            <View style={tw`relative shadow-md rounded-lg p-4`}>
              <ScrollView horizontal={true} style={tw`flex flex-row`}>
                {tokens.map((item, idx) => (
                  <View key={idx} style={tw`p-2`}>
                    <Text style={tw`text-xl`}>{item}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={tw`mt-2 flex-wrap flex-row`}>
                <TextInput
                  placeholder="Address"
                  onChangeText={(text) => setToAddress(text)}
                  style={tw`text-white p-2 my-2 mr-1 border rounded-lg w-full bg-transparent`}
                />
                <TextInput
                  placeholder="Amount"
                  onChangeText={(text) => setAmount(text)}
                  style={tw`text-white p-2 my-2 mr-1 border rounded-lg w-32 bg-transparent`}
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={handleTransfer}>
                  <Text
                    style={tw`my-2 py-2 px-5 bg-blue-800  rounded-lg text-white text-lg `}
                  >
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {subTitle === "Activity" && (
            <View style={tw`relative  shadow-md rounded-lg p-5`}>
              <FlatList
                nestedScrollEnabled
                data={histories}
                renderItem={({ item }) => (
                  <View
                    style={tw`flex-row justify-between p-2 ${
                      item[3].startsWith("-")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    <Text onPress={() => console.log("Copy Txid:", item)}>
                      {item[1]}
                    </Text>
                    <Text onPress={() => console.log("Copy Tick:", item)}>
                      {item[0]}
                    </Text>
                    <Text onPress={() => console.log("Copy Address:", item)}>
                      {item[2]}
                    </Text>
                    <Text onPress={() => console.log("Copy Amount:", item)}>
                      {item[3]}
                    </Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}
        </View>
      </VStack>
      <Modal isOpen={isAccountModalOpen} onClose={toggleAccountModal}>
        <Modal.Content>
          <Modal.Header borderBottomWidth="1" borderColor="white">
            <HStack justifyContent="space-between" alignItems="center">
              <Text style={tw`text-xl`}>Addresses</Text>
              <HStack space={2}>
                <Pressable onPress={handleAddAccount} disabled={addingStatus}>
                  <Icon
                    as={<FontAwesomeIcon icon={faPlus} />}
                    size="sm"
                    style={tw`${addingStatus ? "opacity-50" : "opacity-100"}`}
                  />
                </Pressable>
                <Pressable onPress={toggleAccountModal}>
                  <Icon
                    as={<FontAwesomeIcon icon={faTimes} />}
                    size="sm"
                    style={tw`opacity-100`}
                  />
                </Pressable>
              </HStack>
            </HStack>
          </Modal.Header>
          <ScrollView style={tw`p-2 mb-2`}>
            {allAddresses.map(
              (item, idx) =>
                item !== "" && (
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    key={`address-${idx}`}
                    space={5}
                  >
                    <Pressable onPress={() => handleCopy(item)}>
                      <Icon
                        as={<FontAwesomeIcon icon={faCopy} />}
                        size="sm"
                        style={tw`opacity-100`}
                      />
                    </Pressable>
                    <Text
                      onPress={() => handleClickAccount(item)}
                      style={tw`font-mono`}
                    >
                      {item}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setDeleteAccount(item);
                        toggleDeleteAccountModal();
                      }}
                    >
                      <Icon
                        as={<FontAwesomeIcon icon={faTrash} />}
                        size="sm"
                        style={tw`opacity-100`}
                      />
                    </Pressable>
                  </HStack>
                )
            )}
          </ScrollView>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={toggleDeleteAccountModal}
      >
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header
            borderBottomWidth="1"
            borderColor="white"
            _text={{ fontSize: "lg" }}
          >
            Delete this account?
          </Modal.Header>
          <Modal.Body>
            <Text>{deleteAccount}</Text>
            <HStack justifyContent="flex-end" mt="4" space="4">
              <Button
                isDisabled={deletingStatus}
                onPress={handleDeleteAccount}
                bg="red.500"
                _text={{ color: "white" }}
                _hover={{ bg: "red.600" }}
              >
                Yes
              </Button>
              <Button
                onPress={toggleDeleteAccountModal}
                bg="blue.600"
                _text={{ color: "white" }}
                _hover={{ bg: "blue.700" }}
              >
                No
              </Button>
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={isTransferModalOpen} onClose={toggleTransferModal}>
        <Modal.Content maxWidth="400px">
          {(sendingStatus === "closed" || sendingStatus === "rejected") && (
            <Modal.Header>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                space={5}
              >
                <Text style={tw`text-xl`}>
                  {sendingResult === "no command pending"
                    ? "Success"
                    : sendingStatus === "closed"
                    ? "Sending..."
                    : "Failed"}
                </Text>
                <Pressable onPress={toggleTransferModal}>
                  <Icon as={<FontAwesomeIcon icon={faTimes} />} />
                </Pressable>
              </HStack>
            </Modal.Header>
          )}

          {sendingStatus === "open" || sendingStatus === "pending" ? (
            <Modal.Body>
              <VStack space={5} alignItems="center">
                {/* Place your ClipLoader equivalent here */}
              </VStack>
            </Modal.Body>
          ) : (
            <>
              {sendingStatus === "closed" ? (
                <VStack space={4} alignItems="center" my={4} px={8}>
                  <Text style={tw`uppercase text-sm font-bold text-indigo-500`}>
                    Transaction ID
                  </Text>
                  <Text style={tw`mt-1 text-lg font-medium`}>
                    {transactionId}
                  </Text>
                  {sendingResult === "no command pending" ? (
                    <Icon
                      as={<FontAwesomeIcon icon={faCheck} />}
                      size="xl"
                      mt={4}
                    />
                  ) : (
                    <>
                      <HStack space={2} alignItems="center">
                        <Text style={tw`text-indigo-500 font-semibold`}>
                          Expected Tick:
                        </Text>
                        <Text>{expectedTick}</Text>
                      </HStack>
                      <HStack space={2} alignItems="center">
                        <Text style={tw`text-indigo-500 font-semibold`}>
                          Status:
                        </Text>
                        <Text>{sendingResult}</Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              ) : (
                <Modal.Body>
                  <VStack space={5} alignItems="center">
                    <Text style={tw`text-xl`}>Failed</Text>
                  </VStack>
                </Modal.Body>
              )}
            </>
          )}
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
};

export default Dashboard;
