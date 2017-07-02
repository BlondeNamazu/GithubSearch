import React, { Component } from 'react';
import './App.css';
import flux from 'flux';
import events from 'events';
import assign from 'object-assign';
import ReactDOM from 'react-dom'

// Dispatcher
var testDispatcher = new flux.Dispatcher();

// Action
var testConstants = {
  TEST: "test"
};

var TestAction = {
  test: function (testValue) {
    testDispatcher.dispatch({
      actionType: testConstants.TEST,
      value: testValue
    });
  }
};

// Store
var CHANGE_EVENT = "change";
var _test = {value: null};

var TestStore = assign({}, events.EventEmitter.prototype, {
  getAll: function () {
    return _test;
  },
  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },
  dispatcherIndex: testDispatcher.register(function (payload) {
    if (payload.actionType === testConstants.TEST) {
      _test.value = payload.value;
      TestStore.emitChange();
    }
  })
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      value: null 
    };
    this.setState = this.setState.bind(this);
  }
  setStateInListener() {
    this.setState(TestStore.getAll());
  }
  componentDidMount () {
    var self = this;
    TestStore.addChangeListener(() => {
      self.setState(TestStore.getAll());
    });
  }
  render () {
    return (
      <div className="testApp">
        <TestForm />
        <TestDisplay data={this.state.value} />
      </div>
    );
  }
}

class TestForm extends Component {
  send (e) {
    e.preventDefault();
    var testValue = ReactDOM.findDOMNode(this.refs.text_value).value.trim();
    TestAction.test(testValue);
    console.log(testValue);
    ReactDOM.findDOMNode(this.refs.text_value).value = "";
    return;
  }
  render () {
    return (
      <form>
        <input type="text" ref="text_value" />
        <button onClick={this.send.bind(this)}>送信</button>
      </form>
    );
  }
}
class TestDisplay extends Component {
  render () {
    var message = this.props.data;
    return (
      <div>{message}</div>
    );
  }
}

export default App;
