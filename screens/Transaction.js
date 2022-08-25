import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  alert,
  KeyboardAvoidingView
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config"
import { doc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import firebase from "firebase"
import { askAsync } from "expo-permissions";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      bookName:"",
      studentName:"",     
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false
    };
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*
      status === "granted" é verdadeiro se o usuário concedeu permissão
      status === "granted" é falso se o usuário não concedeu permissão
      */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  handleTransaction=async()=>{
    var {bookId,studentId} = this.state;
    

    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    var transaction_type = await this.checkBookAvailability(bookId)
    if (!transaction_type) {
      this.setState({
        bookId:"",
        studentId:""
      })
      alert("o livro não existe no banco de dados da biblioteca")
    }
    else if (transaction_type === "issue") {
      var is_elegible = await checkStudentElegibleForBookIssue (studentId)
      if (is_elegible) {
        var {bookName,studentName} = this.state
      } 
      this.initiateBookIssue(bookId,studentId,bookName,studentName)
      alert("livro entregue ao aluno")
    }

    else{
      var is_elegible = await checkStudentElegibleForBookReturn (studentId,bookId)
      if (is_elegible) {
        var {bookName,studentName} = this.state
      } 
      this.initiateBookIssue(bookId,studentId,bookName,studentName)
      alert("livro devolvido a biblioteca")
    }

    db.collection("books")
    .doc(bookId).get()
    .then(doc=>{

      var book =doc.data()

      if (book.is_book_avaliable) {
        var {bookName, studentName} = this.state;
        this.initiateBookIssue(bookID,studentId,bookName,studentName);
        alert("livro entregue Para O Aluno");
      }
      else {
          var {bookName, studentName} = this.state;
          this.initiateBookReturn(bookID,studentId,bookName,studentName);
          alert("livro entregue Para a biblioteca");
      }
    })
  }

  getBookDetails = bookId =>{
    bookId=bookId.trim();
    db.collection("books")
    .where("bookID","==",bookId)
    .get()
    .then(snapshot=>{
      this.setState({
        bookName:doc.data().book_details.bookName
      })
    })
  }

  getStudentDetails = studentId =>{
    studentId=studentId.trim();
    db.collection("studantes")
    .where("studentID","==",studentId)
    .get()
    .then(snapshot=>{
      this.setState({
        studentName:doc.data().student_details.studentName
      })
    })
  }
  initiateBookIssue=async(bookId,studentId,bookName,studentName)=>{
    db.collection("transactions").add({
      studentID:studentId,
      studentName:studentName,
      bookID:bookId,
      bookName:bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      transaction_type:"issue"
    })
    db.collection("books").doc(bookId).update({
      is_book_avaliable:false
    })

    db.collection("studantes").doc(studentId).update({
      number_of_books_issued:firebase.firestore.FieldValue.increment(1)
    })

    this.setState({
      studentId:"",bookId:""
    })
  }

  initiateBookReturn=async(bookId,studentId,bookName,studentName)=>{
    db.collection("transactions").add({
      studentID:studentId,
      studentName:studentName,
      bookID:bookId,
      bookName:bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      transaction_type:"issue"
    })
    db.collection("books").doc(bookId).update({
      is_book_avaliable:true
    })

    db.collection("studantes").doc(studentId).update({
      number_of_books_issued:firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      studentId:"",bookId:""
    })
  }

  checkBookAvailability = async bookId => {
    const bookRef = await db
    .collection("books")
    .where("bookID", "==", bookId ).get()
    var Transaction_type= ""
     if (bookRef.docs.length===0) {
      Transaction_type=false
     }
     else {
      bookRef.docs.map(doc=>{Transaction_type=doc.data().is_book_avaliable? "issue": "return" })
     }

     return Transaction_type

  }
    
  checkStudentElegibleForBookIssue = async studentId =>{
    const studentRef = await db
    .collection ("studantes").where("studantID","==", studentId).get()

    var isStudentElegible = "";
     if (studentRef.docs.length === 0) {
      this.setState ({
        bookId:"",
        studentId:""
      })
      isStudentElegible= false;
      alert("id do aluno não existe no banco de dados.")
     }
     else {
      studentRef.doc.map(doc=>{
        if (doc.data().number_of_books_issued < 2) {
          isStudentElegible = true
        }
        else {
          isStudentElegible=false
          alert("o aluno já retirou dois livros")
          this.setState({
            bookId:"",
            studentId:""
          })
        }
      })
     }
     return isStudentElegible
  }
  checkStudentElegibleForBookReturn = async (studentId, bookId) =>{
    const transactionRef = await db
    .collection ("transactions").where("bookID","==", bookId).limit(1).get()

    var isStudentElegible = "";
    transactionRef.docs.map(doc=>{
      var lastBookTransaction= doc.data()
      if (lastBookTransaction.studentID === studentId) {
        isStudentElegible = true
        alert("o livro não foi retirado por esse aluno")
        this.setState ({
          bookId:"",
          studentId:""
        })
      }
    })
     return isStudentElegible
  }
  render() {
    const { bookId, studentId, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Livro"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText={
                  text=>this.setState({
                    bookId:text
                  })
                }
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Estudante"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText={
                  text=>this.setState({
                    studentId:text
                  })
                }
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  }
});