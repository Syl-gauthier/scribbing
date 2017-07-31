/* eslint no-unused-vars: "off" */
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {combineReducers} from 'redux';
import request from 'request';

console.log('listId', listId)

request('http:\/\/localhost:3000/list/get/'+listId, function(err, res, body) {
  let idIncr = 0; // for words unique keys

  console.log(body);
  var body = JSON.parse(body);

  var data = {};
  data.meta = {_id: body._id, name : body.name};
  data.languages = [...body.languages];
  if(body.words) {
    data.words = body.words.map(function(word) {
      word = Object.assign({}, word);
      word.id = idIncr;
      if(!word.training) {
        word.training = {
          directOrder: {
            count: 0,
            fail: 0,
            success: 0,
            palier: 0,
          },
          reverseOrder: {
            count: 0,
            fail: 0,
            success: 0,
            palier: 0,
          }
        }
      }
      idIncr++;
      return word;
    });
  }
  else {
    data.words = [];
  }
  console.log(data);

  var newWords = data.words.reduce(function(acc, word) {
    if (!word.training.directOrder.count) {
      acc.push({id: word.id, order: 'directOrder'});
    } 
    else if (!word.training.reverseOrder.count) {
      acc.push({id: word.id, order: 'reverseOrder'});  
    }
    return acc;
  }, []);

  var now = new Date();

  var allWords = data.words.reduce(function(acc, word) {
    if (word.training.directOrder.dueDate < now) {
      acc.push({id: word.id, order: 'directOrder'});
    } else if (word.training.reverseOrder.dueDate < now) {
      acc.push({id: word.id, order: 'reverseOrder'});
    }
    return acc;
  }, [...newWords]);

  console.log(newWords, allWords);
  data.training = {step: 0, newWords, allWords};

  //words reducer
  const words = (state = [], action) => {
    let stats;

    switch(action.type) {
    case 'ADD_NEW_WORD':
      return [...state, {french: '*', english: '*', id: idIncr++}];
    case 'DELETE_WORD':
      return state.filter(function(word) {
        if (word.id === action.id) return false;
        return true;
      });
    case 'FOCUS_WORD':
      return state.map(function(word) {
        if (word.id === action.id) {
          return Object.assign({}, word, {focus: true});
        }
        else {
          if(word.focus) console.log(word);
          var newWord = Object.assign({}, word);
          delete newWord.focus;
          return newWord;
        }
      });
    case 'UPDATE_WORD':
      return state.map(function(word) {
        if (word.id === action.id) {
          //var language = action.language;
          //word[action.language] = action.value;
          return Object.assign({}, word, {[''+action.language]: action.value});
        }
        else {
          return Object.assign({}, word);
        }
      });
      return state;
    case 'KNEW_LEARNING':
    case 'SUCCESS_TRAINING':
      return state.map(function(word) {
        if (word.id === action.currWord.id) {
          console.log(word.training);
          let training = Object.assign({}, word.training);
          training[action.currWord.order] = Object.assign({}, word.training[action.currWord.order], 
            {
              count: ++word.training[action.currWord.order].count, 
              success: ++word.training[action.currWord.order].success, 
              palier: ++word.training[action.currWord.order].palier
            }
          );
          return Object.assign({}, word, {training});
        }
        else {
          return Object.assign({}, word);
        }
      });
    case 'NEXT_LEARNING':
    case 'RETRY_TRAINING':
      return state.map(function(word) {
        if (word.id === action.id) {
          let training = Object.assign({}, word.training);
          training[action.currWord.order] = Object.assign({}, word.training[action.currWord.order], {count: ++word.training[action.currWord.order].count})
          return Object.assign({}, word, {training});
        }
        else {
          return Object.assign({}, word);
        }
      });
    case 'FAIL_TRAINING':
      return state.map(function(word) {
        if (word.id === action.id) {
          var palier = word.training[action.currWord.order].palier;
          if (!word.failed) palier--;
          let training = Object.assign({}, word.training);
          training[action.currWord.order] = Object.assign({}, word.training[action.currWord.order], 
            {
              count: ++word.training[action.currWord.order].count, 
              fail: ++word.training[action.currWord.order].fail, 
              palier
            }
          );
          return Object.assign({}, word, {training, failed: true});
        }
        else {
          return Object.assign({}, word);
        }
      });
    default:
      return state;
    }
  };

  // languages reducer (TODO)
  const languages = (state = [], action) => {
    switch(action.type) {
    case 'ADD_LANGUAGE':
      if(~state.IndexOf(action.language)) return state;
      else return [...state, action.language];
    case 'DELETE_LANGUAGE':
      return state.filter(function(language) {
        if (language = action.language) return false;
        return true;
      });
    default:
      return state;
    }
  };

  const training = (state = [], action) => {
    let newWords;
    let allWords;

    switch(action.type) {
      case 'START_TRAINING':
        return Object.assign({}, state, {step: 1});
      case 'NEXT_LEARNING':
        newWords = state.newWords.slice(1);
        if(newWords.length < 1) return Object.assign({}, state, {step: 2, newWords});
        return Object.assign({}, state, {step: 1, newWords});
      case 'KNEW_LEARNING':
        let allWords = state.allWords.filter(function(word) {
          if (word.id == state.newWords[0].id) return false;
          return true;
        });
        newWords = state.newWords.slice(1); 
        if(newWords.length < 1) {
          if (allWords.length < 1) return Object.assign({}, state, {step: 4});
          return Object.assign({}, state, {step: 2});
        }
        return Object.assign({}, state, {step: 1, newWords: state.newWords.slice(1), allWords});
      case 'SHOW_ANSWER':
        return Object.assign({}, state, {step: 3});
      case 'FAIL_TRAINING':
      case 'RETRY_TRAINING':
        allWords = [...state.allWords];
        allWords.push(allWords.shift());
        return Object.assign({}, state, {step: 2, allWords});
      case 'SUCCESS_TRAINING':
        allWords = state.allWords.slice(1);
        console.log(allWords);
        if(allWords.length < 1) {
          console.log('oui');
          return Object.assign({}, state, {step: 4, allWords}); }
        return Object.assign({}, state, {step: 2, allWords});
      case 'END_TRAINING':
        return Object.assign({}, state, {step: 4});
      default:
        return state;
    }
  };

  // meta include al the global info about a list
  // meta reducer
  const meta = (state = {name: 'Untitled'}, action) => {
    switch(action.type) {
    case 'UPDATE_NAME':
      return Object.assign({}, state, {name: action.name});
    default:
      return state;
    }
  };

  function save(state, cb) {
    console.log('save');
    state.words = state.words.filter(function(word, index) {
      var pass = true;
      Object.keys(word).forEach(function (key) {
        if (word[key] === '*') {
          return pass = false;
        }
        return true;
      });
      return pass;
    });
    state.words.forEach(function(word) {
      delete word.focus;
      delete word.id;
    });
    delete state.training;
    console.log(state);
    request.post({url:'http:\/\/localhost:3000/list/update', form: state}, function(err, res, body) {
      console.log(body);
      cb(err, res, body);
    });
  }

  //var listEditApp = combineReducers({meta, languages, words});

  var listEditApp =  (state, action) => {
    console.log(action);
    var nextState = {};
    if(state.freeze) return state;

    nextState.meta = meta(state.meta, action);
    nextState.languages = languages(state.languages, action);
    nextState.words = words(state.words, action);
    nextState.training = training(state.training, action);

    switch(action.type) {
      case 'RESET':
        nextState = data;
        break;
      case 'SAVE':
        save(state, function() {
        delete nextState.freeze;
        window.location.reload(true)
        });
        nextState.freeze = true;
        break;
      case 'DELETE':
        var response = confirm('Are you sure you want to delete this list ?');
        if(response) {
          console.log('deletion');
          window.location.replace('/list/del/' + listId);
        }
        break;
      case 'END_TRAINING':
        console.log(state);
    }

    return nextState;
  }

  // createStore's API is { subscribe, dispatch, getState }.
  let store = createStore(listEditApp, data);

  //react elements

  /*      list editor app
    interface to update a given list
    features:
    -editing words
    -adding/deleting words
    -changing list's name
    -adding/removing languages

      possible improvement:
      -manage the order of the word
      -adding already existing words (from a research)
      -manage the order of the languages
  */
  class ListTraining extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {

      if (this.props.freeze) {
        var freezeText = <p>Saving.... No modifications are possible.</p>
      } else {
        var freezeText = '';
      }
      if(this.props.training.newWords.length > 0) {
        var currWord = this.props.training.newWords[0];
      } else if(this.props.training.allWords.length > 0) {
        var currWord = this.props.training.allWords[0];
      } else {
        var currWord = {id: -1}; //to avoid exeption due to undefined currWord
      }

      for (var i = 0; i < this.props.words.length; i++) {
        if (this.props.words[i].id === currWord.id) {
          var order = currWord.order;
          currWord = this.props.words[i];
          currWord.order = order;
        }
      }
      

      let contents;
      switch(this.props.training.step) {
        case 0:
          contents = (
            <h3>Are you ready ?</h3>
          );
          break;
        case 1:
          contents = (
            <div>
              <h3>{this.props.languages[0]} : {currWord[this.props.languages[0]]}</h3>
              <h3>{this.props.languages[1]} : {currWord[this.props.languages[1]]}</h3>
            </div>
          );          
          break;
        case 2:
          if (currWord.order === 'directOrder') {
            contents = (
              <h3>{this.props.languages[0]} : {currWord[this.props.languages[0]]}</h3>
            ); 
          }
          else {
            contents = (
              <h3>{this.props.languages[1]} : {currWord[this.props.languages[1]]}</h3>
            ); 
          }      
          break;
        case 3:
          if (currWord.order === 'directOrder') {
            contents = (
              <div>
                <h3>{this.props.languages[0]} : {currWord[this.props.languages[0]]}</h3>
                <h3>{this.props.languages[1]} : {currWord[this.props.languages[1]]}</h3>
              </div>
            ); 
          }
          else {
            contents = (
              <div>
                <h3>{this.props.languages[1]} : {currWord[this.props.languages[1]]}</h3>
                <h3>{this.props.languages[0]} : {currWord[this.props.languages[0]]}</h3>
              </div>
            );
          }          
          break;
        case 4:
          contents = (
            <h3>You finished your training.</h3>
          );          
          break;
      }

      return (
        <div>
          <h2>{this.props.meta.name}</h2>
          {freezeText}
          <Command step={this.props.training.step} currWord={currWord}/>
          {contents}
        </div>
      );
    }
  }

  class Command extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {

      var buttons;
      switch(this.props.step) {
      case 0:
        buttons = (
          <div>
            <button onClick={() => {store.dispatch({ type: 'START_TRAINING' })}} > start </button>
          </div>
        );
        break;
      case 1:
        buttons = (
          <div>
            <button onClick={() => {store.dispatch({ type: 'NEXT_LEARNING', currWord: this.props.currWord })}} > next </button>
            <button onClick={() => {store.dispatch({ type: 'KNEW_LEARNING', currWord: this.props.currWord })}} > I already knew this word </button>
          </div>
        );
        break;
      case 2:
        buttons = (
          <div>
            <button onClick={() => {store.dispatch({ type: 'SHOW_ANSWER' })}} > Show answer </button>
          </div>
        );
        break;
      case 3:
        buttons = (
          <div>
            <button onClick={() => {store.dispatch({ type: 'FAIL_TRAINING', currWord: this.props.currWord })}} > I didn't knew </button>
            <button onClick={() => {store.dispatch({ type: 'RETRY_TRAINING', currWord: this.props.currWord })}} > I wasn't sure </button>
            <button onClick={() => {store.dispatch({ type: 'SUCCESS_TRAINING', currWord: this.props.currWord })}} > I know this word </button>
          </div>
        );
        break;
      case 4:
        buttons = (
          <div>
            <button onClick={() => {store.dispatch({ type: 'END_TRAINING' })}} > Return to dashboard </button>
          </div>
        );
        break;
      }

      return (
        <div>
          {buttons}
        </div>
      );
    }
  }

  const renderApp = () => {
    ReactDOM.render(
      <ListTraining {...store.getState()}/>,
      document.getElementById('reactRoot')
    );
  };



  store.subscribe(() => {
    renderApp();
  });

  renderApp();

});