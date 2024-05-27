import { SettingsItems } from "../enums/SettingsItems";
import { AssetItemProps, ModeProps, SidebarItemProps, SummaryItemProps } from "./interfaces";

const EXPECTEDTICKGAP = 5;

const autoLockTimes = [{
    label: '1 minute',
    value: '1m'
}, {
    label: '5 minutes',
    value: '5m'
}, {
    label: '10 minutes',
    value: '10m'
}, {
    label: '15 minutes',
    value: '15min'
}, {
    label: '30 minutes',
    value: '30m'
}, {
    label: '1 hour',
    value: '1h'
}, {
    label: '4 hours',
    value: '4h'
}, {
    label: '8 hours',
    value: '8h'
}, {
    label: '24 hours',
    value: '24h'
}, {
    label: 'Never',
    value: 'never'
},]

const settingsSidebarItems = [{
    icon: 'M0 21.0526V18.4211H3.46348L2.9597 17.9605C1.86818 16.9518 1.10202 15.8004 0.661209 14.5066C0.220403 13.2127 0 11.9079 0 10.5921C0 8.1579 0.697943 5.99232 2.09383 4.0954C3.48971 2.19846 5.31066 0.942982 7.55667 0.328947V3.09211C6.04534 3.66228 4.82788 4.63268 3.90428 6.00329C2.98069 7.3739 2.51889 8.90351 2.51889 10.5921C2.51889 11.5789 2.69731 12.5384 3.05416 13.4704C3.411 14.4024 3.96725 15.2632 4.72292 16.0526L5.03778 16.3816V13.1579H7.55667V21.0526H0ZM22.5756 9.21053H20.0252C19.9202 8.44298 19.6946 7.70833 19.3482 7.00658C19.0019 6.30482 18.5348 5.63597 17.9471 5L17.6322 4.67105V7.89474H15.1133V0H22.67V2.63158H19.2065L19.7103 3.09211C20.5709 4.01316 21.2322 4.98904 21.694 6.01974C22.1558 7.05044 22.4496 8.11404 22.5756 9.21053ZM17.6322 25L17.2544 23.0263C17.0025 22.9167 16.7664 22.8015 16.546 22.6809C16.3256 22.5603 16.0999 22.4123 15.869 22.2368L14.0428 22.8289L12.7834 20.5921L14.2317 19.2763C14.1898 18.9693 14.1688 18.6842 14.1688 18.4211C14.1688 18.1579 14.1898 17.8728 14.2317 17.5658L12.7834 16.25L14.0428 14.0132L15.869 14.6053C16.0999 14.4298 16.3256 14.2818 16.546 14.1612C16.7664 14.0406 17.0025 13.9254 17.2544 13.8158L17.6322 11.8421H20.1511L20.529 13.8158C20.7809 13.9254 21.017 14.0461 21.2374 14.1776C21.4578 14.3092 21.6835 14.4737 21.9144 14.6711L23.7406 14.0132L25 16.3158L23.5516 17.6316C23.5936 17.8947 23.6146 18.1689 23.6146 18.4539C23.6146 18.739 23.5936 19.0132 23.5516 19.2763L25 20.5921L23.7406 22.8289L21.9144 22.2368C21.6835 22.4123 21.4578 22.5603 21.2374 22.6809C21.017 22.8015 20.7809 22.9167 20.529 23.0263L20.1511 25H17.6322ZM18.8917 21.0526C19.5844 21.0526 20.1774 20.795 20.6707 20.2796C21.1639 19.7643 21.4106 19.1447 21.4106 18.4211C21.4106 17.6974 21.1639 17.0779 20.6707 16.5625C20.1774 16.0471 19.5844 15.7895 18.8917 15.7895C18.199 15.7895 17.606 16.0471 17.1127 16.5625C16.6194 17.0779 16.3728 17.6974 16.3728 18.4211C16.3728 19.1447 16.6194 19.7643 17.1127 20.2796C17.606 20.795 18.199 21.0526 18.8917 21.0526Z',
    size: {
        width: 25,
        height: 25
    },
    label: SettingsItems.GENERAL
},
{
    icon: 'M0 23V11.5H5V23H0ZM7.5 23V0H12.5V23H7.5ZM15 23V7.1875H20V23H15Z',
    size: {
        width: 20,
        height: 23
    },
    label: SettingsItems.ABOUT
}]

const sideBarItems: SidebarItemProps[] = [
    {
        icon: '/assets/images/sidebar/dashboard.svg',
        label: 'Dashboard',
        active: true,
        link: '/dashboard',
    },
    {
        icon: '/assets/images/sidebar/trading.svg',
        label: 'Trading',
        active: false,
        link: '/trading',
    },
    {
        icon: '/assets/images/sidebar/accounts.svg',
        label: 'Accounts',
        active: false,
        link: '/accounts',
    },
    {
        icon: '/assets/images/sidebar/activity.svg',
        label: 'Activity',
        active: false,
        link: '/activity',
    },
    {
        icon: '/assets/images/sidebar/settings.svg',
        label: 'Settings',
        active: false,
        link: '/settings',
    },
    {
        icon: '/assets/images/ui/logout.svg',
        label: 'Log out',
        active: false,
        link: '/login',
    },
]

const summaryItems: SummaryItemProps[] = [
    {
        icon: '/assets/images/dashboard/totalAssets.svg',
        label: 'Total assets',
        amount: 87.743,
    },
    {
        icon: '/assets/images/dashboard/totalDeposit.svg',
        label: 'Total deposits',
        amount: 78.342,
    }
]

const summaryAccountItems: SummaryItemProps[] = [
    {
        icon: '/assets/images/dashboard/totalDeposit.svg',
        label: 'Balance',
        amount: 78.342,
    },
    {
        icon: '/assets/images/dashboard/totalAssets.svg',
        label: 'Ticks',
        amount: 87.743,
    }
]

const assetsItems: AssetItemProps[] = [
    {
        icon: '/assets/images/tokens/undefined.svg',
        name: 'Undefined',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#FB03F5]',
    },
    {
        icon: '/assets/images/tokens/qu.svg',
        name: 'QU',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#FB03F5]',
    },
    {
        icon: '/assets/images/tokens/qft.svg',
        name: 'QWALLET',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#50AF00]',
    },
    {
        icon: '/assets/images/tokens/qtry.svg',
        name: 'QTRY',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#5CFF9C]',
    },
    {
        icon: '/assets/images/tokens/random.svg',
        name: 'RANDOM',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#FB035C]',
    },
    {
        icon: '/assets/images/tokens/qutil.svg',
        name: 'QUTIL',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#FB03F5]',
    },
    {
        icon: '/assets/images/tokens/qft.svg',
        name: 'QFT',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#50AF95]',
    },
]

const marketOptions = [
    {
        label: 'On',
        value: true
    },
    {
        label: 'Off',
        value: false
    },
]

const MODES: ModeProps[] = [
    {
        wsUrl: 'wss://websocket.qsilver.org',
        type: 'mainnet',
    },
    {
        wsUrl: 'ws://93.190.141.12:5678',
        type: 'testnet',
    }
]

const currencies = [{ label: "US Dollar", value: "USDT" }]

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export { sideBarItems, summaryItems, assetsItems, summaryAccountItems, marketOptions, SERVER_URL, MODES, settingsSidebarItems, currencies, autoLockTimes, EXPECTEDTICKGAP };