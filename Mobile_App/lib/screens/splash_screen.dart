import "package:flutter/material.dart";

import "package:checkmyhttps/routes/routes.dart";
import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/services/services.dart";
import "package:checkmyhttps/settings/settings.dart";

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  final NavigationService _navigationService = NavigationService();
  final IStorageService _storageService = SharedPrefsStorageService();
  late final AnimationController _animationController = AnimationController(
    duration: const Duration(milliseconds: 2500),
    vsync: this,
  )..repeat(reverse: true);

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1500)).whenComplete(() {
      _navigationService.pushNamedAndRemoveUntil(
        _storageService.getAppFirstRun()
            ? CmhAppRoutes.intro
            : CmhAppRoutes.home,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Column(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FadeTransition(
                opacity: _animationController.drive(
                  CurveTween(curve: Curves.easeInOut),
                ),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  height: size.height * 0.2,
                  child: LayoutBuilder(
                    builder: (
                      BuildContext layoutContext,
                      BoxConstraints constraints,
                    ) {
                      var layoutSize = Size(
                        constraints.maxWidth,
                        constraints.maxHeight,
                      );
                      return Image(
                        image: const AssetImage(CmhAssets.logo),
                        height: layoutSize.height,
                        width: layoutSize.width,
                        fit: BoxFit.contain,
                      );
                    },
                  ),
                ),
              ),
              SizedBox(
                height: size.height * 0.2,
                child: FittedBox(
                  fit: BoxFit.contain,
                  child: Text(
                    "CheckMyHTTPS",
                    style: TextStyle(
                      fontSize: size.width,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 40),
          child: Text(
            "V ${CmhAppSettings.instance.versionNumber}",
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
