import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faAdd,
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
import { addAccount } from "../api/api";
import eventEmitter from "../api/eventEmitter";
import { useNavigation } from "@react-navigation/native";
import { Button, FlatList, VStack } from "native-base";

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
      <ScrollView style={tw`max-h-[500px] mt-4`}>
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
  const navigate = useNavigation();

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
    eventEmitter.on("S2C/add-account", (res) => {
      if (res.data) {
        console.log(res);
        login(res.data);
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
      }
      setAddingStatus(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // const handleDeleteAccount = () => {
  //     if (deletingStatus) return;
  //     setDeletingStatus(true)
  //     if (deleteAccount != "")
  //         axios.post(
  //             `${SERVER_URL}/api/delete-account`,
  //             {
  //                 password: user?.password,
  //                 index: user?.accountInfo.addresses.indexOf(deleteAccount),
  //                 address: deleteAccount,
  //             }
  //         ).then((resp) => {
  //             if (user?.accountInfo.addresses.indexOf(deleteAccount) == 0) {
  //                 handleLogout();
  //             }
  //             // delete balances[deleteAccount];
  //             login(resp.data);
  //         }).catch(() => {

  //         }).finally(() => {
  //             toggleDeleteAccountModal();
  //             setDeletingStatus(false);
  //         })
  // }

  // const handleTransfer = () => {
  //     if (toAddress == "" || amount == "" || amount == "0") {
  //         toast.error(
  //             `Invalid address or amount!`
  //         );
  //         return;
  //     }
  //     setSendingStatus('open');
  //     const expectedTick = parseInt(tick) + 5;
  //     setExpectedTick(expectedTick);
  //     axios.post(
  //         `${SERVER_URL}/api/transfer`,
  //         {
  //             toAddress,
  //             fromIdx: allAddresses.indexOf(currentAddress),
  //             amount,
  //             tick: expectedTick,
  //         }
  //     ).then((resp) => {
  //         const _statusInterval = setInterval(() => {
  //             axios.post(
  //                 `${SERVER_URL}/api/transfer-status`
  //             ).then((resp) => {
  //                 console.log(resp.data);
  //                 if (resp.data.value.result == '0') {
  //                     setSendingStatus('pending');
  //                 } else if (resp.data.value.result == '1') {
  //                     setSendingResult(resp.data.value.display);
  //                     setSendingStatus('closed');
  //                 } else {
  //                     setSendingStatus('rejected');
  //                 }
  //             }).catch((error) => {
  //                 console.log(error.response);
  //                 setSendingStatus('rejected');
  //             })
  //         }, 2000)
  //         setStatusInterval(_statusInterval);
  //         console.log(resp.data);
  //         // setSendingStatus('closed');
  //     }).catch((_) => {
  //         setSendingStatus('rejected');
  //     }).finally(() => {
  //     });
  // }

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

  // useEffect(() => {
  //     axios.post(
  //         `${SERVER_URL}/api/history`,
  //         {
  //             address: currentAddress
  //         }
  //     ).then((resp) => {
  //         if (resp.data.changes) {
  //             setHistories(resp.data.changes[1].txids)
  //         } else {
  //             setHistories([]);
  //         }
  //     }).catch((_) => {
  //         setHistories([]);
  //     })

  //     axios.post(
  //         `${SERVER_URL}/api/tokens`,
  //     ).then((resp) => {
  //         dispatch(setTokens(resp.data.tokens));
  //     }).catch((error) => {
  //         console.log(error.response);
  //     })

  // }, [currentAddress])

  // useEffect(() => {
  //     axios.post(
  //         `${SERVER_URL}/api/basic-info`
  //     ).then((resp) => {
  //         resp.data.balances.map((item: [number, string]) => {
  //             dispatch(setBalances({ index: item[0], balance: item[1] }));
  //         })
  //         dispatch(setTokens(resp.data.tokens));
  //         dispatch(setRichlist(resp.data.richlist));
  //         dispatch(setMarketcap(resp.data.marketcap));
  //         console.log(resp.data, 'basicinfo');
  //     })

  //     const handleResize = () => {
  //         setScreenWidth(window.innerWidth);
  //     };
  //     window.addEventListener('resize', handleResize);
  //     return () => window.removeEventListener('resize', handleResize);
  // }, [])

  const handleCopy = (text: string) => {
    // Clipboard.setString(text);
    Toast.show({ type: "success", text1: "Copied to clipboard" });
  };

  return (
    <ScrollView style={tw`h-full`}>
      <VStack style={tw`p-4 w-full h-full rounded-xl`}>
        <View
          style={tw`flex flex-col justify-between items-center border-b border-white`}
        >
          <View style={tw`flex flex-row items-center`}>
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <Image
                source={require("../../assets/icon.png")}
                style={tw`w-12 h-12`}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCopy(currentAddress)}>
              <Text
                style={tw`p-1 flex-1 text-base bg-gray-800 rounded-md text-white`}
              >
                {displayAddress}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex flex-row items-center`}>
            <NetworkSwitcher />
            <TouchableOpacity
              style={tw`bg-blue-800 px-2 py-1 rounded-md`}
              onPress={() => navigate.navigate("Logout")}
            >
              <Text style={tw`text-lg text-white`}>Logout</Text>
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

        <ScrollView
          style={tw`flex-row gap-5 w-full h-full overflow-auto overflow-y-hidden`}
        >
          <TouchableOpacity
            style={tw`p-2 ${
              addingStatus ? "cursor-wait" : "cursor-pointer"
            } flex-row items-center shadow-[2_2_2_2_rgba(0,0,0,0.3)]`}
            onPress={handleAddAccount}
          >
            <FontAwesomeIcon icon={faPlus} style={tw`p-3 text-6`} />
          </TouchableOpacity>
          {allAddresses.map((item, idx) => {
            if (item !== "")
              return (
                <TouchableOpacity
                  key={`item${idx}`}
                  style={tw`p-2 ${
                    currentAddress === item
                      ? "shadow-[2_2_2_2_rgba(0,0,0,0.6)] bg-[#17517a]"
                      : "shadow-[2_2_2_2_rgba(0,0,0,0.3)]"
                  } flex-col items-center`}
                  onPress={() => handleSelectAccount(item)}
                >
                  <Text>{`${item.slice(0, 5)}...${item.slice(-5)}`}</Text>
                  <Text>{+balances[idx] | 0}</Text>
                  <View
                    style={tw`flex-row justify-between w-full gap-1 text-xs`}
                  >
                    <Text style={tw`bg-green-600 px-1`}>
                      {richlist["QU"]?.find((jtem) => jtem[1] === item)?.[0] ??
                        "no rank"}
                    </Text>
                    <Text>
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
        <View style={tw`mt-5 flex-wrap flex-row`}>
          <TextInput
            placeholder="Address"
            onChangeText={(text) => console.log("Address Set:", text)}
            style={tw`text-white p-2 my-2 mr-1 rounded-lg max-w-[720px] w-full bg-transparent`}
          />
          <TextInput
            placeholder="Amount"
            onChangeText={(text) => console.log("Amount Set:", text)}
            style={tw`text-white p-2 my-2 mr-1 rounded-lg w-30 bg-transparent`}
            keyboardType="numeric"
          />
          <Button
            onPress={() => console.log("Send Transaction")}
            style={tw`my-2 py-2 px-5 bg-blue-800  rounded-lg text-white text-lg cursor-pointer`}
          >
            Send
          </Button>
        </View>
        <View style={tw`mt-10 max-h-[500px]`}>
          <View style={tw`flex-row gap-5 mb-5`}>
            <Text
              onPress={() => setSubTitle("Token")}
              style={tw`${
                subTitle === "Token" ? "bg-blue-800" : ""
              } py-1 px-3 cursor-pointer`}
            >
              Token
            </Text>
            <Text
              onPress={() => setSubTitle("Activity")}
              style={tw`${
                subTitle === "Activity" ? "bg-blue-800" : ""
              } py-1 px-3 cursor-pointer`}
            >
              Activity
            </Text>
          </View>
          {subTitle === "Token" && (
            <ScrollView
              style={tw`relative overflow-auto shadow-lg rounded-lg p-5`}
            >
              {tokens.map((item, idx) => (
                <View
                  key={idx}
                  style={tw`flex-row justify-between items-center p-2`}
                >
                  <Text>{item}</Text>
                  <TextInput
                    placeholder="Address"
                    style={tw`text-white p-2 my-2 mr-1 border border-blue-800 rounded-lg max-w-[720px] w-full bg-transparent`}
                  />
                  <TextInput
                    placeholder="Amount"
                    style={tw`text-white p-2 my-2 mr-1 border border-blue-800 rounded-lg w-30 bg-transparent`}
                    keyboardType="numeric"
                  />
                  <Button
                    onPress={() => console.log("Send Token")}
                    style={tw`py-2 px-5 bg-blue-800 border-none rounded-lg text-white text-lg cursor-pointer`}
                  >
                    Send
                  </Button>
                </View>
              ))}
            </ScrollView>
          )}
          {subTitle === "Activity" && (
            <ScrollView
              style={tw`relative overflow-auto shadow-lg rounded-lg p-5`}
            >
              {/* <FlatList
          data={histories}
          renderItem={({ item }) => (
            <View style={tw`flex-row justify-between p-2 ${item.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
              <Text onPress={() => console.log("Copy Txid:", item.txid)}>{item.txid}</Text>
              <Text onPress={() => console.log("Copy Tick:", item.tick)}>{item.tick}</Text>
              <Text onPress={() => console.log("Copy Address:", item.address)}>{item.address}</Text>
              <Text onPress={() => console.log("Copy Amount:", item.amount)}>{item.amount}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        /> */}
            </ScrollView>
          )}
        </View>
        <View style={tw`mt-5 flex-wrap flex-row`}>
          <TextInput
            style={tw`text-white p-2 my-2 mr-1 border border-[#17517a] rounded-lg max-w-[720] w-full bg-transparent`}
            placeholder="Address"
            onChangeText={setToAddress}
          />
          <TextInput
            style={tw`text-white p-2 my-2 mr-1 border border-[#17517a] rounded-lg w-[120] bg-transparent`}
            placeholder="Amount"
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button onPress={() => {}}>Send</Button>
        </View>
      </VStack>
    </ScrollView>
  );
};

export default Dashboard;
