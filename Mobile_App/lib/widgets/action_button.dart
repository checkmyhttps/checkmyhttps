import "package:flutter/material.dart";

class ActionButton extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;
  final bool disabled;
  final bool loading;
  final void Function()? onPressed;

  const ActionButton({
    super.key,
    required this.text,
    this.backgroundColor,
    this.textColor,
    this.onPressed,
    this.disabled = false,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.all(20),
        backgroundColor: backgroundColor ?? Theme.of(context).primaryColor,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
        ),
      ),
      onPressed: disabled || loading ? null : onPressed,
      child:
          loading
              ? Stack(
                alignment: AlignmentDirectional.center,
                children: [
                  const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  Text(
                    text,
                    style: const TextStyle(
                      fontSize: 15,
                      color: Color(0x00000000),
                    ),
                  ),
                ],
              )
              : Text(text, style: TextStyle(fontSize: 15, color: textColor)),
    );
  }
}
