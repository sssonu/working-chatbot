import { gql } from '@apollo/client';

export const MESSAGE_FIELDS = gql`
  fragment MessageFields on messages {
    id
    content
    role
    created_at
  }
`;

export const CHAT_FIELDS = gql`
  fragment ChatFields on chats {
    id
    created_at
  }
`;

export const SEND_MESSAGE_RESPONSE_FIELDS = gql`
  fragment SendMessageResponseFields on SendMessageResponse {
    id
    content
    role
    created_at
  }
`;