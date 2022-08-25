import React, { Component } from "react";
import BottomTabNavigator from "./components/BottomTabNavigator";
import * as Font from "expo-font"

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      FontLoaded : false
    }

  }
  async loadFont (){
    await Font.loadAsync({

    });
    this.setState({FontLoaded:true})
  }
    componentDidMount(){
      this.loadFont()
    }
    render() {
      const {FontLoaded} = this.state;
      if (FontLoaded){
        return <BottomTabNavigator />;
      }
      return null;
  }
}
