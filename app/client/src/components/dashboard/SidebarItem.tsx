import React from 'react';
import { SidebarItemProps } from '../../utils/interfaces';

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, active, label, onClick }) => {
    const activeStyles = active ? 'bg-blue-500 text-white' : 'text-gray-300';
    return (
        <a className={`flex items-center w-full p-2 mb-4 transition-colors duration-200 justify-start cursor-pointer rounded-lg ${activeStyles}`} onClick={onClick}>
            <span className="inline-flex items-center justify-center ml-4">
                <img src={icon} alt="" />
            </span>
            <span className="mx-4 text-sm font-normal">
                {label}
            </span>
        </a>
    );
};

export default SidebarItem;
