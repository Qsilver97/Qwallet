import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { UnprotectedRoute } from "./UnProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import Loading from "../components/commons/Loading";
import { SERVER_URL } from "../utils/constants";
import { ToastContainer } from "react-toastify";

const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Accounts = React.lazy(() => import("../pages/Accounts/Accounts"));
const Trading = React.lazy(() => import("../pages/Trading/Trading"));
const Activity = React.lazy(() => import("../pages/Activity/Activity"));
const Settings = React.lazy(() => import("../pages/Settings"));
const Login = React.lazy(() => import("../pages/Login/Login"));
const SignUp = React.lazy(() => import("../pages/SignUp/SignUp"));
const AccountOptions = React.lazy(
    () => import("../pages/SignUp/AccountOptions")
);
const SignUpSeeds = React.lazy(() => import("../pages/SignUp/SignUpSeeds"));
const SignUpChars = React.lazy(() => import("../pages/SignUp/SignUpChars"));
const BackupChars = React.lazy(() => import("../pages/SignUp/BackupChars"));
const BackupSeeds = React.lazy(() => import("../pages/SignUp/BackupSeeds"));

const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <ToastContainer />
        <AuthProvider wsUrl={SERVER_URL}>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route element={<UnprotectedRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route
                            path="/signup/options"
                            element={<AccountOptions />}
                        />
                        <Route
                            path="/signup/24words"
                            element={<SignUpSeeds />}
                        />
                        <Route
                            path="/signup/55chars"
                            element={<SignUpChars />}
                        />
                        <Route
                            path="/backup/55chars"
                            element={<BackupChars />}
                        />
                        <Route
                            path="/backup/24words"
                            element={<BackupSeeds />}
                        />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route
                            path="/dashboard"
                            element={<Navigate to={"/"} />}
                        />
                        <Route path="/trading" element={<Trading />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Routes>
            </Suspense>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;
