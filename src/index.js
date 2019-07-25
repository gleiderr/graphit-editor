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

const GraphitContext = React.createContext({});

class Indent extends React.Component {
    render() {
        const tabSize = '2rem';
        return <span className="Indent" style={{tabSize}}>
                {'\t'.repeat(this.props.n)}
            </span>
    }
}

class Editable extends React.Component {
    
    static contextType = GraphitContext;

    constructor(props) {
        super(props);
        this.myInput = React.createRef();

        this.state = {data: undefined};
    }

    getData() {
        this.context.node_local({id: this.props.id}).then(gnode => {
            if (gnode.data !== this.state.data) {
                this.setState({
                    data: gnode.data
                });
            }
        });
    }

    componentDidUpdate() {
        // eslint-disable-next-line eqeqeq
        if (this.myInput.current != document.activeElement) {
            this.getData();
        }
    }

    componentDidMount() {
        this.getData();
    }

    render() {
        return (
            <span className={this.props.className}
                contentEditable suppressContentEditableWarning
                onInput={evt => this.context.inputHandle(this.props.id, evt.target.innerText)}
                ref={this.myInput} >
                {this.state.data}
            </span>
        );
    }
}

class Rows extends React.Component {

    static contextType = GraphitContext;

    constructor(props) {
        super(props);
        this.state = {list: []};
    }

    async getList() {
        const glist = await this.context.adj_local({from_id: this.props.from_id});
        if (glist.list != this.state.list) {
            this.setState({ list: glist.list });
        }
    }

    componentDidMount() {
        this.getList();
    }

    componentDidUpdate() {
        this.getList();
    }

    render() {
        if (!this.state || !this.state.list) return null;

        const rows = this.state.list.map(({label, to}, i) =>
            <Row key={`${to}${label}${i}`} id={to} label={label} index={i}
                 deep={this.props.deep + 1} />
        );

        return rows;
    }
}

class Row extends React.Component {

    static contextType = GraphitContext;

    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    async keyDownHandle(evt) {
        switch(evt.key) {
            case 'Enter':
                evt.preventDefault();
                const subNodo = (evt.ctrlKey || this.props.idParent === undefined);
                const index = subNodo ? 0 : this.props.index + 1;
                const from_id = subNodo ? this.props.id : this.props.idParent;
                this.context.insertNode(index, from_id);
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

    render() {
        const tabSize = '2rem';
        const widthExpression = `calc(${tabSize} * ${this.props.deep})`;
        const rows = this.state.opened ? <Rows from_id={this.props.id} /> : undefined;

        //console.log({data: this.state.data, edge: this.props.edge});
        //https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
        //https://www.w3schools.com/cssref/css3_pr_tab-size.asp
        //https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size
        //https://developer.mozilla.org/en-US/docs/Web/CSS/calc

        return (
            <>
            <div className="Row" draggable
                onKeyDown={evt => this.keyDownHandle(evt)}
                onDoubleClick={() => this.setState({opened: this.state.opened === false})}
                
                onDragStart={evt => this.dragStartHandle(evt, this.props.id)}
                onDragOver={evt => this.dragOverHandle(evt)}
                onDragEnter={evt => this.dragEnterHandle(evt)}
                onDragLeave={evt => this.dragLeaveHandle(evt)}
                onDrop={evt => this.dropHandle(evt)}
                >

                <Indent n={this.props.deep}/>
                <span className="Graphit-EdgeNode" style={{width: `calc(calc(100% - 2px) - ${widthExpression})`}}>
                    {this.props.label && <Editable className={'Graphit-Edge'} id={this.props.label}/>}
                    <Editable className={'Graphit-Node'} id={this.props.id}/>
                </span>
            </div>
            {rows}
            </>
        );
    }
}

class GraphitApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.inputHandle = this.inputHandle.bind(this);
        this.insertNode = this.insertNode.bind(this);
        this.node_local = this.node_local.bind(this);
        this.adj_local = this.adj_local.bind(this);
        
        const db = new Graphit_Firebase(firebase.database(), this.props.db_ref);
        this.g_firebase = new Graphit(db);
        
        const db_json = new Graphit_JSON();
        this.g_json = new Graphit(db_json);
    }

