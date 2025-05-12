import { Client } from 'tmi.js';
import { TwitchMessage } from '../types';

let twitchClient: Client | null = null;
let currentChannel = '';
let messageHandler: ((message: TwitchMessage) => void) | null = null;
let connectionRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const connectWithRetry = async (client: Client): Promise<boolean> => {
  try {
    await client.connect();
    console.log('Successfully connected to Twitch');
    connectionRetries = 0;
    return true;
  } catch (error) {
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    console.error('Detailed Twitch connection error:', errorMessage);
    
    // Enhanced error handling with specific error types
    if (errorMessage.includes('ENOTFOUND') || errorMessage.toLowerCase().includes('address could not be found')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      if (connectionRetries < MAX_RETRIES) {
        connectionRetries++;
        console.log(`Retrying DNS resolution (attempt ${connectionRetries}/${MAX_RETRIES})...`);
        return connectWithRetry(client);
      }
    }
    
    if (errorMessage.includes('Connection closed')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 2));
      if (connectionRetries < MAX_RETRIES) {
        connectionRetries++;
        console.log(`Retrying after connection closed (attempt ${connectionRetries}/${MAX_RETRIES})...`);
        return connectWithRetry(client);
      }
    }
    
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      const backoffDelay = RETRY_DELAY * Math.pow(2, connectionRetries - 1);
      console.log(`Retrying connection with exponential backoff (attempt ${connectionRetries}/${MAX_RETRIES}) after ${backoffDelay}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return connectWithRetry(client);
    }
    
    console.error('Failed to connect to Twitch after all retries');
    return false;
  }
};

export const initTwitchClient = async (channel: string): Promise<boolean> => {
  try {
    if (!channel || typeof channel !== 'string' || channel.trim() === '') {
      console.error('Invalid channel name provided');
      return false;
    }

    // Disconnect existing client with timeout
    if (twitchClient) {
      console.log('Disconnecting existing client...');
      const disconnectPromise = twitchClient.disconnect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Disconnect timeout')), 5000)
      );
      await Promise.race([disconnectPromise, timeoutPromise]).catch(() => {
        console.log('Force disconnecting client due to timeout');
        twitchClient = null;
      });
    }

    console.log(`Initializing Twitch client for channel: ${channel}`);
    
    const normalizedChannel = channel.toLowerCase().trim();

    twitchClient = new Client({
      options: { 
        debug: true,
        skipMembership: true
      },
      connection: {
        reconnect: true,
        secure: true,
        timeout: 60000, // Increased timeout to 60 seconds
        maxReconnectAttempts: 10, // Increased retry attempts
        maxReconnectInverval: 30000 // Increased reconnect interval
      },
      channels: [normalizedChannel]
    });

    twitchClient.on('message', (channel, tags, message, self) => {
      if (self || !messageHandler) return;
      
      const twitchMessage: TwitchMessage = {
        username: tags.username || 'anonymous',
        message,
        id: tags.id || Date.now().toString()
      };
      
      messageHandler(twitchMessage);
    });

    twitchClient.on('connected', () => {
      console.log('Connected to Twitch chat');
      currentChannel = normalizedChannel;
      connectionRetries = 0;
    });

    twitchClient.on('disconnected', (reason) => {
      console.log('Disconnected from Twitch chat:', reason);
      if (reason !== 'Requested' && connectionRetries < MAX_RETRIES) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWithRetry(twitchClient!);
        }, RETRY_DELAY);
      }
    });

    const connected = await connectWithRetry(twitchClient);
    if (!connected) {
      console.error('Failed to establish Twitch connection');
      return false;
    }
    return true;
  } catch (error) {
    let errorMessage = 'Unknown error during Twitch client initialization';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    console.error('Error initializing Twitch client:', errorMessage);
    return false;
  }
};

export const changeChannel = async (newChannel: string): Promise<boolean> => {
  if (!newChannel || typeof newChannel !== 'string' || newChannel.trim() === '') {
    console.error('Invalid channel name provided for channel change');
    return false;
  }

  const normalizedNewChannel = newChannel.toLowerCase().trim();
  if (normalizedNewChannel === currentChannel) return true;
  
  try {
    console.log(`Attempting to change channel to: ${normalizedNewChannel}`);
    if (twitchClient) {
      const changeChannelPromise = async () => {
        await twitchClient!.part(currentChannel);
        await twitchClient!.join(normalizedNewChannel);
      };
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Channel change timeout')), 30000) // Increased timeout
      );
      
      await Promise.race([changeChannelPromise(), timeoutPromise]);
      currentChannel = normalizedNewChannel;
      console.log(`Successfully changed to channel: ${normalizedNewChannel}`);
      return true;
    } else {
      console.log('No existing client, initializing new connection');
      return initTwitchClient(normalizedNewChannel);
    }
  } catch (error) {
    let errorMessage = 'Unknown error during channel change';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    console.error('Error changing channel:', errorMessage);
    
    if (errorMessage.includes('timeout')) {
      console.log('Attempting to reinitialize client after timeout...');
      return initTwitchClient(normalizedNewChannel);
    }
    
    return false;
  }
};

export const setMessageHandler = (
  handler: (message: TwitchMessage) => void
): void => {
  messageHandler = handler;
};

export const getCurrentChannel = (): string => {
  return currentChannel;
};