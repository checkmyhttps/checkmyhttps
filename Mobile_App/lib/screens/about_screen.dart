import "package:flutter/material.dart";

import "package:url_launcher/url_launcher.dart";

import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/constants/constants.dart";
import "package:checkmyhttps/l10n/l10n.dart";
import "package:checkmyhttps/settings/settings.dart";
import "package:checkmyhttps/widgets/widgets.dart";
import "package:checkmyhttps/extensions/extensions.dart";

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  void launchItemUrl(String url) async {
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      launchUrl(Uri.parse(url));
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Column(
      children: [
        DescriptionItem(
          title: AppLocalizations.of(context).titleAbout,
          subtitle: AppLocalizations.of(context).descriptionAbout,
        ),
        DescriptionItem(
          title: AppLocalizations.of(context).versionApp,
          subtitle: CmhAppSettings.instance.versionNumber,
        ),
        DescriptionItem(
          title: AppLocalizations.of(context).originalIdea,
          subtitle: Wrap(
            children: [
              Text(
                "- ",
                style: TextStyle(
                  color:
                      Theme.of(context).brightness == Brightness.light
                          ? const Color(0xFF616161)
                          : const Color(0xFF9E9E9E),
                  height: 1.5,
                ),
              ),
              TextLink(
                text: CmhConstants.originalIdea.name,
                link: CmhConstants.originalIdea.link,
              ),
            ],
          ),
        ),
        DescriptionItem(
          title: AppLocalizations.of(context).designDevProject,
          subtitle:
              CmhConstants.designDevProject
                  .map(
                    (contribution) => Wrap(
                      children: [
                        Text(
                          "- ${contribution.date} : ",
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color:
                                Theme.of(context).brightness == Brightness.light
                                    ? const Color(0xFF616161)
                                    : const Color(0xFF9E9E9E),
                            height: 1.5,
                          ),
                        ),
                        ...Iterable<int>.generate(
                          contribution.contributors.length,
                        ).toList().map((idx) {
                          return idx == 0
                              ? [
                                TextLink(
                                  text: contribution.contributors[idx].name,
                                  link: contribution.contributors[idx].link,
                                ),
                              ]
                              : [
                                Text(
                                  " & ",
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).brightness ==
                                                Brightness.light
                                            ? const Color(0xFF616161)
                                            : const Color(0xFF9E9E9E),
                                    height: 1.5,
                                  ),
                                ),
                                TextLink(
                                  text: contribution.contributors[idx].name,
                                  link: contribution.contributors[idx].link,
                                ),
                              ];
                        }).flattened,
                      ],
                    ),
                  )
                  .toList(),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 30),
          child: Image(
            image: const AssetImage(CmhAssets.logoEsieaColor),
            width: size.width * .7,
            fit: BoxFit.contain,
          ),
        ),
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : Colors.black,
            BlendMode.srcATop,
          ),
          child: Image(
            image: const AssetImage(CmhAssets.logoCns),
            width: size.width / 4,
            fit: BoxFit.contain,
          ),
        ),
      ],
    );
  }
}
