import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import awsconfig from "./amplifyconfiguration.json";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries.js";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateNote as updateNoteMutation,
} from "./graphql/mutations.js";

Amplify.configure(awsconfig);
const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function updateNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      id: selectedNote.id,
      name: form.get("name"),
      description: form.get("description"),
    };
    await client.graphql({
      query: updateNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
    setSelectedNote(null);
  }

  async function deleteNote({ id }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  const handleUpdateNote = (note) => {
    setSelectedNote(note);
  };

  return (
    <View className="App">
      <Heading level={1}>Employees</Heading>
      <View as="form" margin="3rem 0" onSubmit={selectedNote ? updateNote : createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Name"
            label="Name"
            labelHidden
            variation="quiet"
            required
            defaultValue={selectedNote ? selectedNote.name : ""}
          />
          <TextField
            name="description"
            placeholder="Job"
            label="Job"
            labelHidden
            variation="quiet"
            required
            defaultValue={selectedNote ? selectedNote.description : ""}
          />
          <Button type="submit" variation="primary">
            {selectedNote ? "Update Employee" : "Create Employee"}
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Employees List</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete Employee
            </Button>
            <Button variation="link" onClick={() => handleUpdateNote(note)}>
              Update Employee
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
