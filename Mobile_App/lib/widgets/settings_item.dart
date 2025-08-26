import "package:flutter/material.dart";

class SettingsItem extends StatelessWidget {
  final IconData? icon;
  final Color? iconColor;
  final Color? iconBackgroundColor;
  final double iconBorderRadius;
  final String title;
  final TextStyle titleStyle;
  final String? subtitle;
  final TextStyle subtitleStyle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool? trailingSubtitle;
  final EdgeInsets? padding;

  const SettingsItem({
    super.key,
    this.icon,
    required this.title,
    this.iconColor,
    this.iconBackgroundColor,
    this.iconBorderRadius = 8,
    this.titleStyle = const TextStyle(fontWeight: FontWeight.bold),
    this.subtitle,
    this.subtitleStyle = const TextStyle(color: Colors.grey),
    this.trailing,
    this.trailingSubtitle,
    this.onTap,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final subtitleWidget =
        subtitle != null ? Text(subtitle!, style: subtitleStyle) : null;

    return ListTile(
      contentPadding: padding,
      onTap: onTap,
      leading:
          icon != null
              ? Container(
                decoration: BoxDecoration(
                  color:
                      iconBackgroundColor ??
                      (Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : Colors.black),
                  borderRadius: BorderRadius.circular(iconBorderRadius),
                ),
                padding: const EdgeInsets.all(5),
                child: Icon(
                  icon,
                  size: 20,
                  color:
                      iconColor ??
                      (Theme.of(context).brightness == Brightness.dark
                          ? Colors.black
                          : Colors.white),
                ),
              )
              : null,
      title: Text(title, style: titleStyle),
      subtitle:
          trailingSubtitle != null && trailing != null
              ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  subtitleWidget ?? const SizedBox.shrink(),
                  trailing!,
                ],
              )
              : subtitleWidget,
      trailing:
          trailingSubtitle == null
              ? trailing ??
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    color:
                        Theme.of(context).brightness == Brightness.light
                            ? Colors.black
                            : Colors.white,
                  )
              : null,
    );
  }
}
