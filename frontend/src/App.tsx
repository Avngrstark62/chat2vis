import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChatBox } from './components/ChatBox';
import { ChatPanel } from './components/ChatPanel';
import { submitQuestion, getQuestions } from './api/index';
import type { Question, Answer } from './api/index';

const DEMO_USER_ID = 'demo_user_123';

function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial questions on mount
  useEffect(() => {
    getQuestions()
      .then(setQuestions)
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  const handleSubmitQuestion = async (question: string) => {
    setIsLoading(true);
    try {
      await submitQuestion(DEMO_USER_ID, question);
      // Refresh questions after submitting
      const updatedQuestions = await getQuestions();
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnswer = useCallback((answer: Answer) => {
    // This is handled by the ChatPanel component internally
    console.log('New answer received:', answer.answerId);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Chat2Vis</h1>
          <p className="text-sm text-gray-600">Ask scientific questions and get animated explanations</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <ChatPanel 
          questions={questions} 
          onNewAnswer={handleNewAnswer}
        />
        
        {/* Input Section */}
        <div className="bg-white border-t border-gray-200 p-4">
          <ChatBox 
            onSubmit={handleSubmitQuestion}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;
