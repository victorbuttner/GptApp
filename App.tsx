import React, {useState, useEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import axios from 'axios';
import {version} from './package.json';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

AppRegistry.registerComponent('ChatGPTApp', () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
});

const WelcomeScreen = ({onSubmitUsername}) => {
  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username..."
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Enter Chat" onPress={() => onSubmitUsername(username)} />
    </View>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) {
      setMessages([
        {
          _id: 1,
          text: `Olá ${user.name}! Como posso te ajudar hoje?`,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'ChatGPT',
          },
        },
      ]);
    }
  }, [user]);

  const onSend = async (newMessages = []) => {
    setMessages(GiftedChat.append(messages, newMessages));
    const message = newMessages[0].text;

    console.log('message', {
      source: 'UserMessage',
      text: message,
      user: user ? user.name : 'undefined',
    });

    if (message.toLowerCase().includes('erro')) {
      setErrorMessage('Um erro foi detectado em sua mensagem.');
      throw new Error('Uma mensagem de erro foi detectada.');
    }
    if (message.toLowerCase().includes('exception')) {
      throw new Error('Uma mensagem de erro foi detectada.');
    }
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer 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',
          },
        },
      );
      const replies = response.data.choices[0].message.content.trim();

      console.log('message', {
        source: 'OpenAIResponse',
        text: replies,
        user: user ? user.name : 'undefined',
      });

      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, {
          _id: Math.round(Math.random() * 1000000),
          text: replies,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'ChatGPT',
          },
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmitUsername = username => {
    setUser({
      _id: 1,
      name: username,
    });
  };

  if (!user) {
    return <WelcomeScreen onSubmitUsername={onSubmitUsername} />;
  }

  return (
    <>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: 1,
        }}
      />
    </>
  );
};

export default App;
