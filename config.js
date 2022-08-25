import firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore'

var firebaseConfig = {
    apiKey: "AIzaSyA8WRNwBm--ogABAdnIkS1eNpxVWVF515g",
    authDomain: "biblioteca-aula-71.firebaseapp.com",
    projectId: "biblioteca-aula-71",
    storageBucket: "biblioteca-aula-71.appspot.com",
    messagingSenderId: "986879481981",
    appId: "1:986879481981:web:edf979e02eae905f82b914"
  };
  
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();