import React, { useState } from "react";
import io from "socket.io-client";

let endPoint = "http://127.0.0.1:8080";
// let endPoint = "http://chat.shangling.info:8080";
let socket = io.connect(`${endPoint}`);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user_id, setId] = useState("");
  const [is_listener, setListener] = useState(true);
  const [predictions, setPredictions] = useState([]);

  socket.on("error", args => {
    alert("Received error from backend: " + args);
  });

  socket.on("new_message", args => {
    setMessages([...messages, {"is_listener": args["is_listener"], "utterance": args["utterance"]}]);
    setPredictions(args["predictions"]);
  });

  socket.on("log_user_success", () => {
    console.log("Logged in successfully");
  });

  socket.on("dump_logs_success", () => {
    console.log("Dumpped logs successfully");
  });
  
  const onChangeMessage = e => {
    setMessage(e.target.value);
  };

  const onSetId = e => {
    setId(e.target.value);
  };

  const onChangeRole = e => {
    setListener(e.target.value === "listener");
  };

  const onLogIn = () => {
    socket.emit("log_user", is_listener, user_id);
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
    socket.emit("log_click", is_listener, x["pred_idx"]);
    setMessage(x["utterance"]);
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
      My assigned ID is: <input value={user_id} name="User ID" onChange={e => onSetId(e)}/>.
      I'm a <select id="role" onChange={x => onChangeRole(x)}>
        <option value="listener" selected>Listener</option>
        <option value="client">Client</option>
      </select> in this mock chat.
      <br/>
      <button onClick={() => onLogIn()}>Log In</button>
      <br/>
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
            <button onClick={() => onSelectPred(x)}>{x["utterance"]}</button>
          </div>
        ))}
      <input value={message} name="message" onChange={e => onChangeMessage(e)} width="100"/>
      <button onClick={() => onSendMessage()}>Send Message</button>
    </div>
  );
};

export default App;

