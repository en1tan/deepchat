import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Chat from './Chat';
const dotnev = require('dotenv');

dotnev.config();

firebase.initializeApp({
  apiKey: "AIzaSyDvT8_6QvgM3Tnj80d-sDCX1V2Y56xyoqU",
    authDomain: "deep-chat-d317d.firebaseapp.com",
    databaseURL: "https://deep-chat-d317d.firebaseio.com",
    projectId: "deep-chat-d317d",
    storageBucket: "deep-chat-d317d.appspot.com",
    messagingSenderId: "513648440931",
    appId: "1:513648440931:web:79e3a3dd5c5ac269aeaa56",
    measurementId: "G-57BGVEH7YJ"
})


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>
      <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
      <section>
        <Chat />
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Connect with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName, email } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      email
    });
    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }


  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        {formValue === "" ? (
          (<button disabled><span role="img" aria-label="send">🕊️</span></button>)
        )
          :
          <button color="yellow"><span role="img" aria-label="send">🕊️</span></button>
      }
      </form>
      </>
  )

}

function ChatMessage(props) {
  const { text, uid, photoURL, email } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt={email} />
      <p>{email}<br />{text}</p>
    </div>
  )
}

// firebase.analytics();
export default App;