import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Category, Listname } from '../../Model/ImageSection';
import { ThemeService } from '../../../services/theme.service';


/**
 * Generated class for the ActivitymodalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-activitymodal',
  templateUrl: 'activitymodal.html',
})
export class ActivitymodalPage {

list = new Category().CategoryList;
category:any = {};
iconList = new Listname().iconsList;
isDarkTheme: boolean = true;
private themeSub: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage, public events: Events,
    private themeService: ThemeService) {
    this.category = this.navParams.get('act');
  }
  select(activity){
    Listname.setListName(activity);
    this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivitymodalPage');
  }

  ionViewDidEnter() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme(this.isDarkTheme);
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme(this.isDarkTheme);
    });

    this.themeSub = this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });

    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewWillLeave() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
    this.events.unsubscribe('theme:changed');
  }

  applyTheme(isDark: boolean) {
    const element = document.querySelector('page-activitymodal');
    if (element) {
      if (isDark) {
        element.classList.remove('light-theme');
      } else {
        element.classList.add('light-theme');
      }
    } else {
      setTimeout(() => {
        const retryElement = document.querySelector('page-activitymodal');
        if (retryElement) {
          if (isDark) {
            retryElement.classList.remove('light-theme');
          } else {
            retryElement.classList.add('light-theme');
          }
        }
      }, 100);
    }
  }

}
