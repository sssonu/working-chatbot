import { useState, useRef, useEffect } from 'react';
import { useSignOut } from '@nhost/react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import {
  AppShell,
  Text,
  ActionIcon,
  Group,
  ScrollArea,
  Stack,
  TextInput,
  Paper,
  Box,
  ThemeIcon,
  UnstyledButton,
  Loader,
  Center,
  Button,
  Divider,
} from '@mantine/core';
import { 
  IconLogout, 
  IconPlus, 
  IconMessageChatbot, 
  IconSend, 
  IconArrowDown,
  IconArrowUp,
  IconChevronUp,
  IconChevronDown,
  IconMessageCircle
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import {
  GET_CHATS,
  GET_MESSAGES_SUBSCRIPTION,
  CREATE_CHAT,
  INSERT_USER_MESSAGE,
  SEND_MESSAGE_TO_BOT,
} from '../graphql/operations';

// --- Reusable Button
function ButtonWithIcon({ children, icon, onClick }) {
  return (
    <Button
      leftSection={icon}
      variant="light"
      fullWidth
      radius="md"
      onClick={onClick}
      style={{ fontWeight: 500 }}
    >
      {children}
    </Button>
  );
}

// --- Enhanced Sidebar with Scroll Buttons
function ChatList({ activeChatId, setActiveChatId }) {
  const { data, loading, error } = useQuery(GET_CHATS);
  const [createChat] = useMutation(CREATE_CHAT, { refetchQueries: ['GetChats'] });
  const scrollViewportRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Check scroll position and update button visibility
  const updateScrollButtons = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const hasOverflow = scrollHeight > clientHeight + 5; // 5px tolerance
    
    setShowScrollButtons(hasOverflow);
    setCanScrollUp(scrollTop > 10);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 10);
  };

  // Scroll functions for chat list
  const scrollUp = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ top: -150, behavior: 'smooth' });
  };

  const scrollDown = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ top: 150, behavior: 'smooth' });
  };

  useEffect(() => {
    // Update scroll buttons when chats change
    const timer = setTimeout(updateScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [data?.chats]);

  if (loading) return <Center><Loader /></Center>;
  if (error) return <Text color="red">Error loading chats.</Text>;

  return (
    <Stack gap="sm" style={{ height: '100%', position: 'relative' }}>
      <ButtonWithIcon icon={<IconPlus size="1rem" />} onClick={() => createChat()}>
        New Chat
      </ButtonWithIcon>
      <Divider my="xs" />
      
      <Box style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* Scroll Up Button for Chat List */}
        {showScrollButtons && canScrollUp && (
          <ActionIcon
            onClick={scrollUp}
            size="sm"
            color="blue"
            variant="light"
            radius="xl"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e9ecef',
            }}
            title="Scroll up"
          >
            <IconChevronUp size="0.8rem" />
          </ActionIcon>
        )}

        <ScrollArea 
          style={{ height: '100%' }}
          viewportRef={scrollViewportRef}
          onScrollPositionChange={updateScrollButtons}
        >
          <Stack gap="xs" pr="sm">
            {data?.chats.map((chat) => (
              <ChatLink
                key={chat.id}
                label={`Chat - ${new Date(chat.created_at).toLocaleDateString()}`}
                active={chat.id === activeChatId}
                onClick={() => setActiveChatId(chat.id)}
              />
            ))}
          </Stack>
        </ScrollArea>

        {/* Scroll Down Button for Chat List */}
        {showScrollButtons && canScrollDown && (
          <ActionIcon
            onClick={scrollDown}
            size="sm"
            color="blue"
            variant="light"
            radius="xl"
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              zIndex: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e9ecef',
            }}
            title="Scroll down"
          >
            <IconChevronDown size="0.8rem" />
          </ActionIcon>
        )}
      </Box>
    </Stack>
  );
}

function ChatLink({ label, active, onClick }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: 10,
        borderRadius: 8,
        fontWeight: 500,
        backgroundColor: active ? 'var(--mantine-color-blue-0)' : 'transparent',
        color: active ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-7)',
      }}
    >
      <Group>
        <ThemeIcon color={active ? 'blue' : 'gray'} variant="light" radius="md">
          <IconMessageChatbot size="1rem" />
        </ThemeIcon>
        <Text size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

