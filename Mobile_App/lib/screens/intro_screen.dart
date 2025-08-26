import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/routes/routes.dart";
import "package:checkmyhttps/services/services.dart";

import "package:flutter/material.dart";

import "package:introduction_screen/introduction_screen.dart";

class IntroScreen extends StatefulWidget {
  const IntroScreen({super.key});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen> {
  final NavigationService _navigationService = NavigationService();
  final IStorageService _storageService = SharedPrefsStorageService();

  void handleSkipOrDone() async {
    await _storageService.setAppFirstRun(false);

    _navigationService.pushNamedAndRemoveUntil(CmhAppRoutes.home);
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return IntroductionScreen(
      globalBackgroundColor: Theme.of(context).colorScheme.surface,
      showSkipButton: SharedPrefsStorageService().getAppFirstRun(),
      showDoneButton: SharedPrefsStorageService().getAppFirstRun(),
      showBackButton: !SharedPrefsStorageService().getAppFirstRun(),
      pages: [
        PageViewModel(
          useRowInLandscape:
              (MediaQuery.of(context).size.width >
                  MediaQuery.of(context).size.height),
          title: AppLocalizations.of(context).introTitle1,
          body: AppLocalizations.of(context).intro1,
          image: Image(
            image: const AssetImage(CmhAssets.intro1),
            width: size.width * .9,
            fit: BoxFit.contain,
          ),
        ),
        PageViewModel(
          useRowInLandscape:
              (MediaQuery.of(context).size.width >
                  MediaQuery.of(context).size.height),
          title: AppLocalizations.of(context).introTitle2,
          body: AppLocalizations.of(context).intro2,
          image: Image(
            image: const AssetImage(CmhAssets.intro2),
            width: size.width * .9,
            fit: BoxFit.contain,
          ),
        ),
        PageViewModel(
          useRowInLandscape:
              (MediaQuery.of(context).size.width >
                  MediaQuery.of(context).size.height),
          title: AppLocalizations.of(context).introTitle3,
          body: AppLocalizations.of(context).intro3,
          image: Image(
            image: const AssetImage(CmhAssets.intro3),
            width: size.width * .9,
            //fit: BoxFit.contain,
          ),
        ),
      ],
      onDone: handleSkipOrDone,
      onSkip: handleSkipOrDone,
      skip: Text(AppLocalizations.of(context).close),
      done: Text(AppLocalizations.of(context).close),
      next: Text(AppLocalizations.of(context).next),
      back:
          SharedPrefsStorageService().getAppFirstRun()
              ? null
              : Text(AppLocalizations.of(context).previous),
      dotsDecorator: DotsDecorator(
        activeColor: Theme.of(context).primaryColor,
        color: Colors.grey,
      ),
      skipStyle: TextButton.styleFrom(
        foregroundColor:
            Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
      ),
      doneStyle: TextButton.styleFrom(
        foregroundColor:
            Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
      ),
      nextStyle: TextButton.styleFrom(
        foregroundColor:
            Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
      ),
      backStyle: TextButton.styleFrom(
        foregroundColor:
            Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
      ),
    );
  }
}
