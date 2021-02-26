import logo from './logo.svg';
import './App.css';
import React  from 'react';
import {useState} from 'react';


class App extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			todoList:[],
			activeItem: {
				id: null,
				title: '',
				completed: false,
			},
			editing: false,
		}
		this.fetchTasks = this.fetchTasks.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.getCookie = this.getCookie.bind(this)
		this.startEditing = this.startEditing.bind(this)
		this.deleteItem = this.deleteItem.bind(this)
	}

	componentWillMount(){
		this.fetchTasks() 
	}

	fetchTasks(){
		console.log('fetching...')
		fetch('http://127.0.0.1:8000/api/task-list/')
		.then(response => response.json() )
		.then(data => {
			this.setState({
				todoList: data
			})
			console.log('Data: ', data)
		}
			)
	}

	//Handling a submit / POST call
	handleSubmit(e){
		e.preventDefault()
		console.log(this.state.activeItem.title)

		//target endpoint
		let url = 'http://127.0.0.1:8000/api/task-create/'
		
		let csrftoken = this.getCookie('csrftoken')

		if(this.state.editing == true){
			url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id}/`
			this.setState({
				editing:false
			})
		}

		//fetch call
		fetch(url, {
			method:'POST',
			headers: {
				'Content-type':'application/json',
				'X-CSRFToken': csrftoken,
			},
			body: JSON.stringify(this.state.activeItem)
		}).then((response) => { //fetch the new tasks, and then set the state to its default values
			this.fetchTasks()
			this.setState({
				activeItem:{
					...this.state.activeItem,
					title: ''
				}
			})
		}).catch((error) => {
			console.log('ERROR:' , error)
		})
	}


	//Changing an Item in State
	handleChange(e) {
		let name = e.target.name;
		let value = e.target.value;
		console.log(name, value)

		this.setState(
			{
				activeItem:{
					...this.state.activeItem,
					title: value
				}
			}
		)
	}

	/* https://docs.djangoproject.com/en/3.0/ref/csrf/ */
	//getCookies 

	getCookie(name) {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}

	//Editing (Update Example)

	startEditing(task) {
		console.log(task)
		this.setState({
			activeItem: task,
			editing: true, 
		})
	}

	//Removing an item from DB (Remove Example)
	deleteItem(task){
		var csrftoken = this.getCookie('csrftoken')
	
		fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
		  method:'DELETE',
		  headers:{
			'Content-type':'application/json',
			'X-CSRFToken':csrftoken,
		  },
		}).then((response) =>{
	
		  this.fetchTasks()
		})
	  }

	render(){
		let tasks = this.state.todoList;
		var self = this

		return(
				<div className='container'>
					<div id='task-container'>

					<form onSubmit={this.handleSubmit}>
						<div id='form-wrapper'>
							
							<div style={{flex: 6}}>
								<input type="text" className='form-control' id='title' name='title' value={this.state.activeItem.title} placeholder='add task'
								onChange={this.handleChange}/>
							</div>
							<div style={{flex: 1}}>
								<input type="submit" className='btn btn-warning' name='add' value='Add task' />
							</div>
					
						</div>
						</form>
						<div  id='list-wrapper'>

							{
								this.state.todoList.map( function(task, index){

									return(

										<div key={index} className = 'task-wrapper'>
											
											<div style={{flex:7}}>
												<span>{task.title}</span>
											</div>
											<div style={{flex:1}}>
												<button onClick={()=> self.startEditing(task)} className='btn btn-sm btn-outline-info'>Edit</button>
											</div>
											<div style={{flex:1}}>
												<button onClick={()=> self.deleteItem(task)} className='btn btn-sm btn-outline-dark delete'> - </button>
										
											</div>
										</div>
									)
								} )
							}

						</div>


					</div>
				</div>
			);

	}

}


export default App;
