import axios from "axios";
import { createContext, useContext, ReactNode, useState } from "react";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../redux/appSlice";

export interface AccountDetailType {
  addresses: string[];
  numaddrs: number;
  subshash: string;
}

export interface UserDetailType {
  isAuthenticated: boolean;
  password: string;
  accountInfo: AccountDetailType;
}

interface AuthContextType {
  user: UserDetailType | null;
  tempPassword: string;
  login: (userDetails: UserDetailType) => void;
  logout: () => void;
  setTempPassword: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetailType | null>(null);
  const dispatch = useDispatch();
  const [tempPassword, setTempPassword] = useState("");
  const login = (userDetails: UserDetailType | null) => {
    setUser(userDetails);
  };
  const logout = () => {
    // axios
    //   .post(`${}/api/logout`)
    //   .then((resp) => {
    //     console.log(resp.data);
    //     dispatch(setIsAuthenticated(true));
    //     login(null);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   })
    //   .finally(() => {});
  };
  return (
    <AuthContext.Provider
      value={{ user, tempPassword, login, logout, setTempPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
