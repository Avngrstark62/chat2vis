import React, { useState, useEffect } from 'react';
import type { Question, Answer } from '../api/index';
import { getAnswer } from '../api/index';
import { VisualizationCanvas } from './VisualizationCanvas';

interface ChatMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
  answerId?: string;
  answer?: Answer;
  isLoading?: boolean;
}

interface ChatPanelProps {
  questions: Question[];
  onNewAnswer: (answer: Answer) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ questions, onNewAnswer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set());
  const [fetchedAnswers, setFetchedAnswers] = useState<Set<string>>(new Set());
  const [pollingAnswers, setPollingAnswers] = useState<Set<string>>(new Set());

  // Polling function for pending answers
  const pollForAnswer = (answerId: string) => {
    if (pollingAnswers.has(answerId)) return; // Already polling
    
    setPollingAnswers(prev => new Set(prev).add(answerId));
    
    const interval = setInterval(async () => {
      try {
        const answer = await getAnswer(answerId);
        
        // Answer found, stop polling
        clearInterval(interval);
        setPollingAnswers(prev => {
          const updated = new Set(prev);
          updated.delete(answerId);
          return updated;
        });
        
        onNewAnswer(answer);
        setMessages(prevMessages => {
          const answerExists = prevMessages.some(msg => msg.id === `answer_${answerId}`);
          if (answerExists) {
            return prevMessages;
          }
          
          const answerMessage: ChatMessage = {
            id: `answer_${answerId}`,
            type: 'answer',
            content: answer.text,
            timestamp: new Date(answer.createdAt),
            answer
          };
          const updatedMessages = [...prevMessages, answerMessage];
          return updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
        
        setLoadingAnswers(prev => {
          const updated = new Set(prev);
          updated.delete(answerId);
          return updated;
        });
        
      } catch (error) {
        // Answer not ready yet, continue polling
        console.log(`Answer ${answerId} not ready yet, continuing to poll...`);
      }
    }, 2000); // Poll every 2 seconds
    
    // Stop polling after 5 minutes to avoid infinite polling
    setTimeout(() => {
      clearInterval(interval);
      setPollingAnswers(prev => {
        const updated = new Set(prev);
        updated.delete(answerId);
        return updated;
      });
      setLoadingAnswers(prev => {
        const updated = new Set(prev);
        updated.delete(answerId);
        return updated;
      });
    }, 300000); // 5 minutes
  };

  useEffect(() => {
    // Convert questions to messages and start polling for answers
    const newMessages: ChatMessage[] = [];
    const answersToFetch: string[] = [];
    
    questions.forEach(question => {
      // Add question message
      newMessages.push({
        id: question.questionId,
        type: 'question',
        content: question.question,
        timestamp: new Date(question.createdAt),
        answerId: question.answerId
      });

      // Check if we need to fetch/poll for the answer
      if (question.answerId && !fetchedAnswers.has(question.answerId) && !loadingAnswers.has(question.answerId)) {
        answersToFetch.push(question.answerId);
      }
    });

    // Set the question messages immediately
    setMessages(newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));

    // For each answer that needs to be fetched, try immediate fetch then start polling
    answersToFetch.forEach(answerId => {
      setLoadingAnswers(prev => new Set(prev).add(answerId));
      setFetchedAnswers(prev => new Set(prev).add(answerId));
      
      // Try immediate fetch first
      getAnswer(answerId)
        .then(answer => {
          onNewAnswer(answer);
          setMessages(prevMessages => {
            const answerExists = prevMessages.some(msg => msg.id === `answer_${answerId}`);
            if (answerExists) {
              return prevMessages;
            }
            
            const answerMessage: ChatMessage = {
              id: `answer_${answerId}`,
              type: 'answer',
              content: answer.text,
              timestamp: new Date(answer.createdAt),
              answer
            };
            const updatedMessages = [...prevMessages, answerMessage];
            return updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
          setLoadingAnswers(prev => {
            const updated = new Set(prev);
            updated.delete(answerId);
            return updated;
          });
        })
        .catch(() => {
          // Answer not ready yet, start polling
          pollForAnswer(answerId);
        });
    });
  }, [questions, onNewAnswer]); // Removed other dependencies to avoid re-polling

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">Welcome to Chat2Vis!</p>
          <p>Ask any scientific question and I'll explain it with an animated visualization.</p>
        </div>
      ) : (
        messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'question'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'question' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
              
              {message.type === 'answer' && message.answer && (
                <div className="mt-3">
                  <VisualizationCanvas
                    visualizationSpec={message.answer.visualization}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        ))
      )}
      
      {Array.from(loadingAnswers).map(answerId => (
        <div key={`loading_${answerId}`} className="flex justify-start">
          <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <p className="text-sm">Generating visualization...</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
