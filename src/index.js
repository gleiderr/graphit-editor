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
let g_firebase = new Graphit(db);

const db_json = new Graphit_JSON();
const g_json = new Graphit(db_json);
//g = g_json;

//Recuperação offline sempre que possível para reduzir trafego de rede e aumentar eficiência
const node_local = async ({id, data}) => {
    let node;
    if(id === undefined && data === undefined) {//: criação de nodo sem dado
        node = await g_firebase.node({id, data});
        await g_json.node({id: node.id, data: null});//salva dado localmente
    } else if(id === undefined && data !== undefined) {//: criação de nodo com dado
        node = await g_firebase.node({id, data});
        await g_json.node({id: node.id, data});//salva dado localmente
    } else if(id !== undefined && data === undefined) {//: recuperação de nodo e seu dado
        node = await g_json.node({id, data}); //tentativa de recuperação local
        if(node.data === undefined) { //se não recuperar, busca na base de dados
            node = await g_firebase.node({id, data});
            await g_json.node({id: node.id, data});//salva dado localmente
        }
    } else if(id !== undefined && data !== undefined) {//: atribuição de dado do nodo
        node = await g_firebase.node({id, data});
        await g_json.node({id, data});
    }
    return node;
}

const adj_local = async ({from_id, list}) => {
    let adj;
    
    if (list === undefined) { //recuperação
        
        adj = await g_json.adj({from_id, list}); //tentativa de recuperação local
        if (adj.list === undefined) {
            adj = await g_firebase.adj({from_id, list}); //recuperação remota
            await g_json.adj(adj); //atribuição local
        }
    } else { //atribuição
        adj = await g_firebase.adj({from_id, list}); //atribuição remota
        await g_json.adj(adj); //atribuição local
    }
    return adj;
}

const GraphitContext = React.createContext({
    adj_local
});

class GraphitApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {teste: 'teste'};
        this.inputHandle = this.inputHandle.bind(this);
    }

    async inputHandle(id, data) {
        await node_local({id, data});
        this.setState({});
    }

    render() {
        const state = this.state;
        return (
            <GraphitContext.Provider value={{
                state,
                inputHandle: this.inputHandle
            }}>
                <Node id='0' deep={0} />
            </GraphitContext.Provider>
        );
    }
}

class Node extends React.Component {
    
    static contextType = GraphitContext;

    constructor(props) {
        super(props);
        
        this.state = {
            data: undefined,
            list: [],
            focusPending: props.focusPending,
        };

        this.myInput = React.createRef();

        node_local({id: props.id}).then(gnode => {
            adj_local({from_id: props.id}).then(glist => {
                this.setState({ 
                    data: gnode.data,
                    list: glist.list
                });
            })
        });
    }

    /*setData(data) {
        const node = {id: this.props.id, data};
        node_local(node);
        //this.setState({data});
    }*/

    async insertNode(index, id) {
        let node = await node_local({ id });

        let adj = await adj_local({ from_id: this.props.id }); //Recupera lista da base de dados
        
        if(adj.list === undefined){
            adj.list = [node.id];
        } else {
            adj.list.splice(index, 0, node.id); //Insere elemento na posição index
        }

        adj = await adj_local(adj) //Atribui na base de dados

        this.setState({
            list: adj.list,
            focusChild: index,
        });
    }

    /*inputHandle(evt) {
        this.setData(evt.target.innerText);
        this.context.inputHandle(evt.target.innerText);
    }*/

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

    componentDidUpdate() {
        node_local({id: this.props.id}).then(gnode => {  
            if (this.myInput.current != document.activeElement) {
                this.setState({ 
                    data: gnode.data
                });
            }
        });
        /*adj_local({from_id: this.props.id}).then(glist => {
            console.log('componentDidUpdate', 'list');
            this.setState({
                list: glist.list
            });
        })*/
    }

    componentDidMount() {
        if (this.state.focusPending) {
            this.myInput.current.focus();            
            this.setState({focusPending: false});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //https://github.com/facebook/react/issues/2047
        let shouldUpdate = nextState.data !== this.myInput.current.innerText;
        for (const key in nextState) {
            if(shouldUpdate) return shouldUpdate;
            if(key !== 'data') shouldUpdate = shouldUpdate || (this.state[key] !== nextState[key]);
        }
        return shouldUpdate;
    }

    render() {
        const style = {
            'marginLeft': ((10 * this.props.deep) + 'px'),
        };

        const nodes = this.props.deep >= 100 ? 
                        <div style={style}>...</div> : 
                        this.state.list && 
                        this.state.list.map((id, i) => {
            return (<Node key={`${id}(${i})`} id={id} index={i}
                          focusPending={this.state.focusChild === i} 
                          deep={this.props.deep + 1}
                          insertNodeParent={index => this.insertNode(index)} />);
        });

        //https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
        return (
            <>
                <div className="Graphit-Node" 
                     contentEditable suppressContentEditableWarning draggable
                     style={style}
                     onInput={evt => this.context.inputHandle(this.props.id, evt.target.innerText)}
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
            </>);
    }
}

ReactDOM.render(<GraphitApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
