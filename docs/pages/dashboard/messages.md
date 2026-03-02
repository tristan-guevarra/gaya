# Messages — Gaya Intelligence Platform

## Product

**Purpose:** In-app messaging hub enabling real-time direct communication between coaches and parents (or fellow coaches), with rich message types and AI-assisted reply suggestions.

**Target users:** Coaches managing inbound inquiries from parents and coordinating with other coaches on the platform.

**Key features:**
- Two-panel layout: conversation list on the left, active chat on the right
- Online presence indicators (green dot) and typing indicator display
- Unread badge counts per conversation and in the page header
- Pinned conversations surfaced at the top of the list
- AI-powered quick reply chips pre-populated with contextual suggestions
- Booking confirmation message type — renders a structured card inside the chat bubble
- Read receipts (single check = sent, double check = read) on outgoing messages
- Search to filter conversations by contact name
- Attachment, image, and emoji input buttons in the composer

**User flows:**
1. Open Messages; unread count displayed in header badge
2. Click a conversation in the list to open it; list item shows typing indicator when active
3. Read message history; booking confirmation cards render inline
4. Select an AI quick reply chip to pre-fill the composer
5. Type or edit the message and press Enter or the send button (active only when input is non-empty)

---

## Technical

**Component:** `MessagingPage` (default export) — `'use client'`

**Imports / dependencies:**
- `useState`, `useRef`, `useEffect` from React
- `lucide-react`
- `@/lib/utils` — `cn`

**Key types:**
```ts
interface Message {
  id: string; text: string; sender: 'me' | 'them';
  timestamp: string; read: boolean;
  type?: 'text' | 'booking' | 'image';
  bookingData?: { title: string; date: string; time: string; status: string };
}

interface Conversation {
  id: string; name: string; avatar: string; avatarColor: string;
  role: string; lastMessage: string; lastTime: string;
  unread: number; online: boolean; typing: boolean; pinned: boolean;
  messages: Message[];
}
```

**Mock data:**
- `conversations` — 4 entries; 2 with unread messages; 1 with `typing: true`; 1 pinned
- `quickReplies` — 4 static AI suggestion strings

**State:**
- `activeConvo: Conversation` — initialized to `conversations[0]`; switching triggers `useEffect` scroll-to-bottom
- `message: string` — composer input value; cleared on Enter keydown when non-empty
- `searchQuery: string` — filters `conversations` by name client-side

**UI patterns:**
- Layout: `flex h-[calc(100vh-120px)]`; left panel fixed at `w-80`; right panel `flex-col` with scrollable messages area
- `messagesEndRef` attached to a trailing `<div>`; scrolled into view on conversation change
- Booking message type renders a white card with status badge inside the bubble
- Send button uses `cn` to toggle between active (`bg-atlas-500`) and inactive (`bg-slate-50`) styles based on `message.trim()`
- Avatar colors are Tailwind gradient strings stored on each conversation object
