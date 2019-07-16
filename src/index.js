import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
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

const graphit_ref = '__graphit-test__';
//const graphit_ref = 'graphit';

const db = new Graphit_Firebase(firebase.database(), graphit_ref);
let g_firebase = new Graphit(db);

const db_json = new Graphit_JSON();
const g_json = new Graphit(db_json);

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
        this.insertNode = this.insertNode.bind(this);
    }

    async inputHandle(id, data) {
        await node_local({id, data});
        this.setState({}); //Força atualização dos nodos
    }

    /**
     * Insere referência a nodo [id] a partir do nodo [from_id] na posição [index].
     * @param {Number} index 
     * @param {String} from_id 
     * @param {String} id 
     */
    async insertNode(index, from_id, id = undefined) {
        //Recupera nodo e lista da base de dados
        const node = await node_local({ id }); 
        const adj = await adj_local({ from_id });
        const edge = { to: node.id };
        
        //Insere elemento na posição index
        if(adj.list === undefined){
            adj.list = [edge];
        } else {
            adj.list.splice(index, 0, edge);
        }

        await adj_local(adj) //Atribui lista na base de dados

        this.setState({}); //Força atualização dos nodos
    }

    render() {
        return (
            <div style={ graphit_ref !== '__graphit-test__' ? {background: 'black', color: 'lightsteelblue'} : {}}>
                <div id='graphit_ref' style={{display: 'none'}}>{graphit_ref}</div>
                <GraphitContext.Provider value={{
                    inputHandle: this.inputHandle,
                    insertNode: this.insertNode
                }}>
                    <Node id='0' deep={0} />
                </GraphitContext.Provider>
            </div>
        );
    }
}
let dragging_id;

class Edge extends React.Component {

    static contextType = GraphitContext;

    constructor(props) {
        super(props);
        
        this.state = {
            label: props.label,
            data: undefined 
        };

        this.myInput = React.createRef();
    }

    componentDidUpdate() {
        // eslint-disable-next-line eqeqeq
        if (this.myInput.current != document.activeElement) {
            node_local({id: this.state.label}).then(gnode => {
                if (gnode.data !== this.state.data) {
                    this.setState({
                        data: gnode.data
                    });
                }
            });
        }
    }

    async inputHandle(label, innerText) {
        if (label === undefined) { // Define novo nodo para armazenar conteúdo da aresta
            const node = await node_local({id: this.state.label});
            this.setState({ label: node.id });
        }
        this.context.inputHandle(this.state.label, innerText)
    }

    render() {
        return (
            <span className="Graphit-Edge" ref={this.myInput}
                contentEditable suppressContentEditableWarning draggable
                onInput={evt => this.inputHandle(this.state.label, evt.target.innerText)}>
                {this.state.data}
            </span>
        );
    }
}

class Node extends React.Component {
    
    static contextType = GraphitContext;

    constructor(props) {
        super(props);

        this.resetFocusChild = this.resetFocusChild.bind(this);
        
        this.state = {
            data: undefined,
            list: [],
            focusPending: props.focusPending,
            opened: false || graphit_ref === '__graphit-test__'
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

    async insertNode(index, id) {
        this.context.insertNode(index, this.props.id, id);
        this.setState({ focusChild: index, opened: true });
    }

    resetFocusChild() {
        this.setState({ focusChild: undefined });
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
        if (graphit_ref === '__graphit-test__') {
            dragging_id = id;
            return;
        }
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
        if (graphit_ref === '__graphit-test__') {
            this.insertNode(0, dragging_id);
            return;
        }        
        evt.target.style.background = null;
        
        const id = evt.dataTransfer.getData('text/plain');
        this.insertNode(0, id);
    }

    componentDidUpdate() {
        // eslint-disable-next-line eqeqeq
        if (this.myInput.current != document.activeElement) {
            node_local({id: this.props.id}).then(gnode => {
                if (gnode.data !== this.state.data) {
                    this.setState({ 
                        data: gnode.data
                    });
                }
            });
        }

        adj_local({from_id: this.props.id}).then(glist => {
            if (glist.list !== this.state.list) {
                this.setState({
                    list: glist.list
                });
            }
        })
    }

    componentDidMount() {
        if (this.state.focusPending) {
            this.myInput.current.focus();
            this.props.resetFocusParent();
            this.setState({focusPending: false});
        }
    }

    /*shouldComponentUpdate(nextProps, nextState) {
        //https://github.com/facebook/react/issues/2047
        let shouldUpdate = nextState.data !== this.myInput.current.innerText;
        for (const key in nextState) {
            if(shouldUpdate) return shouldUpdate;
            if(key !== 'data') shouldUpdate = shouldUpdate || (this.state[key] !== nextState[key]);
        }
        return shouldUpdate;
    }*/

    render() {
        const style = {
            'marginLeft': ((10 * this.props.deep) + 'px'),
        };


        let nodes;
        if (this.props.deep >= 100) {
            nodes = <div style={style}>...</div>;
        } else if (this.state.opened && this.state.list) {
            nodes = this.state.list.map(({label, to}, i) => {
                return (<Node key={`${to}(${i})`} id={to} index={i} label={label}
                              focusPending={this.state.focusChild === i}
                              resetFocusParent={this.resetFocusChild}
                              deep={this.props.deep + 1}
                              insertNodeParent={index => this.insertNode(index)} />);
            });
        }

        const tabSize = '2rem';
        const widthExpression = `calc(${tabSize} * ${this.props.deep})`;
        const indent = (
            <span className="Indent" style={{tabSize}}>
                {'\t'.repeat(this.props.deep)}
            </span>
        );

        //https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
        //https://www.w3schools.com/cssref/css3_pr_tab-size.asp
        //https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size
        //https://developer.mozilla.org/en-US/docs/Web/CSS/calc
        return (
            <>
            <div className="Row">
                {indent}
                <span className="Graphit-EdgeNode"
                    style={{width: `calc(calc(100% - 2px) - ${widthExpression})`}}>
                    <Edge label={this.props.label} from={this.props.id} index={this.props.index} />
                    <span className="Graphit-Node" 
                        contentEditable suppressContentEditableWarning draggable

                        onInput={evt => this.context.inputHandle(this.props.id, evt.target.innerText)}
                        onKeyDown={evt => this.keyDownHandle(evt)}
                        onDragStart={evt => this.dragStartHandle(evt, this.props.id)}
                        onDragOver={evt => this.dragOverHandle(evt)}
                        onDragEnter={evt => this.dragEnterHandle(evt)}
                        onDragLeave={evt => this.dragLeaveHandle(evt)}
                        onDrop={evt => this.dropHandle(evt)}
                        onDoubleClick={() => this.setState({opened: this.state.opened === false})}
                        
                        //Somente para simular drag-n-drop na base de testes
                        onCopy={evt => this.dragStartHandle(evt, this.props.id)} //mesmo que onDragStart
                        onPaste={evt => this.dropHandle(evt)} //mesmo que onDrop
                        
                        ref={this.myInput} >
                            {this.state.data}
                    </span>
                </span>
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
