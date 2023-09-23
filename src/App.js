import React, { useState, useEffect } from 'react'
import "./App.css"
import "@aws-amplify/ui-react/styles.css"
import { API, Storage } from 'aws-amplify';
import {
  withAuthenticator,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View
} from "@aws-amplify/ui-react"
import {listTodos} from "./graphql/queries"
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation
} from "./graphql/mutations"

function App({ signOut }) {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const apiData = await API.graphql({ query: listTodos })
    const todosFromApi = apiData.data.listTodos.items
    await Promise.all(
      todosFromApi.map(async (todo) => {
        if (todo.image) {
          const url = await Storage.get(todo.name)
          todo.image = url 
        }
        return todo 
      })
    )
    setTodos(todosFromApi)
  }

  async function createTodo(event) {
    event.preventDefault()
    const form = new FormData(event.target)
    const image = form.get("todo_image")
    const data = {
      name: form.get("todo_name"),
      description: form.get("todo_description"),
      image: image.name
    }
    if (!!data.image) {
      await Storage.put(data.name, image)
    }
    await API.graphql({
      query: createTodoMutation,
      variables: { input: data }
    })
    fetchTodos()
    event.target.reset()
  }

  async function deleteTodo({ id, name }) {
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
    await Storage.remove(name)
    await API.graphql({
      query: deleteTodoMutation,
      variables: { input: { id }}
    })
  }

  return (
    <View className="App">
      <Heading level={1}>My Todos App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTodo}>
        <Flex direction="flow" justifyContent="center">
          <TextField
            name="todo_name"
            placeholder="Todo Name"
            label="Todo Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="todo_description"
            placeholder="Todo Description"
            label="Todo Description"
            labelHidden
            variation="quiet"
            required
          />
          <View 
            name="todo_image"
            as="input"
            type="file"
            accept="image/*"
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            Create Todo
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Todos</Heading>
      <View margin="3rem 0">
        {todos.map((todo) => {
          return (
            <Flex 
              key={todo.id || todo.name}
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Text as="strong" fontWeight={700}>
                {todo.name}
              </Text>
              <Text as="span">
                {todo.description}
              </Text>
              {todo.image && (
                <Image 
                  src={todo.image}
                  alt={`visual aid for ${todo.name}`}
                  style={{width: 400}}
                />
              )}
              <Button variation="link" onClick={() => deleteTodo(todo)}>
                Delete todo
              </Button>
            </Flex>
          )
        })}
      </View>
      <Button onClick={signOut} alignSelf={'center'}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);
