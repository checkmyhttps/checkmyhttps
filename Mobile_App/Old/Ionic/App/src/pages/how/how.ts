import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ImageViewerController } from 'ionic-img-viewer';

@Component({
  selector: 'page-how',
  templateUrl: 'how.html',
})
export class HowPage {
  _imageViewerCtrl: ImageViewerController;

  constructor(public navCtrl: NavController, public navParams: NavParams, imageViewerCtrl: ImageViewerController) {
    this._imageViewerCtrl = imageViewerCtrl;
  }

  presentImage(myImage) {
    const imageViewer = this._imageViewerCtrl.create(myImage);
    imageViewer.present();
  }
}
