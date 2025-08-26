import "package:flutter/material.dart";

import "./page_app_bar.dart";
import "./page_drawer.dart";

class PageScafold extends StatefulWidget {
  final EdgeInsetsGeometry? margin;
  final Widget child;
  final bool? withAppBar;
  final bool? scrollable;

  const PageScafold({
    super.key,
    this.margin = const EdgeInsets.only(
      left: 10,
      right: 10,
      top: kToolbarHeight / 2,
    ),
    this.withAppBar = true,
    this.scrollable = false,
    required this.child,
  });

  @override
  State<PageScafold> createState() => _PageScafoldState();
}

class _PageScafoldState extends State<PageScafold> {
  final GlobalKey<ScaffoldState> drawerKey = GlobalKey();

  void handleOpenDrawer(GlobalKey<ScaffoldState> drawerKey) {
    drawerKey.currentState?.openDrawer();
  }

  @override
  Widget build(BuildContext context) {
    final Widget childWidget = Container(
      width: MediaQuery.of(context).size.width,
      margin: widget.margin,
      child: widget.child,
    );

    return SafeArea(
      child: Scaffold(
        backgroundColor: Theme.of(context).colorScheme.surface,
        drawer: const PageDrawer(),
        appBar: widget.withAppBar == true ? const PageAppBar() : null,
        body:
            widget.scrollable == true
                ? SingleChildScrollView(child: childWidget)
                : childWidget,
      ),
    );
  }
}
