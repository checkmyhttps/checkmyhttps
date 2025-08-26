import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";

class Alert extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final ImageProvider? image;

  const Alert({super.key, this.title, this.subtitle, this.image});

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return CupertinoAlertDialog(
      title:
          title != null
              ? Text(
                title!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  height: 1.5,
                  fontSize: 25,
                ),
              )
              : null,
      content:
          subtitle != null || image != null
              ? image == null
                  ? Text(
                    subtitle!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(height: 1.5, fontSize: 20),
                  )
                  : subtitle == null
                  ? Image(
                    image: image!,
                    width: size.width / 4,
                    fit: BoxFit.contain,
                  )
                  : Column(
                    children: [
                      Image(
                        image: image!,
                        width: size.width / 4,
                        fit: BoxFit.contain,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Divider(
                          color: (Theme.of(context).brightness ==
                                      Brightness.light
                                  ? Colors.black
                                  : Colors.white)
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      Text(
                        subtitle!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(height: 1.5, fontSize: 20),
                      ),
                    ],
                  )
              : null,
    );
  }
}
