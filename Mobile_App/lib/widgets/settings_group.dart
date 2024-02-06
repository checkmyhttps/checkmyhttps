import "package:flutter/material.dart";

import "./settings_item.dart";

class SettingsGroup extends StatelessWidget {
  final String? title;
  final Color? backgroundColor;
  final TextStyle? titleStyle;
  final List<SettingsItem> items;

  const SettingsGroup({
    Key? key,
    required this.items,
    this.title,
    this.backgroundColor,
    this.titleStyle = const TextStyle(
      fontSize: 25,
      fontWeight: FontWeight.bold,
    ),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          (title != null)
              ? Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Text(
                    title!,
                    style: titleStyle,
                  ),
                )
              : const SizedBox.shrink(),
          Container(
            decoration: BoxDecoration(
              color: backgroundColor ??
                  (Theme.of(context).brightness == Brightness.light
                      ? Colors.white
                      : Colors.black),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              children: [
                ...Iterable<int>.generate(
                  items.length,
                ).toList().map((idx) {
                  return idx == items.length - 1
                      ? items[idx]
                      : Container(
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: (Theme.of(context).brightness ==
                                            Brightness.light
                                        ? Colors.black
                                        : Colors.white)
                                    .withOpacity(0.1),
                                width: 0,
                              ),
                            ),
                          ),
                          child: items[idx],
                        );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