// --- Enhanced Messages with Scroll Buttons
function MessageList({ activeChatId }) {
  const viewport = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const { data, loading, error } = useSubscription(GET_MESSAGES_SUBSCRIPTION, {
    variables: { chatId: activeChatId },
    skip: !activeChatId,
  });

  // Auto-scroll to bottom when new messages arrive and user is near bottom
  useEffect(() => {
    if (!viewport.current || !data?.messages?.length) return;
    
    // Always scroll to bottom for new messages if user was already at bottom
    if (atBottom) {
      const timer = setTimeout(() => {
        viewport.current?.scrollTo({
          top: viewport.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data?.messages, atBottom]);

  // Enhanced scroll position tracking
  const updateScrollPosition = () => {
    const el = viewport.current;
    if (!el) return;
    
    const tolerance = 50; // Increased tolerance
    const { scrollTop, scrollHeight, clientHeight } = el;
    
    const isAtBottom = (scrollHeight - scrollTop - clientHeight) < tolerance;
    const isAtTop = scrollTop < tolerance;
    const hasScrollableContent = scrollHeight > clientHeight + 10;
    
    setAtBottom(isAtBottom);
    setAtTop(isAtTop);
    setHasContent(hasScrollableContent);
  };

  // Initialize scroll position check
  useEffect(() => {
    const timer = setTimeout(updateScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [data?.messages]);

  const scrollToBottom = () => {
    if (!viewport.current) return;
    viewport.current.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollToTop = () => {
    if (!viewport.current) return;
    viewport.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!activeChatId)
    return (
      <Center style={{ height: '100%' }}>
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" variant="light" color="blue">
            <IconMessageCircle size={40} />
          </ThemeIcon>
          <Stack align="center" gap="xs">
            <Text size="lg" fw={500} c="dark">
              Welcome to AI Chatbot
            </Text>
            <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 300 }}>
              Click on the <strong>New Chat</strong> button or select a chat to start a conversation.
            </Text>
          </Stack>
        </Stack>
      </Center>
    );

  if (loading)
    return (
      <Center style={{ height: '100%' }}>
        <Loader />
      </Center>
    );

  if (error) return <Text c="red">Error loading messages.</Text>;

  return (
    <Box style={{ position: 'relative', height: '100%' }}>
      <ScrollArea
        style={{ height: '100%' }}
        viewportRef={viewport}
        onScrollPositionChange={updateScrollPosition}
        px="md"
        py="sm"
      >
        <Stack gap="sm">
          {data?.messages?.length > 0 ? (
            data.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          ) : (
            <Center style={{ height: '200px' }}>
              <Text c="dimmed">No messages yet. Start the conversation!</Text>
            </Center>
          )}
        </Stack>
      </ScrollArea>

      {/* Scroll to Top Button */}
      {hasContent && !atTop && (
        <ActionIcon
          onClick={scrollToTop}
          radius="xl"
          size="lg"
          color="gray"
          variant="filled"
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            opacity: 0.9,
          }}
          title="Scroll to top"
        >
          <IconArrowUp size={18} />
        </ActionIcon>
      )}

      {/* Scroll to Bottom Button */}
      {hasContent && !atBottom && (
        <ActionIcon
          onClick={scrollToBottom}
          radius="xl"
          size="lg"
          color="blue"
          variant="filled"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
          }}
          title="Scroll to latest"
        >
          <IconArrowDown size={18} />
        </ActionIcon>
      )}
    </Box>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <Box style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Paper
        shadow="sm"
        p="sm"
        radius="lg"
        style={{
          maxWidth: '70%',
          backgroundColor: isUser ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-0)',
          color: isUser ? 'white' : 'var(--mantine-color-black)',
          fontSize: 'var(--mantine-font-size-sm)',
          lineHeight: 1.5,
        }}
      >
        <Text style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
      </Paper>
    </Box>
  );
}

// --- Message Input
function MessageInput({ activeChatId }) {
  const [insertUserMessage] = useMutation(INSERT_USER_MESSAGE);
  const [sendMessageToBot, { loading: botLoading }] = useMutation(SEND_MESSAGE_TO_BOT);
  const form = useForm({ initialValues: { message: '' } });

  const handleSubmit = async (values) => {
    if (!values.message.trim() || !activeChatId) return;
    const userMessage = values.message;
    form.reset();
    try {
      await insertUserMessage({ variables: { chatId: activeChatId, message: userMessage } });
      await sendMessageToBot({ variables: { chatId: activeChatId, message: userMessage } });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Box p="sm" style={{ borderTop: '1px solid #eee', backgroundColor: 'white' }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group gap="sm">
          <TextInput
            placeholder="Type your message..."
            radius="xl"
            size="md"
            style={{ flex: 1 }}
            disabled={!activeChatId || botLoading}
            {...form.getInputProps('message')}
          />
          <ActionIcon
            type="submit"
            size="lg"
            color="blue"
            variant="filled"
            radius="xl"
            loading={botLoading}
            disabled={!activeChatId}
            title="Send"
          >
            <IconSend size="1.2rem" />
          </ActionIcon>
        </Group>
      </form>
    </Box>
  );
}

// --- Main Chat Page
const ChatPage = () => {
  const { signOut } = useSignOut();
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <AppShell
      padding={0}
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm' }}
      footer={{ height: 70 }}
    >
      <AppShell.Header>
        <Box style={{ position: 'relative', height: '100%' }}>
          <Center style={{ height: '100%' }}>
            <Text fw={700}>AI Chatbot</Text>
          </Center>
          <ActionIcon
            onClick={signOut}
            title="Sign Out"
            variant="light"
            radius="md"
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <IconLogout size="1.2rem" />
          </ActionIcon>
        </Box>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ChatList activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box style={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <MessageList activeChatId={activeChatId} />
        </Box>
      </AppShell.Main>

      <AppShell.Footer>
        <MessageInput activeChatId={activeChatId} />
      </AppShell.Footer>
    </AppShell>
  );
};

export default ChatPage;
