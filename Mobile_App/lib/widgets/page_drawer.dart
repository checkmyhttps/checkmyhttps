import "package:flutter/material.dart";

import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/settings/settings.dart";
import "package:checkmyhttps/routes/routes.dart";
import "package:checkmyhttps/services/services.dart";

import "./settings_item.dart";

class PageDrawerDrawerItem {
  final String route;
  final Function(BuildContext) name;
  final IconData icon;

  const PageDrawerDrawerItem({
    required this.route,
    required this.icon,
    required this.name,
  });
}

List<PageDrawerDrawerItem> kdrawerItems = [
  PageDrawerDrawerItem(
    route: CmhAppRoutes.home,
    icon: Icons.home,
    name: (ctx) => AppLocalizations.of(ctx).home,
  ),
  PageDrawerDrawerItem(
    route: CmhAppRoutes.intro,
    icon: Icons.announcement,
    name: (ctx) => AppLocalizations.of(ctx).intro,
  ),
  PageDrawerDrawerItem(
    route: CmhAppRoutes.how,
    icon: Icons.question_mark,
    name: (ctx) => AppLocalizations.of(ctx).how,
  ),
  PageDrawerDrawerItem(
    route: CmhAppRoutes.about,
    icon: Icons.info,
    name: (ctx) => AppLocalizations.of(ctx).about,
  ),
  PageDrawerDrawerItem(
    route: CmhAppRoutes.settings,
    icon: Icons.settings,
    name: (ctx) => AppLocalizations.of(ctx).settings,
  ),
];

class PageDrawer extends StatefulWidget {
  const PageDrawer({super.key});

  @override
  State<PageDrawer> createState() => _PageDrawerState();
}

class _PageDrawerState extends State<PageDrawer> {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Theme.of(context).colorScheme.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Material(
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(10),
                bottomRight: Radius.circular(10),
              ),
            ),
            elevation: 2.5,
            color:
                Theme.of(context).brightness == Brightness.light
                    ? Colors.white
                    : Colors.black,
            shadowColor:
                Theme.of(context).brightness == Brightness.light
                    ? Colors.black
                    : Colors.grey,
            child: SizedBox(
              height: kToolbarHeight,
              child: Center(
                child: Text(
                  AppLocalizations.of(context).menu,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.separated(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: kdrawerItems.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (BuildContext context, int index) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).brightness == Brightness.light
                            ? Colors.white
                            : Colors.black,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: SettingsItem(
                    icon: kdrawerItems.elementAt(index).icon,
                    title: kdrawerItems.elementAt(index).name(context),
                    onTap:
                        () => NavigationService().pushNamed(
                          kdrawerItems.elementAt(index).route,
                        ),
                  ),
                );
              },
            ),
          ),
          Align(
            alignment: FractionalOffset.bottomCenter,
            child: Container(
              height: 50,
              width: MediaQuery.of(context).size.width,
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: (Theme.of(context).brightness == Brightness.light
                            ? Colors.black
                            : Colors.white)
                        .withValues(alpha: 0.1),
                    width: 0,
                  ),
                ),
              ),
              child: Center(
                child: Text(
                  "${AppLocalizations.of(context).version}: ${CmhAppSettings.instance.versionNumber}",
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
