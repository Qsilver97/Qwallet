import React from "react";
import ThemeToggle from "../components/theme/ThemeToggle";

const Dashboard: React.FC = () => {
    return (
        <>
            <ThemeToggle />
            <div className="bg-light dark:bg-dark text-light dark:text-dark">
                This text and background color will change based on the theme.
            </div>
        </>
    )
}

export default Dashboard;