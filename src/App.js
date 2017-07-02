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
      <div>
        <div id="formParent">
          <div id="form">
            <TestForm />
          </div>
        </div>
        <div id="parent">
          <div id="leftChild">
            <ResultDisplay data={this.state.value} />
          </div>
          <div id="rightChild">
            <WatchDisplay/>
          </div>
        </div>
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
        <button onClick={this.send.bind(this)}>Search</button>
      </form>
    );
  }
}
class ResultDisplay extends Component {
  constructor () {
    super();
    this.state = {
      numOfResult: null
    };
  }
  render () {
    var message = this.state.numOfResult?(this.state.numOfResult==0?"No repository found...":this.state.numOfResult+" repository found!"):"Input keyword and click \"Search\"";
    return (
      <div>
        <p>{message}</p>
        <table id="Results">
          <tr>
            <th>Repository Name</th>
            <th>Owner's Name</th>
            <th>Link</th>
            <th>Stars</th>
          </tr>
        </table>
      </div>
    );
  }
}

class WatchDisplay extends Component {
  constructor () {
    super();
    this.state = {
      watchlist: []
    };
  }
  render () {
    var message = "Repositories you're watching";
    return (
      <div>
        <p>{message}</p>
        <table id="Watch">
          <tr>
            <th>Repository Name</th>
            <th>Owner's Name</th>
            <th>Link</th>
            <th>Stars</th>
          </tr>
        </table>
      </div>
    )
  }
}

export default App;
