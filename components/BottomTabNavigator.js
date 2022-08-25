import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Ionicons from "react-native-vector-icons/Ionicons";
import TransactionScreen from "../screens/Transaction";
import SearchScreen from "../screens/Search";

const Tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component {
  render() {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator screenOptions={({route})=>({
            tabBarIcon:({focused,color,size})=>{
              let iconName;
              if (route.name==="Transação"){
                iconName="book"
              }
              else if (route.name==="Pesquisa") {
                iconName="search"
              }
              return(
                <Ionicons 
                name= {iconName} 
                size={size}
                color = {color}
                />
              )
            }
          })}
          tabBarOptions={{
            activeTintColor:'light-blue',
            inactiveTintColor:'light-red',
            style:{
              height:150,
              borderTopWidth:0,
              backgroundColor:"#5653D4"
            },
            labelStyle:{
              fontSize:21,
              fontFamily:""
            },
            labelPosition:"beside-icon",
            tabStyle:{
              marginTop:25,
              marginLeft:25,
              marginRight:25,
              borderRadius:60,
              borderWidth:3,
              alignItems:"center",
              justifyContent:"center",
              backgroundColor:"cyan"
            }
          }}
          >
            <Tab.Screen name="Transação" component={TransactionScreen} />
            <Tab.Screen name="Pesquisa" component={SearchScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}
