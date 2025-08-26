import "package:flutter/material.dart";

Future<Dialog?> showFullscreenImage(
  BuildContext context,
  ImageProvider provider, {
  Color barrierColor = Colors.black38,
  Color closeButtonColor = Colors.white,
}) {
  return showDialog<Dialog>(
    context: context,
    barrierDismissible: true,
    barrierColor: barrierColor,
    builder: (context) {
      return FullscreenImageDialog(
        provider,
        backgroundColor: barrierColor,
        closeButtonColor: closeButtonColor,
      );
    },
  );
}

class FullscreenImageDialog extends StatefulWidget {
  final ImageProvider provider;
  final Color backgroundColor;
  final Color closeButtonColor;

  const FullscreenImageDialog(
    this.provider, {
    super.key,
    required this.backgroundColor,
    required this.closeButtonColor,
  });

  @override
  State<FullscreenImageDialog> createState() => _FullscreenImageDialogState();
}

class _FullscreenImageDialogState extends State<FullscreenImageDialog> {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      shadowColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(0),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      child: FullscreenImageView(provider: widget.provider),
    );
  }
}

class FullscreenImageView extends StatefulWidget {
  final ImageProvider provider;

  const FullscreenImageView({super.key, required this.provider});

  @override
  State<FullscreenImageView> createState() => _FullscreenImageViewState();
}

class _FullscreenImageViewState extends State<FullscreenImageView>
    with SingleTickerProviderStateMixin {
  final TransformationController _transformationController =
      TransformationController();

  TapDownDetails _doubleTapDetails = TapDownDetails();
  late AnimationController _animationController;
  Animation<Matrix4>? _doubleTapAnimation;

  @override
  void initState() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return SizedBox(
      height: size.height * .6,
      child: InteractiveViewer(
        transformationController: _transformationController,
        minScale: 1,
        maxScale: 5,
        child: GestureDetector(
          onDoubleTapDown: _handleDoubleTapDown,
          onDoubleTap: _handleDoubleTap,
          child: Image(image: widget.provider),
        ),
      ),
    );
  }

  void _handleDoubleTapDown(TapDownDetails details) {
    _doubleTapDetails = details;
  }

  void _handleDoubleTap() {
    _doubleTapAnimation?.removeListener(_animationListener);

    double scale = _transformationController.value.getMaxScaleOnAxis();

    if (scale < 2.0) {
      final position = _doubleTapDetails.localPosition;
      final begin = _transformationController.value;
      final end =
          Matrix4.identity()
            ..translate(-position.dx, -position.dy)
            ..scale(2.0);

      _updateDoubleTapAnimation(begin, end);
      _animationController.forward(from: 0.0);
    } else {
      final begin = Matrix4.identity();
      final end = _transformationController.value;

      _updateDoubleTapAnimation(begin, end);

      _animationController.reverse(from: scale - 1.0);
    }
  }

  void _updateDoubleTapAnimation(Matrix4 begin, Matrix4 end) {
    _doubleTapAnimation = Matrix4Tween(begin: begin, end: end).animate(
      CurveTween(curve: Curves.easeInOut).animate(_animationController),
    );
    _doubleTapAnimation?.addListener(_animationListener);
  }

  void _animationListener() {
    _transformationController.value =
        _doubleTapAnimation?.value ?? Matrix4.identity();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
