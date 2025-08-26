import "package:flutter/material.dart";

class DescriptionItem extends StatelessWidget {
  final String title;
  final dynamic subtitle;
  final EdgeInsetsGeometry padding;

  const DescriptionItem({
    super.key,
    required this.title,
    required this.subtitle,
    this.padding = const EdgeInsets.only(bottom: 12),
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, height: 1.5),
          textAlign: TextAlign.justify,
        ),
      ),
      subtitle: Padding(
        padding: padding,
        child:
            subtitle.runtimeType == String
                ? Text(
                  subtitle,
                  style: TextStyle(
                    color:
                        Theme.of(context).brightness == Brightness.light
                            ? const Color(0xFF616161)
                            : const Color(0xFF9E9E9E),
                    height: 1.5,
                  ),
                  textAlign: TextAlign.justify,
                )
                : subtitle is List<dynamic>
                ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ...(subtitle as List<Widget>).map((sub) {
                      return Padding(
                        padding: EdgeInsets.only(
                          bottom:
                              (subtitle as List<Widget>).indexOf(sub) !=
                                      (subtitle as List<Widget>).length - 1
                                  ? 8
                                  : 0,
                        ),
                        child: sub,
                      );
                    }),
                  ],
                )
                : subtitle,
      ),
    );
  }
}
