import { Component } from '@angular/core';
import { NavController,
  AlertController, // To Add Button
  ActionSheetController // To delete
 } from 'ionic-angular';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from '@firebase/util';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  currentUser:any;
  userRef:any;
  users:AngularFireList<any>;
  mensajesRef:any;
  mensajes:AngularFireList<any>;


  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public afDatabase: AngularFireDatabase,
    public afAuth: AngularFireAuth
  ) {
    this.userRef = afDatabase.list('users');
    this.users = this.userRef.valueChanges();

    this.mensajesRef = afDatabase.list('mensajes');
    this.mensajes = this.mensajesRef.valueChanges();

    afAuth.authState.subscribe(user => {
      if (!user) {
        this.currentUser = null;
        return;
      }
      this.currentUser = {uid:user.uid, photoURL: user.photoURL, name:user.displayName};

    });
  }

addMessage(){
let prompt = this.alertCtrl.create({
  title: 'Mensaje',
  message: "Comparte este mensaje con tus amigos",
  inputs: [
    {
      name: 'mensaje',
      placeholder: 'Mensaje:'
    },
  ],
  buttons: [
    {
      text: 'Cancel',
      handler: data => {
        console.log('Cancel clicked');
      }
    },
    {
      text: 'Publicar',
      handler: data => {
        const newmensajesRef = this.mensajesRef.push({});


        newmensajesRef.set({
          id: newmensajesRef.key,
          mensaje: data.mensaje,
          uid: this.currentUser.uid,
          uname:this.currentUser.name,
          likes:0
        });
      }
    }
  ]
});
prompt.present();
}

addDislikes(mensaId,likes){
  let like = likes - 1;
  this.mensajesRef.update(mensaId,{likes: like, lastUpdatedBy: this.currentUser.uid});
}
addlikes(mensaId,likes){
  let like = likes + 1;
  this.mensajesRef.update(mensaId,{likes: like, lastUpdatedBy: this.currentUser.uid});
}

  showOptions(mensaId, mensaCont, mensaAutor) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'What do you want to do?',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.removeMens(mensaId);
          }
        },{
          text: 'Actualizar',
          handler: () => {
            this.updateMens(mensaId, mensaCont);
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },{
          text: 'Seguir',
          handler: () => {
            this.addSeguir(mensaAutor);
          }
        }
      ]
    });
    actionSheet.present();
  }


  removeMens(mensaId: string){
    this.mensajesRef.remove(mensaId);
  }

  updateMens(mensaId, mensaCont){
    let prompt = this.alertCtrl.create({
      title: 'Mensaje:',
      message: "Editar mensaje",
      inputs: [
        {
          name: 'mensaje',
          placeholder: 'Mensaje',
          value: mensaCont
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Guardar',
          handler: data => {
            this.mensajesRef.update(mensaId, {
              mensaje: data.mensaje, lastUpdatedBy: this.currentUser.uname
            });
          }
        }
      ]
    });
    prompt.present();
  }

  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then((response)=>{
      console.log('resultado login google:', response);

      const userRef = this.afDatabase.list('users');

      userRef.update(response.user.uid,
        {
          userId: response.user.uid,
          displayName: response.user.displayName,
          photoURL: response.user.photoURL
        });
      //userRef.push({userId: xx.user.uid, displayName: xx.user.displayName}).then((xx)=>{

      //});

    });
  }

  loginWithEmail() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.EmailAuthProvider()).then((xx)=>{

    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }

}
