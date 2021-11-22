import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'page-how',
  templateUrl: 'how.html',
})
export class HowPage {
  _imageViewerCtrl: PhotoViewer;

  constructor(public navCtrl: NavController, public navParams: NavParams, imageViewerCtrl: PhotoViewer) {
    this._imageViewerCtrl = imageViewerCtrl;
  }

  presentImage(myImage) {
    this._imageViewerCtrl.show(myImage);
  }
}
