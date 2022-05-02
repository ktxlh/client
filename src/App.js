import React, { useState } from "react";
import io from "socket.io-client";

let endPoint = "http://127.0.0.1:8000";
// let endPoint = "http://35.188.189.237:8000";
let socket = io.connect(`${endPoint}`);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chat_id, setChatId] = useState("");
  const [user_id, setUserId] = useState("");
  const [is_listener, setListener] = useState(true);
  const [predictions, setPredictions] = useState([]);

  socket.on("error", args => {
    alert("Received error from backend: " + args);
  });

  socket.on("new_message", args => {
    setMessages([...messages, {"is_listener": args["is_listener"], "utterance": args["utterance"]}]);
    setPredictions(args["predictions"]);
  });

  socket.on("login_response", args => {
    if (!args["valid"]) {
      alert("Invalid login. Check your input.")
      console.log("Logged in failed");
    }
    else {
      setListener(args["is_listener"]);
      console.log("Logged in successfully");
    }
  });

  socket.on("dump_logs_success", () => {
    console.log("Dumpped logs successfully");
  });
  

  const onSetUserId = e => {
    setUserId(e.target.value);
  };
  const onSetChatId = e => {
    setChatId(e.target.value);
  };

  const onLogIn = () => {
    socket.emit("log_user", chat_id, user_id);
  };

  const onChangeMessage = e => {
    setMessage(e.target.value);
  };

  const onSendMessage = () => {
    if (message !== "") {
      socket.emit("add_message", is_listener, message);
      setMessage("");
    } else {
      alert("Please add a message.");
    }
  };

  const onSelectPred = x => {
    socket.emit("log_click", is_listener, -1);
    setMessage(x);
  };

  const onDumpLogs = () => {
    socket.emit("dump_logs");
  };

  const onClearSession = () => {
    socket.emit("clear_session");
  };

  return (
    <div>
      <h1>This is a dummy frontend to test our backend.</h1>
      chat_id: <input value={chat_id} name="Chat ID" onChange={e => onSetChatId(e)}/>.
      user_id: <input value={user_id} name="User ID" onChange={e => onSetUserId(e)}/>.
      <br/>
      <button onClick={() => onLogIn()}>Log In</button>
      <br/>
      <p>{is_listener? "Listener" : "Client"}</p><br/>
      <button onClick={() => onDumpLogs() }>Dump Logs</button><br/>
      <button onClick={() => onClearSession() }>Clear Session</button><br/>

      {messages.length > 0 &&
        messages.map(x => (
            <div> 
              <p>{x["is_listener"] === is_listener? "Me" : "Other"}: {x["utterance"]}</p>
            </div>
        ))}
      {is_listener && 
        predictions.length > 0 &&
        predictions.map(x => (
          <div>
            <button onClick={() => onSelectPred(x)}>{x}</button>
          </div>
        ))}
      <input value={message} name="message" onChange={e => onChangeMessage(e)} width="100"/>
      <button onClick={() => onSendMessage()}>Send Message</button>
    </div>
  );
};

export default App;

