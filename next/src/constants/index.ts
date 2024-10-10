import { House, Search, BellRing, Mail, Bookmark, User, Settings2 } from 'lucide-react';

// sidebar links etc...

// Left sidebar links
export const leftSidebarLinks = [
    {
        icon: House,
        route: "/",
        label: "Home",
    },
    {
        icon: Search,
        route: "/explore",
        label: "Explore",
    },
    {
        icon: BellRing,
        route: "/notifications",
        label: "Notifications",
    },
    {
        icon: Mail,
        route: "/messages",
        label: "Messages",
    },
    {
        icon: Bookmark,
        route: "/bookmarks",
        label: "Bookmarks",
    },
    {
        icon: User,
        route: "/profile",
        label: "Profile",
    },
    {
        icon: Settings2,
        route: "/settings",
        label: "Settings",
    },
];

// Phone bottom navbar links
export const bottomNavLinks = [
    {
        icon: House,
        route: "/",
    },
    {
        icon: Search,
        route: "/explore",
    },
    {
        icon: Bookmark,
        route: "/bookmarks",
    },
    {
        icon: BellRing,
        route: "/notifications",
    },
    {
        icon: Mail,
        route: "/messages",
    },
];

// Profile content tabs
export const profileContentTabs = [
    {
        name: 'Posts'
    },
    {
        name: 'Replies'
    },
    {
        name: 'Media'
    },
    {
        name: 'Likes'
    }
]