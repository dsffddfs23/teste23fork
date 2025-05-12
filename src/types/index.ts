export interface Comment {
  username: string;
  message: string;
  timestamp: number;
  txHash: string;
}

export interface TwitchMessage {
  username: string;
  message: string;
  id: string;
}

export interface ContractEventData {
  username: string;
  message: string;
  timestamp: bigint;
  txHash: string;
}