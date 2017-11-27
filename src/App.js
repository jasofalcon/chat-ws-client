import React, { Component } from 'react';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import UserList from './components/UserList/UserList';
import Chat from './components/Chat/Chat';
import Singleton from './socket';
import MessageType from './components/Chat/SendMessage/MessageType';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

class App extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
      messages: [],
      thisUser: null,
      modalOpen: true,
      usernameInput: ''
    }
  }

  render() {
    const modalActions = [
      <RaisedButton
        label="Choose"
        primary={true}
        onClick={() => this.onChooseName()}
      />
    ];

    const modalStyle = {
      width: '600px'
    };

    const chat = <Chat messages={this.state.messages} thisUser={this.state.thisUser} />;

    return (
      <MuiThemeProvider>
        <div className="App">
          <UserList users={this.state.users} />
          {this.state.users.length > 0 ? chat : ''}
          <Dialog
            title="Choose your name"
            actions={modalActions}
            modal={true}
            open={this.state.modalOpen}
            contentStyle={modalStyle}>
            <TextField
              hintText="Write your name here..."
              value={this.state.usernameInput}
              onChange={(event) => this.updateInputValue(event.target.value)}
            />
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }

  registerSocket() {
    let self = this;
    this.socket = Singleton.getInstance();

    this.socket.onmessage = (response) => {
      let message = JSON.parse(response.data);
      let users;

      switch (message.type) {
        case MessageType.TEXT_MESSAGE:
          let messages = self.state.messages;
          messages.push(JSON.parse(response.data));
          self.setState({ messages: messages });
          break;
        case MessageType.USER_JOINED:
          users = JSON.parse(message.data);
          self.setState({ users });
          break;
        case MessageType.USER_LEFT:
          users = JSON.parse(message.data);
          self.setState({ users });
          break;
        case MessageType.USER_JOINED_ACK:
          let thisUser = message.user;
          self.setState({ thisUser });
          break;
        default:
      }
    }

    this.socket.onopen = () => {
      this.sendJoinedMessage();
    }

    window.onbeforeunload = () => {
      let messageDto = JSON.stringify({ user: this.state.thisUser, type: MessageType.USER_LEFT });
      this.socket.send(messageDto);
    }
  }

  sendJoinedMessage() {
    let messageDto = JSON.stringify({ user: this.state.usernameInput, type: MessageType.USER_JOINED });
    this.socket.send(messageDto);
  }

  onChooseName() {
    this.registerSocket();
    this.setState({ modalOpen: false });
  }

  updateInputValue(value) {
    this.setState({ usernameInput: value });
  }
}

export default App;
