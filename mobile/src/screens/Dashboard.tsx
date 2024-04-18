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
      setAddingStatus(false)
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
      <View
        style={tw`mx-auto w-full max-w-7xl bg-[rgba(3,35,61,0.8)] h-full rounded-xl shadow-[0_15px_25px_rgba(0,0,0,0.5)] p-5`}
      >
        <View
          style={tw`flex flex-row justify-between items-center border-b border-white`}
        >
          <TouchableOpacity onPress={() => navigate.goBack()}>
            <Image source={require("../../assets/icon.png")} style={tw`w-12 h-12`} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCopy(currentAddress)}>
            <Text style={tw`text-base sm:text-lg bg-gray-700 p-1 rounded-md`}>
              {currentAddress}
            </Text>
          </TouchableOpacity>
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
        <View style={tw`flex flex-row gap-5`}>
          {allAddresses.map((item, idx) => (
            <TouchableOpacity key={idx} style={tw`p-2`}>
              <Text>{`${item.slice(0, 5)}...${item.slice(-5)}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={tw`flex flex-wrap`}>
          <TextInput
            style={tw`text-white p-2 border border-blue-800 rounded-md w-full`}
            placeholder="Address"
          />
          <TextInput
            style={tw`text-white p-2 border border-blue-800 rounded-md w-32`}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={tw`bg-blue-800 px-5 py-2 rounded-md text-white text-base`}
          >
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;
