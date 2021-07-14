const express = require('express');
const cors = require('cors');

const {v4: uuidv4} = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(400).json({error: "User not found"})
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const checksExistsUserAccount = users.some(
    (user) => user.username === username
  );

  if(checksExistsUserAccount) {
    return response.status(400).json({error: "Usuer already exists!"})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos:[]
  });

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const { user } = request;

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todos);

  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todos => todos.id === id);
  
  todo.title = title
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params

  const {done} = request.body

  const todo = user.todos.find(todos => todos.id = id);

  todo.done = done

  return response.status(201).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params

    const todo = user.todos.find(todos => todos.id === id);

    user.todos.splice(todo, 1)

    return response.status(200).json(todo)

});

module.exports = app;