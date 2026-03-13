import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { Send, ArrowLeft } from 'lucide-react';

type MessagesPageProps = {
  initialConversationId?: string;
  initialSellerId?: string;
  initialListingId?: string;
};

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listings: {
    title: string;
    images: string[];
  };
  buyer_profile: {
    username: string;
  };
  seller_profile: {
    username: string;
  };
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
};

export function MessagesPage({ initialConversationId, initialSellerId, initialListingId }: MessagesPageProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    if (initialConversationId) {
      setSelectedConversation(initialConversationId);
    } else if (initialSellerId && initialListingId) {
      createOrFindConversation(initialSellerId, initialListingId);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markMessagesAsRead();

      const subscription = supabase
        .channel(`messages:${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  const createOrFindConversation = async (sellerId: string, listingId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (existing) {
      setSelectedConversation(existing.id);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (newConv) {
        setSelectedConversation(newConv.id);
        fetchConversations();
      }
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        listings (title, images),
        buyer_profile:profiles!conversations_buyer_id_fkey (username),
        seller_profile:profiles!conversations_seller_id_fkey (username)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (data) {
      setConversations(data as any);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConversation)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', selectedConversation)
      .neq('sender_id', user.id)
      .eq('read', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage('');
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    return user.id === conversation.buyer_id
      ? conversation.seller_profile
      : conversation.buyer_profile;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('loading', language)}</div>
      </div>
    );
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  if (selectedConversation && currentConversation) {
    const otherUser = getOtherUser(currentConversation);

    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">{otherUser?.username}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{currentConversation.listings.title}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('typeMessage', language)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('messages', language)}</h1>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noMessages', language)}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {otherUser?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">{otherUser?.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {conversation.listings.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
