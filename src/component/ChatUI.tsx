import React, {useRef, useState} from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  ListItemText,
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../backend/api';
import {AVAILABLE_MODELS, Message, ModelType, ChatSession} from '../types/types';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';


const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("llama3.2");
  const currentMessageContent = useRef<string>('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [fileContext, setFileContext] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFiles(prev => [...prev, file]);
    setFileContext({
      name: file.name,
      content: `Uploaded: ${file.name}`
    });
  };
  // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //
  //   const fileType = file.name.split('.').pop()?.toLowerCase();
  //
  //   if (fileType === 'txt' || fileType === 'md' || fileType === 'csv') {
  //     const reader = new FileReader();
  //     reader.onload = async (e) => {
  //       const text = e.target?.result as string;
  //       setFileContext({
  //         name: file.name,
  //         content: text
  //       });
  //     };
  //     reader.readAsText(file);
  //   } else if (fileType === 'pdf' || fileType === 'xlsx' || fileType === 'xls' || fileType === 'docx') {
  //     setFileContext({
  //       name: file.name,
  //       content: `[${fileType.toUpperCase()} file content]`
  //     });
  //   }
  // };

  // const handleSend = async () => {
  //     if (!input.trim()) return;
  //     var userMessage: Message
  //     if (fileContext) {
  //       userMessage = {
  //         role: 'user',
  //         content: input.trim()
  //             ? `File: ${fileContext.name}\n\nContent:\n${fileContext.content}\n\nQuestion: ${input}`
  //             : `File: ${fileContext.name}\n\nContent:\n${fileContext.content}`
  //       };
  //     } else {
  //       userMessage = {
  //         role: 'user',
  //         content: input
  //       };
  //     }
  //
  //     const updatedMessages = [...messages, userMessage];
  //     setMessages(updatedMessages);
  //     setInput('');
  //     setFileContext(null); // Clear file context after sending
  //     setIsStreaming(true);
  //     currentMessageContent.current = '';
  //
  //     try {
  //       // Add an empty system message that will be updated with streaming content
  //       const systemMessage: Message = {
  //         role: 'system',
  //         content: ''
  //       };
  //       setMessages(prev => [...prev, systemMessage]);
  //
  //       await sendChatMessage(updatedMessages, (chunk: string) => {
  //         currentMessageContent.current += chunk;
  //         setMessages(prevMessages => {
  //           const newMessages = [...prevMessages];
  //           newMessages[newMessages.length - 1] = {
  //             ...newMessages[newMessages.length - 1],
  //             content: currentMessageContent.current
  //           };
  //           return newMessages;
  //         });
  //       }, selectedModel);
  //     } catch (error) {
  //       console.error('Error:', error);
  //     } finally {
  //       setIsStreaming(false);
  //     }
  // };
  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: input || 'Analyze these documents'
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    currentMessageContent.current = '';

    try {
      const systemMessage: Message = {
        role: 'system',
        content: ''
      };
      setMessages(prev => [...prev, systemMessage]);

      await sendChatMessage(
          updatedMessages,
          (chunk: string) => {
            currentMessageContent.current += chunk;
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: currentMessageContent.current
              };
              return newMessages;
            });
          },
          selectedModel,
          uploadedFiles
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsStreaming(false);
      setUploadedFiles([]);
      setFileContext(null);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isStreaming) {
        handleSend();
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (selectedSession === sessionId) {
      setMessages([]);
      setSelectedSession(null);
    }
  };

  const saveSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(), // Simple unique ID
      title: `Chat ${chatSessions.length + 1}`, // Simple title
      messages: messages,
      timestamp: new Date()
    };
    setChatSessions(prev => [...prev, newSession]);
    setSelectedSession(newSession.id);
  };

  return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Left Sidebar */}
        <Box sx={{
          width: 280,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5'
        }}>
          <Box sx={{ p: 2 }}>
            <Button
                variant="contained"
                fullWidth
                onClick={handleNewChat}
                sx={{ mb: 2 }}
            >
              New Chat
            </Button>
            <Button
                variant="outlined"
                fullWidth
                onClick={saveSession}
                disabled={messages.length === 0}
            >
              Save Chat
            </Button>
          </Box>
          <Divider />
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#666' }}>
            Recent Chats
          </Typography>
          <List sx={{ overflow: 'auto', flex: 1 }}>
            {chatSessions.map((session) => (
                <ListItemButton
                    key={session.id}
                    selected={selectedSession === session.id}
                    onClick={() => setSelectedSession(session.id)}
                >
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                      primary={session.title}
                      secondary={new Date(session.timestamp).toLocaleDateString()}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: '0.9rem'
                      }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        fontSize: '0.75rem'
                      }}
                  />
                  <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Model: {selectedModel}
            </Typography>
          </Box>
        </Box>

        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Existing chat list */}
          <List sx={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            {messages.map((msg, index) => (
                <ListItemButton
                    key={index}
                    disableRipple
                    sx={{
                      padding: 2,
                      bgcolor: msg.role === 'system' ? '#fff' : 'transparent',
                      alignItems: 'flex-start',
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'default',
                      '&:hover': {
                        bgcolor: msg.role === 'system' ? '#fff' : 'transparent',
                      }
                    }}
                >
                  <ListItemIcon sx={{ minWidth: '40px', mt: 0.5 }}>
                    {msg.role === 'user' ? (
                        <PersonIcon sx={{ color: '#555' }} />
                    ) : (
                        <SupportAgentIcon sx={{ color: '#555' }} />
                    )}
                  </ListItemIcon>
                  <Box sx={{ flex: 1, marginLeft: 1 }}>
                    <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                              <p style={{ margin: '0.5em 0' }}>{children}</p>
                          ),
                          code: ({ children }) => (
                              <code style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 4px',
                                borderRadius: 4,
                                fontSize: '0.9em'
                              }}>
                                {children}
                              </code>
                          ),
                          pre: ({ children }) => (
                              <pre style={{
                                backgroundColor: '#f0f0f0',
                                padding: '1em',
                                borderRadius: 8,
                                overflow: 'auto'
                              }}>
                        {children}
                      </pre>
                          )
                        }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                </ListItemButton>
            ))}
          </List>

          {/* Input area */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            borderTop: '1px solid #ccc',
            backgroundColor: '#fff',
            position: 'sticky',
            bottom: 0,
            gap: 1
          }}>
            {fileContext && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#f0f0f0',
                  p: 1,
                  borderRadius: 1
                }}>
                  <UploadFile fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {fileContext.name}
                  </Typography>
                  <IconButton
                      size="small"
                      onClick={() => {
                        setFileContext(null);
                        setInput('');
                      }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ width: 100 }}>
                <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                    disabled={isStreaming}
                    size="small"
                >
                  {AVAILABLE_MODELS.map((model) => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={handleKeyPress}
                    multiline
                    maxRows={4}
                    disabled={isStreaming}
                />
                <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                    disabled={isStreaming}
                >
                  <UploadFile fontSize="small" />
                  <input
                      type="file"
                      hidden
                      accept=".txt,.md,.xlsx,.xls,.pdf,.csv,.docx"
                      onChange={handleFileUpload}
                  />
                </IconButton>
              </Box>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                  disabled={isStreaming}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
  );
};

export default ChatUI;