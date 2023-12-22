import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import "./AIChatBox.css";

interface AIBotProps {
  visible: boolean;
  onClose: () => void;
}

const AIChatBot: React.FC<AIBotProps> = ({ visible, onClose }) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "bot", message: "你好！我是简易AI Chatbot。" },
  ]);

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;

    setChatHistory([...chatHistory, { role: "user", message: userInput }]);
    setUserInput("");

    setTimeout(() => {
      setChatHistory([
        ...chatHistory,
        { role: "bot", message: generateBotReply(userInput) },
      ]);
    }, 500);
  };

  const generateBotReply = (userMessage: string) => {
    return `你说："${userMessage}"，我是一个简单的AI，还不能理解太复杂的问题。`;
  };

  return (
    <Modal
      title="AI Chat Bot"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
      ]}
    >
      <div className="chat-container">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-bubble ${chat.role}`}>
            {chat.message}
          </div>
        ))}
      </div>
      <div className="user-input">
        <Input
          type="text"
          placeholder="输入消息..."
          value={userInput}
          onChange={handleUserInput}
        />
        <Button type="primary" onClick={handleSendMessage}>
          发送
        </Button>
      </div>
    </Modal>
  );
};

export default AIChatBot;
