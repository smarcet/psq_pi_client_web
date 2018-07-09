import T from "i18n-react/dist/i18n-react";
import '../../i18n';

export default {
    items: [
        {
            name: T.translate("Dashboard"),
            url: '/auth/user/dashboard',
            icon: 'icon-speedometer',

        },
        {
            name: T.translate("Exercises"),
            url: '/auth/user/exercises',
            icon: 'icon-book-open',

        },
        {
            name: T.translate("Exams"),
            url: '/auth/user/exams',
            icon: 'icon-badge',

        },
        {
            name: T.translate("Statistics"),
            url: '/auth/user/statistics',
            icon: 'icon-graph',

        },
        {
            name: T.translate("Videos"),
            url: '/auth/user/videos',
            icon: 'icon-camrecorder',

        },
        {
            name: T.translate("Settings"),
            url: '/auth/user/settings',
            icon: 'icon-settings',

        },
        {
            name: T.translate("Logout"),
            url: '/auth/logout',
            icon: 'icon-logout',
        }
    ]
};
