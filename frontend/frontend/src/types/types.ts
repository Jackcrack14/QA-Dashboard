export interface Reply {
  id: number;
  question_id: number;
  content: string;
  created_at: string;
}

export interface Question {
  id: number;
  content: string;
  status: "Pending" | "Escalated" | "Answered";
  created_at: string;
  replies: Reply[];
  votes: number;
}

export interface SocketMessage {
  type: "NEW_QUESTION" | "UPDATE_QUESTION";
  data: any;
}