    async node_local ({id, data} = {})  {
        //Recuperação offline sempre que possível para reduzir trafego de rede e aumentar eficiência
        let node;
        if(id === undefined && data === undefined) {//: criação de nodo sem dado
            node = await this.g_firebase.node({id, data});
            await this.g_json.node({id: node.id, data: null});//salva dado localmente
        } else if(id === undefined && data !== undefined) {//: criação de nodo com dado
            node = await this.g_firebase.node({id, data});
            await this.g_json.node({id: node.id, data});//salva dado localmente
        } else if(id !== undefined && data === undefined) {//: recuperação de nodo e seu dado
            node = await this.g_json.node({id, data}); //tentativa de recuperação local
            if(node.data === undefined) { //se não recuperar, busca na base de dados
                node = await this.g_firebase.node({id, data});
                await this.g_json.node({id: node.id, data});//salva dado localmente
            }
        } else if(id !== undefined && data !== undefined) {//: atribuição de dado do nodo
            node = await this.g_firebase.node({id, data});
            await this.g_json.node({id, data});
        }
        return node;
    }

    async adj_local ({from_id, list}) {
        //Recuperação offline sempre que possível para reduzir trafego de rede e aumentar eficiência
        let adj;
        if (list === undefined) { //recuperação
            adj = await this.g_json.adj({from_id, list}); //tentativa de recuperação local
            if (adj.list === undefined) {
                adj = await this.g_firebase.adj({from_id, list}); //recuperação remota
                await this.g_json.adj(adj); //atribuição local
            }
        } else { //atribuição
            adj = await this.g_firebase.adj({from_id, list}); //atribuição remota
            await this.g_json.adj(adj); //atribuição local
        }
        return adj;
    }

    async inputHandle(id, data) {
        await this.node_local({id, data});
        this.setState({}); //Força atualização dos nodos
    }

    async _insertNode(index, from_id, id = undefined) {
        //Recupera nodo, label e lista da base de dados
        const {id: to } = await this.node_local({ id }); 
        const {id: label} = await this.node_local(); //novo label
        const adj = await this.adj_local({ from_id });
        const edge = { label, to };
        
        //Insere elemento na posição index
        if(adj.list === undefined){
            adj.list = [edge];
        } else if(index === undefined) {
            adj.list.push(edge)
        } else {
            adj.list.splice(index, 0, edge);
        }

        await this.adj_local(adj) //Atribui lista na base de dados
    }

    /**
     * Insere referência a nodo [id] a partir do nodo [from_id] na posição [index].
     * @param {Number} index 
     * @param {String} from_id 
     * @param {String} id 
     */
    async insertNode(index, from_id, id = undefined) {
        //Recupera nodo e lista da base de dados
        const node = await this.node_local({ id }); 
        await this._insertNode(index, from_id, node.id); // Insere aresta direta
        await this._insertNode(undefined, node.id, from_id);// Insere aresta indireta

        this.setState({}); //Força atualização dos nodos
    }

    render() {
        return (
            <div style={ graphit_ref !== '__graphit-test__' ? {background: 'black', color: 'lightsteelblue'} : {}}>
                <GraphitContext.Provider value={{
                        inputHandle: this.inputHandle,
                        insertNode: this.insertNode,
                        node_local: this.node_local,
                        adj_local: this.adj_local,
                    }}>
                    <Row id='0' deep={0} />
                </GraphitContext.Provider>
            </div>
        );
    }
}

const test_ref = '__graphit-test__';
document.clearTestRef = () => firebase.database().ref(test_ref).remove();

const graphit_ref = 'graphit';

ReactDOM.render(<GraphitApp db_ref={test_ref} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
