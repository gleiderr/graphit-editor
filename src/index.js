import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase';
import { Graphit } from 'graphit';
const { Graphit_Firebase } = require('graphit-firebase');
const { Graphit_JSON } = require('graphit-json');

const config = {
    apiKey: "AIzaSyDw44kycEYrMUc3RJ_WQ1Oe5ztZqx_S_is",
    authDomain: "graphit-js.firebaseapp.com",
    databaseURL: "https://graphit-js.firebaseio.com",
    projectId: "graphit-js",
    storageBucket: "graphit-js.appspot.com",
    messagingSenderId: "694181552879"
};
firebase.initializeApp(config);

const test_ref = '__graphit-test__';
const db = new Graphit_Firebase(firebase.database(), test_ref);
const g = new Graphit(db);

class Node extends React.Component {

    constructor(props) {
        super(props);

        this.state = {data: undefined};

        g.node({id: props.id}).then(gnode => {
            this.setState({ data: gnode.data});
        });
    }

    setData(data) {
        const node = {id: this.props.id, data};
        g.node(node);
    }

    inputHandle(evt) {
        this.setData(evt.target.innerText);
    }

    async keyDownHandle(evt) {
        switch(evt.key) {
            case 'Enter':
                evt.preventDefault();
                let node = await g.node({});
                console.log(node);
                break;
            default:
        }
    }

    render() {
        return (<div className="Graphit-Node" contentEditable 
                     onInput={evt => this.inputHandle(evt)}
                     onKeyDown={evt => this.keyDownHandle(evt)} >{this.state.data}</div>);
    }
}

class Root extends React.Component {
    render() {
        return (<Node id='0' />);
    }
}

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
