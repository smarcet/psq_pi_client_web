import T from "i18n-react/dist/i18n-react";
import '../../i18n';

export default {
    items: [
        {
            name: T.translate("Dashboard"),
            url: '/auth/admin/dashboard',
            icon: 'icon-speedometer',

        },
        {
            name: T.translate("Devices"),
            url: '/auth/admin/devices',
            icon: 'icon-camrecorder',

        },
        {
            name:  T.translate("User Groups"),
            url: '/auth/admin/user-groups',
            icon: 'icon-people',

        },
        {
            name: T.translate("Users"),
            url: '/auth/admin/users',
            icon: 'icon-people',

        },
        {
            name: T.translate("Exercises"),
            url: '/auth/admin/exercises',
            icon: 'icon-book-open',

        },
        {
            name: T.translate("Exams"),
            url: '/auth/admin/exams',
            icon: 'icon-badge',

        },
        {
            name: T.translate("News"),
            url: '/auth/admin/news',
            icon: 'icon-bell',

        },
        {
            name: T.translate("Settings"),
            url: '/auth/super-admin/settings',
            icon: 'icon-settings',

        },
        {
            name: T.translate("Logout"),
            url: '/auth/logout',
            icon: 'icon-logout',

        },
    ]
};
