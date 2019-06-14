import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
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
let g = new Graphit(db);

const db_json = new Graphit_JSON();
const g_json = new Graphit(db_json);
g = g_json;

class Node extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: undefined,
            list: [],
            focusPending: props.focusPending,
        };

        this.myInput = React.createRef();

        g.node({id: props.id}).then(gnode => {
            g.adj({from_id: props.id}).then(glist => {
                this.setState({ 
                    data: gnode.data,
                    list: glist.list
                });
            })
        });
    }

    setData(data) {
        const node = {id: this.props.id, data};
        g.node(node);
    }

    async insertNode(index, id) {
        let node = await g.node({ id });

        let adj = await g.adj({ from_id: this.props.id }); //Recupera lista da base de dados
        
        adj.list.splice(index, 0, node.id); //Insere elemento na posição index

        adj = await g.adj(adj) //Atribui na base de dados

        this.state.list = [...adj.list];
        this.state.focusChild = index; //Provoca foco em nodo recém criado
        this.setState(this.state);
    }

    inputHandle(evt) {
        this.setData(evt.target.innerText);
    }

    async keyDownHandle(evt) {
        switch(evt.key) {
            case 'Enter':
                evt.preventDefault();
                
                if (evt.ctrlKey || !this.props.insertNodeParent) {
                    this.insertNode(0);
                } else {
                    this.props.insertNodeParent(this.props.index + 1);
                }
                break;
            default:
        }
    }

    dragStartHandle(evt, id) {
        evt.dataTransfer.setData('text/plain', id);
    }

    dragOverHandle(evt) {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';        
    }

    dragEnterHandle(evt) {
        evt.target.style.background = 'orange';
    }

    dragLeaveHandle(evt) {
        evt.target.style.background = null;
    }

    dropHandle(evt) {
        evt.preventDefault();
        
        evt.target.style.background = null;
        
        const id = evt.dataTransfer.getData('text/plain');
        this.insertNode(0, id);
    }

    componentDidMount() {
        if (this.state.focusPending) {
            this.myInput.current.focus();            
            this.setState({focusPending: false});
        }
    }

    render() {
        const style = {
            'marginLeft': ((10 * this.props.deep) + 'px'),
        };

        const nodes = this.props.deep >= 10 ? <div style={style}>...</div> : this.state.list.map((id, i) => {
            return (<Node key={`${id}(${i})`} id={id} index={i}
                          focusPending={this.state.focusChild === i} 
                          deep={this.props.deep + 1}
                          insertNodeParent={index => this.insertNode(index)} />);
        });

        //https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
        return (
            <div>
                <div className="Graphit-Node" 
                     contentEditable suppressContentEditableWarning draggable
                     style={style}
                     onInput={evt => this.inputHandle(evt)}
                     onKeyDown={evt => this.keyDownHandle(evt)}
                     onDragStart={evt => this.dragStartHandle(evt, this.props.id)}
                     onDragOver={evt => this.dragOverHandle(evt)}
                     onDragEnter={evt => this.dragEnterHandle(evt)}
                     onDragLeave={evt => this.dragLeaveHandle(evt)}
                     onDrop={evt => this.dropHandle(evt)}
                     ref={this.myInput} >
                        {this.state.data}
                </div>
                {nodes}
            </div>);
    }
}

ReactDOM.render(<Node id='0' deep={0} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
