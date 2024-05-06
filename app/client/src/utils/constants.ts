import { SettingsItems } from "../enums/SettingsItems";
import { AssetItemProps, ModeProps, SidebarItemProps, SummaryItemProps } from "./interfaces";

const autoLockTimes = [{
    label: '1 minute',
    value: '1m'}, {
    label: '5 minutes',
        value: '5m'},{
    label: '10 minutes',
        value: '10m'},{
    label: '15 minutes',
        value: '15min'},{
    label: '30 minutes',
        value: '30m'},{
    label: '1 hour',
        value: '1h'},{
    label: '4 hours',
        value: '4h'},{
    label: '8 hours',
        value: '8h'},{
    label: '24 hours',
        value: '24h'},{
    label: 'Never',
        value: 'never'},]

const settingsSidebarItems = [{
    icon: 'M0 21.0526V18.4211H3.46348L2.9597 17.9605C1.86818 16.9518 1.10202 15.8004 0.661209 14.5066C0.220403 13.2127 0 11.9079 0 10.5921C0 8.1579 0.697943 5.99232 2.09383 4.0954C3.48971 2.19846 5.31066 0.942982 7.55667 0.328947V3.09211C6.04534 3.66228 4.82788 4.63268 3.90428 6.00329C2.98069 7.3739 2.51889 8.90351 2.51889 10.5921C2.51889 11.5789 2.69731 12.5384 3.05416 13.4704C3.411 14.4024 3.96725 15.2632 4.72292 16.0526L5.03778 16.3816V13.1579H7.55667V21.0526H0ZM22.5756 9.21053H20.0252C19.9202 8.44298 19.6946 7.70833 19.3482 7.00658C19.0019 6.30482 18.5348 5.63597 17.9471 5L17.6322 4.67105V7.89474H15.1133V0H22.67V2.63158H19.2065L19.7103 3.09211C20.5709 4.01316 21.2322 4.98904 21.694 6.01974C22.1558 7.05044 22.4496 8.11404 22.5756 9.21053ZM17.6322 25L17.2544 23.0263C17.0025 22.9167 16.7664 22.8015 16.546 22.6809C16.3256 22.5603 16.0999 22.4123 15.869 22.2368L14.0428 22.8289L12.7834 20.5921L14.2317 19.2763C14.1898 18.9693 14.1688 18.6842 14.1688 18.4211C14.1688 18.1579 14.1898 17.8728 14.2317 17.5658L12.7834 16.25L14.0428 14.0132L15.869 14.6053C16.0999 14.4298 16.3256 14.2818 16.546 14.1612C16.7664 14.0406 17.0025 13.9254 17.2544 13.8158L17.6322 11.8421H20.1511L20.529 13.8158C20.7809 13.9254 21.017 14.0461 21.2374 14.1776C21.4578 14.3092 21.6835 14.4737 21.9144 14.6711L23.7406 14.0132L25 16.3158L23.5516 17.6316C23.5936 17.8947 23.6146 18.1689 23.6146 18.4539C23.6146 18.739 23.5936 19.0132 23.5516 19.2763L25 20.5921L23.7406 22.8289L21.9144 22.2368C21.6835 22.4123 21.4578 22.5603 21.2374 22.6809C21.017 22.8015 20.7809 22.9167 20.529 23.0263L20.1511 25H17.6322ZM18.8917 21.0526C19.5844 21.0526 20.1774 20.795 20.6707 20.2796C21.1639 19.7643 21.4106 19.1447 21.4106 18.4211C21.4106 17.6974 21.1639 17.0779 20.6707 16.5625C20.1774 16.0471 19.5844 15.7895 18.8917 15.7895C18.199 15.7895 17.606 16.0471 17.1127 16.5625C16.6194 17.0779 16.3728 17.6974 16.3728 18.4211C16.3728 19.1447 16.6194 19.7643 17.1127 20.2796C17.606 20.795 18.199 21.0526 18.8917 21.0526Z',
    size: {
        width: 25,
        height: 25
    },
    label: SettingsItems.GENERAL
},
{
    icon: 'M10 0L0 4.54545V11.3636C0 17.6705 4.26667 23.5682 10 25C15.7333 23.5682 20 17.6705 20 11.3636V4.54545L10 0ZM10 12.4886H17.7778C17.1889 17.1705 14.1333 21.3409 10 22.6477V12.5H2.22222V6.02273L10 2.48864V12.4886Z',
    size: {
        width: 20,
        height: 25
    },
    label:  SettingsItems.SECURITY
},
{
    icon: 'M11.6471 25L11.3235 21.25H11C7.93726 21.25 5.33824 20.2188 3.20294 18.1562C1.06765 16.0938 0 13.5833 0 10.625C0 7.66667 1.06765 5.15625 3.20294 3.09375C5.33824 1.03125 7.93726 0 11 0C12.5314 0 13.9601 0.275833 15.2861 0.8275C16.613 1.38 17.7782 2.14042 18.7815 3.10875C19.784 4.07792 20.5709 5.20292 21.142 6.48375C21.714 7.76542 22 9.14583 22 10.625C22 13.7917 21.0186 16.63 19.0559 19.14C17.0931 21.6508 14.6235 23.6042 11.6471 25ZM10.9676 17.4688C11.3343 17.4688 11.6471 17.3438 11.9059 17.0938C12.1647 16.8438 12.2941 16.5417 12.2941 16.1875C12.2941 15.8333 12.1647 15.5313 11.9059 15.2812C11.6471 15.0312 11.3343 14.9062 10.9676 14.9062C10.601 14.9062 10.2882 15.0312 10.0294 15.2812C9.77059 15.5313 9.64118 15.8333 9.64118 16.1875C9.64118 16.5417 9.77059 16.8438 10.0294 17.0938C10.2882 17.3438 10.601 17.4688 10.9676 17.4688ZM10.0294 13.5H11.9706C11.9706 12.875 12.0353 12.4375 12.1647 12.1875C12.2941 11.9375 12.7039 11.4792 13.3941 10.8125C13.7824 10.4375 14.1059 10.0312 14.3647 9.59375C14.6235 9.15625 14.7529 8.6875 14.7529 8.1875C14.7529 7.125 14.3811 6.32792 13.6374 5.79625C12.8929 5.26542 12.0137 5 11 5C10.051 5 9.25294 5.255 8.60588 5.765C7.95882 6.27583 7.50588 6.89583 7.24706 7.625L9.05882 8.3125C9.16667 7.95833 9.37157 7.60917 9.67353 7.265C9.97549 6.92167 10.4176 6.75 11 6.75C11.5824 6.75 12.0193 6.90625 12.3109 7.21875C12.6017 7.53125 12.7471 7.875 12.7471 8.25C12.7471 8.60417 12.6392 8.92167 12.4235 9.2025C12.2078 9.48417 11.949 9.77083 11.6471 10.0625C10.8922 10.6875 10.434 11.1821 10.2727 11.5463C10.1105 11.9113 10.0294 12.5625 10.0294 13.5ZM14.2353 18.75V20.4375C15.7667 19.1875 17.012 17.7242 17.9714 16.0475C18.9316 14.37 19.4118 12.5625 19.4118 10.625C19.4118 8.35417 18.5978 6.43208 16.9698 4.85875C15.3409 3.28625 13.351 2.5 11 2.5C8.64902 2.5 6.65953 3.28625 5.03153 4.85875C3.40267 6.43208 2.58824 8.35417 2.58824 10.625C2.58824 12.8958 3.40267 14.8179 5.03153 16.3913C6.65953 17.9638 8.64902 18.75 11 18.75H14.2353Z',
    size: {
        width: 22,
        height: 25
    },
    label:  SettingsItems.SUPPORT
},
{
    icon: 'M0 23V11.5H5V23H0ZM7.5 23V0H12.5V23H7.5ZM15 23V7.1875H20V23H15Z',
    size: {
        width: 20,
        height: 23
    },
    label:  SettingsItems.ABOUT
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
        amount: '87.743',
    },
    {
        icon: '/assets/images/dashboard/totalDeposit.svg',
        label: 'Total deposits',
        amount: '78.342',
    }
]

const summaryAccountItems: SummaryItemProps[] = [
    {
        icon: '/assets/images/dashboard/totalDeposit.svg',
        label: 'Balance',
        amount: '78.342',
    },
    {
        icon: '/assets/images/dashboard/totalAssets.svg',
        label: 'Ticks',
        amount: '87.743',
    }
]

const assetsItems: AssetItemProps[] = [
    {
        icon: '/assets/images/tokens/qu.svg',
        name: 'QU',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#FB03F5]',
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
    {
        icon: '/assets/images/tokens/qft.svg',
        name: 'QWALLET',
        amount: '0',
        percentage: 0,
        colorClassName: 'bg-[#50AF00]',
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
        wsUrl: 'wss://qsilver.org:5555',
        type: 'mainnet',
    },
    {
        wsUrl: 'ws://93.190.141.12:5678',
        type: 'testnet',
    }
]

const currencies = [{label: "US Dollar", value: "USDT"}]

const SERVER_URL = "http://localhost:3000";

export { sideBarItems, summaryItems, assetsItems, summaryAccountItems, marketOptions, SERVER_URL, MODES, settingsSidebarItems, currencies, autoLockTimes };