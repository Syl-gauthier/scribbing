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
      idIncr++;
      return word;
    });
  }
  else {
    data.words = [];
  }


  //words reducer
  const words = (state = [], languages, action) => {
    switch(action.type) {
    case 'ADD_NEW_WORD':
      let newWord = {};
      languages.forEach(function(language) {
        newWord[language] = '*';
      });
      newWord.id = idIncr++;
      return [...state, newWord];
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
    request.post({url:'http:\/\/localhost:3000/list/update', form: state}, function(err, res, body) {
      console.log(body);
      cb(err, res, body);
    });
  }

  //var listEditApp = combineReducers({meta, languages, words});

  var listEditApp =  (state, action) => {
    var nextState = {};
    if(state.freeze) return state;

    nextState.meta = meta(state.meta, action);
    nextState.languages = languages(state.languages, action);
    nextState.words = words(state.words, state.languages, action);

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
  class ListEdit extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {

      if (this.props.freeze) {
        var freezeText = <p>Saving.... No modifications are possible.</p>
      } else {
        var freezeText = '';
      }

      return (
        <div>
          <h2> Name : <input type='text' className='listName' value={this.props.meta.name} onChange={(event) => {store.dispatch({type:'UPDATE_NAME', name:event.target.value})}} /></h2>
          <Command />
          {freezeText}
          <List words={this.props.words} languages={this.props.languages}/>
        </div>
      );
    }
  }

  class Command extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <section className='command'>
          <button className='classic' onClick={() => {store.dispatch({ type: 'ADD_NEW_WORD' })}} > add a word </button>
          <button className='classic' onClick={() => {store.dispatch({ type: 'SAVE' })}}>save</button>
          <button className='classic' onClick={() => {store.dispatch({ type: 'RESET' })}}>reset changes</button>
          <button className='classic' onClick={() => {store.dispatch({ type: 'DELETE' })}}>delete list</button>
        </section>
      );
    }
  }

  class List extends React.Component {
    constructor(props) {
      super(props);
    }
    
    render() {
      
      var headRow = this.props.languages.map(function(language) {
            return (<th key={language}>{language}</th>);
          });
      headRow = (
        <tr>
          {headRow}
          <th>delete</th>
        </tr>
      );

      var wordArray = this.props.words.map(function(word) {
        var wordsRow;
        if (word.focus) {
          wordsRow = this.props.languages.map(function(language) {
            return (
              <td>
                <input key={language} type='text' value={word[language]} onChange={(event)=>{store.dispatch({type: 'UPDATE_WORD', id: word.id, language: language, value:event.target.value})}}>
                </input>
              </td>);
          });
        }
        else {
          wordsRow = this.props.languages.map(function(language) {
            return (<td key={language} onClick={()=>{store.dispatch({type: 'FOCUS_WORD', id: word.id})}}>{word[language]}</td>);
          });
        }
        return (
          <tr key={word.id}>
            {wordsRow}
            <td onClick={()=>{store.dispatch({type: 'DELETE_WORD', id: word.id})}}>X</td>
          </tr>
        );
      }.bind(this));

      return (
        <table className='wordTable'>
          <tbody>
            {headRow}
            {wordArray}
          </tbody>
        </table>
      );
    }
  }

  const renderApp = () => {
    ReactDOM.render(
      <ListEdit {...store.getState()}/>,
      document.getElementById('reactRoot')
    );
  };



  store.subscribe(() => {
    renderApp();
  });

  renderApp();

});