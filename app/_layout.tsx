import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
} from "react-native";

import {
  withAuthenticator,
  useAuthenticator,
} from "@aws-amplify/ui-react-native";
import config from "../src/amplifyconfiguration.json";
import { createTodo } from "../src/graphql/mutations";
import { listTodos } from "../src/graphql/queries";

Amplify.configure(config);

// retrieves only the current value of 'user' from 'useAuthenticator'
const userSelector = (context: any) => [context.user];

const SignOutButton = () => {
  const { user, signOut } = useAuthenticator(userSelector);
  return (
    <Pressable onPress={signOut} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        Hello, {user.username}! Click here to sign out!
      </Text>
    </Pressable>
  );
};

const initialFormState = { name: "", description: "" };
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [todos, setTodos] = useState<any>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key: any, value: any) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialFormState);
      await client.graphql({
        query: createTodo,
        variables: { input: todo },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <SignOutButton />
        <TextInput
          onChangeText={(value) => setInput("name", value)}
          style={styles.input}
          value={formState.name}
          placeholder="Name"
        />
        <TextInput
          onChangeText={(value) => setInput("description", value)}
          style={styles.input}
          value={formState.description}
          placeholder="Description"
        />
        <Pressable onPress={addTodo} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Create todo</Text>
        </Pressable>
        {todos.map((todo: any, index: number) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: { width: 400, flex: 1, padding: 20, alignSelf: "center" },
  todo: { marginBottom: 15 },
  input: {
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  buttonContainer: {
    alignSelf: "center",
    backgroundColor: "black",
    paddingHorizontal: 8,
  },
  buttonText: { color: "white", padding: 16, fontSize: 18 },
  todoDescription: { color: "white", padding: 16, fontSize: 18 },
});
