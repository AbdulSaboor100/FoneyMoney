 // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyBestuOMbqo2cKIFzj5Ode9E8Xy5EhfiAU",
    authDomain: "vipp-817e7.firebaseapp.com",
    projectId: "vipp-817e7",
    storageBucket: "vipp-817e7.appspot.com",
    messagingSenderId: "638028005308",
    appId: "1:638028005308:web:a062563bfb17c4e2f535b9",
    measurementId: "G-QHB4VXCEQH"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  ///////////////////////////////


let db = firebase.firestore();
let auth = firebase.auth();
let storage = firebase.storage();

let userName = document.getElementById('username');
let email = document.getElementById('email');
let password = document.getElementById('password');
let MPIN = document.getElementById("MPIN")

function register(){
    auth.createUserWithEmailAndPassword(email.value,password.value)
        .then(async(UserCredientials)=>{
            let dataObj = {
                email : UserCredientials.user.email,
                username : userName.value,
                MPIN : MPIN.value,
                UID : UserCredientials.user.uid
            }
            
            await saveDataToFirestore(dataObj)
       
        })
        .catch((error)=>{
            console.log(error.message)
        })
}


function login(){
    auth.signInWithEmailAndPassword(email.value,password.value)
        .then((UserCredientials)=>{
            console.log('Login')
        })
        .catch((error)=>{
            console.log(error.message)
        })
}

async function saveDataToFirestore(dataObjEl){
    let currentUser = auth.currentUser;
    await db.collection('foneyUsers').doc(currentUser.uid).set(dataObjEl)
    await db.collection('foneyUsers').doc(currentUser.uid).collection('balance').doc(docUID).set({
        balance : 0
    })
}

let docUID ;
let bodys =document.getElementById('bodys');
auth.onAuthStateChanged((user) => {
    let pageLocArr = window.location.href.split('/');
    let pageName = pageLocArr[pageLocArr.length - 1];
    let authenticatedPages = ['home.html','transferToAccount.html','deposit.html'];
    let currentUser = auth.currentUser;
    docUID = currentUser.uid



  
  setTimeout(function(){
    if (user && authenticatedPages.indexOf(pageName) === -1) {
        window.location = '../home.html';
        
    }
     if (!user && pageName === 'home.html') {
        window.location = './index.html';
    }
  },3000)


});




async function logOut(){

    await auth.signOut()

}

let names = document.getElementById('name');
let accountNo = document.getElementById('accountNo')


async function dataRetrive(){
    let currentUser = auth.currentUser;
    
        let userFetch = await db.collection('foneyUsers').doc(currentUser.uid).get()
        let Uname = userFetch.data().username;
        let accountNumber = userFetch.data().UID;
        accountNo.innerHTML = `Your Account Number : ${accountNumber}`
        names.innerHTML = Uname; 

}

setTimeout(async function(){
    if(window.location.href == 'file:///E:/SMIT%20WORK/JS/JSFirebase/MoneyApp/home.html' ){
       fetchBalance()
       dataRetrive()
}
},3000)



let balance = document.getElementById('balance')

async function fetchBalance(){
    let fetchdata = await db.collection('foneyUsers').doc(docUID).collection('balance').doc(docUID).onSnapshot(function(doc){
        let dataBal = doc.data();
        if(dataBal == null){
            balance.innerHTML = `Balance : 0 Rs`
        }else{
            balance.innerHTML = `Balance : ${dataBal.balance} Rs`
        }

    })

}


// setTimeout(function(){
//     db.collection('foneyUsers').doc(docUID).collection('balance').doc(docUID).set({
//         balance : '1000'
//     })
// },3000)

function deposit(){
        window.location = 'transactions/deposit.html';
}

async function transferToAcc(){
    let currentUser = auth.currentUser;
    let fetchdata = await db.collection('foneyUsers').doc(currentUser.uid).collection('balance').doc(docUID).get()
    console.log(fetchdata.data())
    if(fetchdata.data().balance != 0){
        window.location = 'transactions/transferToAccount.html'
    }else{
        alert(`You Don't Have Money`)
    }

}

let STANumber = document.getElementById('STANumber');
let mPin = document.getElementById('MPIN')
let money = document.getElementById('money');

async function sendMoney(){
    let currentUser = auth.currentUser;
    let checkUserUID = await db.collection('foneyUsers').get()
    checkUserUID.forEach( async (UserUID)=>{
        if(UserUID.data().UID === STANumber.value){
            let userMPin =  await db.collection('foneyUsers').doc(currentUser.uid).get()
                if(userMPin.data().MPIN === mPin.value){
                    let fetchdata = await db.collection('foneyUsers').doc(docUID).collection('balance').doc(docUID).get()
                    if(fetchdata.data().balance >= money.value){
                        db.collection('foneyUsers').doc(STANumber.value).collection('balance'). doc(STANumber.value).update({
                            balance :  firebase.firestore.FieldValue.increment(money.value)
                        }) .then(async ()=>{
                            let fetchdata = await db.collection('foneyUsers').doc(currentUser.uid).collection('balance').doc(docUID).update({
                                balance :  firebase.firestore.FieldValue.increment(-money.value)
                            })
                            window.location = '../home.html'
                        })
                    }
                       
                }
        }
    })
}

// db.collection('foneyUsers').doc(STANumber.value).collection('balance').doc(STANumber.value).update({
//     balance :  firebase.firestore.FieldValue.increment(money.value)
// })  