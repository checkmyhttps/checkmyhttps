import "package:flutter/material.dart";

class InputField extends StatefulWidget {
  final TextEditingController? controller;
  final void Function(String value)? onSubmit;
  final TextInputType? keyboardType;
  final String? text;
  final bool? withSuffix;
  final double maxHeight;
  final bool disabled;

  const InputField({
    Key? key,
    this.controller,
    this.onSubmit,
    this.keyboardType,
    this.text,
    this.withSuffix = true,
    this.maxHeight = 40,
    this.disabled = false,
  }) : super(key: key);

  @override
  State<InputField> createState() => _InputFieldState();
}

class _InputFieldState extends State<InputField> {
  late TextEditingController controller =
      widget.controller ?? TextEditingController(text: widget.text);

  void handleSubmit({String? value}) {
    if (widget.onSubmit != null) {
      widget.onSubmit!(value ?? controller.value.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      readOnly: widget.disabled,
      controller: controller,
      keyboardType: TextInputType.url,
      decoration: InputDecoration(
        constraints: BoxConstraints(
          maxHeight: widget.maxHeight,
        ),
        suffixIcon: widget.withSuffix != false
            ? ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.zero,
                  ),
                ),
                onPressed: handleSubmit,
                child: Icon(
                  Icons.save,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white,
                  size: 20,
                ),
              )
            : null,
        isDense: true,
        contentPadding: EdgeInsets.symmetric(
          vertical: widget.maxHeight * .3,
          horizontal: widget.maxHeight * .2,
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Theme.of(context).primaryColor,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Theme.of(context).primaryColor,
          ),
        ),
      ),
      onSubmitted: (value) => handleSubmit(value: value),
    );
  }
}
