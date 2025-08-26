import "package:flutter/material.dart";

import "package:url_launcher/url_launcher.dart";

class TextLink extends StatelessWidget {
  final String? link;
  final String text;

  const TextLink({super.key, required this.link, required this.text});

  void launchItemUrl() async {
    if (link != null) {
      final uri = Uri.parse(link!);

      if (await canLaunchUrl(uri)) {
        launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(context) {
    return GestureDetector(
      onTap: launchItemUrl,
      child: Text(
        text,
        style: TextStyle(
          color:
              link != null
                  ? Colors.blue
                  : Theme.of(context).brightness == Brightness.light
                  ? const Color(0xFF616161)
                  : const Color(0xFF9E9E9E),
          height: 1.5,
        ),
      ),
    );
  }
}
