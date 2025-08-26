import "package:checkmyhttps/utils/utils.dart";
import "package:flutter/material.dart";

import "package:checkmyhttps/assets/assets.dart";
import "package:checkmyhttps/config/config.dart";
import "package:checkmyhttps/l10n/l10n.dart";

class HowScreen extends StatefulWidget {
  const HowScreen({super.key});

  @override
  State<HowScreen> createState() => _HowScreenState();
}

class _HowScreenState extends State<HowScreen> {
  @override
  Widget build(BuildContext context) {
    final paragraphs = AppLocalizations.of(context).howText.split("\n");
    final size = MediaQuery.of(context).size;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Text(
              AppLocalizations.of(context).explanation,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemBuilder: (context, idx) {
            return Text(
              paragraphs[idx],
              textAlign: TextAlign.justify,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color:
                    Theme.of(context).brightness == Brightness.light
                        ? const Color(0xFF616161)
                        : const Color(0xFF9E9E9E),
                height: 1.5,
              ),
            );
          },
          separatorBuilder: (context, idx) => const SizedBox(height: 20),
          itemCount: paragraphs.length,
        ),
        Padding(
          padding: const EdgeInsets.only(top: 20),
          child: Text(
            AppLocalizations.of(
              context,
            ).defaultServer(CmhConfig.checkServerAddress),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontStyle: FontStyle.italic,
              color:
                  Theme.of(context).brightness == Brightness.light
                      ? const Color(0xFF616161)
                      : const Color(0xFF9E9E9E),
              height: 1.5,
              fontSize: 12,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 40),
          child: Text(
            AppLocalizations.of(context).howImageTitle,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color:
                  Theme.of(context).brightness == Brightness.light
                      ? const Color(0xFF616161)
                      : const Color(0xFF9E9E9E),
              height: 1.5,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 20, bottom: 10),
          child: GestureDetector(
            onTap: () {
              showFullscreenImage(
                context,
                const AssetImage(CmhAssets.cmhExplication),
              );
            },
            child: Image(
              image: const AssetImage(CmhAssets.cmhExplication),
              width: size.width * .95,
              fit: BoxFit.contain,
            ),
          ),
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(
              AppLocalizations.of(context).howImageLegend,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
