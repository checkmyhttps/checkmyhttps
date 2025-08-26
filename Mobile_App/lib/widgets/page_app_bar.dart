import "package:flutter/material.dart";

import "./page_drawer.dart";

class PageAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  final Size preferredSize;

  const PageAppBar({super.key}) : preferredSize = const Size.fromHeight(60.0);

  final ShapeBorder kBackButtonShape = const RoundedRectangleBorder(
    borderRadius: BorderRadius.only(
      topRight: Radius.circular(30),
      bottomRight: Radius.circular(30),
    ),
  );

  void handleOpenDrawer(BuildContext context) {
    Scaffold.of(context).openDrawer();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        Card(
          color:
              Theme.of(context).brightness == Brightness.light
                  ? Colors.white
                  : Colors.black,
          shadowColor:
              Theme.of(context).brightness == Brightness.light
                  ? Colors.black
                  : Colors.grey,
          elevation: 2.5,
          margin: const EdgeInsets.all(0),
          shape: kBackButtonShape,
          child: GestureDetector(
            behavior: HitTestBehavior.translucent,
            onTap: () => handleOpenDrawer(context),
            child: SizedBox(
              height: kToolbarHeight,
              width: 80,
              child: Icon(
                Icons.menu,
                size: kMinInteractiveDimension * 0.6,
                color:
                    Theme.of(context).brightness == Brightness.light
                        ? Colors.black
                        : Colors.white,
              ),
            ),
          ),
        ),
        Card(
          color:
              Theme.of(context).brightness == Brightness.light
                  ? Colors.white
                  : Colors.black,
          shadowColor:
              Theme.of(context).brightness == Brightness.light
                  ? Colors.black
                  : Colors.grey,
          elevation: 2.5,
          margin: const EdgeInsets.all(0),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.only(bottomLeft: Radius.circular(30)),
          ),
          child: SizedBox(
            width: MediaQuery.of(context).size.width - 120,
            height: kToolbarHeight,
            child: Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.only(left: 30),
                child: Text(
                  kdrawerItems
                      .firstWhere(
                        (item) =>
                            item.route == ModalRoute.of(context)?.settings.name,
                        orElse: () => kdrawerItems.first,
                      )
                      .name(context),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 25,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
