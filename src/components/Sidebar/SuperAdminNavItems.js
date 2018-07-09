import T from "i18n-react/dist/i18n-react";
import '../../i18n';

export default {
  items: [
    {
      name: T.translate("Dashboard"),
      url: '/auth/super-admin/dashboard',
      icon: 'icon-speedometer',

    },
    {
        name: T.translate("Devices"),
        url: '/auth/super-admin/devices',
        icon: 'icon-camrecorder',

    },
      {
          name: T.translate("Admin Users"),
          url: '/auth/super-admin/admin-users',
          icon: 'icon-people',

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
