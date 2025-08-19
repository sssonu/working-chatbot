import { gql } from '@apollo/client';
import { MESSAGE_FIELDS, CHAT_FIELDS, SEND_MESSAGE_RESPONSE_FIELDS } from './fragments';

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      ...ChatFields
    }
  }
  ${CHAT_FIELDS}
`;

export const GET_MESSAGES_SUBSCRIPTION = gql`
  subscription GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      ...MessageFields
    }
  }
  ${MESSAGE_FIELDS}
`;

export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      ...ChatFields
    }
  }
  ${CHAT_FIELDS}
`;

export const INSERT_USER_MESSAGE = gql`
  mutation InsertUserMessage($chatId: uuid!, $message: String!) {
    insert_messages_one(object: { chat_id: $chatId, content: $message, role: "user" }) {
      ...MessageFields
    }
  }
  ${MESSAGE_FIELDS}
`;

export const SEND_MESSAGE_TO_BOT = gql`
  mutation SendMessageToBot($chatId: uuid!, $message: String!) {
    sendMessageToBot(chat_id: $chatId, content: $message) {
      ...SendMessageResponseFields
    }
  }
  ${SEND_MESSAGE_RESPONSE_FIELDS}
`;