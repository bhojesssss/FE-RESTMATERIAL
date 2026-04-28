// src/services/conversationApi.js
import { request } from './api'; // pakai helper yang sama kayak auth.js

// Start/resume conversation ke listing tertentu
export async function startConversation(listingId, message) {
  return request('/conversations/', {
    method: 'POST',
    body: JSON.stringify({ listing_id: listingId, message }),
  });
}

// Ambil semua conversation milik user (buat list di widget)
export async function getMyConversations() {
  return request('/conversations/');
}

// Ambil messages dari 1 conversation, dengan pagination
export async function getMessages(conversationId, page = 1, limit = 50) {
  return request(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
}

// Kirim message ke conversation yang udah ada
export async function sendMessage(conversationId, content) {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// Mark semua pesan dari lawan bicara sebagai read
export async function markAsRead(conversationId) {
  return request(`/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
} 